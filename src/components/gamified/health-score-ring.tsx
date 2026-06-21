'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface HealthScoreRingProps {
  score: number; // 0-100
  proteinProgress: number; // 0-100
  energyProgress: number; // 0-100
  exerciseProgress: number; // 0-100
  className?: string;
}

// 根据分数获取颜色
function getScoreColor(score: number): string {
  if (score >= 85) return '#10B981';
  if (score >= 70) return '#34D399';
  if (score >= 50) return '#F59E0B';
  return '#FB923C';
}

function getScoreLevel(score: number): string {
  if (score >= 85) return '优秀';
  if (score >= 70) return '良好';
  if (score >= 50) return '一般';
  return '需改进';
}

// 三圈配置：不同半径、不同颜色
const RING_CONFIG = [
  {
    key: 'protein',
    radius: 145,
    strokeWidth: 16,
    color: '#10B981',   // 翠绿
    bgColor: '#E0F2FE',
    label: '蛋白质',
  },
  {
    key: 'energy',
    radius: 118,
    strokeWidth: 16,
    color: '#F59E0B',   // 琥珀橙
    bgColor: '#FEF3C7',
    label: '能量缺口',
  },
  {
    key: 'exercise',
    radius: 91,
    strokeWidth: 16,
    color: '#3B82F6',   // 蓝色
    bgColor: '#DBEAFE',
    label: '运动消耗',
  },
];

export function HealthScoreRing({
  score,
  proteinProgress,
  energyProgress,
  exerciseProgress,
  className,
}: HealthScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [animatedProtein, setAnimatedProtein] = useState(0);
  const [animatedEnergy, setAnimatedEnergy] = useState(0);
  const [animatedExercise, setAnimatedExercise] = useState(0);
  const [isHotState, setIsHotState] = useState(false);

  const allAchieved = proteinProgress >= 100 && energyProgress >= 100 && exerciseProgress >= 100;

  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const interval = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setAnimatedScore(Math.round(score * progress));
      setAnimatedProtein(Math.round(proteinProgress * progress));
      setAnimatedEnergy(Math.round(energyProgress * progress));
      setAnimatedExercise(Math.round(exerciseProgress * progress));

      if (currentStep >= steps) {
        clearInterval(timer);
        if (allAchieved) {
          setIsHotState(true);
        }
      }
    }, interval);

    return () => clearInterval(timer);
  }, [score, proteinProgress, energyProgress, exerciseProgress, allAchieved]);

  const scoreColor = getScoreColor(animatedScore);
  const scoreLevel = getScoreLevel(animatedScore);

  const size = 340;
  const center = size / 2;

  // 计算圆环周长
  const getCircleCircumference = (radius: number) => 2 * Math.PI * radius;

  // 三个进度的值
  const progressValues: Record<string, number> = {
    protein: animatedProtein,
    energy: animatedEnergy,
    exercise: animatedExercise,
  };

  return (
    <div className={cn('relative flex flex-col items-center', className)}>
      <svg width={size} height={size} className={cn('relative', isHotState && 'animate-pulse')}>
        {/* 三圈背景 + 进度 */}
        {RING_CONFIG.map((ring) => {
          const circumference = getCircleCircumference(ring.radius);
          const progress = Math.min(progressValues[ring.key] / 100, 1);
          const dashLength = circumference * progress;
          const dashGap = circumference - dashLength;

          return (
            <g key={ring.key}>
              {/* 背景圆环 */}
              <circle
                cx={center}
                cy={center}
                r={ring.radius}
                fill="none"
                stroke={ring.bgColor}
                strokeWidth={ring.strokeWidth}
              />
              {/* 进度圆环 */}
              {progress > 0 && (
                <circle
                  cx={center}
                  cy={center}
                  r={ring.radius}
                  fill="none"
                  stroke={ring.color}
                  strokeWidth={ring.strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={`${dashLength} ${dashGap}`}
                  transform={`rotate(-90 ${center} ${center})`}
                  style={{ transition: 'stroke-dasharray 0.3s ease' }}
                />
              )}
            </g>
          );
        })}

        {/* 中心分数和等级 */}
        <text
          x={center}
          y={center - 12}
          textAnchor="middle"
          className="fill-current text-gray-900 font-bold"
          style={{ fontSize: '52px' }}
        >
          {animatedScore}
        </text>
        <text
          x={center}
          y={center + 22}
          textAnchor="middle"
          className="fill-current"
          style={{ fontSize: '18px', color: scoreColor }}
        >
          {scoreLevel}
        </text>
      </svg>

      {/* 火热状态标签 */}
      {isHotState && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-bounce shadow-lg">
          🔥 火热状态
        </div>
      )}

      {/* 图例说明 */}
      <div className="flex justify-center gap-4 mt-3 text-sm">
        {RING_CONFIG.map((ring) => (
          <div key={ring.key} className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ring.color }} />
            <span className="text-gray-600">{ring.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
