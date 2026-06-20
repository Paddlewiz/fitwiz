import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Get Supabase client with user token
function getSupabaseClient(token: string) {
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const session = request.headers.get('x-session');
    
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const body = await request.json();
    const { type, data } = body;

    const supabase = getSupabaseClient(session);

    let result;

    switch (type) {
      case 'body_metric':
        // Insert body metrics
        result = await supabase
          .from('body_metrics')
          .insert({
            user_id: (await supabase.auth.getUser()).data.user?.id,
            weight: data.weight,
            body_fat: data.bodyFat,
            bmi: data.bmi,
            body_age: data.bodyAge,
            visceral_fat: data.visceralFat,
            muscle_mass: data.muscleMass,
            bone_mass: data.boneMass,
            water_pct: data.waterPct,
            recorded_at: new Date().toISOString(),
          })
          .select();
        break;

      case 'diet_log':
        // Insert diet log
        result = await supabase
          .from('diet_logs')
          .insert({
            user_id: (await supabase.auth.getUser()).data.user?.id,
            date: new Date().toISOString().split('T')[0],
            meal_type: data.mealType, // breakfast, lunch, dinner, snack
            food_name: data.foodName,
            calories: data.calories,
            protein: data.protein,
            carbs: data.carbs,
            fat: data.fat,
          })
          .select();
        break;

      case 'exercise_log':
        // Insert exercise log
        result = await supabase
          .from('exercise_logs')
          .insert({
            user_id: (await supabase.auth.getUser()).data.user?.id,
            date: new Date().toISOString().split('T')[0],
            exercise_type: data.exerciseType,
            duration_minutes: data.duration,
            calories_burned: data.caloriesBurned,
          })
          .select();
        break;

      default:
        return NextResponse.json({ error: '无效的记录类型' }, { status: 400 });
    }

    if (result?.error) {
      console.error('Insert error:', result.error);
      return NextResponse.json({ error: '保存失败' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: result?.data?.[0] 
    });

  } catch (error) {
    console.error('Record API error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = request.headers.get('x-session');
    
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const supabase = getSupabaseClient(session);

    let result;

    switch (type) {
      case 'diet':
        result = await supabase
          .from('diet_logs')
          .select('*')
          .eq('date', date)
          .order('created_at', { ascending: false });
        break;

      case 'exercise':
        result = await supabase
          .from('exercise_logs')
          .select('*')
          .eq('date', date)
          .order('created_at', { ascending: false });
        break;

      case 'body':
        result = await supabase
          .from('body_metrics')
          .select('*')
          .order('recorded_at', { ascending: false })
          .limit(10);
        break;

      default:
        return NextResponse.json({ error: '无效的查询类型' }, { status: 400 });
    }

    if (result?.error) {
      console.error('Query error:', result.error);
      return NextResponse.json({ error: '查询失败' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: result?.data 
    });

  } catch (error) {
    console.error('Record API error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}