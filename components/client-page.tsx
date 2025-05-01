'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Chat as PreviewChat } from '@/components/custom/chat';
import ProjectLandingPage from '@/components/ProjectLandingPage';

interface ClientPageProps {
  initialChatId: string | null;
  initialProjectId: string | null;
  initialMessages: any[];
  selectedModelId: string;
  user: any;
}

export function ClientPage({
  initialChatId,
  initialProjectId,
  initialMessages,
  selectedModelId,
  user,
}: ClientPageProps) {
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
}
