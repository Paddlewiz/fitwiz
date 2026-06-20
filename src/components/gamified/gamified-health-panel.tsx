'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { HealthScoreRing } from './health-score-ring';
import { ProgressModulesGroup } from './progress-modules';
import { useI18n } from '@/lib/i18n-context';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface GamifiedHealthPanelProps {
  // 基础数据
  tdee: number; // 每日总能量消耗
  todayIntake: number; // 今日摄入热量
  todayProtein: number; // 今日蛋白质摄入
  todayExercise: number; // 今日运动消耗
  // 目标数据
  proteinTarget: number; // 蛋白质目标
  energyDeficitTarget: number; // 能量缺口目标
  exerciseTarget: number; // 运动消耗目标
  className?: string;
}

export function GamifiedHealthPanel({
  tdee,
  todayIntake,
  todayProtein,
  todayExercise,
  proteinTarget,
  energyDeficitTarget,
  exerciseTarget,
  className,
}: GamifiedHealthPanelProps) {
  const { t } = useI18n();
  const router = useRouter();

  // 计算各项进度
  const proteinProgress = Math.min((todayProtein / proteinTarget) * 100, 100);
  const energyDeficit = Math.max(tdee - todayIntake + todayExercise, 0);
  const energyProgress = Math.min((energyDeficit / energyDeficitTarget) * 100, 100);
  const exerciseProgress = Math.min((todayExercise / exerciseTarget) * 100, 100);

  // 计算综合健康指数（加权平均）
  // 权重：蛋白质 30%，能量缺口 40%，运动消耗 30%
  const healthScore = Math.round(
    proteinProgress * 0.3 + energyProgress * 0.4 + exerciseProgress * 0.3
  );

  // 检测是否有数据
  const hasData = todayIntake > 0 || todayExercise > 0 || todayProtein > 0;

  if (!hasData) {
    return (
      <div className={cn('bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6', className)}>
        <div className="text-center">
          <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl">📊</span>
          </div>
          <h3 className="font-medium text-gray-700 mb-2">
            {t('gamified.noDataTitle')}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {t('gamified.noDataHint')}
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => router.push('/metrics')}
              variant="outline"
              size="sm"
              className="text-teal-600 border-teal-200 hover:bg-teal-50"
            >
              {t('gamified.recordDiet')}
            </Button>
            <Button
              onClick={() => router.push('/metrics')}
              size="sm"
              className="bg-teal-500 hover:bg-teal-600 text-white"
            >
              {t('gamified.recordExercise')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-sm border border-gray-100',
        className
      )}
    >
      {/* 标题 */}
      <div className="text-center mb-6">
        <h2 className="text-lg font-medium text-gray-800">
          {t('gamified.todayHealthStatus')}
        </h2>
        <p className="text-sm text-gray-500">
          {t('gamified.statusDescription')}
        </p>
      </div>

      {/* 顶部环形仪表盘 */}
      <div className="flex justify-center mb-6">
        <HealthScoreRing
          score={healthScore}
          proteinProgress={proteinProgress}
          energyProgress={energyProgress}
          exerciseProgress={exerciseProgress}
        />
      </div>

      {/* 下方三根进度条 */}
      <ProgressModulesGroup
        proteinCurrent={todayProtein}
        proteinTarget={proteinTarget}
        energyDeficitCurrent={energyDeficit}
        energyDeficitTarget={energyDeficitTarget}
        exerciseCurrent={todayExercise}
        exerciseTarget={exerciseTarget}
      />

      {/* 底部说明 */}
      <div className="mt-6 pt-4 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-400">
          {t('gamified.calculationNote')}
        </p>
      </div>
    </div>
  );
}

// 导出所有组件
export { HealthScoreRing } from './health-score-ring';
export { ProgressModulesGroup, ProgressModule } from './progress-modules';