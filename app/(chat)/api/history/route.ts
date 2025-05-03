import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get session
    const { data: sessionData } = await supabase.auth.getSession();
    
    // Ensure user is authenticated
    if (!sessionData?.session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = sessionData.session.user.id;
    
    // Fetch chat history
    const { data, error } = await supabase
      .from('chats')
      .select()
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
