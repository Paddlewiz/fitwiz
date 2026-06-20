import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET /api/metrics - Get user's body metrics, diet logs, and exercise logs
export async function GET(request: NextRequest) {
  try {
    // Get session token from header
    const sessionToken = request.headers.get('x-session');
    
    if (!sessionToken) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    // Get Supabase credentials
    const supabaseUrl = process.env.COZE_SUPABASE_URL;
    const supabaseKey = process.env.COZE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: '数据库配置错误' }, { status: 500 });
    }

    // Create Supabase client with user's session
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      },
    });

    // Get user info
    const { data: { user }, error: userError } = await supabase.auth.getUser(sessionToken);
    if (userError || !user) {
      return NextResponse.json({ error: '会话无效' }, { status: 401 });
    }

    // Get today's date
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Get last 7 days dates
    const last7Days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(d.toISOString().split('T')[0]);
    }

    // Query body_metrics (uses recorded_at, not date)
    const { data: metrics, error: metricsError } = await supabase
      .from('body_metrics')
      .select('*')
      .eq('user_id', user.id)
      .order('recorded_at', { ascending: false })
      .limit(30);

    if (metricsError) {
      console.error('Metrics query error:', metricsError);
    }

    // Query diet_logs for last 7 days
    const { data: dietLogs, error: dietError } = await supabase
      .from('diet_logs')
      .select('date, calories, protein')
      .eq('user_id', user.id)
      .gte('date', last7Days[0])
      .lte('date', last7Days[6])
      .order('date', { ascending: true });

    if (dietError) {
      console.error('Diet logs query error:', dietError);
    }

    // Query exercise_logs for last 7 days
    const { data: exerciseLogs, error: exerciseError } = await supabase
      .from('exercise_logs')
      .select('date, calories_burned')
      .eq('user_id', user.id)
      .gte('date', last7Days[0])
      .lte('date', last7Days[6])
      .order('date', { ascending: true });

    if (exerciseError) {
      console.error('Exercise logs query error:', exerciseError);
    }

    // Aggregate diet data by date
    const dietByDate: Record<string, { calories: number; protein: number }> = {};
    (dietLogs || []).forEach(log => {
      const date = log.date as string;
      if (!dietByDate[date]) {
        dietByDate[date] = { calories: 0, protein: 0 };
      }
      dietByDate[date].calories += log.calories || 0;
      dietByDate[date].protein += log.protein || 0;
    });

    // Aggregate exercise data by date
    const exerciseByDate: Record<string, number> = {};
    (exerciseLogs || []).forEach(log => {
      const date = log.date as string;
      if (!exerciseByDate[date]) {
        exerciseByDate[date] = 0;
      }
      exerciseByDate[date] += log.calories_burned || 0;
    });

    // Build daily summary for last 7 days
    const dailySummary = last7Days.map(date => ({
      date,
      intakeCalories: dietByDate[date]?.calories || 0,
      intakeProtein: dietByDate[date]?.protein || 0,
      exerciseBurn: exerciseByDate[date] || 0,
    }));

    // Today's summary
    const todayDiet = dietByDate[todayStr] || { calories: 0, protein: 0 };
    const todayExercise = exerciseByDate[todayStr] || 0;

    return NextResponse.json({
      metrics: metrics || [],
      dailySummary,
      today: {
        date: todayStr,
        intakeCalories: todayDiet.calories,
        intakeProtein: todayDiet.protein,
        exerciseBurn: todayExercise,
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: '服务器错误', metrics: [], dailySummary: [], today: null }, { status: 500 });
  }
}