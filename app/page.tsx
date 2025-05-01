'use client';

import React from 'react';
import { useSearchParams, notFound } from 'next/navigation';

import { Chat as PreviewChat } from '@/components/custom/chat';
import {
  getChatById,
  getMessagesByChatId,
} from '@/db/cached-queries';
import { convertToUIMessages } from '@/lib/utils';
import ProjectLandingPage from '/app/ProjectLandingPage';

import { supabase } from '@/lib/supabase/client'; // Import the client-side Supabase client
import { DEFAULT_MODEL_NAME, models } from '@/ai/models';

async function getSessionClientSide() {
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

  const user = await getSessionClientSide(); // Use the client-side session retrieval

  if (!user) {
    return notFound();
  }

  if (user.id !== chat.user_id) {
    return notFound();
  }

  const messagesFromDb = await getMessagesByChatId(chatId);
  // We need to fetch modelId server-side and pass it as a prop
  return <ModelIdFetcher chatId={chatId} initialMessages={convertToUIMessages(messagesFromDb)} />;
}

interface ModelIdFetcherProps {
  chatId: string;
  initialMessages: any[];
}

const ModelIdFetcher: React.FC<ModelIdFetcherProps> = ({ chatId, initialMessages }) => {
  const [selectedModelId, setSelectedModelId] = useState(DEFAULT_MODEL_NAME);

  useEffect(() => {
    const fetchInitialModelId = async () => {
      const response = await fetch('/api/get-model-id');
      if (response.ok) {
        const data = await response.json();
        setSelectedModelId(data.modelId);
      }
    };

    fetchInitialModelId();
  }, []);

  return (
    <PreviewChat
      id={chatId}
      initialMessages={initialMessages}
      selectedModelId={selectedModelId}
    />
  );
};
