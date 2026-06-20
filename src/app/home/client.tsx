'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Calculator, LineChart, Scale, Activity, Target, ChevronRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';

// Dynamically import GamifiedHealthPanel to avoid SSR issues with client-only features
const GamifiedHealthPanel = dynamic(
  () => import('@/components/gamified/gamified-health-panel').then(mod => mod.GamifiedHealthPanel),
  { ssr: false, loading: () => <div className="h-[300px] bg-gray-100 rounded-2xl animate-pulse" /> }
);

// 今日数据类型
interface TodayData {
  protein: number;
  proteinTarget: number;
  energyDeficit: number;
  energyDeficitTarget: number;
  exercise: number;
  exerciseTarget: number;
  tdee: number;
  intake: number;
}

// Landing Page 组件 - 未登录状态显示
function LandingPage() {
  const { t } = useI18n();

  return (
    <div className="bg-gradient-to-b from-teal-50 to-white min-h-screen">
      {/* Hero 区域 */}
      <section className="px-4 py-12">
        <div className="container mx-auto max-w-lg text-center">
          {/* Logo 和品牌 */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white mb-4 shadow-lg shadow-teal-200">
              <Scale className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              FitWiz
            </h1>
            <p className="text-lg text-gray-600">
              {t('landing.subtitle') || '免费健康管理追踪工具'}
            </p>
          </div>

          {/* 价值介绍 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {t('landing.whatCanDo') || '你能做什么？'}
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                  <Calculator className="w-4 h-4 text-teal-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{t('landing.calcTDEE') || '计算每日能量消耗'}</p>
                  <p className="text-sm text-gray-500">{t('landing.calcTDEEDesc') || '科学估算你的TDEE，制定合理的减重目标'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <LineChart className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{t('landing.trackMetrics') || '追踪身体指标'}</p>
                  <p className="text-sm text-gray-500">{t('landing.trackMetricsDesc') || '体重、体脂、肌肉量，可视化变化趋势'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Target className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{t('landing.gameDashboard') || '游戏化仪表盘'}</p>
                  <p className="text-sm text-gray-500">{t('landing.gameDashboardDesc') || '像FIFA球员卡一样，追踪每日健康表现'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 登录/注册按钮 */}
          <Link href="/login">
            <Button className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold py-6 rounded-xl shadow-lg shadow-teal-200/50 mb-4">
              {t('landing.loginOrRegister') || '立即登录 / 注册'}
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <p className="text-center text-gray-500 text-sm">
            {t('landing.freeForever') || '免费使用，永久免费'}
          </p>
        </div>
      </section>

      {/* 计算器入口 */}
      <section className="px-4 py-8">
        <div className="container mx-auto max-w-lg">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">
            {t('landing.freeTools') || '免费工具'}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/calculators/tdee">
              <Card className="bg-white hover:shadow-md transition-shadow cursor-pointer border-teal-100 hover:border-teal-200">
                <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                  <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
                    <Calculator className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">TDEE计算器</p>
                    <p className="text-xs text-gray-500">{t('landing.tdeeDescShort') || '每日能量消耗'}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/calculators/bmi">
              <Card className="bg-white hover:shadow-md transition-shadow cursor-pointer border-orange-100 hover:border-orange-200">
                <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">BMI计算器</p>
                    <p className="text-xs text-gray-500">{t('landing.bmiDescShort') || '体质指数评估'}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
          <p className="text-center text-gray-400 text-xs mt-3">
            {t('landing.noLoginRequired') || '无需登录，直接使用'}
          </p>
        </div>
      </section>
    </div>
  );
}

// 已登录首页 - 显示真实数据仪表盘
function LoggedInHome({ todayData }: { todayData: TodayData }) {
  const { t } = useI18n();

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Gamified Health Panel - 核心视觉焦点 */}
      <section className="px-4 py-4">
        <div className="container mx-auto max-w-md">
          <GamifiedHealthPanel
            tdee={todayData.tdee}
            todayIntake={todayData.intake}
            todayProtein={todayData.protein}
            todayExercise={todayData.exercise}
            proteinTarget={todayData.proteinTarget}
            energyDeficitTarget={todayData.energyDeficitTarget}
            exerciseTarget={todayData.exerciseTarget}
            showRecordButton={false}
          />
        </div>
      </section>

      {/* 记录今日数据按钮 - 醒目 */}
      <section className="px-4 py-3">
        <div className="container mx-auto max-w-md">
          <Link href="/record">
            <Button 
              className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-5 rounded-xl shadow-lg shadow-teal-200/50"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t('record.recordToday') || '记录今日数据'}
            </Button>
          </Link>
        </div>
      </section>

      {/* 快速入口 - 紧凑 */}
      <section className="px-4 py-3">
        <div className="container mx-auto max-w-md">
          <div className="grid grid-cols-2 gap-3">
            <Link href="/calculators/tdee">
              <Card className="bg-white hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-3 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                    <Calculator className="w-4 h-4 text-teal-600" />
                  </div>
                  <span className="font-medium text-gray-900 text-sm">TDEE计算器</span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/calculators/bmi">
              <Card className="bg-white hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-3 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="font-medium text-gray-900 text-sm">BMI计算器</span>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export function HomeClient() {
  const { t } = useI18n();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [todayData, setTodayData] = useState<TodayData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = getSupabaseBrowserClient();
      
      // 获取用户登录状态
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
      
      if (user) {
        // 获取今日数据
        const today = new Date().toISOString().split('T')[0];
        
        // 获取用户档案数据（用于目标值）
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        // 获取今日饮食记录
        const { data: dietLogs } = await supabase
          .from('diet_logs')
          .select('calories, protein')
          .eq('user_id', user.id)
          .eq('date', today);
        
        // 获取今日运动记录
        const { data: exerciseLogs } = await supabase
          .from('exercise_logs')
          .select('calories_burned')
          .eq('user_id', user.id)
          .eq('date', today);
        
        // 计算今日汇总
        const totalIntake = (dietLogs || []).reduce((sum, log) => sum + (log.calories || 0), 0);
        const totalProtein = (dietLogs || []).reduce((sum, log) => sum + (log.protein || 0), 0);
        const totalExercise = (exerciseLogs || []).reduce((sum, log) => sum + (log.calories_burned || 0), 0);
        
        // 从用户档案获取目标值，使用默认值作为fallback
        const tdee = profile?.tdee || 1800;
        const proteinTarget = profile?.protein_target || 60;
        const energyDeficitTarget = profile?.energy_deficit_target || 300;
        const exerciseTarget = profile?.exercise_target || 300;
        
        setTodayData({
          protein: totalProtein,
          proteinTarget: proteinTarget,
          energyDeficit: Math.max(tdee - totalIntake + totalExercise, 0),
          energyDeficitTarget: energyDeficitTarget,
          exercise: totalExercise,
          exerciseTarget: exerciseTarget,
          tdee: tdee,
          intake: totalIntake,
        });
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  // 加载状态
  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Scale className="w-6 h-6 text-teal-600" />
          </div>
          <p className="text-gray-500">{t('common.loading') || '加载中...'}</p>
        </div>
      </div>
    );
  }

  // 未登录状态 - 显示 Landing Page
  if (!isLoggedIn) {
    return <LandingPage />;
  }

  // 已登录状态 - 显示仪表盘
  return <LoggedInHome todayData={todayData || {
    protein: 0,
    proteinTarget: 60,
    energyDeficit: 0,
    energyDeficitTarget: 300,
    exercise: 0,
    exerciseTarget: 300,
    tdee: 1800,
    intake: 0,
  }} />;
}