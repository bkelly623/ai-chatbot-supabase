import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';

// Add this function to your existing queries.ts file
export async function getChatsByProjectId(projectId: string) {
  try {
    const supabase = await createClient();
    
    const { data: chats, error } = await supabase
      .from('chats')
      .select('*')
      .eq('project_id', projectId)
      .order('updated_at', { ascending: false });
      
    if (error) {
      throw new Error(`Error fetching chats by project ID: ${error.message}`);
    }
    
    return chats;
  } catch (error) {
    console.error('Error in getChatsByProjectId:', error);
    return [];
  }
}

// Add this function if it doesn't already exist
export async function getProjectById(projectId: string) {
  try {
    const supabase = await createClient();
    
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();
      
    if (error) {
      throw new Error(`Error fetching project: ${error.message}`);
    }
    
    return project;
  } catch (error) {
    console.error('Error in getProjectById:', error);
    return null;
  }
}

// Add this function if it doesn't already exist
export async function getProjectsByUserId(userId: string) {
  try {
    const supabase = await createClient();
    
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) {
      throw new Error(`Error fetching projects: ${error.message}`);
    }
    
    return projects;
  } catch (error) {
    console.error('Error in getProjectsByUserId:', error);
    return [];
  }
}
