'use client'; // Mark the Client Component

import React from 'react';
import { useSearchParams, notFound, useRouter } from 'next/navigation';
import { cookies } from 'next/headers';

import { DEFAULT_MODEL_NAME, models } from '@/ai/models';
import { Chat as PreviewChat } from '@/components/custom/chat';
import {
  getChatById,
  getMessagesByChatId,
  getSession,
} from '@/db/cached-queries';
import { convertToUIMessages } from '@/lib/utils';
import ProjectLandingPage from '@/components/ProjectLandingPage';

interface PageProps {
  initialChatId: string | null;
  initialProjectId: string | null;
  initialMessages: any[];
  selectedModelId: string;
  user: any;
}

const Page: React.FC<PageProps> = ({
  initialChatId,
  initialProjectId,
  initialMessages,
  selectedModelId,
  user,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatId = initialChatId || searchParams.get('chatId');
  const projectId = initialProjectId || searchParams.get('projectId');

  if (projectId) {
    return <ProjectLandingPage user={user} />;
  }

  if (!chatId) {
    return <div>Select a chat from the sidebar, or create a new chat.</div>;
  }

  return (
    <PreviewChat
      id={chatId}
      initialMessages={initialMessages}
      selectedModelId={selectedModelId}
    />
  );
};

// Server Component to fetch initial data
async function PageServerWrapper() {
  const searchParams = useSearchParams();
  const chatId = searchParams.get('chatId');
  const projectId = searchParams.get('projectId');

  const user = await getSession();

  if (!user && !projectId) {
    return notFound();
  }

  let initialMessages = [];
  let selectedModelId = DEFAULT_MODEL_NAME;

  if (chatId) {
    const { chat, messagesFromDb } = await getChatById(chatId);

    if (!chat || (user && user.id !== chat.user_id)) {
      return notFound();
    }

    initialMessages = convertToUIMessages(messagesFromDb);

    const cookieStore = cookies();
    const modelIdFromCookie = cookieStore.get('model-id')?.value;
    selectedModelId =
      models.find((model) => model.id === modelIdFromCookie)?.id ||
      DEFAULT_MODEL_NAME;
  } else {
    const cookieStore = cookies();
    const modelIdFromCookie = cookieStore.get('model-id')?.value;
    selectedModelId =
      models.find((model) => model.id === modelIdFromCookie)?.id ||
      DEFAULT_MODEL_NAME;
  }

  return (
    <Page
      initialChatId={chatId}
      initialProjectId={projectId}
      initialMessages={initialMessages}
      selectedModelId={selectedModelId}
      user={user}
    />
  );
}

export default PageServerWrapper;
