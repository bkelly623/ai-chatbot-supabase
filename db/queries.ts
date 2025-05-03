import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';

// Preserve existing query functions
export async function getSessionQuery() {
  const supabase = await createClient();
  return supabase.auth.getSession();
}

export async function getUserQuery() {
  const supabase = await createClient();
  return supabase.auth.getUser();
}

export async function getUserByIdQuery(userId: string) {
  const supabase = await createClient();
  return supabase.from('users').select('*').eq('id', userId).single();
}

export async function getChatByIdQuery(chatId: string) {
  const supabase = await createClient();
  return supabase.from('chats').select('*').eq('id', chatId).single();
}

export async function getChatWithMessagesQuery(chatId: string) {
  const supabase = await createClient();
  return supabase
    .from('chats')
    .select(
      `*, messages:messages(*, votes:votes(*))`,
    )
    .eq('id', chatId)
    .order('created_at', { referencedTable: 'messages', ascending: true })
    .single();
}

export async function getMessagesByChatIdQuery(chatId: string) {
  const supabase = await createClient();
  return supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });
}

export async function getChatsByUserIdQuery(userId: string) {
  const supabase = await createClient();
  return supabase
    .from('chats')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
}

export async function getVotesByChatIdQuery(chatId: string) {
  const supabase = await createClient();
  return supabase
    .from('votes')
    .select('*')
    .eq('chat_id', chatId);
}

export async function getDocumentByIdQuery(documentId: string) {
  const supabase = await createClient();
  return supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single();
}

export async function getDocumentsByIdQuery(documentIds: string[]) {
  const supabase = await createClient();
  return supabase
    .from('documents')
    .select('*')
    .in('id', documentIds);
}

export async function getSuggestionsByDocumentIdQuery(documentId: string) {
  const supabase = await createClient();
  return supabase
    .from('suggestions')
    .select('*')
    .eq('document_id', documentId);
}

// Add new project-related queries
export async function getChatsByProjectIdQuery(projectId: string) {
  const supabase = await createClient();
  return supabase
    .from('chats')
    .select('*')
    .eq('project_id', projectId)
    .order('updated_at', { ascending: false });
}

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
