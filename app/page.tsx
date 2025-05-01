'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, notFound } from 'next/navigation';

import { Chat as PreviewChat } from '@/components/custom/chat';
import {
  getChatById,
  getMessagesByChatId,
  getSession, // Import getSession from '@/db/cached-queries'
} from '@/db/cached-queries';
import { convertToUIMessages } from '@/lib/utils';
import ProjectLandingPage from '/app/ProjectLandingPage';
import { DEFAULT_MODEL_NAME, models } from '@/ai/models'; // Import DEFAULT_MODEL_NAME
import { cookies } from 'next/headers';

interface PageProps {
  initialChatId: string | null;
}

const Page: React.FC<PageProps> = ({ initialChatId }) => {
  const searchParams = useSearchParams();
  const chatId = initialChatId || searchParams.get('chatId');
  const projectId = searchParams.get('projectId');
  const [selectedModelId, setSelectedModelId] = useState(DEFAULT_MODEL_NAME);
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
        const userData = await getSession(); // Use getSession from '@/db/cached-queries'
        setUser(userData?.user);
      } catch (error) {
        notFound();
      }

      const cookieStore = cookies();
      const modelIdFromCookie = cookieStore.get('model-id')?.value;
      setSelectedModelId(
        models.find((model) => model.id === modelIdFromCookie)?.id ||
          DEFAULT_MODEL_NAME
      );
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
      selectedModelId={selectedModelId}
    />
  );
};

export default function PageServerWrapper() {
  const searchParams = useSearchParams();
  const chatId = searchParams.get('chatId');

  return <Page initialChatId={chatId} />;
}
