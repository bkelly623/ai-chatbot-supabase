'use client';

import { cookies } from 'next/headers';
import { DEFAULT_MODEL_NAME, models } from '@/ai/models';
import { ClientPage } from '@/components/client-page';
import {
  getChatById,
  getMessagesByChatId,
  getSession,
} from '@/db/cached-queries';
import { convertToUIMessages } from '@/lib/utils';

export default async function Page({ searchParams }) {
  const chatId = searchParams?.chatId || null;
  const projectId = searchParams?.projectId || null;
  
  // Server-side code to access cookies
  const cookieStore = cookies();
  const modelIdFromCookie = cookieStore.get('model-id')?.value;
  const selectedModelId = models.find((model) => model.id === modelIdFromCookie)?.id || DEFAULT_MODEL_NAME;

  // Fetch data server-side
  let user = null;
  let chat = null;
  let initialMessages = [];

  try {
    const userData = await getSession();
    user = userData?.user;
  } catch (error) {
    // Handle error in client component
  }

  if (chatId && typeof chatId === 'string' && user) {
    chat = await getChatById(chatId);
    
    if (chat) {
      const messagesFromDb = await getMessagesByChatId(chatId);
      initialMessages = convertToUIMessages(messagesFromDb);
    }
  }

  // Pass all data to client component
  return <ClientPage 
    initialChatId={chatId}
    initialProjectId={projectId}
    initialMessages={initialMessages}
    selectedModelId={selectedModelId}
    user={user}
  />;
}
