'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Beef, Flame, Activity } from 'lucide-react';

interface ProgressModuleProps {
  icon: React.ReactNode;
  label: string;
  current: number;
  target: number;
  unit: string;
  achieved: boolean;
  hint?: string;
  className?: string;
}

export function ProgressModule({
  icon,
  label,
  current,
  target,
  unit,
  achieved,
  hint,
  className,
}: ProgressModuleProps) {
  const [animatedWidth, setAnimatedWidth] = useState(0);
  // 防止除零错误
  const progress = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const remaining = target > 0 ? Math.max(target - current, 0) : 0;

  // 动画效果
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedWidth(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  // 触发达标动画
  const [showAchievedAnimation, setShowAchievedAnimation] = useState(false);
  useEffect(() => {
    if (achieved && progress >= 100) {
      setShowAchievedAnimation(true);
      setTimeout(() => setShowAchievedAnimation(false), 2000);
    }
  }, [achieved, progress]);

  // 统一配色：达标翠绿色，未达标橙色
  const achievedColor = 'bg-teal-500 text-teal-500';
  const notAchievedColor = 'bg-orange-500 text-orange-500';

  return (
    <div
      className={cn(
        'relative bg-white rounded-lg p-3 shadow-sm border overflow-hidden transition-all duration-300',
        achieved ? 'border-teal-200' : 'border-orange-200',
        showAchievedAnimation && 'animate-pulse border-teal-400',
        className
      )}
    >
      {/* 左侧彩色高亮条（FIFA风格） */}
      <div
        className={cn(
          'absolute left-0 top-0 bottom-0 w-1 transition-colors duration-300',
          achieved ? 'bg-gradient-to-b from-teal-400 to-teal-600' : 'bg-gradient-to-b from-orange-400 to-orange-600'
        )}
      />

      <div className="flex items-center justify-between">
        {/* 左侧：图标 + 名称 */}
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300',
              achieved ? 'bg-teal-100 text-teal-600' : 'bg-orange-100 text-orange-500',
              showAchievedAnimation && 'scale-110 animate-bounce'
            )}
          >
            {icon}
          </div>
          <div>
            <span className="font-medium text-gray-900 text-sm">{label}</span>
            {!achieved && remaining > 0 && (
              <span className="text-xs text-orange-500 ml-1">
                还差 {remaining.toFixed(0)}{unit}
              </span>
            )}
            {achieved && (
              <span className="text-xs text-teal-500 ml-1">✓</span>
            )}
          </div>
        </div>

        {/* 右侧：数值 */}
        <div className="text-right">
          <span
            className={cn(
              'font-bold text-base',
              achieved ? 'text-teal-600' : 'text-orange-500'
            )}
          >
            {current.toFixed(0)}
          </span>
          <span className="text-gray-400 text-xs"> / {target.toFixed(0)} {unit}</span>
        </div>
      </div>

      {/* 进度条 */}
      <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-1000 ease-out',
            achieved ? 'bg-gradient-to-r from-teal-400 to-teal-600' : 'bg-gradient-to-r from-orange-400 to-orange-600'
          )}
          style={{ width: `${animatedWidth}%` }}
        />
      </div>

      {/* 提示信息 */}
      {hint && !achieved && (
        <div className="mt-1.5 text-xs text-gray-500 bg-gray-50 rounded px-2 py-0.5">
          💡 {hint}
        </div>
      )}
    </div>
  );
}

// 三个进度模块的组合组件 - 紧凑布局
interface ProgressModulesGroupProps {
  proteinCurrent: number;
  proteinTarget: number;
  energyDeficitCurrent: number;
  energyDeficitTarget: number;
  exerciseCurrent: number;
  exerciseTarget: number;
  className?: string;
}

export function ProgressModulesGroup({
  proteinCurrent,
  proteinTarget,
  energyDeficitCurrent,
  energyDeficitTarget,
  exerciseCurrent,
  exerciseTarget,
  className,
}: ProgressModulesGroupProps) {
  const proteinAchieved = proteinCurrent >= proteinTarget;
  const energyAchieved = energyDeficitCurrent >= energyDeficitTarget;
  const exerciseAchieved = exerciseCurrent >= exerciseTarget;

  // 检测是否三项全部达标
  const allAchieved = proteinAchieved && energyAchieved && exerciseAchieved;

  // 生成提示
  const getProteinHint = () => {
    if (proteinAchieved) return undefined;
    const remaining = proteinTarget - proteinCurrent;
    if (remaining <= 20) return '吃一个鸡蛋即可达标';
    if (remaining <= 50) return '加一份瘦肉或豆腐即可达标';
    return '注意每餐增加蛋白质摄入';
  };

  const getEnergyHint = () => {
    if (energyAchieved) return undefined;
    const remaining = energyDeficitTarget - energyDeficitCurrent;
    if (remaining <= 100) return '少吃一块饼干即可达标';
    if (remaining <= 200) return '步行20分钟即可达标';
    return '控制饮食+增加运动';
  };

  const getExerciseHint = () => {
    if (exerciseAchieved) return undefined;
    const remaining = exerciseTarget - exerciseCurrent;
    if (remaining <= 100) return '步行10分钟即可达标';
    if (remaining <= 200) return '快走或慢跑15分钟';
    return '增加运动时间和强度';
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* 状态提示 */}
      {allAchieved && (
        <div className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-lg text-center animate-pulse">
          🎉 三项达标，明天大概率体重下降！
        </div>
      )}

      {/* 进度模块 */}
      <ProgressModule
        icon={<Beef className="w-4 h-4" />}
        label="蛋白质摄入"
        current={proteinCurrent}
        target={proteinTarget}
        unit="g"
        achieved={proteinAchieved}
        hint={getProteinHint()}
      />

      <ProgressModule
        icon={<Flame className="w-4 h-4" />}
        label="能量缺口"
        current={energyDeficitCurrent}
        target={energyDeficitTarget}
        unit="kcal"
        achieved={energyAchieved}
        hint={getEnergyHint()}
      />

      <ProgressModule
        icon={<Activity className="w-4 h-4" />}
        label="运动消耗"
        current={exerciseCurrent}
        target={exerciseTarget}
        unit="kcal"
        achieved={exerciseAchieved}
        hint={getExerciseHint()}
      />
    </div>
  );
}