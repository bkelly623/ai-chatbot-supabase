'use client';

import React from 'react';
import { useSearchParams, notFound, useRouter } from 'next/navigation';

import { DEFAULT_MODEL_NAME, models } from '@/ai/models';
import { Chat as PreviewChat } from '@/components/custom/chat';
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

  const { getSession } = await import('@/db/cached-queries');
  const user = await getSession();

  if (!user && !projectId) {
    return notFound();
  }

  let initialMessages = [];
  let selectedModelId = DEFAULT_MODEL_NAME;

  if (chatId) {
    const { getChatById, getMessagesByChatId } = await import('@/db/cached-queries');
    const chat = await getChatById(chatId);

    if (!chat || (user && user.id !== chat.user_id)) {
      return notFound();
    }

    const messagesFromDb = await getMessagesByChatId(chatId);
    initialMessages = convertToUIMessages(messagesFromDb);

    const { cookies } = await import('next/headers');
    const modelIdFromCookie = cookies().get('model-id')?.value;
    selectedModelId =
      models.find((model) => model.id === modelIdFromCookie)?.id ||
      DEFAULT_MODEL_NAME;
  } else {
    const { cookies } = await import('next/headers');
    const modelIdFromCookie = cookies().get('model-id')?.value;
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

import { DEFAULT_MODEL_NAME, models } from '@/ai/models';
import { convertToUIMessages } from '@/lib/utils';
import ProjectLandingPage from '@/components/ProjectLandingPage';
import React from 'react';
import { useSearchParams, notFound, useRouter } from 'next/navigation';
import { cookies } from 'next/headers';
import {
  getChatById,
  getMessagesByChatId,
  getSession,
} from '@/db/cached-queries';
