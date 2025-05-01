'use client';

import React from 'react';
import { useSearchParams, notFound } from 'next/navigation';

import { Chat as PreviewChat } from '@/components/custom/chat';
import {
  getChatById,
  getMessagesByChatId,
  getSession,
} from '@/db/cached-queries';
import { convertToUIMessages } from '@/lib/utils';
import ProjectLandingPage from '/app/ProjectLandingPage';

interface PageProps {
  initialSelectedModelId: string;
}

const Page: React.FC<PageProps> = ({ initialSelectedModelId }) => {
  const searchParams = useSearchParams();
  const chatId = searchParams.get('chatId');
  const projectId = searchParams.get('projectId');

  if (projectId) {
    return <ProjectLandingPage />;
  }

  if (!chatId) {
    return <div>Select a chat from the sidebar, or create a new chat.</div>;
  }

  const chat = getChatById(chatId);

  if (!chat) {
    notFound();
  }

  const user = getSession();

  if (!user) {
    return notFound();
  }

  if (user.id !== chat.user_id) {
    return notFound();
  }

  const messagesFromDb = getMessagesByChatId(chatId);

  return (
    <PreviewChat
      id={chat.id}
      initialMessages={convertToUIMessages(messagesFromDb)}
      selectedModelId={initialSelectedModelId}
    />
  );
};

async function getInitialModelId() {
  const { cookies } = await import('next/headers');
  const { DEFAULT_MODEL_NAME, models } = await import('@/ai/models');
  const cookieStore = cookies();
  const modelIdFromCookie = cookieStore.get('model-id')?.value;
  return (
    models.find((model) => model.id === modelIdFromCookie)?.id ||
    DEFAULT_MODEL_NAME
  );
}

export default async function PageServerWrapper() {
  const initialSelectedModelId = await getInitialModelId();

  return <Page initialSelectedModelId={initialSelectedModelId} />;
}
