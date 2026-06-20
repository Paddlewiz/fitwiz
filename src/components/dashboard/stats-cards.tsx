'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n-context';
import { TrendingDown, TrendingUp, Minus, Heart, Flame, Scale } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardsProps {
  currentWeight?: number;
  previousWeight?: number;
  bmi?: number;
  todayCalories?: number;
  targetCalories?: number;
}

export function StatsCards({ 
  currentWeight, 
  previousWeight, 
  bmi, 
  todayCalories, 
  targetCalories 
}: StatsCardsProps) {
  const { t } = useI18n();
  
  // Calculate weight change
  const weightChange = currentWeight && previousWeight 
    ? currentWeight - previousWeight 
    : null;
  
  // Get BMI category and color
  const getBMICategory = (bmiValue: number): { label: string; color: string } => {
    if (bmiValue < 18.5) return { label: t('bmi.underweight'), color: 'text-blue-500' };
    if (bmiValue < 24) return { label: t('bmi.normal'), color: 'text-green-500' };
    if (bmiValue < 28) return { label: t('bmi.overweight'), color: 'text-orange-500' };
    return { label: t('bmi.obese'), color: 'text-red-500' };
  };
  
  const bmiInfo = bmi ? getBMICategory(bmi) : null;
  
  // Calculate calorie percentage
  const caloriePercent = todayCalories && targetCalories 
    ? Math.min(100, (todayCalories / targetCalories) * 100) 
    : null;
  
  // Get calorie progress color
  const getCalorieColor = (percent: number): string => {
    if (percent <= 80) return '#10B981'; // Green - good deficit
    if (percent <= 100) return '#F59E0B'; // Orange - close to target
    return '#EF4444'; // Red - over target
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Current Weight Card */}
      <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">{t('dashboard.currentWeight')}</p>
              {currentWeight ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-800">
                    {currentWeight.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500">kg</span>
                </div>
              ) : (
                <p className="text-lg text-gray-400">{t('common.noData')}</p>
              )}
            </div>
            <Scale className="w-5 h-5 text-teal-500" />
          </div>
          
          {/* Weight change indicator */}
          {weightChange !== null && weightChange !== 0 && (
            <div className="mt-3 flex items-center gap-1">
              {weightChange < 0 ? (
                <>
                  <TrendingDown className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500">
                    {Math.abs(weightChange).toFixed(1)} kg ↓
                  </span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-500">
                    {weightChange.toFixed(1)} kg ↑
                  </span>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* BMI Card */}
      <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">{t('dashboard.currentBMI')}</p>
              {bmi ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-800">
                    {bmi.toFixed(1)}
                  </span>
                </div>
              ) : (
                <p className="text-lg text-gray-400">{t('common.noData')}</p>
              )}
            </div>
            <Heart className="w-5 h-5 text-teal-500" />
          </div>
          
          {/* BMI category */}
          {bmiInfo && (
            <div className="mt-3">
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                bmiInfo.color === 'text-green-500' ? 'bg-green-100 text-green-600' :
                bmiInfo.color === 'text-orange-500' ? 'bg-orange-100 text-orange-600' :
                bmiInfo.color === 'text-red-500' ? 'bg-red-100 text-red-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                {bmiInfo.label}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Calorie Balance Card */}
      <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">{t('dashboard.calorieBalance')}</p>
              {todayCalories && targetCalories ? (
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-gray-800">
                    {todayCalories}
                  </span>
                  <span className="text-sm text-gray-500">/</span>
                  <span className="text-sm text-gray-500">{targetCalories}</span>
                  <span className="text-xs text-gray-400 ml-1">kcal</span>
                </div>
              ) : (
                <p className="text-lg text-gray-400">{t('common.noData')}</p>
              )}
            </div>
            <Flame className="w-5 h-5 text-teal-500" />
          </div>
          
          {/* Calorie progress bar */}
          {caloriePercent !== null && (
            <div className="mt-3">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-300"
                  style={{ 
                    width: `${caloriePercent}%`,
                    backgroundColor: getCalorieColor(caloriePercent)
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {caloriePercent <= 100 
                  ? `${Math.round(caloriePercent)}% ${t('dashboard.ofTarget')}`
                  : t('dashboard.overTarget')
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}