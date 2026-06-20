'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n-context';
import { useOnboarding } from '@/lib/onboarding-context';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import { UnifiedRecordForm, BodyData, DietRecord, ExerciseRecord } from '@/components/record/unified-record-form';
import { toast } from 'sonner';

export function RecordPageClient() {
  const { t } = useI18n();
  const router = useRouter();
  const { data: onboardingData, completeOnboarding } = useOnboarding();
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);
  
  const handleSaveBodyData = async (data: BodyData) => {
    if (!user) {
      toast.error(t('common.pleaseLogin'));
      router.push('/login');
      return;
    }
    
    setIsSaving(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const today = new Date().toISOString().split('T')[0];
      
      // Calculate BMI if weight and height are available
      let bmi = data.bmi;
      if (onboardingData?.height && data.weight) {
        const heightM = onboardingData.height / 100;
        bmi = data.weight / (heightM * heightM);
      }
      
      const { error } = await supabase.from('body_metrics').insert({
        user_id: user.id,
        weight: data.weight,
        body_fat: data.bodyFat,
        bmi: bmi,
        body_age: data.bodyAge,
        visceral_fat: data.visceralFat,
        muscle_mass: data.muscleMass,
        bone_mass: data.boneMass,
        water_percentage: data.waterPercentage,
        recorded_at: new Date().toISOString(),
      });
      
      if (error) {
        throw error;
      }
      
      // Complete onboarding step 3 if this is the first weight record
      completeOnboarding();
      
      toast.success(t('record.bodyDataSaved'));
      router.push('/');
    } catch (error) {
      console.error('Error saving body data:', error);
      toast.error(t('common.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSaveDietRecord = async (data: DietRecord) => {
    if (!user) {
      toast.error(t('common.pleaseLogin'));
      router.push('/login');
      return;
    }
    
    setIsSaving(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase.from('diet_logs').insert({
        user_id: user.id,
        date: today,
        meal_type: data.mealType,
        food_name: data.foodName,
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
        created_at: new Date().toISOString(),
      });
      
      if (error) {
        throw error;
      }
      
      toast.success(t('record.dietSaved'));
      router.push('/');
    } catch (error) {
      console.error('Error saving diet record:', error);
      toast.error(t('common.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSaveExerciseRecord = async (data: ExerciseRecord) => {
    if (!user) {
      toast.error(t('common.pleaseLogin'));
      router.push('/login');
      return;
    }
    
    setIsSaving(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase.from('exercise_logs').insert({
        user_id: user.id,
        date: today,
        exercise_type: data.exerciseType,
        duration: data.duration,
        calories_burned: data.caloriesBurned,
        steps: data.steps,
        created_at: new Date().toISOString(),
      });
      
      if (error) {
        throw error;
      }
      
      toast.success(t('record.exerciseSaved'));
      router.push('/');
    } catch (error) {
      console.error('Error saving exercise record:', error);
      toast.error(t('common.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          {t('record.title')}
        </h1>
        
        <UnifiedRecordForm
          onSaveBodyData={handleSaveBodyData}
          onSaveDietRecord={handleSaveDietRecord}
          onSaveExerciseRecord={handleSaveExerciseRecord}
          isSaving={isSaving}
          height={onboardingData?.height}
        />
      </div>
    </div>
  );
}