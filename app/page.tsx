import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { DEFAULT_MODEL_NAME, models } from '@/ai/models';
import { ClientPage } from '@/components/client-page';
import {
  getChatById,
  getMessagesByChatId,
  getSession,
} from '@/db/cached-queries';
import { convertToUIMessages } from '@/lib/utils';

export default async function Page({ searchParams }: { searchParams: { chatId?: string; projectId?: string } }) {
  const chatId = searchParams.chatId || null;
  const projectId = searchParams.projectId || null;

  const user = await getSession();

  if (!user && !projectId) {
    return notFound();
  }

  let initialMessages = [];
  let selectedModelId = DEFAULT_MODEL_NAME;

  if (chatId) {
    const chat = await getChatById(chatId);

    if (!chat || (user && user.id !== chat.user_id)) {
      return notFound();
    }

    const messagesFromDb = await getMessagesByChatId(chatId);
    initialMessages = convertToUIMessages(messagesFromDb);

    const modelIdFromCookie = cookies().get('model-id')?.value;
    selectedModelId =
      models.find((model) => model.id === modelIdFromCookie)?.id ||
      DEFAULT_MODEL_NAME;
  } else {
    const modelIdFromCookie = cookies().get('model-id')?.value;
    selectedModelId =
      models.find((model) => model.id === modelIdFromCookie)?.id ||
      DEFAULT_MODEL_NAME;
  }

  return (
    <ClientPage
      initialChatId={chatId}
      initialProjectId={projectId}
      initialMessages={initialMessages}
      selectedModelId={selectedModelId}
      user={user}
    />
  );
}
