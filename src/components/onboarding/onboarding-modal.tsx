'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useOnboarding, OnboardingStep, OnboardingData } from '@/lib/onboarding-context';
import { useI18n } from '@/lib/i18n-context';
import { X, ChevronLeft, ChevronRight, Check, Sparkles, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';

// Step 1: Basic Info Component - Auto-calculate when all fields are filled
function Step1BasicInfo() {
  const { t } = useI18n();
  const { data, updateData, nextStep } = useOnboarding();
  
  const [gender, setGender] = useState<'male' | 'female'>(data.gender || 'male');
  const [age, setAge] = useState(data.age?.toString() || '');
  const [height, setHeight] = useState(data.height?.toString() || '');
  const [weight, setWeight] = useState(data.currentWeight?.toString() || '');
  const [bmi, setBMI] = useState<number | null>(null);
  const [tdee, setTDEE] = useState<number | null>(null);
  
  // Auto-calculate BMI and TDEE when all fields are filled
  const calculateResults = useCallback(() => {
    const ageNum = parseFloat(age);
    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);
    
    if (ageNum > 0 && heightNum > 0 && weightNum > 0) {
      // Calculate BMI
      const heightM = heightNum / 100;
      const calculatedBMI = weightNum / (heightM * heightM);
      setBMI(calculatedBMI);
      
      // Calculate TDEE using Mifflin-St Jeor formula (assuming sedentary for simplicity)
      let bmr;
      if (gender === 'male') {
        bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5;
      } else {
        bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum - 161;
      }
      // Multiply by activity factor (sedentary = 1.2)
      const calculatedTDEE = Math.round(bmr * 1.2);
      setTDEE(calculatedTDEE);
      
      // Save to context
      updateData({
        gender,
        age: ageNum,
        height: heightNum,
        currentWeight: weightNum,
        calculatedBMI: calculatedBMI,
        calculatedTDEE: calculatedTDEE,
      });
    } else {
      setBMI(null);
      setTDEE(null);
    }
  }, [age, height, weight, gender, updateData]);
  
  // Auto-calculate when any field changes
  useEffect(() => {
    calculateResults();
  }, [calculateResults]);
  
  const isFormComplete = age && height && weight && parseFloat(age) > 0 && parseFloat(height) > 0 && parseFloat(weight) > 0;
  
  const handleNext = () => {
    if (isFormComplete) {
      nextStep();
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto px-1 space-y-5">
        <div className="text-center mb-3">
          <p className="text-gray-600 text-sm">
            {t('onboarding.step1Desc')}
          </p>
        </div>
        
        {/* Gender Selection */}
        <div className="space-y-2">
          <Label>{t('onboarding.gender')}</Label>
          <div className="flex gap-4">
            <Button
              variant={gender === 'male' ? 'default' : 'outline'}
              className={`flex-1 ${gender === 'male' ? 'bg-teal-500 hover:bg-teal-600' : ''}`}
              onClick={() => setGender('male')}
            >
              {t('onboarding.male')}
            </Button>
            <Button
              variant={gender === 'female' ? 'default' : 'outline'}
              className={`flex-1 ${gender === 'female' ? 'bg-teal-500 hover:bg-teal-600' : ''}`}
              onClick={() => setGender('female')}
            >
              {t('onboarding.female')}
            </Button>
          </div>
        </div>
        
        {/* Age */}
        <div className="space-y-2">
          <Label htmlFor="age">{t('onboarding.age')}</Label>
          <Input
            id="age"
            type="number"
            placeholder={t('onboarding.agePlaceholder')}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full"
          />
        </div>
        
        {/* Height */}
        <div className="space-y-2">
          <Label htmlFor="height">{t('onboarding.height')}</Label>
          <Input
            id="height"
            type="number"
            placeholder={t('onboarding.heightPlaceholder')}
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="w-full"
          />
        </div>
        
        {/* Weight */}
        <div className="space-y-2">
          <Label htmlFor="weight">{t('onboarding.currentWeight')}</Label>
          <Input
            id="weight"
            type="number"
            placeholder={t('onboarding.weightPlaceholder')}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full"
          />
        </div>
        
        {/* Results - Show automatically when calculated */}
        {bmi && tdee && (
          <Card className="bg-teal-50 border-teal-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-teal-500" />
                <span className="text-sm text-teal-600 font-medium">{t('onboarding.autoCalculated')}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-teal-600">{bmi.toFixed(1)}</div>
                  <div className="text-sm text-gray-600">{t('onboarding.yourBMI')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-teal-600">{tdee}</div>
                  <div className="text-sm text-gray-600">{t('onboarding.yourTDEE')}</div>
                </div>
              </div>
              <div className="mt-3 text-center text-sm text-gray-600">
                {t('onboarding.bmiStatus', { status: getBMIStatus(bmi, t) })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Next Step Button */}
      <div className="pt-4">
        <Button 
          onClick={handleNext}
          className="w-full bg-teal-500 hover:bg-teal-600"
          disabled={!isFormComplete}
        >
          {t('onboarding.toStep2')}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
        
        {/* Helper text when form is incomplete */}
        {!isFormComplete && (
          <p className="text-center text-sm text-gray-500 mt-2">
            {t('onboarding.fillAllFields')}
          </p>
        )}
      </div>
    </div>
  );
}

function getBMIStatus(bmi: number, t: (key: string, params?: Record<string, unknown>) => string): string {
  if (bmi < 18.5) return t('bmi.underweight');
  if (bmi < 24) return t('bmi.normal');
  if (bmi < 28) return t('bmi.overweight');
  return t('bmi.obese');
}

// Step 2: Goal Setting Component - Auto-calculate when fields are filled
function Step2GoalSetting() {
  const { t } = useI18n();
  const { data, updateData, nextStep, prevStep } = useOnboarding();
  
  const [targetWeight, setTargetWeight] = useState(data.targetWeight?.toString() || '');
  const [targetWeeks, setTargetWeeks] = useState(data.targetWeeks?.toString() || '8');
  const [recommendedCalories, setRecommendedCalories] = useState<number | null>(null);
  
  // Auto-calculate recommended calories
  const calculateGoal = useCallback(() => {
    const targetWeightNum = parseFloat(targetWeight);
    const targetWeeksNum = parseFloat(targetWeeks);
    const currentWeight = data.currentWeight || 0;
    const tdee = data.calculatedTDEE || 0;
    
    if (targetWeightNum > 0 && targetWeeksNum > 0 && currentWeight > 0 && tdee > 0) {
      // Calculate weight to lose
      const weightToLose = currentWeight - targetWeightNum;
      
      // Calculate daily deficit needed
      // 1 kg fat ≈ 7700 kcal
      const totalDeficitNeeded = weightToLose * 7700;
      const days = targetWeeksNum * 7;
      const dailyDeficit = totalDeficitNeeded / days;
      
      // Recommended daily intake
      const recommended = Math.round(tdee - dailyDeficit);
      
      // Ensure minimum safe intake (not less than BMR * 0.8)
      const minCalories = Math.round((tdee / 1.2) * 0.8);
      const finalRecommended = Math.max(recommended, minCalories);
      
      setRecommendedCalories(finalRecommended);
      
      updateData({
        targetWeight: targetWeightNum,
        targetWeeks: targetWeeksNum,
        recommendedCalories: finalRecommended,
      });
    } else {
      setRecommendedCalories(null);
    }
  }, [targetWeight, targetWeeks, data.currentWeight, data.calculatedTDEE, updateData]);
  
  // Auto-calculate when any field changes
  useEffect(() => {
    calculateGoal();
  }, [calculateGoal]);
  
  const isFormComplete = targetWeight && targetWeeks && parseFloat(targetWeight) > 0 && parseFloat(targetWeeks) > 0;
  
  return (
    <div className="flex flex-col h-full">
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto px-1 space-y-5">
        <div className="text-center mb-3">
          <p className="text-gray-600 text-sm">
            {t('onboarding.step2Desc')}
          </p>
        </div>
        
        {/* Current Weight Display */}
        <Card className="bg-gray-50">
          <CardContent className="p-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">{t('onboarding.currentWeight')}</span>
              <span className="text-lg font-bold">{data.currentWeight} kg</span>
            </div>
          </CardContent>
        </Card>
        
        {/* Target Weight */}
        <div className="space-y-2">
          <Label htmlFor="targetWeight">{t('onboarding.targetWeight')}</Label>
          <Input
            id="targetWeight"
            type="number"
            placeholder={t('onboarding.targetWeightPlaceholder')}
            value={targetWeight}
            onChange={(e) => setTargetWeight(e.target.value)}
            className="w-full"
          />
        </div>
        
        {/* Target Timeline */}
        <div className="space-y-2">
          <Label htmlFor="targetWeeks">{t('onboarding.targetTimeline')}</Label>
          <div className="flex gap-2">
            <Input
              id="targetWeeks"
              type="number"
              placeholder="8"
              value={targetWeeks}
              onChange={(e) => setTargetWeeks(e.target.value)}
              className="flex-1"
            />
            <span className="flex items-center text-gray-600">{t('onboarding.weeks')}</span>
          </div>
        </div>
        
        {/* Quick Options */}
        <div className="flex gap-2">
          {[4, 8, 12].map(weeks => (
            <Button
              key={weeks}
              variant={targetWeeks === weeks.toString() ? 'default' : 'outline'}
              size="sm"
              className={`flex-1 ${targetWeeks === weeks.toString() ? 'bg-teal-500 hover:bg-teal-600' : ''}`}
              onClick={() => setTargetWeeks(weeks.toString())}
            >
              {weeks} {t('onboarding.weeks')}
            </Button>
          ))}
        </div>
        
        {/* Results - Show automatically when calculated */}
        {recommendedCalories && (
          <Card className="bg-teal-50 border-teal-200">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-teal-500" />
                <span className="text-sm text-teal-600 font-medium">{t('onboarding.autoCalculated')}</span>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-600">{recommendedCalories}</div>
                <div className="text-sm text-gray-600 mt-1">{t('onboarding.recommendedCalories')}</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-sm">
                <p className="text-gray-600">
                  {t('onboarding.goalPlanDesc', {
                    current: data.currentWeight ?? 0,
                    target: targetWeight,
                    weeks: targetWeeks,
                    calories: recommendedCalories
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Navigation Buttons */}
      <div className="pt-4">
        <div className="flex gap-3">
          <Button variant="outline" onClick={prevStep} className="flex-1">
            <ChevronLeft className="w-4 h-4 mr-2" />
            {t('onboarding.prevStep')}
          </Button>
          <Button 
            onClick={nextStep} 
            className="flex-1 bg-teal-500 hover:bg-teal-600"
            disabled={!isFormComplete}
          >
            {t('onboarding.toStep3')}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
        
        {/* Helper text when form is incomplete */}
        {!isFormComplete && (
          <p className="text-center text-sm text-gray-500 mt-2">
            {t('onboarding.fillTargetWeight')}
          </p>
        )}
      </div>
    </div>
  );
}

// Step 3: First Record Component - Simplified flow
function Step3FirstRecord() {
  const { t } = useI18n();
  const { data, updateData, completeOnboarding, prevStep } = useOnboarding();
  
  const [weight, setWeight] = useState(data.currentWeight?.toString() || '');
  const [recorded, setRecorded] = useState(false);
  
  const handleRecord = () => {
    const weightNum = parseFloat(weight);
    if (weightNum > 0) {
      updateData({
        currentWeight: weightNum,
        firstWeightRecorded: true,
      });
      setRecorded(true);
    }
  };
  
  const handleComplete = () => {
    completeOnboarding();
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto px-1 space-y-5">
        <div className="text-center mb-3">
          <p className="text-gray-600 text-sm">
            {t('onboarding.step3Desc')}
          </p>
        </div>
        
        {/* Weight Input */}
        <div className="space-y-2">
          <Label htmlFor="firstWeight">{t('onboarding.recordFirstWeight')}</Label>
          <Input
            id="firstWeight"
            type="number"
            placeholder={t('onboarding.weightPlaceholder')}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full"
          />
        </div>
        
        {/* Record Button - Show when not recorded */}
        {!recorded && (
          <Button 
            onClick={handleRecord}
            className="w-full bg-teal-500 hover:bg-teal-600"
            disabled={!weight || parseFloat(weight) <= 0}
          >
            <Scale className="w-4 h-4 mr-2" />
            {t('onboarding.recordWeight')}
          </Button>
        )}
        
        {/* Success Message */}
        {recorded && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <Check className="w-10 h-10 text-green-500 mx-auto mb-2" />
              <p className="text-green-600 font-medium">{t('onboarding.recordSuccess')}</p>
              <p className="text-gray-600 text-sm mt-1">{t('onboarding.readyToStart')}</p>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Navigation Buttons */}
      <div className="pt-4">
        <div className="flex gap-3">
          <Button variant="outline" onClick={prevStep} className="flex-1">
            <ChevronLeft className="w-4 h-4 mr-2" />
            {t('onboarding.prevStep')}
          </Button>
          <Button 
            onClick={handleComplete} 
            className="flex-1 bg-teal-500 hover:bg-teal-600"
            disabled={!recorded}
          >
            {t('onboarding.goToDashboard')}
            <Check className="w-4 h-4 ml-2" />
          </Button>
        </div>
        
        {/* Helper text when not recorded */}
        {!recorded && (
          <p className="text-center text-sm text-gray-500 mt-2">
            {t('onboarding.recordWeightFirst')}
          </p>
        )}
      </div>
    </div>
  );
}

// Main Onboarding Modal
export function OnboardingModal() {
  const { t } = useI18n();
  const { isModalOpen, currentStep, closeModal, isCompleted } = useOnboarding();
  
  // Don't show if completed
  if (isCompleted && isModalOpen === false) return null;
  
  const stepTitles = {
    1: t('onboarding.step1'),
    2: t('onboarding.step2'),
    3: t('onboarding.step3'),
  };
  
  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent 
        className="max-w-md mx-auto max-h-[85vh] overflow-y-auto p-4 sm:p-6"
        showCloseButton={true}
      >
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {t('onboarding.title')}
          </DialogTitle>
          <DialogDescription className="text-center">
            {t('onboarding.subtitle')}
          </DialogDescription>
        </DialogHeader>
        
        {/* Progress Indicator */}
        <div className="flex justify-center gap-2 py-2">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`w-8 h-8 rounded-full flex items-center justify-center font-medium transition-colors ${
                step === currentStep
                  ? 'bg-teal-500 text-white'
                  : step < currentStep
                  ? 'bg-teal-100 text-teal-600'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step < currentStep ? <Check className="w-4 h-4" /> : step}
            </div>
          ))}
        </div>
        
        {/* Current Step Title */}
        <div className="text-center font-medium text-gray-700 pb-2">
          {stepTitles[currentStep]}
        </div>
        
        {/* Step Content */}
        {currentStep === 1 && <Step1BasicInfo />}
        {currentStep === 2 && <Step2GoalSetting />}
        {currentStep === 3 && <Step3FirstRecord />}
        
        {/* Skip Button */}
        <div className="text-center pt-2">
          <Button variant="ghost" size="sm" onClick={closeModal} className="text-gray-500">
            {t('onboarding.skip')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}