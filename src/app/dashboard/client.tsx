'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useI18n } from '@/lib/i18n-context';
import { useOnboarding } from '@/lib/onboarding-context';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { WeightTrendChart } from '@/components/charts/weight-trend-chart';
import { CalorieBalanceChart } from '@/components/charts/calorie-balance-chart';
import { GoalProgressRing } from '@/components/charts/goal-progress-ring';
import { EmptyState } from '@/components/dashboard/empty-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Scale, Calculator, BarChart3, ArrowRight, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface BodyMetric {
  id: string;
  created_at: string;
  weight: number;
  body_fat?: number;
  bmi?: number;
  body_age?: number;
  visceral_fat?: number;
  muscle_mass?: number;
  bone_mass?: number;
  water_percent?: number;
}

export default function DashboardClient() {
  const { t } = useI18n();
  const router = useRouter();
  const { isCompleted, data: onboardingData, restartOnboarding } = useOnboarding();
  const [metrics, setMetrics] = useState<BodyMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileData, setProfileData] = useState<{
    target_weight?: number;
    height?: number;
    recommended_calories?: number;
  }>({});
  
  const supabase = getSupabaseBrowserClient();
  
  // Check authentication and fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }
        
        setIsAuthenticated(true);
        
        // Fetch body metrics
        const response = await fetch('/api/metrics', {
          headers: {
            'x-session': session.access_token,
          },
        });
        
        if (response.ok) {
          const result = await response.json();
          setMetrics(result.data || []);
        } else {
          setError(t('common.error'));
        }
        
        // Fetch user profile for target weight
        const profileResponse = await fetch('/api/profile', {
          headers: {
            'x-session': session.access_token,
          },
        });
        
        if (profileResponse.ok) {
          const profileResult = await profileResponse.json();
          setProfileData(profileResult.data || {});
        }
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(t('common.error'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [supabase, t]);
  
  // Prepare chart data
  const prepareChartData = useCallback(() => {
    if (metrics.length === 0) return [];
    
    // Sort by date ascending
    const sortedMetrics = [...metrics].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    return sortedMetrics.map(metric => ({
      date: metric.created_at,
      displayDate: formatDate(metric.created_at),
      weight: metric.weight,
    }));
  }, [metrics]);
  
  // Prepare calorie chart data (mock for now, will integrate with diet logs)
  const prepareCalorieData = useCallback(() => {
    // Generate mock data for last 7 days
    const last7Days = [];
    const targetCalories = profileData.recommended_calories || onboardingData.recommendedCalories || 1800;
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const intake = Math.floor(1500 + Math.random() * 600); // Mock intake
      last7Days.push({
        date: date.toISOString(),
        displayDate: `${date.getMonth() + 1}/${date.getDate()}`,
        intake,
        target: targetCalories,
        balance: intake - targetCalories,
      });
    }
    
    return last7Days;
  }, [profileData.recommended_calories, onboardingData.recommendedCalories]);
  
  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };
  
  // Calculate current stats
  const latestMetric = metrics.length > 0 
    ? metrics.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
    : null;
  
  const previousMetric = metrics.length > 1 
    ? metrics.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[1]
    : null;
  
  const currentWeight = latestMetric?.weight || onboardingData.currentWeight;
  const previousWeight = previousMetric?.weight || onboardingData.currentWeight;
  const currentBMI = latestMetric?.bmi || onboardingData.calculatedBMI;
  const targetWeight = profileData.target_weight || onboardingData.targetWeight;
  const startWeight = metrics.length > 0 
    ? metrics.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0].weight
    : onboardingData.currentWeight;
  
  // Quick Actions
  const QuickActions = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Link href="/metrics">
        <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1">
          <Scale className="w-5 h-5 text-teal-500" />
          <span className="text-sm">{t('dashboard.logWeight')}</span>
        </Button>
      </Link>
      <Link href="/calculators/tdee">
        <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1">
          <Calculator className="w-5 h-5 text-teal-500" />
          <span className="text-sm">{t('dashboard.tdeeCalc')}</span>
        </Button>
      </Link>
      <Link href="/calculators/bmi">
        <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1">
          <BarChart3 className="w-5 h-5 text-teal-500" />
          <span className="text-sm">{t('dashboard.bmiCalc')}</span>
        </Button>
      </Link>
      <Link href="/metrics">
        <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1">
          <Plus className="w-5 h-5 text-teal-500" />
          <span className="text-sm">{t('dashboard.fullMetrics')}</span>
        </Button>
      </Link>
    </div>
  );
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">{t('common.loading')}</p>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-4">{t('dashboard.loginRequired')}</p>
            <Link href="/login">
              <Button className="bg-teal-500 hover:bg-teal-600">
                {t('nav.login')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              {t('common.retry')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="bg-teal-500 text-white px-4 py-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{t('dashboard.welcome')}</h1>
            <p className="text-teal-100 text-sm mt-1">
              {t('dashboard.progressToTarget')}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={restartOnboarding}
            className="text-white hover:bg-teal-600"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            {t('dashboard.startTracking')}
          </Button>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="px-4 mb-6">
        <QuickActions />
      </div>
      
      {/* Stats Cards */}
      <div className="px-4 mb-6">
        <StatsCards 
          currentWeight={currentWeight}
          previousWeight={previousWeight}
          bmi={currentBMI}
          todayCalories={prepareCalorieData()[6]?.intake}
          targetCalories={profileData.recommended_calories || onboardingData.recommendedCalories}
        />
      </div>
      
      {/* Main Content */}
      {metrics.length === 0 && !onboardingData.currentWeight ? (
        /* Empty State */
        <div className="px-4">
          <EmptyState type="welcome" />
        </div>
      ) : (
        /* Charts Section */
        <div className="px-4 space-y-6">
          {/* Weight Trend Chart */}
          <WeightTrendChart 
            data={prepareChartData()}
            targetWeight={targetWeight}
            currentWeight={currentWeight}
          />
          
          {/* Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Calorie Balance Chart */}
            <CalorieBalanceChart data={prepareCalorieData()} />
            
            {/* Goal Progress Ring */}
            {targetWeight && startWeight && currentWeight && (
              <GoalProgressRing 
                currentWeight={currentWeight}
                startWeight={startWeight}
                targetWeight={targetWeight}
              />
            )}
            
            {/* No Goal Set */}
            {!targetWeight && (
              <EmptyState type="no-goal" />
            )}
          </div>
          
          {/* Recent Records */}
          {metrics.length > 0 && (
            <Card className="bg-white shadow-sm">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-800 mb-4">
                  {t('metrics.recentRecords')}
                </h3>
                <div className="space-y-3">
                  {metrics.slice(0, 5).map((metric, index) => (
                    <div key={metric.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="font-medium">{metric.weight.toFixed(1)} kg</p>
                        <p className="text-xs text-gray-500">
                          {new Date(metric.created_at).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                      {index > 0 && metrics[index - 1] && (
                        <div className="flex items-center gap-1">
                          {metric.weight < metrics[index - 1].weight ? (
                            <span className="text-green-500 text-sm">
                              ↓ {(metrics[index - 1].weight - metric.weight).toFixed(1)} kg
                            </span>
                          ) : metric.weight > metrics[index - 1].weight ? (
                            <span className="text-red-500 text-sm">
                              ↑ {(metric.weight - metrics[index - 1].weight).toFixed(1)} kg
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Guidance to next step */}
          <Card className="bg-teal-50 border-teal-200">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-teal-700">
                    {t('guidance.toDashboard')}
                  </p>
                </div>
                <Link href="/metrics">
                  <ArrowRight className="w-5 h-5 text-teal-500" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}