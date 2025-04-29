'use client';

import { useChatStore } from '@/lib/stores/chat-store';
import { IconSpinner } from '@/components/ui/icons';

export function ChatHeader() {
  const loading = useChatStore(state => state.loading);

  return (
    <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2 dark:border-gray-700">
      <div className="flex items-center space-x-2">
        <h2 className="text-lg font-semibold">Chat</h2>
        {loading && <IconSpinner className="h-4 w-4 animate-spin" />}
      </div>
    </div>
  );
}
