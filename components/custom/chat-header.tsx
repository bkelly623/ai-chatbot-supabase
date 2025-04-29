'use client';

import { Button } from '@/components/ui/button';
import { IconSpinner } from '@/components/ui/icons';
import { ChatShareDialog } from '@/components/chat/share-dialog';
import { ClearChat } from '@/components/chat/clear-chat';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import { useScrollAnchor } from '@/lib/hooks/use-scroll-anchor';
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit';
import { useChatStore } from '@/lib/stores/chat-store';
import { cn } from '@/lib/utils';

export function ChatHeader() {
  const [shareDialogOpen, setShareDialogOpen] = useLocalStorage<boolean>('shareDialogOpen', false);
  const loading = useChatStore(state => state.loading);
  useScrollAnchor();

  return (
    <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2 dark:border-gray-700">
      <div className="flex items-center space-x-2">
        <h2 className="text-lg font-semibold">Chat</h2>
        {loading && <IconSpinner className="h-4 w-4 animate-spin" />}
      </div>
      <div className="flex space-x-2">
        <ClearChat />
        <ChatShareDialog open={shareDialogOpen} onOpenChange={setShareDialogOpen} />
      </div>
    </div>
  );
}
