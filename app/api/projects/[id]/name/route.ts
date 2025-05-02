import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

// For Next.js 15, use the exact pattern expected for dynamic route handlers
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Get the project ID from the route parameters
  const id = params.id;

  try {
    // Create Supabase client
    const supabase = await createClient();
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Fetch the project from the database
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('name, user_id')
      .eq('id', id)
      .single();
      
    if (projectError) {
      console.error('Error fetching project:', projectError);
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    // Verify the user owns this project
    if (project.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Return just the project name
    return NextResponse.json({ name: project.name });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
