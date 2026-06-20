'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n-context';

interface GoalProgressRingProps {
  currentWeight: number;
  startWeight: number;
  targetWeight: number;
}

export function GoalProgressRing({ currentWeight, startWeight, targetWeight }: GoalProgressRingProps) {
  const { t } = useI18n();
  
  // Calculate progress percentage
  const totalToLose = startWeight - targetWeight;
  const alreadyLost = startWeight - currentWeight;
  const progressPercent = totalToLose > 0 ? Math.min(100, Math.max(0, (alreadyLost / totalToLose) * 100)) : 0;
  
  // SVG ring dimensions
  const size = 180;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;
  
  // Determine color based on progress
  const getProgressColor = () => {
    if (progressPercent >= 100) return '#10B981'; // Green - goal achieved
    if (progressPercent >= 50) return '#10B981'; // Green - on track
    if (progressPercent >= 25) return '#F59E0B'; // Orange - needs attention
    return '#EF4444'; // Red - behind
  };
  
  const progressColor = getProgressColor();
  const isGoalAchieved = currentWeight <= targetWeight;
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center">
      {/* Ring */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
          />
          {/* Progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={progressColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500 ease-out"
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-gray-800">
            {Math.round(progressPercent)}%
          </span>
          <span className="text-sm text-gray-500">
            {isGoalAchieved ? t('dashboard.goalAchieved') : t('dashboard.complete')}
          </span>
        </div>
      </div>
      
      {/* Weight info */}
      <div className="mt-4 text-center">
        <div className="flex items-center gap-4 justify-center">
          <div className="text-center">
            <span className="text-xl font-bold text-gray-800">{currentWeight.toFixed(1)}</span>
            <span className="text-sm text-gray-500 ml-1">kg</span>
            <p className="text-xs text-gray-400 mt-1">{t('dashboard.current')}</p>
          </div>
          <div className="text-gray-400">→</div>
          <div className="text-center">
            <span className="text-xl font-bold text-teal-600">{targetWeight.toFixed(1)}</span>
            <span className="text-sm text-gray-500 ml-1">kg</span>
            <p className="text-xs text-gray-400 mt-1">{t('dashboard.target')}</p>
          </div>
        </div>
        
        {/* Weight lost info */}
        {alreadyLost > 0 && (
          <p className="mt-3 text-sm text-green-600">
            {t('dashboard.weightLost')}: {alreadyLost.toFixed(1)} kg
          </p>
        )}
        
        {/* Weight remaining */}
        {!isGoalAchieved && alreadyLost < totalToLose && (
          <p className="mt-1 text-sm text-gray-500">
            {t('dashboard.weightRemaining')}: {(totalToLose - alreadyLost).toFixed(1)} kg
          </p>
        )}
      </div>
    </div>
  );
}