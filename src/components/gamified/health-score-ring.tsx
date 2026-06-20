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

// 根据分数获取颜色 - 统一使用翠绿色主题
function getScoreColor(score: number): string {
  if (score >= 85) return '#10B981'; // 翠绿色 - 优秀/达标
  if (score >= 70) return '#34D399'; // 浅翠绿 - 良好
  if (score >= 50) return '#F59E0B'; // 橙色 - 一般/未达标
  return '#FB923C'; // 浅橙色 - 需改进
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

  // SVG 环形参数 - 放大尺寸作为核心视觉焦点
  const size = 320;
  const center = size / 2;
  const strokeWidth = 20;

  // 外层三个分段环的半径 - 增大为核心视觉
  const outerRadius = 140;
  // 内层综合评分环的半径 - 增大
  const innerRadius = 105;

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

  // 进度颜色 - 统一配色：达标翠绿色，未达标橙色
  const getProgressColor = (progress: number): string => {
    if (progress >= 100) return '#10B981'; // 达标 - 翠绿色
    if (progress >= 70) return '#F59E0B'; // 接近达标 - 橙色
    return '#D1D5DB'; // 未达标 - 浅灰色
  };

  return (
    <div className={cn('relative flex flex-col items-center', className)}>
      {/* SVG 环形仪表盘 */}
      <svg width={size} height={size} className={cn('relative', isHotState && 'animate-pulse')}>
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
          strokeWidth={strokeWidth - 4}
        />

        {/* 外层三段进度环 - 蛋白质（0-120度） */}
        {animatedProtein > 0 && (
          <path
            d={createArcPath(outerRadius, proteinArc.start, proteinArc.end)}
            fill="none"
            stroke={getProgressColor(animatedProtein)}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        )}

        {/* 外层三段进度环 - 能量缺口（120-240度） */}
        {animatedEnergy > 0 && (
          <path
            d={createArcPath(outerRadius, energyArc.start, energyArc.end)}
            fill="none"
            stroke={getProgressColor(animatedEnergy)}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        )}

        {/* 外层三段进度环 - 运动消耗（240-360度） */}
        {animatedExercise > 0 && (
          <path
            d={createArcPath(outerRadius, exerciseArc.start, exerciseArc.end)}
            fill="none"
            stroke={getProgressColor(animatedExercise)}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        )}

        {/* 内层综合评分环 */}
        {animatedScore > 0 && (
          <circle
            cx={center}
            cy={center}
            r={innerRadius}
            fill="none"
            stroke={scoreColor}
            strokeWidth={strokeWidth - 4}
            strokeDasharray={`${(scoreArcEnd / 360) * 2 * Math.PI * innerRadius} ${2 * Math.PI * innerRadius}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
          />
        )}

        {/* 中心分数和等级 */}
        <text
          x={center}
          y={center - 15}
          textAnchor="middle"
          className="fill-current text-gray-900 font-bold"
          style={{ fontSize: '56px' }}
        >
          {animatedScore}
        </text>
        <text
          x={center}
          y={center + 30}
          textAnchor="middle"
          className="fill-current text-gray-600"
          style={{ fontSize: '20px' }}
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
      <div className="flex justify-center gap-4 mt-4 text-sm">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-teal-500" />
          <span className="text-gray-600">蛋白质</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-gray-600">能量缺口</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-gray-600">运动消耗</span>
        </div>
      </div>
    </div>
  );
}