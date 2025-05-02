'use server';

import { CoreMessage, CoreUserMessage, generateText } from 'ai';
import { cookies } from 'next/headers';
import { revalidateTag } from 'next/cache';

import { customModel } from '@/ai';
import { getSession } from '@/db/cached-queries';
import { createClient } from '@/lib/supabase/server';

export async function saveModelId(model: string) {
  const cookieStore = await cookies();
  cookieStore.set('model-id', model);
}

export async function generateTitleFromUserMessage({
  message,
}: {
  message: CoreUserMessage;
}): Promise<string> {  // Explicit return type
  const { text: title } = await generateText({
    model: customModel('gpt-4o-mini'),
    system: `
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
    prompt: JSON.stringify(message),
  });

  return title;
}

export async function createChat(
  userId: string,
  title: string,
  projectId: string | null = null
) {
  const session = await getSession();
  if (!session?.id || session.id !== userId) {
    throw new Error('Unauthorized to create chat for this user.');
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('chats')
    .insert([{ user_id: userId, title, project_id: projectId }])
    .select();

  if (error) {
    console.error('Error creating chat:', error);
    throw new Error('Failed to create chat');
  }

  return data[0];
}

export async function updateChatProjectId(
  chatId: string,
  newProjectId: string | null
) {
  const session = await getSession();
  if (!session?.id) {
    throw new Error('Unauthorized.');
  }

  const supabase = await createClient();

  // Verify ownership of the chat
  const { data: chatData, error: chatError } = await supabase
    .from('chats')
    .select('user_id')
    .eq('id', chatId)
    .single();

  if (chatError || !chatData) {
    throw new Error('Chat not found.');
  }

  if (chatData.user_id !== session.id) {
    throw new Error('Unauthorized to modify this chat.');
  }

  const { error } = await supabase
    .from('chats')
    .update({ project_id: newProjectId })
    .eq('id', chatId);

  if (error) {
    console.error('Error updating chat project:', error);
    throw new Error('Failed to update chat project');
  }

  // Invalidate cache
  if (newProjectId) {
    revalidateTag(`project_${newProjectId}_chats`);
  }

  // Also revalidate the cache for the chat itself (if you have one)
  revalidateTag(`chat_${chatId}`);
}
