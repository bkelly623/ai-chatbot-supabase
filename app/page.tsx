import React from 'react';
import { useSearchParams, notFound } from 'next/navigation';
import { cookies } from 'next/headers'; // Import cookies here

import { DEFAULT_MODEL_NAME, models } from '@/ai/models';
import { Chat as PreviewChat } from '@/components/custom/chat';
import {
  getChatById,
  getMessagesByChatId,
} from '@/db/cached-queries';
import { convertToUIMessages } from '@/lib/utils';
import ProjectLandingPage from '@/components/ProjectLandingPage';
import { createServerClient } from '@supabase/ssr'; // Import createServerClient here

async function getSupabaseClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // Ignore error in Server Components
          }
        },
      },
    }
  );
}

async function getCurrentUser() {
  const supabase = await getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export default async function Page() {
  const searchParams = useSearchParams();
  const chatId = searchParams.get('chatId');
  const projectId = searchParams.get('projectId');

  if (projectId) {
    return <ProjectLandingPage />;
  }

  if (!chatId) {
    return <div>Select a chat from the sidebar, or create a new chat.</div>;
  }

  const chat = await getChatById(chatId);

  if (!chat) {
    notFound();
  }

  const user = await getCurrentUser();

  if (!user) {
    notFound();
  }

  if (user.id !== chat.user_id) {
    notFound();
  }

  const messagesFromDb = await getMessagesByChatId(chatId);
  const cookieStore = cookies(); // Access cookies directly
  const modelIdFromCookie = cookieStore.get('model-id')?.value;
  const selectedModelId =
    models.find((model) => model.id === modelIdFromCookie)?.id ||
    DEFAULT_MODEL_NAME;

  return (
    <PreviewChat
      id={chat.id}
      initialMessages={convertToUIMessages(messagesFromDb)}
      selectedModelId={selectedModelId}
    />
  );
}
