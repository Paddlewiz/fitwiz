'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Calculator, LineChart } from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';

// Dynamically import GamifiedHealthPanel to avoid SSR issues with client-only features
const GamifiedHealthPanel = dynamic(
  () => import('@/components/gamified/gamified-health-panel').then(mod => mod.GamifiedHealthPanel),
  { ssr: false, loading: () => <div className="h-[300px] bg-gray-100 rounded-2xl animate-pulse" /> }
);

export function HomeClient() {
  const { t } = useI18n();

  // Default values for homepage (user needs to login for real data)
  const defaultHealthData = {
    proteinCurrent: 0,
    proteinTarget: 60,
    energyDeficitCurrent: 0,
    energyDeficitTarget: 300,
    exerciseCurrent: 0,
    exerciseTarget: 300,
    tdee: 1800,
    todayIntake: 0,
    todayProtein: 0,
    todayExercise: 0,
    isLoggedIn: false,
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Gamified Health Panel - Main Focus */}
      <section className="px-4 py-6">
        <div className="container mx-auto max-w-lg">
          <GamifiedHealthPanel {...defaultHealthData} />
        </div>
      </section>

      {/* Record Today's Data Button */}
      <section className="px-4 py-4">
        <div className="container mx-auto max-w-lg">
          <Card className="bg-white shadow-md border-2 border-teal-100 hover:border-teal-300 transition-colors">
            <CardContent className="p-4">
              <Link href="/record">
                <Button 
                  className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-6 rounded-xl shadow-lg"
                  size="lg"
                >
                  <Plus className="w-6 h-6 mr-3" />
                  {t('record.recordToday')}
                </Button>
              </Link>
              <p className="text-center text-gray-500 text-sm mt-3">
                {t('record.recordTodayDesc')}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="px-4 py-4">
        <div className="container mx-auto max-w-lg">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">
            快速入口
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/calculators/tdee">
              <Card className="bg-white hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                    <Calculator className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">TDEE计算器</p>
                    <p className="text-xs text-gray-500">每日能量消耗</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/calculators/bmi">
              <Card className="bg-white hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <LineChart className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">BMI计算器</p>
                    <p className="text-xs text-gray-500">体质指数评估</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Login Prompt for non-logged users */}
      <section className="px-4 py-6">
        <div className="container mx-auto max-w-lg">
          <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
            <CardContent className="p-6 text-center">
              <p className="text-teal-700 mb-4">
                登录后可保存数据、追踪长期变化
              </p>
              <Link href="/login">
                <Button className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8">
                  立即登录 / 注册
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}