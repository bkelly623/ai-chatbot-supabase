import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // Verify the user is authenticated
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the projects for this user
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(projects || []);
  } catch (error) {
    console.error('Error in projects API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to fetch projects: ${errorMessage}` },
      { status: 500 }
    );
  }
}
