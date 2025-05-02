'use server';

import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/db/cached-queries';

export async function createProject(projectName: string) {
  const session = await getSession();
  if (!session?.id) {  //  ✅  Corrected check
    return { error: 'You must be logged in to create a project.' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('projects')
    .insert([{ name: projectName, user_id: session.id }])  //  ✅  Corrected use of session
    .select();

  if (error) {
    console.error('Error creating project:', error);
    return { error: 'Failed to create project.' };
  }

  return { data };
}
