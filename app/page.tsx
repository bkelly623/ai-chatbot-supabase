import React from 'react';
import { useSearchParams, notFound } from 'next/navigation';
import { DEFAULT_MODEL_NAME, models } from '@/ai/models';
import { Chat as PreviewChat } from '@/components/custom/chat';
import { convertToUIMessages } from '@/lib/utils';
import ProjectLandingPage from '@/components/ProjectLandingPage';

// Server Component to fetch user session
async function GetUser() {
  const { getSession } = await import('@/db/cached-queries'); // Dynamic import to ensure server-only context
  return await getSession();
}

// Server Component to fetch chat data
async function GetChatData(chatId: string) {
  const { getChatById, getMessagesByChatId } = await import('@/db/cached-queries'); // Dynamic import
  const chat = await getChatById(chatId);
  const messagesFromDb = await getMessagesByChatId(chatId);
  return { chat, messagesFromDb };
}

// Client Component
interface PageProps {
  chatId: string | null;
  projectId: string | null;
  initialMessages: any[];
  selectedModelId: string;
  user: any;
}

const Page: React.FC<PageProps> = ({
  chatId,
  projectId,
  initialMessages,
  selectedModelId,
  user,
}) => {
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

// Server Component to orchestrate data fetching and rendering
export default async function PageServerWrapper() {
  const searchParams = useSearchParams();
  const chatId = searchParams.get('chatId');
  const projectId = searchParams.get('projectId');

  const user = await GetUser();

  if (!user && !projectId) {
    return notFound();
  }

  let initialMessages = [];
  let selectedModelId = DEFAULT_MODEL_NAME;

  if (chatId) {
    const { chat, messagesFromDb } = await GetChatData(chatId);

    if (!chat || (user && user.id !== chat.user_id)) {
      return notFound();
    }

    initialMessages = convertToUIMessages(messagesFromDb);

    const { cookies } = await import('next/headers'); // Dynamic import
    const modelIdFromCookie = cookies().get('model-id')?.value;
    selectedModelId =
      models.find((model) => model.id === modelIdFromCookie)?.id ||
      DEFAULT_MODEL_NAME;
  } else {
    const { cookies } = await import('next/headers'); // Dynamic import
    const modelIdFromCookie = cookies().get('model-id')?.value;
    selectedModelId =
      models.find((model) => model.id === modelIdFromCookie)?.id ||
      DEFAULT_MODEL_NAME;
  }

  return (
    <Page
      chatId={chatId}
      projectId={projectId}
      initialMessages={initialMessages}
      selectedModelId={selectedModelId}
      user={user}
    />
  );
}

// Import necessary modules (dynamic imports within Server Components)
import { DEFAULT_MODEL_NAME, models } from '@/ai/models';
import { convertToUIMessages } from '@/lib/utils';
import ProjectLandingPage from '@/components/ProjectLandingPage';
import React from 'react';
import { useSearchParams, notFound } from 'next/navigation';
