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
  if (score >= 85) return '#10B981'; // 绿色 - 优秀
  if (score >= 70) return '#3B82F6'; // 蓝色 - 良好
  if (score >= 50) return '#F59E0B'; // 橙色 - 一般
  return '#EF4444'; // 红色 - 需改进
}

// 根据分数获取等级
function getScoreLevel(score: number): string {
  if (score >= 85) return '优秀';
  if (score >= 70) return '良好';
  if (score >= 50) return '一般';
  return '需改进';
}

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

  // 检测是否三项全部达标（火热状态）
  const allAchieved = proteinProgress >= 100 && energyProgress >= 100 && exerciseProgress >= 100;

  // 动画效果
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

  // SVG 环形参数
  const size = 200;
  const center = size / 2;
  const strokeWidth = 12;

  // 外层三个分段环的半径
  const outerRadius = 85;
  // 内层综合评分环的半径
  const innerRadius = 65;

  // 计算弧度路径
  const createArcPath = (
    radius: number,
    startAngle: number,
    endAngle: number,
    clockwise: boolean = true
  ): string => {
    const start = polarToCartesian(center, center, radius, endAngle);
    const end = polarToCartesian(center, center, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return [
      'M',
      start.x,
      start.y,
      'A',
      radius,
      radius,
      0,
      largeArcFlag,
      clockwise ? '0' : '1',
      end.x,
      end.y,
    ].join(' ');
  };

  const polarToCartesian = (
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number
  ) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  // 三个外层环的起始角度（每个占120度）
  const proteinArc = { start: 0, end: Math.min(120 * (animatedProtein / 100), 120) };
  const energyArc = { start: 120, end: Math.min(120 + 120 * (animatedEnergy / 100), 240) };
  const exerciseArc = { start: 240, end: Math.min(240 + 120 * (animatedExercise / 100), 360) };

  // 内层综合评分环
  const scoreArcEnd = Math.min(360 * (animatedScore / 100), 360);

  // 进度颜色
  const getProgressColor = (progress: number): string => {
    if (progress >= 100) return '#10B981'; // 达标 - 绿色
    if (progress >= 70) return '#F59E0B'; // 接近达标 - 橙色
    return '#9CA3AF'; // 未达标 - 灰色
  };

  return (
    <div className={cn('relative flex flex-col items-center', className)}>
      {/* SVG 环形仪表盘 */}
      <svg width={size} height={size} className="relative">
        {/* 背景圆环 - 外层 */}
        <circle
          cx={center}
          cy={center}
          r={outerRadius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />

        {/* 背景圆环 - 内层 */}
        <circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />

        {/* 外层三个分段进度 */}
        {/* 蛋白质进度 (0-120度) */}
        <path
          d={createArcPath(outerRadius, proteinArc.start, proteinArc.end)}
          fill="none"
          stroke={getProgressColor(animatedProtein)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={cn(
            'transition-all duration-300',
            isHotState && animatedProtein >= 100 && 'animate-pulse'
          )}
        />

        {/* 能量缺口进度 (120-240度) */}
        <path
          d={createArcPath(outerRadius, energyArc.start, energyArc.end)}
          fill="none"
          stroke={getProgressColor(animatedEnergy)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={cn(
            'transition-all duration-300',
            isHotState && animatedEnergy >= 100 && 'animate-pulse'
          )}
        />

        {/* 运动消耗进度 (240-360度) */}
        <path
          d={createArcPath(outerRadius, exerciseArc.start, exerciseArc.end)}
          fill="none"
          stroke={getProgressColor(animatedExercise)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={cn(
            'transition-all duration-300',
            isHotState && animatedExercise >= 100 && 'animate-pulse'
          )}
        />

        {/* 内层综合评分进度 */}
        <path
          d={createArcPath(innerRadius, 0, scoreArcEnd)}
          fill="none"
          stroke={scoreColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>

      {/* 中心分数显示 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn(
            'text-4xl font-bold transition-colors duration-500',
            isHotState && 'animate-pulse'
          )}
          style={{ color: scoreColor }}
        >
          {animatedScore}
        </span>
        <span className="text-sm text-gray-500 mt-1">{scoreLevel}</span>

        {/* 火热状态标签 */}
        {isHotState && (
          <div className="mt-2 px-3 py-1 bg-gradient-to-r from-green-400 to-teal-500 rounded-full text-white text-xs font-medium animate-bounce shadow-lg">
            🔥 火热状态
          </div>
        )}
      </div>

      {/* 外层标签 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 text-xs text-gray-600">
        🥩 蛋白质
      </div>
      <div className="absolute bottom-4 left-2 text-xs text-gray-600">🔥 能量</div>
      <div className="absolute bottom-4 right-2 text-xs text-gray-600">🏃 运动</div>
    </div>
  );
}