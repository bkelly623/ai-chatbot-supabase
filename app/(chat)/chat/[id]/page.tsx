import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { DEFAULT_MODEL_NAME, models } from '@/ai/models';
import { Chat as PreviewChat } from '@/components/custom/chat';
import {
  getChatById,
  getMessagesByChatId,
  getSession,
} from '@/db/cached-queries';
import { convertToUIMessages } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontalIcon } from '@/components/custom/icons';

export default async function Page(props: { params: Promise<any> }) {
  const params = await props.params;
  const { id } = params;
  const chat = await getChatById(id);

  if (!chat) {
    notFound();
  }

  const user = await getSession();

  if (!user) {
    return notFound();
  }

  if (user.id !== chat.user_id) {
    return notFound();
  }

  const messagesFromDb = await getMessagesByChatId(id);

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('model-id')?.value;
  const selectedModelId =
    models.find((model) => model.id === modelIdFromCookie)?.id ||
    DEFAULT_MODEL_NAME;

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center px-4 py-2 border-b">
        {/* You can insert a title on the left if needed */}
        <div />

        <div className="flex items-center gap-2">
          <Button variant="default" size="sm">
            New Chat
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontalIcon className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  console.log('Move to project clicked');
                }}
              >
                Move to project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <PreviewChat
          id={chat.id}
          initialMessages={convertToUIMessages(messagesFromDb)}
          selectedModelId={selectedModelId}
        />
      </div>
    </div>
  );
}
