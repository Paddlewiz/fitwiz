'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSupabaseConfig } from '@/lib/supabase-config-inject';
import { getSupabaseBrowserClientWithRetry } from '@/lib/supabase-browser';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Scale, Plus, Trash2, Loader2, AlertCircle, TrendingDown, TrendingUp } from 'lucide-react';
import { useTranslation } from '@/lib/i18n-context';

interface BodyMetric {
  id: string;
  recorded_at: string;
  weight: string | null;
  body_fat_pct: string | null;
  bmi: string | null;
  body_age: number | null;
  bmr: number | null;
  visceral_fat: number | null;
  muscle_mass: string | null;
  bone_mass: string | null;
  water_pct: string | null;
  notes: string | null;
}

export function MetricsPageClient() {
  const router = useRouter();
  const { isLoading: configLoading } = useSupabaseConfig();
  const { t, locale } = useTranslation();

  const [user, setUser] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<BodyMetric[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [activeChart, setActiveChart] = useState<string>('weight');

  // Form state
  const [weight, setWeight] = useState('');
  const [bodyFatPct, setBodyFatPct] = useState('');
  const [bodyAge, setBodyAge] = useState('');
  const [visceralFat, setVisceralFat] = useState('');
  const [muscleMass, setMuscleMass] = useState('');
  const [boneMass, setBoneMass] = useState('');
  const [waterPct, setWaterPct] = useState('');
  const [bmr, setBmr] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check auth and fetch data
  useEffect(() => {
    const init = async () => {
      try {
        const supabase = await getSupabaseBrowserClientWithRetry();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push('/login');
          return;
        }

        setUser(user);

        // Fetch metrics
        const { data, error } = await supabase
          .from('body_metrics')
          .select('*')
          .eq('user_id', user.id)
          .order('recorded_at', { ascending: false })
          .limit(30);

        if (error) throw error;
        setMetrics(data || []);
      } catch (err) {
        console.error(err);
        setError(t('metrics.loadError'));
      } finally {
        setLoading(false);
      }
    };

    if (!configLoading) {
      init();
    }
  }, [configLoading, router, t]);

  // Calculate BMI from weight
  const calculateBMI = async () => {
    if (!weight || !user) return;

    try {
      const supabase = await getSupabaseBrowserClientWithRetry();
      // Get user profile for height
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('height')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile?.height) {
        const heightM = parseFloat(profile.height) / 100;
        const weightKg = parseFloat(weight);
        const bmi = weightKg / (heightM * heightM);
        return Math.round(bmi * 10) / 10;
      }
    } catch (err) {
      console.error(err);
    }
    return null;
  };

  // Save new metric
  const handleSave = async () => {
    if (!weight || !user) {
      setError(t('metrics.weightRequired'));
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const supabase = await getSupabaseBrowserClientWithRetry();
      const bmi = await calculateBMI();

      const { error } = await supabase.from('body_metrics').insert({
        user_id: user.id,
        recorded_at: new Date().toISOString(),
        weight: weight || null,
        body_fat_pct: bodyFatPct || null,
        bmi: bmi || null,
        body_age: bodyAge ? parseInt(bodyAge) : null,
        bmr: bmr ? parseInt(bmr) : null,
        visceral_fat: visceralFat ? parseInt(visceralFat) : null,
        muscle_mass: muscleMass || null,
        bone_mass: boneMass || null,
        water_pct: waterPct || null,
        notes: notes || null,
      });

      if (error) throw error;

      // 如果用户填了基础代谢率，用 BMR × 活动系数 更新 user_profiles.tdee
      if (bmr && parseInt(bmr) > 0) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('activity_level')
          .eq('user_id', user.id)
          .maybeSingle();

        const activityMultiplier: Record<string, number> = {
          sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, veryActive: 1.9,
        };
        const multiplier = activityMultiplier[profile?.activity_level || 'moderate'] || 1.55;
        const newTdee = Math.round(parseInt(bmr) * multiplier);

        await supabase
          .from('user_profiles')
          .update({ tdee: newTdee, updated_at: new Date().toISOString() })
          .eq('user_id', user.id);
      }

      // Refresh data
      const { data } = await supabase
        .from('body_metrics')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false })
        .limit(30);

      setMetrics(data || []);
      setShowForm(false);
      setWeight('');
      setBodyFatPct('');
      setBodyAge('');
      setVisceralFat('');
      setMuscleMass('');
      setBoneMass('');
      setWaterPct('');
      setNotes('');
    } catch (err: any) {
      const errMsg = err?.message || err?.code || JSON.stringify(err);
      setError(`保存失败: ${errMsg}`);
      console.error('Body metrics save error:', err);
    } finally {
      setSaving(false);
    }
  };

  // Delete metric
  const handleDelete = async (id: string) => {
    if (!user) return;

    try {
      const supabase = await getSupabaseBrowserClientWithRetry();
      const { error } = await supabase
        .from('body_metrics')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      setMetrics(metrics.filter((m) => m.id !== id));
    } catch (err) {
      setError(t('metrics.deleteError'));
      console.error(err);
    }
  };

  // Prepare chart data - 全部身体指标
  const chartData = metrics
    .slice()
    .reverse()
    .map((m) => ({
      date: new Date(m.recorded_at).toLocaleDateString(locale === 'zh-CN' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' }),
      weight: m.weight ? parseFloat(m.weight) : null,
      bmi: m.bmi ? parseFloat(m.bmi) : null,
      bodyFat: m.body_fat_pct ? parseFloat(m.body_fat_pct) : null,
      muscleMass: m.muscle_mass ? parseFloat(m.muscle_mass) : null,
      waterPct: m.water_pct ? parseFloat(m.water_pct) : null,
      bmr: m.bmr || null,
    }));

  // 图表配置
  const chartConfigs: Record<string, { label: string; unit: string; color: string; dataKey: string }> = {
    weight: { label: '体重', unit: 'kg', color: '#10B981', dataKey: 'weight' },
    bodyFat: { label: '体脂率', unit: '%', color: '#F59E0B', dataKey: 'bodyFat' },
    bmi: { label: 'BMI', unit: '', color: '#3B82F6', dataKey: 'bmi' },
    muscle: { label: '肌肉量', unit: 'kg', color: '#8B5CF6', dataKey: 'muscleMass' },
    water: { label: '水分率', unit: '%', color: '#06B6D4', dataKey: 'waterPct' },
    bmr: { label: '基础代谢', unit: 'kcal', color: '#EC4899', dataKey: 'bmr' },
  };

  // 计算趋势变化（最新值 vs 上一条）
  const getTrend = (dataKey: string): { direction: 'up' | 'down' | 'flat'; delta: number } | null => {
    if (chartData.length < 2) return null;
    const latest = chartData[chartData.length - 1];
    const prev = chartData[chartData.length - 2];
    const latestVal = latest[dataKey as keyof typeof latest] as number | null;
    const prevVal = prev[dataKey as keyof typeof prev] as number | null;
    if (latestVal == null || prevVal == null) return null;
    const delta = Math.round((latestVal - prevVal) * 10) / 10;
    if (Math.abs(delta) < 0.05) return { direction: 'flat', delta: 0 };
    return { direction: delta > 0 ? 'up' : 'down', delta };
  };

  // Latest metric
  const latestMetric = metrics[0];

  if (configLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('metrics.title')}</h1>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-teal-500 hover:bg-teal-600"
          >
            {showForm ? t('common.cancel') : <><Plus className="w-4 h-4 mr-2" />{t('metrics.addEntry')}</>}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Add Metric Form */}
        {showForm && (
          <Card className="mb-6 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-teal-500" />
                {t('metrics.addMetric')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">{t('metrics.weight')} *</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="70.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bodyFatPct">{t('metrics.bodyFatPct')}</Label>
                  <Input
                    id="bodyFatPct"
                    type="number"
                    step="0.1"
                    value={bodyFatPct}
                    onChange={(e) => setBodyFatPct(e.target.value)}
                    placeholder="15.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bodyAge">{t('metrics.bodyAge')}</Label>
                  <Input
                    id="bodyAge"
                    type="number"
                    value={bodyAge}
                    onChange={(e) => setBodyAge(e.target.value)}
                    placeholder="25"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bmr">{t('metrics.bmr') || '基础代谢率'}</Label>
                  <Input
                    id="bmr"
                    type="number"
                    value={bmr}
                    onChange={(e) => setBmr(e.target.value)}
                    placeholder="1500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="visceralFat">{t('metrics.visceralFat')}</Label>
                  <Input
                    id="visceralFat"
                    type="number"
                    value={visceralFat}
                    onChange={(e) => setVisceralFat(e.target.value)}
                    placeholder="5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="muscleMass">{t('metrics.muscleMass')}</Label>
                  <Input
                    id="muscleMass"
                    type="number"
                    step="0.1"
                    value={muscleMass}
                    onChange={(e) => setMuscleMass(e.target.value)}
                    placeholder="30.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="boneMass">{t('metrics.boneMass')}</Label>
                  <Input
                    id="boneMass"
                    type="number"
                    step="0.1"
                    value={boneMass}
                    onChange={(e) => setBoneMass(e.target.value)}
                    placeholder="2.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="waterPct">{t('metrics.waterPct')}</Label>
                  <Input
                    id="waterPct"
                    type="number"
                    step="0.1"
                    value={waterPct}
                    onChange={(e) => setWaterPct(e.target.value)}
                    placeholder="55.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">{t('metrics.notes')}</Label>
                  <Input
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t('metrics.notesPlaceholder')}
                  />
                </div>
              </div>
              <Button
                onClick={handleSave}
                className="w-full bg-teal-500 hover:bg-teal-600"
                disabled={saving || !weight}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('common.saving')}
                  </>
                ) : (
                  t('common.save')
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 多指标趋势图 */}
        {metrics.length > 0 && (
          <Card className="mb-6 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-teal-500" />
                身体数据趋势
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* 指标切换标签 */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {Object.entries(chartConfigs).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => setActiveChart(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeChart === key
                        ? 'text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    style={activeChart === key ? { backgroundColor: cfg.color } : {}}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>

              {/* 趋势涨跌指示 */}
              {(() => {
                const trend = getTrend(chartConfigs[activeChart].dataKey);
                if (!trend) return null;
                const cfg = chartConfigs[activeChart];
                return (
                  <div className="flex items-center gap-1.5 mb-3 text-sm">
                    <span className="text-gray-500">较上次</span>
                    {trend.direction === 'up' && (
                      <span className="flex items-center gap-0.5 text-red-500 font-medium">
                        <TrendingUp className="w-3.5 h-3.5" />
                        +{trend.delta}{cfg.unit}
                      </span>
                    )}
                    {trend.direction === 'down' && (
                      <span className="flex items-center gap-0.5 text-teal-500 font-medium">
                        <TrendingDown className="w-3.5 h-3.5" />
                        {trend.delta}{cfg.unit}
                      </span>
                    )}
                    {trend.direction === 'flat' && (
                      <span className="text-gray-400 font-medium">持平</span>
                    )}
                  </div>
                );
              })()}

              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" tick={{ fill: '#4B5563', fontSize: 12 }} />
                  <YAxis
                    tick={{ fill: '#4B5563', fontSize: 12 }}
                    domain={['auto', 'auto']}
                    label={{ value: chartConfigs[activeChart].unit, angle: -90, position: 'insideLeft', fill: '#4B5563', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '13px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey={chartConfigs[activeChart].dataKey}
                    stroke={chartConfigs[activeChart].color}
                    strokeWidth={2.5}
                    dot={{ fill: chartConfigs[activeChart].color, strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>

              {/* 记录数提示 */}
              <p className="text-xs text-gray-400 mt-2 text-center">
                共 {chartData.length} 条记录 · 点击上方标签切换指标
              </p>
            </CardContent>
          </Card>
        )}

        {/* Current Stats */}
        {latestMetric && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <Card className="shadow-sm bg-teal-50 border-teal-100">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-teal-600 mb-1">{t('metrics.weight')}</p>
                <p className="text-2xl font-bold text-teal-700">{latestMetric.weight || '-'} kg</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm bg-green-50 border-green-100">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-green-600 mb-1">{t('bmi.title')}</p>
                <p className="text-2xl font-bold text-green-700">{latestMetric.bmi || '-'}</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm bg-amber-50 border-amber-100">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-amber-600 mb-1">{t('metrics.bodyFatPct')}</p>
                <p className="text-2xl font-bold text-amber-700">{latestMetric.body_fat_pct || '-'}%</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm bg-blue-50 border-blue-100">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-blue-600 mb-1">{t('metrics.muscleMass')}</p>
                <p className="text-2xl font-bold text-blue-700">{latestMetric.muscle_mass || '-'} kg</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm bg-purple-50 border-purple-100">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-purple-600 mb-1">{t('metrics.bmr') || '基础代谢率'}</p>
                <p className="text-2xl font-bold text-purple-700">{latestMetric.bmr || '-'} kcal</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm bg-pink-50 border-pink-100">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-pink-600 mb-1">{t('metrics.bodyAge')}</p>
                <p className="text-2xl font-bold text-pink-700">{latestMetric.body_age || '-'} 岁</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* History List */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-teal-500" />
              {t('metrics.history')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                <Scale className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>{t('metrics.noMetrics')}</p>
                <p className="text-sm mt-2">{t('metrics.startTracking')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {metrics.map((metric) => (
                  <div
                    key={metric.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
                  >
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">
                        {new Date(metric.recorded_at).toLocaleDateString(locale === 'zh-CN' ? 'zh-CN' : 'en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                      <div className="flex gap-4 mt-1">
                        <span className="text-teal-700 font-medium">{metric.weight || '-'} kg</span>
                        <span className="text-green-700">{metric.bmi || '-'} {t('bmi.title')}</span>
                        <span className="text-amber-700">{metric.body_fat_pct || '-'}% {t('metrics.bodyFat')}</span>
                      </div>
                      {metric.notes && (
                        <p className="text-gray-500 text-sm mt-1">{metric.notes}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(metric.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}