'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { HealthScoreRing } from './health-score-ring';
import { ProgressModulesGroup } from './progress-modules';
import { useI18n } from '@/lib/i18n-context';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
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
  showRecordButton?: boolean; // 是否显示记录按钮
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
  showRecordButton = true,
}: GamifiedHealthPanelProps) {
  const { t } = useI18n();
  const router = useRouter();

  // 计算各项进度（防止除零错误）
  const proteinProgress = proteinTarget > 0 ? Math.min((todayProtein / proteinTarget) * 100, 100) : 0;
  const energyDeficit = Math.max(tdee - todayIntake + todayExercise, 0);
  const energyProgress = energyDeficitTarget > 0 ? Math.min((energyDeficit / energyDeficitTarget) * 100, 100) : 0;
  const exerciseProgress = exerciseTarget > 0 ? Math.min((todayExercise / exerciseTarget) * 100, 100) : 0;

  // 计算综合健康指数（加权平均）
  // 权重：蛋白质 30%，能量缺口 40%，运动消耗 30%
  const healthScore = Math.round(
    proteinProgress * 0.3 + energyProgress * 0.4 + exerciseProgress * 0.3
  );

  // 检测是否有数据
  const hasData = todayIntake > 0 || todayExercise > 0 || todayProtein > 0;

  // 检测是否三项全部达标
  const allAchieved = proteinProgress >= 100 && energyProgress >= 100 && exerciseProgress >= 100;

  if (!hasData) {
    return (
      <div className={cn('bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-6 border border-teal-100', className)}>
        <div className="text-center">
          {/* 空状态环形图 - 放大尺寸 */}
          <div className="relative w-64 h-64 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-8 border-gray-200"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <span className="text-5xl font-light text-gray-300">--</span>
                <p className="text-xs text-gray-400 mt-1">健康指数</p>
              </div>
            </div>
          </div>

          <h3 className="font-medium text-gray-700 mb-2">
            {t('gamified.noDataTitle') || '还没有今日数据'}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {t('gamified.noDataHint') || '记录饮食和运动，查看健康指数'}
          </p>

          {showRecordButton && (
            <Button
              onClick={() => router.push('/record')}
              size="lg"
              className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-xl shadow-lg shadow-teal-200/50"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t('gamified.recordToday') || '记录今日数据'}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-gradient-to-br from-white via-teal-50/30 to-emerald-50/20 rounded-2xl shadow-sm border',
        allAchieved ? 'border-teal-300' : 'border-gray-100',
        className
      )}
    >
      {/* 热门状态横幅 */}
      {allAchieved && (
        <div className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-t-xl text-center">
          🔥 {t('gamified.hotState') || '火热状态'} - {t('gamified.allAchieved') || '三项达标！'}
        </div>
      )}

      {/* 标题区域 - 精简 */}
      <div className={cn('text-center px-4', allAchieved ? 'pt-3' : 'pt-4')}>
        <h2 className="text-base font-medium text-gray-800">
          {t('gamified.todayHealthStatus') || '今日健康状态'}
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          {t('gamified.statusDescription') || '综合评估你的饮食与运动表现'}
        </p>
      </div>

      {/* 环形仪表盘 - 核心视觉焦点，放大 */}
      <div className="flex justify-center px-4 py-3">
        <HealthScoreRing
          score={healthScore}
          proteinProgress={proteinProgress}
          energyProgress={energyProgress}
          exerciseProgress={exerciseProgress}
        />
      </div>

      {/* 进度条区域 - 紧凑布局，缩小 */}
      <div className="px-3 pb-3">
        <ProgressModulesGroup
          proteinCurrent={todayProtein}
          proteinTarget={proteinTarget}
          energyDeficitCurrent={energyDeficit}
          energyDeficitTarget={energyDeficitTarget}
          exerciseCurrent={todayExercise}
          exerciseTarget={exerciseTarget}
        />
      </div>

      {/* 记录数据按钮 */}
      {showRecordButton && (
        <div className="px-3 pb-3">
          <Button
            onClick={() => router.push('/record')}
            variant="outline"
            className="w-full border-teal-200 text-teal-600 hover:bg-teal-50 rounded-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('gamified.updateRecord') || '更新今日数据'}
          </Button>
        </div>
      )}

      {/* 底部说明 - 精简 */}
      <div className="px-4 pb-3 text-center">
        <p className="text-xs text-gray-400">
          {t('gamified.calculationNote') || '健康指数 = 蛋白质30% + 能量缺口40% + 运动30%'}
        </p>
      </div>
    </div>
  );
}

// 导出所有组件
export { HealthScoreRing } from './health-score-ring';
export { ProgressModulesGroup, ProgressModule } from './progress-modules';