import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import { Chat as PreviewChat } from '@/components/custom/chat';
import {
  getChatById,
  getMessagesByChatId,
  getSession,
} from '@/db/cached-queries';
import { convertToUIMessages } from '@/lib/utils';
import ProjectLandingPage from '@/app/ProjectLandingPage';
import { DEFAULT_MODEL_NAME, models } from '@/ai/models';

const Page = () => {
  const router = useRouter();
  const { chatId, projectId } = router.query;
  const [initialMessages, setInitialMessages] = useState([]);
  const [chat, setChat] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedModelId, setSelectedModelId] = useState(DEFAULT_MODEL_NAME);

  useEffect(() => {
    const loadData = async () => {
      // Get model from cookie client-side
      const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
      };
      
      const modelIdFromCookie = getCookie('model-id');
      if (modelIdFromCookie && models.find(model => model.id === modelIdFromCookie)) {
        setSelectedModelId(modelIdFromCookie);
      }

      try {
        const userData = await getSession();
        setUser(userData?.user);
      } catch (error) {
        router.push('/404');
        return;
      }

      if (chatId && typeof chatId === 'string') {
        const fetchedChat = await getChatById(chatId);
        if (!fetchedChat) {
          router.push('/404');
          return;
        }
        setChat(fetchedChat);

        const messagesFromDb = await getMessagesByChatId(chatId);
        setInitialMessages(convertToUIMessages(messagesFromDb));
      }
    };

    loadData();
  }, [chatId, router]);

  if (projectId) {
    return <ProjectLandingPage user={user} />;
  }

  if (!chatId) {
    return <div>Select a chat from the sidebar, or create a new chat.</div>;
  }

  if (!user || !chat || user.id !== chat.user_id) {
    router.push('/404');
    return <div>Loading...</div>;
  }

  return (
    <PreviewChat
      id={chatId as string}
      initialMessages={initialMessages}
      selectedModelId={selectedModelId}
    />
  );
};

export default Page;
