import { NextRequest, NextResponse } from 'next/server';

import { getProjectById } from '@/db/cached-queries';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify the user is authenticated
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the project ID from the URL params
    const projectId = params.id;
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }
    
    // Get the project
    const project = await getProjectById(projectId);
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    // Verify the user owns this project
    if (project.user_id !== user.id) {
      console.error('User does not own project:', { userId: user.id, projectId });
      return NextResponse.json({ error: 'Unauthorized access to project' }, { status: 403 });
    }
    
    // Only return the name to keep the response small
    return NextResponse.json({ name: project.name });
  } catch (error) {
    console.error('Error fetching project name:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to fetch project name: ${errorMessage}` },
      { status: 500 }
    );
  }
}
