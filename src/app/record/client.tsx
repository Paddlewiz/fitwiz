'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n-context';
import { useOnboarding } from '@/lib/onboarding-context';
import { getSupabaseBrowserClientAsync } from '@/lib/supabase-browser';
import { UnifiedRecordForm, BodyData, DietRecord, ExerciseRecord } from '@/components/record/unified-record-form';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Trash2, ArrowLeft, ChefHat, Dumbbell, Scale, TrendingUp, TrendingDown } from 'lucide-react';

// 今日记录数据类型
interface TodayDietLog {
  id: string;
  meal_type: string;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portion_size?: number;
  sodium_mg?: number;
  created_at: string;
}

interface TodayExerciseLog {
  id: string;
  exercise_type: string;
  duration_minutes: number;
  calories_burned: number;
  weight_kg?: number;
  sets?: number;
  reps?: number;
  created_at: string;
}

interface TodaySummary {
  totalIntake: number;
  totalExercise: number;
  tdee: number;
  energyBalance: number; // TDEE - intake + exercise
}

export function RecordPageClient() {
  const { t } = useI18n();
  const router = useRouter();
  const { data: onboardingData, completeOnboarding } = useOnboarding();
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  // 今日记录数据
  const [dietLogs, setDietLogs] = useState<TodayDietLog[]>([]);
  const [exerciseLogs, setExerciseLogs] = useState<TodayExerciseLog[]>([]);
  const [summary, setSummary] = useState<TodaySummary | null>(null);

  // 获取用户信息和今日记录
  const loadUserData = useCallback(async () => {
    const supabase = await getSupabaseBrowserClientAsync();

    // 获取用户
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (!user) return;

    // 获取用户档案（用于TDEE）
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    setUserProfile(profile);

    // 获取今日日期
    const today = new Date().toISOString().split('T')[0];

    // 获取今日饮食记录
    const { data: dietData } = await supabase
      .from('diet_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .order('created_at', { ascending: false });
    setDietLogs((dietData || []) as TodayDietLog[]);

    // 获取今日运动记录
    const { data: exerciseData } = await supabase
      .from('exercise_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .order('created_at', { ascending: false });
    setExerciseLogs((exerciseData || []) as TodayExerciseLog[]);

    // 计算汇总
    const totalIntake = (dietData || []).reduce((sum, log) => sum + (log.calories || 0), 0);
    const totalExercise = (exerciseData || []).reduce((sum, log) => sum + (log.calories_burned || 0), 0);
    const tdee = profile?.tdee || 1800;

    setSummary({
      totalIntake,
      totalExercise,
      tdee,
      energyBalance: tdee - totalIntake + totalExercise,
    });
  }, []);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // 删除饮食记录
  const handleDeleteDiet = async (id: string) => {
    try {
      const supabase = await getSupabaseBrowserClientAsync();
      const { error } = await supabase
        .from('diet_logs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success(t('record.deleteSuccess') || '删除成功');
      // 重新加载数据
      loadUserData();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(t('common.deleteFailed') || '删除失败');
    }
  };

  // 删除运动记录
  const handleDeleteExercise = async (id: string) => {
    try {
      const supabase = await getSupabaseBrowserClientAsync();
      const { error } = await supabase
        .from('exercise_logs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success(t('record.deleteSuccess') || '删除成功');
      // 重新加载数据
      loadUserData();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(t('common.deleteFailed') || '删除失败');
    }
  };

  // 保存身体数据
  const handleSaveBodyData = async (data: BodyData) => {
    if (!user) {
      toast.error(t('common.pleaseLogin'));
      router.push('/login');
      return;
    }

    setIsSaving(true);
    try {
      const supabase = await getSupabaseBrowserClientAsync();

      // Calculate BMI if weight and height are available
      let bmi = data.bmi;
      if (onboardingData?.height && data.weight) {
        const heightM = onboardingData.height / 100;
        bmi = data.weight / (heightM * heightM);
      }

      const { error } = await supabase.from('body_metrics').insert({
        user_id: user.id,
        weight: data.weight,
        body_fat_pct: data.bodyFat || null,
        bmi: bmi || null,
        body_age: data.bodyAge ? Math.round(data.bodyAge) : null,
        bmr: data.bmr ? Math.round(data.bmr) : null,
        visceral_fat: data.visceralFat ? Math.round(data.visceralFat) : null,
        muscle_mass: data.muscleMass || null,
        bone_mass: data.boneMass || null,
        water_pct: data.waterPercentage || null,
        recorded_at: new Date().toISOString(),
      });

      if (error) throw error;

      // 如果用户填了基础代谢率，用 BMR × 活动系数 更新 user_profiles.tdee
      if (data.bmr && data.bmr > 0) {
        const activityMultiplier: Record<string, number> = {
          sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, veryActive: 1.9,
        };
        const multiplier = activityMultiplier[userProfile?.activity_level || 'moderate'] || 1.55;
        const newTdee = Math.round(data.bmr * multiplier);

        await supabase
          .from('user_profiles')
          .update({ tdee: newTdee, updated_at: new Date().toISOString() })
          .eq('user_id', user.id);
      }

      completeOnboarding();
      toast.success(t('record.bodyDataSaved'));
    } catch (error: any) {
      const errMsg = error?.message || error?.code || JSON.stringify(error);
      console.error('Error saving body data:', error);
      toast.error(`保存失败: ${errMsg}`);
    } finally {
      setIsSaving(false);
    }
  };

  // 保存饮食记录
  const handleSaveDietRecord = async (data: DietRecord) => {
    if (!user) {
      toast.error(t('common.pleaseLogin'));
      router.push('/login');
      return;
    }

    setIsSaving(true);
    try {
      const supabase = await getSupabaseBrowserClientAsync();
      const today = new Date().toISOString().split('T')[0];

      const { error } = await supabase.from('diet_logs').insert({
        user_id: user.id,
        date: today,
        meal_type: data.mealType,
        food_name: data.foodName,
        portion_size: data.portionSize || null,
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
        sodium_mg: data.sodium || 0,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast.success(t('record.dietSaved'));
      // 重新加载今日数据
      loadUserData();
    } catch (error) {
      console.error('Error saving diet record:', error);
      toast.error(t('common.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  // 保存运动记录
  const handleSaveExerciseRecord = async (data: ExerciseRecord) => {
    if (!user) {
      toast.error(t('common.pleaseLogin'));
      router.push('/login');
      return;
    }

    setIsSaving(true);
    try {
      const supabase = await getSupabaseBrowserClientAsync();
      const today = new Date().toISOString().split('T')[0];

      const { error } = await supabase.from('exercise_logs').insert({
        user_id: user.id,
        date: today,
        exercise_type: data.exerciseType,
        duration_minutes: data.duration || null,
        calories_burned: data.caloriesBurned,
        weight_kg: data.weight || null,
        sets: data.sets || null,
        reps: data.reps || null,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast.success(t('record.exerciseSaved'));
      // 重新加载今日数据
      loadUserData();
    } catch (error) {
      console.error('Error saving exercise record:', error);
      toast.error(t('common.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  // 保存步数
  const handleSaveSteps = async (steps: number, calories: number) => {
    if (!user) {
      toast.error(t('common.pleaseLogin'));
      router.push('/login');
      return;
    }

    setIsSaving(true);
    try {
      const supabase = await getSupabaseBrowserClientAsync();
      const today = new Date().toISOString().split('T')[0];

      // 保存步数作为一条运动记录
      const { error } = await supabase.from('exercise_logs').insert({
        user_id: user.id,
        date: today,
        exercise_type: '步行',
        duration_minutes: Math.round(steps / 100),
        calories_burned: calories,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast.success(t('record.stepsSaved') || '步数已保存');
      // 重新加载今日数据
      loadUserData();
    } catch (error) {
      console.error('Error saving steps:', error);
      toast.error(t('common.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  // 餐次翻译
  const mealTypeLabel = (type: string) => {
    switch (type) {
      case 'breakfast': return t('record.breakfast') || '早餐';
      case 'lunch': return t('record.lunch') || '午餐';
      case 'dinner': return t('record.dinner') || '晚餐';
      case 'snack': return t('record.snack') || '加餐';
      default: return type;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* 返回按钮 */}
      <div className="sticky top-0 bg-white border-b border-gray-100 z-10 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center">
          <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="mr-3">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">
            {t('record.title') || '记录数据'}
          </h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-4 space-y-6">
        {/* 当日汇总卡片 */}
        {summary && (
          <Card className="bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-100">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-500" />
                {t('record.todaySummary') || '今日汇总'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                {/* 总摄入 */}
                <div className="bg-white rounded-lg p-2 shadow-sm">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <ChefHat className="w-3.5 h-3.5 text-orange-500" />
                    <span className="text-xs text-gray-500">{t('record.totalIntake') || '总摄入'}</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{summary.totalIntake}</p>
                  <p className="text-xs text-gray-400">kcal</p>
                </div>
                {/* 总消耗 */}
                <div className="bg-white rounded-lg p-2 shadow-sm">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Dumbbell className="w-3.5 h-3.5 text-teal-500" />
                    <span className="text-xs text-gray-500">{t('record.totalExercise') || '总消耗'}</span>
                  </div>
                  <p className="text-lg font-bold text-teal-600">{summary.totalExercise}</p>
                  <p className="text-xs text-gray-400">kcal</p>
                </div>
                {/* 热量平衡 */}
                <div className="bg-white rounded-lg p-2 shadow-sm">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Scale className="w-3.5 h-3.5" />
                    <span className="text-xs text-gray-500">{t('record.energyBalance') || '热量平衡'}</span>
                  </div>
                  <p className={`text-lg font-bold ${summary.energyBalance >= 0 ? 'text-teal-600' : 'text-orange-500'}`}>
                    {summary.energyBalance}
                  </p>
                  <p className="text-xs text-gray-400">kcal</p>
                </div>
              </div>
              {/* 说明 */}
              <div className="mt-2 text-center">
                <p className="text-xs text-gray-500">
                  {t('record.balanceFormula') || `热量平衡 = TDEE(${summary.tdee}) - 摄入(${summary.totalIntake}) + 运动(${summary.totalExercise})`}
                </p>
                {summary.energyBalance > 0 && (
                  <p className="text-xs text-teal-600 mt-1 flex items-center justify-center gap-1">
                    <TrendingDown className="w-3 h-3" />
                    {t('record.expectedWeightLoss') || '预计体重下降'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 数据录入表单 */}
        <Card className="border-gray-100">
          <CardContent className="pt-4">
            <UnifiedRecordForm
              onSaveBodyData={handleSaveBodyData}
              onSaveDietRecord={handleSaveDietRecord}
              onSaveExerciseRecord={handleSaveExerciseRecord}
              onSaveSteps={handleSaveSteps}
              isSaving={isSaving}
              height={onboardingData?.height}
            />
          </CardContent>
        </Card>

        {/* 今日饮食记录列表 */}
        {dietLogs.length > 0 && (
          <Card className="border-gray-100">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-orange-500" />
                {t('record.todayDietLogs') || '今日饮食记录'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="space-y-2">
                {dietLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-2.5">
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-gray-500 bg-white px-1.5 py-0.5 rounded">
                        {mealTypeLabel(log.meal_type)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{log.food_name}</p>
                        <p className="text-xs text-gray-500">
                          {log.portion_size ? `${log.portion_size}g · ` : ''}{log.calories} kcal · {log.protein}g蛋白
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-red-500 h-8 w-8 p-0"
                      onClick={() => handleDeleteDiet(log.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 今日运动记录列表 */}
        {exerciseLogs.length > 0 && (
          <Card className="border-gray-100">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-teal-500" />
                {t('record.todayExerciseLogs') || '今日运动记录'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="space-y-2">
                {exerciseLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Dumbbell className="w-3.5 h-3.5 text-teal-500" />
                        <span className="font-medium text-gray-900 text-sm">{log.exercise_type}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {log.sets ? (
                          <span>{log.sets}组×{log.reps || 0}次{log.weight_kg ? ` · ${log.weight_kg}kg` : ''} · {log.calories_burned}kcal</span>
                        ) : (
                          <span>{log.duration_minutes || 0}分钟 · {log.calories_burned}kcal</span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-red-500 h-8 w-8 p-0"
                      onClick={() => handleDeleteExercise(log.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 空状态提示 */}
        {dietLogs.length === 0 && exerciseLogs.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <Scale className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">
              {t('record.noRecordsToday') || '今天还没有记录，开始记录吧！'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}