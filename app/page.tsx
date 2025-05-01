'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, notFound } from 'next/navigation';

import { Chat as PreviewChat } from '@/components/custom/chat';
import {
  getChatById,
  getMessagesByChatId,
  getSession,
} from '@/db/cached-queries';
import { convertToUIMessages } from '@/lib/utils';
import ProjectLandingPage from '@/components/ProjectLandingPage';
import { DEFAULT_MODEL_NAME } from '@/ai/models';

interface PageProps {
  initialChatId: string | null;
  initialSelectedModelId: string;
}

const Page: React.FC<PageProps> = ({ initialChatId, initialSelectedModelId }) => {
  const searchParams = useSearchParams();
  const chatId = initialChatId || searchParams.get('chatId');
  const projectId = searchParams.get('projectId');
  const [initialMessages, setInitialMessages] = useState<any[]>([]);
  const [chat, setChat] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      if (chatId) {
        const fetchedChat = await getChatById(chatId);
        if (!fetchedChat) {
          notFound();
          return;
        }
        setChat(fetchedChat);

        const messagesFromDb = await getMessagesByChatId(chatId);
        setInitialMessages(convertToUIMessages(messagesFromDb));
      }

      try {
        const userData = await getSession();
        setUser(userData?.user);
      } catch (error) {
        notFound();
      }
    };

    loadData();
  }, [chatId]);

  if (projectId) {
    return <ProjectLandingPage user={user} />;
  }

  if (!chatId) {
    return <div>Select a chat from the sidebar, or create a new chat.</div>;
  }

  if (!user || !chat || user.id !== chat.user_id) {
    return notFound();
  }

  return (
    <PreviewChat
      id={chatId}
      initialMessages={initialMessages}
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
  const searchParams = useSearchParams();
  const chatId = searchParams.get('chatId');
  const initialSelectedModelId = await getInitialModelId();

  return <Page initialChatId={chatId} initialSelectedModelId={initialSelectedModelId} />;
}
