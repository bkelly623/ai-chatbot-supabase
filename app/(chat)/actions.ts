// Correctly handle the session object structure
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import { nanoid } from '@/lib/utils';

// Function to get the current session
async function getSession() {
  const supabase = await createClient();
  return supabase.auth.getSession();
}

// Function to update a chat title
export async function updateChatTitle(chatId: string, title: string) {
  const supabase = await createClient();

  const { data: session } = await getSession();
  if (!session?.session?.user) {
    throw new Error('Unauthorized');
  }

  const { error } = await supabase
    .from('chats')
    .update({ title })
    .eq('id', chatId)
    .eq('user_id', session.session.user.id);

  if (error) {
    throw new Error('Failed to update chat title');
  }

  revalidatePath(`/chat/${chatId}`);
}

// Function to update a chat's project ID
export async function updateChatProjectId(chatId: string, projectId: string | null) {
  const supabase = await createClient();

  const { data: session } = await getSession();
  if (!session?.session?.user) {
    throw new Error('Unauthorized');
  }

  const { error } = await supabase
    .from('chats')
    .update({ project_id: projectId })
    .eq('id', chatId)
    .eq('user_id', session.session.user.id);

  if (error) {
    throw new Error(`Failed to update chat project: ${error.message}`);
  }

  revalidatePath(`/chat/${chatId}`);
}

// Function to create a chat
export async function createChat(userId: string, title?: string) {
  const supabase = await createClient();
  
  const { data: session } = await getSession();
  if (!session?.session?.user || session.session.user.id !== userId) {
    throw new Error('Unauthorized to create chat for this user.');
  }

  const id = nanoid();

  const { error } = await supabase.from('chats').insert({
    id,
    title: title || 'New Chat',
    user_id: userId
  });

  if (error) {
    throw new Error('Failed to create chat');
  }

  revalidatePath('/');
  return id;
}

export async function removeChat(chatId: string) {
  const supabase = await createClient();

  const { data: session } = await getSession();
  if (!session?.session?.user) {
    throw new Error('Unauthorized');
  }

  const { error } = await supabase
    .from('chats')
    .delete()
    .eq('id', chatId)
    .eq('user_id', session.session.user.id);

  if (error) {
    throw new Error('Failed to remove chat');
  }

  revalidatePath('/');
}

export async function clearChats(userId: string) {
  const supabase = await createClient();

  const { data: session } = await getSession();
  if (!session?.session?.user || session.session.user.id !== userId) {
    throw new Error('Unauthorized');
  }

  const { error } = await supabase
    .from('chats')
    .delete()
    .eq('user_id', userId);

  if (error) {
    throw new Error('Failed to remove chat');
  }

  revalidatePath('/');
}

export async function getChats(userId: string) {
  const supabase = await createClient();

  const { data: session } = await getSession();
  if (!session?.session?.user || session.session.user.id !== userId) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error('Failed to fetch chats');
  }

  return data;
}

export async function getChat(id: string) {
  const supabase = await createClient();

  const { data: session } = await getSession();
  if (!session?.session?.user) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase
    .from('chats')
    .select('*, messages(*)')
    .eq('id', id)
    .eq('user_id', session.session.user.id)
    .order('created_at', { referencedTable: 'messages', ascending: true })
    .single();

  if (error) {
    console.error(error);
    throw new Error('Failed to fetch chat');
  }

  return data;
}

export async function shareChat(chatId: string) {
  const supabase = await createClient();

  const { data: session } = await getSession();
  if (!session?.session?.user) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase
    .from('chats')
    .update({ shareable: true })
    .eq('id', chatId)
    .eq('user_id', session.session.user.id)
    .select()
    .single();

  if (error) {
    throw new Error('Failed to share chat');
  }

  return data;
}

// Define schema for the share form
const ShareSchema = z.object({
  id: z.string(),
  ShareCheckbox: z.boolean().optional()
});

// Share form action
export async function shareAction(formData: FormData) {
  'use server';

  const supabase = await createClient();

  const { data: session } = await getSession();
  if (!session?.session?.user) {
    throw new Error('Unauthorized');
  }

  const validatedFields = ShareSchema.safeParse({
    id: formData.get('id'),
    ShareCheckbox: formData.get('ShareCheckbox') === 'on'
  });

  if (!validatedFields.success) {
    return {
      error: 'Invalid fields'
    };
  }

  const { id, ShareCheckbox } = validatedFields.data;

  // If ShareCheckbox is false, unshare the chat
  if (!ShareCheckbox) {
    await supabase
      .from('chats')
      .update({ shareable: false })
      .eq('id', id)
      .eq('user_id', session.session.user.id);

    revalidatePath(`/share/${id}`);
    return redirect(`/chat/${id}`);
  }

  // Otherwise, share the chat
  const { data, error } = await supabase
    .from('chats')
    .update({ shareable: true })
    .eq('id', id)
    .eq('user_id', session.session.user.id)
    .select()
    .single();

  if (error) {
    return {
      error: 'Failed to share chat'
    };
  }

  revalidatePath(`/share/${id}`);
  return redirect(`/share/${id}`);
}
