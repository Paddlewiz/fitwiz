import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET /api/profile - Get user's profile data
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

    // Query user_profiles
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      // PGRST116 = no rows found, which is okay for new users
      console.error('Profile query error:', profileError);
      return NextResponse.json({ profile: null });
    }

    return NextResponse.json({ profile: profile || null });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: '服务器错误', profile: null }, { status: 500 });
  }
}