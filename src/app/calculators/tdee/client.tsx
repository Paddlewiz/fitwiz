'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calculator, TrendingDown, TrendingUp, Scale, Zap, ArrowLeft, Loader2, LineChart } from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClientAsync } from '@/lib/supabase-browser';

type Gender = 'male' | 'female';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';

interface TDEEResult {
  bmr: number;
  tdee: number;
  maintain: number;
  mildLoss: number;
  weightLoss: number;
  extremeLoss: number;
  mildGain: number;
  weightGain: number;
}

const activityMultipliers: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

export function TDEECalculatorClient() {
  const { t } = useI18n();
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasTdee, setHasTdee] = useState(false);
  const [saving, setSaving] = useState(false);

  const [gender, setGender] = useState<Gender>('male');
  const [age, setAge] = useState<string>('25');
  const [weight, setWeight] = useState<string>('70');
  const [height, setHeight] = useState<string>('175');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  const [result, setResult] = useState<TDEEResult | null>(null);

  // 检查用户是否已设置TDEE
  useEffect(() => {
    const checkTdee = async () => {
      try {
        const supabase = await getSupabaseBrowserClientAsync();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setIsLoggedIn(false);
          setChecking(false);
          return;
        }

        setIsLoggedIn(true);

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('tdee, height, gender, date_of_birth, activity_level')
          .eq('user_id', user.id)
          .maybeSingle();

        // 已有TDEE → 跳转到身体数据曲线图
        if (profile?.tdee) {
          router.replace('/metrics');
          return;
        }

        // 预填用户已有数据
        if (profile?.height) setHeight(String(profile.height));
        if (profile?.gender === 'female') setGender('female');
        if (profile?.activity_level) setActivityLevel(profile.activity_level as ActivityLevel);

        // 从出生日期算年龄
        if (profile?.date_of_birth) {
          const birth = new Date(profile.date_of_birth);
          const ageYears = Math.floor((Date.now() - birth.getTime()) / (365.25 * 24 * 3600 * 1000));
          if (ageYears > 0) setAge(String(ageYears));
        }

        setHasTdee(false);
        setChecking(false);
      } catch (err) {
        console.error('Check TDEE error:', err);
        setChecking(false);
      }
    };

    checkTdee();
  }, [router]);

  const getActivityLabel = (level: ActivityLevel): string => {
    return `${t(`tdee.activityLevels.${level}`)} - ${t(`tdee.activityLevels.${level}Desc`)}`;
  };

  const calculateTDEE = () => {
    const weightKg = parseFloat(weight);
    const heightCm = parseFloat(height);
    const ageNum = parseInt(age);

    // Mifflin-St Jeor Formula
    let bmr: number;
    if (gender === 'male') {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageNum + 5;
    } else {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageNum - 161;
    }

    const multiplier = activityMultipliers[activityLevel];
    const tdeeVal = Math.round(bmr * multiplier);
    const bmrRounded = Math.round(bmr);

    setResult({
      bmr: bmrRounded,
      tdee: tdeeVal,
      maintain: tdeeVal,
      mildLoss: Math.round(tdeeVal - 250),
      weightLoss: Math.round(tdeeVal - 500),
      extremeLoss: Math.round(tdeeVal - 1000),
      mildGain: Math.round(tdeeVal + 250),
      weightGain: Math.round(tdeeVal + 500),
    });
  };

  // 保存TDEE到用户档案
  const saveToProfile = async () => {
    if (!result) return;
    setSaving(true);
    try {
      const supabase = await getSupabaseBrowserClientAsync();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_profiles')
        .update({
          tdee: result.tdee,
          activity_level: activityLevel,
          gender: gender,
          height: parseFloat(height),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // 保存成功 → 跳转到身体数据曲线图
      router.push('/metrics');
    } catch (err: any) {
      console.error('Save TDEE error:', err);
      alert(`保存失败: ${err?.message || JSON.stringify(err)}`);
    } finally {
      setSaving(false);
    }
  };

  // 加载中
  if (checking) {
    return (
      <div className="max-w-xl mx-auto flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="text-gray-600 hover:text-teal-600">
          <ArrowLeft className="w-4 h-4 mr-1" />
          返回首页
        </Button>
      </div>

      <Card className="shadow-lg border-gray-100">
        <CardHeader className="bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            {t('tdee.subtitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* 提示 */}
          <div className="bg-teal-50 rounded-lg p-3 text-center">
            <p className="text-sm text-teal-700">
              {isLoggedIn
                ? '首次设置你的每日能量消耗，保存后将自动跳转到身体数据趋势图'
                : '无需登录即可计算，登录后可保存数据并追踪趋势'}
            </p>
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label htmlFor="gender">{t('tdee.gender')}</Label>
            <Select value={gender} onValueChange={(v) => setGender(v as Gender)}>
              <SelectTrigger id="gender">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">{t('tdee.male')}</SelectItem>
                <SelectItem value="female">{t('tdee.female')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Age */}
          <div className="space-y-2">
            <Label htmlFor="age">{t('tdee.age')}</Label>
            <Input
              id="age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder={t('tdee.agePlaceholder')}
              min="1"
              max="120"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Weight */}
            <div className="space-y-2">
              <Label htmlFor="weight">{t('tdee.weight')} ({t('common.kg')})</Label>
              <Input
                id="weight"
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder={t('tdee.weightPlaceholder')}
                min="1"
                step="0.1"
              />
            </div>
            {/* Height */}
            <div className="space-y-2">
              <Label htmlFor="height">{t('tdee.height')} ({t('common.cm')})</Label>
              <Input
                id="height"
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder={t('tdee.heightPlaceholder')}
                min="1"
              />
            </div>
          </div>

          {/* Activity Level */}
          <div className="space-y-2">
            <Label htmlFor="activity">{t('tdee.activityLevel')}</Label>
            <Select
              value={activityLevel}
              onValueChange={(v) => setActivityLevel(v as ActivityLevel)}
            >
              <SelectTrigger id="activity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(activityMultipliers).map((key) => (
                  <SelectItem key={key} value={key}>
                    {getActivityLabel(key as ActivityLevel)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Calculate Button */}
          <Button
            onClick={calculateTDEE}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3"
          >
            {t('tdee.calculate')}
          </Button>

          {/* Results */}
          {result && (
            <div className="mt-6 space-y-4 bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 text-center">{t('tdee.results')}</h3>

              {/* BMR */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-teal-600" />
                  <p className="text-sm text-gray-600">{t('tdee.bmr')}</p>
                </div>
                <p className="text-3xl font-bold text-teal-600">{result.bmr} {t('common.calories')}</p>
                <p className="text-xs text-gray-500 mt-1">{t('tdee.bmrDesc')}</p>
              </div>

              {/* TDEE */}
              <div className="text-center bg-teal-100 rounded-lg py-4">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Calculator className="w-4 h-4 text-teal-700" />
                  <p className="text-sm text-teal-800">{t('tdee.tdee')}</p>
                </div>
                <p className="text-4xl font-bold text-teal-700">{result.tdee} {t('tdee.caloriesPerDay')}</p>
                <p className="text-xs text-teal-600 mt-1">{t('tdee.tdeeDesc')}</p>
              </div>

              {/* Calorie Goals */}
              <h4 className="text-md font-semibold text-gray-900 text-center mt-4">{t('tdee.calorieGoals')}</h4>

              <div className="bg-amber-50 rounded-lg p-4 text-center">
                <Scale className="w-5 h-5 text-amber-600 mx-auto mb-2" />
                <p className="text-sm text-amber-800 mb-1">{t('tdee.maintain')}</p>
                <p className="text-xl font-bold text-amber-700">{result.maintain} {t('tdee.caloriesPerDay')}</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <TrendingDown className="w-4 h-4 text-green-600 mx-auto mb-1" />
                  <p className="text-xs text-green-800 mb-1">{t('tdee.mildLoss')}</p>
                  <p className="text-lg font-bold text-green-700">{result.mildLoss}</p>
                </div>
                <div className="bg-green-100 rounded-lg p-3 text-center">
                  <TrendingDown className="w-4 h-4 text-green-600 mx-auto mb-1" />
                  <p className="text-xs text-green-800 mb-1">{t('tdee.weightLoss')}</p>
                  <p className="text-lg font-bold text-green-700">{result.weightLoss}</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-3 text-center">
                  <TrendingDown className="w-4 h-4 text-orange-600 mx-auto mb-1" />
                  <p className="text-xs text-orange-800 mb-1">{t('tdee.extremeLoss')}</p>
                  <p className="text-lg font-bold text-orange-700">{result.extremeLoss}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <TrendingUp className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                  <p className="text-xs text-blue-800 mb-1">{t('tdee.mildGain')}</p>
                  <p className="text-lg font-bold text-blue-700">{result.mildGain}</p>
                </div>
                <div className="bg-blue-100 rounded-lg p-3 text-center">
                  <TrendingUp className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                  <p className="text-xs text-blue-800 mb-1">{t('tdee.weightGain')}</p>
                  <p className="text-lg font-bold text-blue-700">{result.weightGain}</p>
                </div>
              </div>

              {/* 保存按钮 - 登录用户可见 */}
              {isLoggedIn && (
                <Button
                  onClick={saveToProfile}
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold py-3"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    <>
                      <LineChart className="w-4 h-4 mr-2" />
                      保存并查看身体数据趋势
                    </>
                  )}
                </Button>
              )}

              {/* Tips */}
              <div className="bg-gray-100 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">{t('tdee.tip1')}</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• {t('tdee.tip2')}</li>
                  <li>• {t('tdee.tip3')}</li>
                  <li>• {t('tdee.tip4')}</li>
                  <li>• 保存后每次记录身体数据时，如填写了基础代谢率，TDEE将自动更新</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
