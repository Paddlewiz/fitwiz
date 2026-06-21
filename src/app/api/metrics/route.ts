import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

// GET /api/metrics - Get user's body metrics, diet logs, and exercise logs
export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.headers.get('x-session');
    if (!sessionToken) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const supabaseUrl = process.env.COZE_SUPABASE_URL;
    const supabaseKey = process.env.COZE_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: '数据库配置错误' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser(sessionToken);
    if (userError || !user) {
      return NextResponse.json({ error: '会话无效' }, { status: 401 });
    }

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const last7Days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(d.toISOString().split('T')[0]);
    }

    // Query body_metrics
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

    // Try to get today's sodium (separate query, safe if column doesn't exist yet)
    let todaySodium = 0;
    try {
      const { data: sodiumData } = await supabase
        .from('diet_logs')
        .select('sodium_mg')
        .eq('user_id', user.id)
        .eq('date', todayStr);
      
      if (sodiumData) {
        todaySodium = sodiumData.reduce((sum: number, log: any) => sum + (log.sodium_mg || 0), 0);
      }
    } catch (e) {
      // sodium_mg column might not exist yet, default to 0
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

    // Build weekly calorie data (field names match dashboard expectations)
    const weeklyCalorieData = last7Days.map(date => {
      const intake = dietByDate[date]?.calories || 0;
      const exercise = exerciseByDate[date] || 0;
      return {
        date,
        displayDate: formatDate(date),
        intake,
        target: 0,
        deficit: exercise - intake,
        balance: exercise - intake,
        exerciseBurn: exercise,
        protein: dietByDate[date]?.protein || 0,
      };
    });

    // Today's summary
    const todayDiet = dietByDate[todayStr] || { calories: 0, protein: 0 };
    const todayExercise = exerciseByDate[todayStr] || 0;

    return NextResponse.json({
      metrics: metrics || [],
      weeklyCalorieData,
      todayIntake: todayDiet.calories,
      todayProtein: todayDiet.protein,
      todayExercise: todayExercise,
      todaySodium: todaySodium,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({
      error: '服务器错误',
      metrics: [],
      weeklyCalorieData: [],
      todayIntake: 0,
      todayProtein: 0,
      todayExercise: 0,
      todaySodium: 0,
    }, { status: 500 });
  }
}
