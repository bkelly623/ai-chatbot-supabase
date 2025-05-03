'use server';

import { getSession } from '@/db/cached-queries';
import { createClient } from '@/lib/supabase/server';

export async function createProject(projectName: string) {
  const session = await getSession();
  if (!session?.id) {
    return { error: 'You must be logged in to create a project.' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('projects')
    .insert([{ name: projectName, user_id: session.id }])
    .select();

  if (error) {
    console.error('Error creating project:', error);
    return { error: 'Failed to create project.' };
  }

  return { data };
}

export async function moveChatToProject(chatId: string, projectId: string) {
  const session = await getSession();
  if (!session?.id) {
    return { error: 'You must be logged in to move a chat.' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('chats')
    .update({ project_id: projectId })
    .eq('id', chatId)
    .eq('user_id', session.id);

  if (error) {
    console.error('Error moving chat to project:', error);
    return { error: 'Failed to move chat to project.' };
  }

  return { success: true };
}
