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
import { GamifiedHealthPanel } from '@/components/gamified';
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

interface DailyCalorieData {
  date: string;
  displayDate: string;
  intake: number;
  target: number;
  deficit: number;
  exerciseBurn?: number;
  protein?: number;
}

// Helper function to format date
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

// Helper function to get date string for comparison
const getDateString = (date: Date) => {
  return date.toISOString().split('T')[0];
};

export default function DashboardClient() {
  const { t } = useI18n();
  const router = useRouter();
  const { isCompleted, data: onboardingData, restartOnboarding } = useOnboarding();
  const [metrics, setMetrics] = useState<BodyMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Profile data
  const [profileData, setProfileData] = useState<{
    target_weight?: number;
    height?: number;
    recommended_calories?: number;
    age?: number;
    gender?: string;
    activity_level?: string;
  }>({});
  
  // Today's actual data from database (NO MOCK DATA)
  const [todayIntake, setTodayIntake] = useState(0);
  const [todayProtein, setTodayProtein] = useState(0);
  const [todayExercise, setTodayExercise] = useState(0);
  const [weeklyCalorieData, setWeeklyCalorieData] = useState<DailyCalorieData[]>([]);
  
  const supabase = getSupabaseBrowserClient();
  
  // Calculate TDEE from user profile (if available)
  const calculateTDEE = useCallback(() => {
    const weight = metrics.length > 0 ? metrics[0].weight : onboardingData.currentWeight;
    const height = profileData.height || onboardingData.height;
    const age = profileData.age || onboardingData.age;
    const gender = profileData.gender || onboardingData.gender;
    const activityLevel = profileData.activity_level || 'moderate';
    
    if (!weight || !height || !age || !gender) {
      return profileData.recommended_calories || onboardingData.recommendedCalories || 1800;
    }
    
    // Mifflin-St Jeor formula
    let bmr: number;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    
    // Activity multiplier
    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9,
    };
    
    const multiplier = activityMultipliers[activityLevel] || 1.55;
    return Math.round(bmr * multiplier);
  }, [metrics, profileData, onboardingData]);
  
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
        
        // Fetch metrics data (includes diet_logs and exercise_logs)
        const metricsResponse = await fetch('/api/metrics', {
          headers: {
            'x-session': session.access_token,
          },
        });
        
        if (metricsResponse.ok) {
          const metricsResult = await metricsResponse.json();
          setMetrics(metricsResult.metrics || []);
          
          // Set today's actual data from API response (NO MOCK DATA)
          setTodayIntake(metricsResult.todayIntake || 0);
          setTodayProtein(metricsResult.todayProtein || 0);
          setTodayExercise(metricsResult.todayExercise || 0);
          setWeeklyCalorieData(metricsResult.weeklyCalorieData || []);
        }
        
        // Fetch user profile for target weight and TDEE calculation
        const profileResponse = await fetch('/api/profile', {
          headers: {
            'x-session': session.access_token,
          },
        });
        
        if (profileResponse.ok) {
          const profileResult = await profileResponse.json();
          setProfileData(profileResult.profile || {});
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
  
  // Prepare chart data from actual metrics
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
  
  // Get current weight from latest metric or onboarding data
  const currentWeight = metrics.length > 0 
    ? metrics.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].weight 
    : onboardingData.currentWeight || undefined;
  
  const previousWeight = metrics.length > 1 
    ? metrics.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[1].weight 
    : undefined;
  
  // Calculate BMI if we have weight and height
  const heightInCm = profileData.height ?? onboardingData?.height;
  const currentBMI = currentWeight && heightInCm
    ? currentWeight / Math.pow(heightInCm / 100, 2)
    : metrics.length > 0 ? metrics[0].bmi : undefined;
  
  // Target weight from profile or onboarding
  const targetWeight = profileData.target_weight || onboardingData.targetWeight;
  const startWeight = onboardingData.currentWeight || (metrics.length > 0 
    ? metrics.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0].weight 
    : undefined);
  
  // Calculate targets based on TDEE
  const tdee = calculateTDEE();
  const targetCalories = profileData.recommended_calories || onboardingData.recommendedCalories || Math.round(tdee * 0.8);
  
  // Recommended targets for gamified panel
  const proteinTarget = Math.round((targetCalories * 0.25) / 4); // 25% of calories from protein, 4 cal per gram
  const energyDeficitTarget = Math.max(0, tdee - targetCalories); // Daily deficit target
  const exerciseTarget = 300; // Standard exercise burn target
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }
  
  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full bg-white shadow-lg">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {t('dashboard.loginRequired')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('dashboard.loginHint')}
            </p>
            <Link href="/login">
              <Button className="w-full bg-teal-600 hover:bg-teal-700">
                {t('nav.login')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full bg-white shadow-lg">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-4">
              {t('common.error')}
            </h2>
            <Button onClick={() => window.location.reload()} className="bg-teal-600 hover:bg-teal-700">
              {t('common.retry')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-4 py-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{t('dashboard.welcome')}</h1>
            <p className="text-teal-100 mt-1">{t('dashboard.subtitle')}</p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            onClick={restartOnboarding}
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            {t('onboarding.restart')}
          </Button>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/metrics">
            <Button className="w-full bg-teal-600 hover:bg-teal-700 h-12">
              <Plus className="w-4 h-4 mr-2" />
              {t('dashboard.logWeight')}
            </Button>
          </Link>
          <Link href="/calculators/tdee">
            <Button variant="outline" className="w-full h-12">
              <Calculator className="w-4 h-4 mr-2" />
              {t('dashboard.tdeeCalc')}
            </Button>
          </Link>
          <Link href="/calculators/bmi">
            <Button variant="outline" className="w-full h-12">
              <BarChart3 className="w-4 h-4 mr-2" />
              {t('dashboard.bmiCalc')}
            </Button>
          </Link>
          <Link href="/metrics">
            <Button variant="outline" className="w-full h-12">
              <Scale className="w-4 h-4 mr-2" />
              {t('dashboard.fullMetrics')}
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Stats Cards - Using REAL data only */}
      <div className="px-4 mb-6">
        <StatsCards 
          currentWeight={currentWeight}
          previousWeight={previousWeight}
          bmi={currentBMI}
          todayCalories={todayIntake}
          targetCalories={targetCalories}
        />
      </div>
      
      {/* Gamified Health Panel - Using REAL data only */}
      <div className="px-4 mb-6">
        <GamifiedHealthPanel
          tdee={tdee}
          todayIntake={todayIntake}
          todayProtein={todayProtein}
          todayExercise={todayExercise}
          proteinTarget={proteinTarget}
          energyDeficitTarget={energyDeficitTarget}
          exerciseTarget={exerciseTarget}
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
            {/* Calorie Balance Chart - Using REAL weekly data */}
            {weeklyCalorieData.length > 0 ? (
              <CalorieBalanceChart 
                data={weeklyCalorieData.map(d => ({
                  date: d.date,
                  displayDate: new Date(d.date).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }),
                  intake: d.intake,
                  target: tdee || 2000,
                  balance: (tdee || 2000) - d.intake - (d.exerciseBurn || 0)
                }))} 
              />
            ) : (
              <EmptyState type="no-calorie-data" />
            )}
            
            {/* Goal Progress Ring */}
            {targetWeight && startWeight && currentWeight ? (
              <GoalProgressRing 
                currentWeight={currentWeight}
                startWeight={startWeight}
                targetWeight={targetWeight}
              />
            ) : (
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
                        <span className="text-sm text-gray-500">
                          {formatDate(metric.created_at)}
                        </span>
                        <span className="ml-3 font-medium text-gray-800">
                          {metric.weight} kg
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {metric.bmi && (
                          <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded">
                            BMI {metric.bmi.toFixed(1)}
                          </span>
                        )}
                        {index > 0 && metrics[index - 1] && (
                          <span className={`text-xs font-medium ${
                            metric.weight < metrics[index - 1].weight 
                              ? 'text-green-600' 
                              : metric.weight > metrics[index - 1].weight 
                                ? 'text-orange-500' 
                                : 'text-gray-400'
                          }`}>
                            {metric.weight < metrics[index - 1].weight ? '↓' : metric.weight > metrics[index - 1].weight ? '↑' : '='}
                            {Math.abs(metric.weight - metrics[index - 1].weight).toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/metrics">
                  <Button variant="outline" className="w-full mt-4">
                    {t('dashboard.viewAll')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}