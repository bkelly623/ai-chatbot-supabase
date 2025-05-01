'use client';

import React from 'react';
import { useSearchParams, notFound } from 'next/navigation'; // Corrected import
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

export default async function PageServerWrapper() {
  const searchParams = useSearchParams();
  const chatId = searchParams.get('chatId');
  const projectId = searchParams.get('projectId');

  const user = await getSession();

  if (!user && !projectId) {
    return notFound();
  }

  let chat;
  let messagesFromDb = [];

  if (chatId) {
    chat = await getChatById(chatId);

    if (!chat || (user && user.id !== chat.user_id)) {
      return notFound();
    }

    messagesFromDb = await getMessagesByChatId(chatId);
  }

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('model-id')?.value;
  const selectedModelId =
    models.find((model) => model.id === modelIdFromCookie)?.id ||
    DEFAULT_MODEL_NAME;

  return (
    <Page
      chatId={chatId}
      projectId={projectId}
      initialMessages={convertToUIMessages(messagesFromDb)}
      selectedModelId={selectedModelId}
      user={user}
    />
  );
}

import {
  getChatById,
  getMessagesByChatId,
  getSession,
} from '@/db/cached-queries';
import { cookies } from 'next/headers';
import { useSearchParams, notFound } from 'next/navigation'; // Removed duplicate 'notFound'
import React from 'react';
import { DEFAULT_MODEL_NAME, models } from '@/ai/models';
import { Chat as PreviewChat } from '@/components/custom/chat';
import { convertToUIMessages } from '@/lib/utils';
import ProjectLandingPage from '@/components/ProjectLandingPage';

'use client';

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

export default async function PageServerWrapper() {
  const searchParams = useSearchParams();
  const chatId = searchParams.get('chatId');
  const projectId = searchParams.get('projectId');

  const user = await getSession();

  if (!user && !projectId) {
    return notFound();
  }

  let chat;
  let messagesFromDb = [];

  if (chatId) {
    chat = await getChatById(chatId);

    if (!chat || (user && user.id !== chat.user_id)) {
      return notFound();
    }

    messagesFromDb = await getMessagesByChatId(chatId);
  }

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('model-id')?.value;
  const selectedModelId =
    models.find((model) => model.id === modelIdFromCookie)?.id ||
    DEFAULT_MODEL_NAME;

  return (
    <Page
      chatId={chatId}
      projectId={projectId}
      initialMessages={convertToUIMessages(messagesFromDb)}
      selectedModelId={selectedModelId}
      user={user}
    />
  );
}
