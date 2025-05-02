// actions/project-actions.ts
'use server';

import { createClient } from '@/lib/supabase/server'; // Use server client
import { getSession } from '@/db/cached-queries'; // Import getSession

export async function createProject(projectName: string) {
  const session = await getSession(); // Get the session
  if (!session?.user?.id) {
    return { error: 'You must be logged in to create a project.' };
  }

  const supabase = await createClient(); // Initialize Supabase client *after* getting the session
  const { data, error } = await supabase
    .from('projects')
    .insert([{ name: projectName, user_id: session.user.id }]) // Include user_id
    .select();

  if (error) {
    console.error('Error creating project:', error);
    return { error: 'Failed to create project.' };
  }

  return { data };
}
