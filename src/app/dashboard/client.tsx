'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useI18n } from '@/lib/i18n-context';
import { useOnboarding } from '@/lib/onboarding-context';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getSupabaseBrowserClientAsync } from '@/lib/supabase-browser';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Scale, Calculator, BarChart3, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import Link from 'next/link';

// Dynamically import ALL components to avoid SSR issues
const GamifiedHealthPanel = dynamic(
  () => import('@/components/gamified/gamified-health-panel').then(mod => mod.GamifiedHealthPanel),
  { ssr: false, loading: () => <div className="h-[300px] bg-gray-100 rounded-2xl animate-pulse" /> }
);

const StatsCards = dynamic(
  () => import('@/components/dashboard/stats-cards').then(mod => mod.StatsCards),
  { ssr: false, loading: () => <div className="h-[100px] bg-gray-100 rounded-xl animate-pulse" /> }
);

const EmptyState = dynamic(
  () => import('@/components/dashboard/empty-state').then(mod => mod.EmptyState),
  { ssr: false, loading: () => <div className="h-[100px] bg-gray-100 rounded-xl animate-pulse" /> }
);

const WeightTrendChart = dynamic(
  () => import('@/components/charts/weight-trend-chart').then(mod => mod.WeightTrendChart),
  { ssr: false, loading: () => <div className="h-[200px] bg-gray-100 rounded-xl animate-pulse" /> }
);

const CalorieBalanceChart = dynamic(
  () => import('@/components/charts/calorie-balance-chart').then(mod => mod.CalorieBalanceChart),
  { ssr: false, loading: () => <div className="h-[200px] bg-gray-100 rounded-xl animate-pulse" /> }
);

const GoalProgressRing = dynamic(
  () => import('@/components/charts/goal-progress-ring').then(mod => mod.GoalProgressRing),
  { ssr: false, loading: () => <div className="h-[180px] bg-gray-100 rounded-xl animate-pulse" /> }
);

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
  balance: number; // alias for deficit, for CalorieBalanceChart compatibility
  exerciseBurn?: number;
  protein?: number;
}

// Helper function to format date
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

// Timeout helper
const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
    promise
      .then(result => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch(error => {
        clearTimeout(timer);
        reject(error);
      });
  });
};

export default function DashboardClient() {
  const { t } = useI18n();
  const router = useRouter();
  const { isCompleted, data: onboardingData, restartOnboarding } = useOnboarding();
  
  const [metrics, setMetrics] = useState<BodyMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
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
  const [todaySodium, setTodaySodium] = useState(0);
  const [weeklyCalorieData, setWeeklyCalorieData] = useState<DailyCalorieData[]>([]);
  
  // Ref to track if data fetch is in progress
  const fetchingRef = useRef(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Calculate TDEE from user profile (if available)
  const calculateTDEE = () => {
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
  };
  
  // Check authentication and fetch data - run only once on mount
  useEffect(() => {
    // Prevent duplicate fetches
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setLoadingTimeout(false);
        
        // Wait for Supabase config to be ready (SupabaseConfigProvider sets it async)
        const supabase = await getSupabaseBrowserClientAsync();
        
        // Check session with timeout (3 seconds)
        const sessionResult = await withTimeout(
          supabase.auth.getSession(),
          3000
        );
        
        const { session } = sessionResult.data;
        
        if (!session) {
          // Not authenticated - redirect to login after 1 second
          setIsAuthenticated(false);
          setLoading(false);
          // Delay redirect to show message briefly
          setTimeout(() => {
            router.push('/login');
          }, 1000);
          return;
        }
        
        setIsAuthenticated(true);
        
        // Fetch metrics data with timeout
        const metricsPromise = fetch('/api/metrics', {
          headers: {
            'x-session': session.access_token,
          },
        });
        
        const metricsResponse = await withTimeout(metricsPromise, 5000);
        
        if (metricsResponse.ok) {
          const metricsResult = await metricsResponse.json();
          setMetrics(metricsResult.metrics || []);
          setTodayIntake(metricsResult.todayIntake || 0);
          setTodayProtein(metricsResult.todayProtein || 0);
          setTodayExercise(metricsResult.todayExercise || 0);
          setTodaySodium(metricsResult.todaySodium || 0);
          setWeeklyCalorieData((metricsResult.weeklyCalorieData || []).map((d: DailyCalorieData) => ({
            ...d,
            balance: d.balance ?? d.deficit ?? 0,
          })));
        } else {
          console.warn('Metrics API returned non-OK status:', metricsResponse.status);
        }
        
        // Fetch user profile with timeout
        const profilePromise = fetch('/api/profile', {
          headers: {
            'x-session': session.access_token,
          },
        });
        
        const profileResponse = await withTimeout(profilePromise, 5000);
        
        if (profileResponse.ok) {
          const profileResult = await profileResponse.json();
          setProfileData(profileResult.profile || {});
        } else {
          console.warn('Profile API returned non-OK status:', profileResponse.status);
        }
        
      } catch (err) {
        console.error('Error fetching data:', err);
        
        // Check if it's a timeout error
        if (err instanceof Error && err.message.includes('Timeout')) {
          setLoadingTimeout(true);
        } else {
          setError(t('common.error'));
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Cleanup - reset fetching ref if component unmounts
    return () => {
      fetchingRef.current = false;
    };
  }, [retryCount]); // Re-run when retry is triggered
  
  // Handle retry
  const handleRetry = () => {
    fetchingRef.current = false;
    setError(null);
    setLoadingTimeout(false);
    setLoading(true);
    setRetryCount(c => c + 1); // Re-trigger useEffect
  };
  
  // Prepare chart data from actual metrics
  const prepareChartData = () => {
    if (metrics.length === 0) return [];
    
    const sortedMetrics = [...metrics].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    return sortedMetrics.map(metric => ({
      date: metric.created_at,
      displayDate: formatDate(metric.created_at),
      weight: metric.weight,
    }));
  };
  
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
    ? metrics.sort((a, b) => new Date(a.created_at).getTime() - new Date(a.created_at).getTime())[0].weight 
    : undefined);
  
  // Calculate targets based on TDEE
  const tdee = calculateTDEE();
  const targetCalories = profileData.recommended_calories || onboardingData.recommendedCalories || Math.round(tdee * 0.8);
  
  // Recommended targets for gamified panel
  const proteinTarget = Math.round((targetCalories * 0.25) / 4); // 25% of calories from protein, 4 cal per gram
  const energyDeficitTarget = Math.max(0, tdee - targetCalories); // Daily deficit target
  const exerciseTarget = 300; // Standard exercise burn target
  
  // Loading state with timeout indicator
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">{t('common.loading')}</p>
          {/* Show timeout button after 3 seconds */}
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4 opacity-0 animate-[fadeIn_3s_forwards]"
            onClick={handleRetry}
          >
            {t('common.retry')}
          </Button>
        </div>
      </div>
    );
  }
  
  // Loading timeout state
  if (loadingTimeout) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full bg-white shadow-lg">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {t('common.loadingSlow')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('common.loadingSlowHint')}
            </p>
            <Button onClick={handleRetry} className="w-full bg-teal-600 hover:bg-teal-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('common.retry')}
            </Button>
          </CardContent>
        </Card>
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
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-600 mb-4">
              {t('common.error')}
            </h2>
            <Button onClick={handleRetry} className="bg-teal-600 hover:bg-teal-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('common.retry')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const chartData = prepareChartData();
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-4 py-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{t('dashboard.title')}</h1>
            <p className="text-teal-100 text-sm mt-1">{t('dashboard.subtitle')}</p>
          </div>
          <Link href="/record">
            <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white">
              <Plus className="w-4 h-4 mr-1" />
              {t('common.record')}
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="px-4 py-4 space-y-4">
        {/* Gamified Health Panel - 核心视觉焦点 */}
        <GamifiedHealthPanel
          tdee={tdee}
          todayIntake={todayIntake}
          todayProtein={todayProtein}
          todayExercise={todayExercise}
          proteinTarget={proteinTarget}
          energyDeficitTarget={energyDeficitTarget}
          exerciseTarget={exerciseTarget}
          showRecordButton={true}
        />
        
        {/* 钠盐摄入监控 */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                <span className="text-base">🧂</span>
                钠盐摄入
              </h3>
              <span className={`text-sm font-medium ${todaySodium > 2000 ? 'text-red-600' : todaySodium > 1500 ? 'text-orange-500' : 'text-teal-600'}`}>
                {todaySodium} / 2000 mg
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  todaySodium > 2000 ? 'bg-red-500' : todaySodium > 1500 ? 'bg-orange-500' : 'bg-teal-500'
                }`}
                style={{ width: `${Math.min((todaySodium / 2000) * 100, 100)}%` }}
              />
            </div>
            {todaySodium > 2000 ? (
              <p className="text-xs text-red-500 mt-2">⚠ 今日钠盐已超标！建议每日摄入不超过2000mg（约5g食盐）</p>
            ) : todaySodium > 0 ? (
              <p className="text-xs text-gray-500 mt-2">每日建议摄入量不超过2000mg（约5g食盐）</p>
            ) : (
              <p className="text-xs text-gray-400 mt-2">记录饮食后自动统计钠盐摄入</p>
            )}
          </CardContent>
        </Card>
        
        {/* Stats Cards */}
        {currentWeight && (
          <StatsCards
            currentWeight={currentWeight}
            previousWeight={previousWeight}
            bmi={currentBMI}
          />
        )}
        
        {/* Empty State for new users */}
        {!currentWeight && metrics.length === 0 && (
          <EmptyState type="welcome" onRecordClick={() => restartOnboarding()} />
        )}
        
        {/* Weight Trend Chart */}
        {chartData.length > 1 && (
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {t('dashboard.weightTrend')}
              </h3>
              <WeightTrendChart data={chartData} />
            </CardContent>
          </Card>
        )}
        
        {/* Calorie Balance Chart */}
        {weeklyCalorieData.length > 0 && (
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {t('dashboard.calorieBalance')}
              </h3>
              <CalorieBalanceChart data={weeklyCalorieData} />
            </CardContent>
          </Card>
        )}
        
        {/* Goal Progress */}
        {targetWeight && startWeight && currentWeight && (
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {t('dashboard.goalProgress')}
              </h3>
              <GoalProgressRing
                currentWeight={currentWeight}
                startWeight={startWeight}
                targetWeight={targetWeight}
              />
            </CardContent>
          </Card>
        )}
        
        {/* Quick Actions */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              {t('dashboard.quickActions')}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/calculators/tdee">
                <Button variant="outline" className="w-full justify-start">
                  <Calculator className="w-4 h-4 mr-2 text-teal-600" />
                  {t('nav.tdee')}
                </Button>
              </Link>
              <Link href="/calculators/bmi">
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="w-4 h-4 mr-2 text-orange-600" />
                  {t('nav.bmi')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}