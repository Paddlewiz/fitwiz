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

  // Form state
  const [weight, setWeight] = useState('');
  const [bodyFatPct, setBodyFatPct] = useState('');
  const [bodyAge, setBodyAge] = useState('');
  const [visceralFat, setVisceralFat] = useState('');
  const [muscleMass, setMuscleMass] = useState('');
  const [boneMass, setBoneMass] = useState('');
  const [waterPct, setWaterPct] = useState('');
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
        weight: weight || null,
        body_fat_pct: bodyFatPct || null,
        bmi: bmi || null,
        body_age: bodyAge ? parseInt(bodyAge) : null,
        visceral_fat: visceralFat ? parseInt(visceralFat) : null,
        muscle_mass: muscleMass || null,
        bone_mass: boneMass || null,
        water_pct: waterPct || null,
        notes: notes || null,
      });

      if (error) throw error;

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
    } catch (err) {
      setError(t('metrics.saveError'));
      console.error(err);
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

  // Prepare chart data
  const chartData = metrics
    .slice()
    .reverse()
    .map((m) => ({
      date: new Date(m.recorded_at).toLocaleDateString(locale === 'zh-CN' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' }),
      weight: m.weight ? parseFloat(m.weight) : null,
      bmi: m.bmi ? parseFloat(m.bmi) : null,
    }));

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

        {/* Weight Trend Chart */}
        {metrics.length > 0 && (
          <Card className="mb-6 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-teal-500" />
                {t('metrics.weightTrend')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" tick={{ fill: '#4B5563' }} />
                  <YAxis
                    tick={{ fill: '#4B5563' }}
                    domain={['auto', 'auto']}
                    label={{ value: 'kg', angle: -90, position: 'insideLeft', fill: '#4B5563' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ fill: '#10B981', strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Current Stats */}
        {latestMetric && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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