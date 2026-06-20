'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useSupabaseConfig } from '@/lib/supabase-config-inject';
import { getSupabaseBrowserClientWithRetry } from '@/lib/supabase-browser';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Scale,
  Calculator,
  TrendingDown,
  Target,
  Plus,
  ArrowRight,
  Loader2,
  Flame,
  Activity,
} from 'lucide-react';

interface UserProfile {
  display_name: string | null;
  target_weight: string | null;
  height: string | null;
}

interface BodyMetric {
  id: string;
  recorded_at: string;
  weight: string | null;
  bmi: string | null;
}

export function DashboardPageClient() {
  const router = useRouter();
  const { isLoading: configLoading } = useSupabaseConfig();

  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [metrics, setMetrics] = useState<BodyMetric[]>([]);
  const [latestMetric, setLatestMetric] = useState<BodyMetric | null>(null);

  // Check auth and fetch data
  useEffect(() => {
    const init = async () => {
      try {
        const supabase = await getSupabaseBrowserClientWithRetry();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push('/login');
          return;
        }

        setUser(user);

        // Get user profile
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profileData) {
          setProfile(profileData);
        }

        // Get body metrics (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: metricsData } = await supabase
          .from('body_metrics')
          .select('id, recorded_at, weight, bmi')
          .eq('user_id', user.id)
          .gte('recorded_at', thirtyDaysAgo.toISOString())
          .order('recorded_at', { ascending: false })
          .limit(30);

        if (metricsData && metricsData.length > 0) {
          setMetrics(metricsData);
          setLatestMetric(metricsData[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (!configLoading) {
      init();
    }
  }, [configLoading, router]);

  // Handle logout
  const handleLogout = async () => {
    try {
      const supabase = await getSupabaseBrowserClientWithRetry();
      await supabase.auth.signOut();
      router.push('/login');
    } catch (err) {
      console.error(err);
    }
  };

  // Prepare chart data
  const chartData = metrics
    .slice()
    .reverse()
    .map((m) => ({
      date: new Date(m.recorded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: m.weight ? parseFloat(m.weight) : null,
    }));

  // Calculate progress
  const calculateProgress = (): { current: number; target: number; progress: number } | null => {
    if (!latestMetric?.weight || !profile?.target_weight) return null;
    const current = parseFloat(latestMetric.weight);
    const target = parseFloat(profile.target_weight);
    // Assume starting weight was current + 10% difference (for demo)
    const startWeight = current + (current - target) * 0.5;
    const progress = Math.min(100, Math.max(0, ((startWeight - current) / (startWeight - target)) * 100));
    return { current, target, progress };
  };

  const progressData = calculateProgress();

  if (configLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, {profile?.display_name || user?.email?.split('@')[0] || 'User'}!
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="text-gray-600">
            Logout
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Link href="/metrics">
            <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-teal-50 border-teal-100">
              <CardContent className="p-4 flex items-center gap-3">
                <Plus className="w-5 h-5 text-teal-600" />
                <span className="font-medium text-teal-700">Log Weight</span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/calculators/tdee">
            <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-blue-50 border-blue-100">
              <CardContent className="p-4 flex items-center gap-3">
                <Calculator className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-700">TDEE Calc</span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/calculators/bmi">
            <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-green-50 border-green-100">
              <CardContent className="p-4 flex items-center gap-3">
                <Scale className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-700">BMI Calc</span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/metrics">
            <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-amber-50 border-amber-100">
              <CardContent className="p-4 flex items-center gap-3">
                <Activity className="w-5 h-5 text-amber-600" />
                <span className="font-medium text-amber-700">Full Metrics</span>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
                <Scale className="w-4 h-4 text-teal-500" />
                Current Weight
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-teal-600">
                {latestMetric?.weight ? `${latestMetric.weight} kg` : 'No data'}
              </p>
              {metrics.length > 1 && (
                <p className="text-sm text-gray-500 mt-1">
                  {parseFloat(metrics[0].weight || '0') < parseFloat(metrics[1].weight || '0')
                    ? '↓ from last entry'
                    : '↑ from last entry'}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-green-500" />
                Current BMI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {latestMetric?.bmi ? latestMetric.bmi : 'No data'}
              </p>
              {latestMetric?.bmi && (
                <p className="text-sm text-gray-500 mt-1">
                  {parseFloat(latestMetric.bmi) < 18.5
                    ? 'Underweight'
                    : parseFloat(latestMetric.bmi) < 25
                      ? 'Normal'
                      : parseFloat(latestMetric.bmi) < 30
                        ? 'Overweight'
                        : 'Obese'}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                Calorie Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-amber-600">--</p>
              <p className="text-sm text-gray-500 mt-1">Start tracking to see</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress to Target */}
        {progressData && (
          <Card className="shadow-md mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-teal-500" />
                Progress to Target
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Current: {progressData.current} kg</span>
                <span>Target: {progressData.target} kg</span>
              </div>
              <Progress value={progressData.progress} className="h-4" />
              <p className="text-center text-gray-600">
                {progressData.progress < 100
                  ? `${Math.round(progressData.progress)}% complete`
                  : 'Goal achieved! 🎉'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Weight Trend Chart */}
        <Card className="shadow-md mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-teal-500" />
              30-Day Weight Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                <TrendingDown className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No weight data yet.</p>
                <Link href="/metrics">
                  <Button className="mt-4 bg-teal-500 hover:bg-teal-600">
                    Start Tracking
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" tick={{ fill: '#4B5563' }} />
                  <YAxis
                    tick={{ fill: '#4B5563' }}
                    domain={['auto', 'auto']}
                    label={{ value: 'kg', angle: -90, position: 'insideLeft', fill: '#4B5563' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ fill: '#10B981', strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Call to Action */}
        {!profile?.target_weight && (
          <Card className="shadow-md bg-teal-50 border-teal-100">
            <CardContent className="p-6 text-center">
              <Target className="w-8 h-8 mx-auto mb-4 text-teal-600" />
              <p className="text-teal-700 font-medium mb-2">Set Your Weight Goal</p>
              <p className="text-teal-600 text-sm mb-4">
                Define your target weight to see progress tracking on your dashboard.
              </p>
              <Link href="/metrics">
                <Button className="bg-teal-500 hover:bg-teal-600">
                  Set Goal
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}