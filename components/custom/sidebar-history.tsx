'use client';

import { User } from '@supabase/supabase-js';
import { format, isToday, isYesterday } from 'date-fns';
import { ChevronDown, ChevronUp, Clock, MoreHorizontal, Trash } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

interface SidebarHistoryProps {
  user?: User;
  activeChat?: string | null;
}

type ChatItem = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

export function SidebarHistory({ user, activeChat }: SidebarHistoryProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [filteredChats, setFilteredChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);
  const [chatToRename, setChatToRename] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState<string>('');
  const [renameInputVisible, setRenameInputVisible] = useState<boolean>(false);

  // Fetch chats from API
  const fetchChats = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch('/api/history');
      const data = await response.json();
      setChats(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      toast.error('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats, pathname]);

  // Filter chats based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredChats(chats);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = chats.filter((chat) =>
        chat.title.toLowerCase().includes(term)
      );
      setFilteredChats(filtered);
    }
  }, [chats, searchTerm]);

  // Group chats by date
  const groupedChats = useMemo(() => {
    const groups: Record<string, ChatItem[]> = {
      Today: [],
      Yesterday: [],
      'Previous 7 Days': [],
      'Previous 30 Days': [],
      Older: [],
    };

    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    filteredChats.forEach((chat) => {
      const chatDate = new Date(chat.updated_at);

      if (isToday(chatDate)) {
        groups['Today'].push(chat);
      } else if (isYesterday(chatDate)) {
        groups['Yesterday'].push(chat);
      } else if (chatDate >= sevenDaysAgo) {
        groups['Previous 7 Days'].push(chat);
      } else if (chatDate >= thirtyDaysAgo) {
        groups['Previous 30 Days'].push(chat);
      } else {
        groups['Older'].push(chat);
      }
    });

    // Remove empty groups
    return Object.entries(groups).filter(([_, chats]) => chats.length > 0);
  }, [filteredChats]);

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups((prev) =>
      prev.includes(groupName)
        ? prev.filter((g) => g !== groupName)
        : [...prev, groupName]
    );
  };

  const handleClearAllChats = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/chats?userId=${user.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to clear chats');
      }

      toast.success('All chats cleared');
      setChats([]);
      router.push('/');
    } catch (error) {
      console.error('Error clearing chats:', error);
      toast.error('Failed to clear chats');
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete chat');
      }

      toast.success('Chat deleted');
      
      // Remove the chat from state
      setChats((prevChats) => 
        prevChats.filter((chat) => chat.id !== chatId)
      );
      
      // If we're viewing the chat that was deleted, navigate home
      if (pathname.includes(`/chat/${chatId}`)) {
        router.push('/');
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast.error('Failed to delete chat');
    }
  };

  const handleRenameChat = async () => {
    if (!chatToRename || !newTitle.trim()) {
      setRenameInputVisible(false);
      return;
    }

    try {
      const response = await fetch(`/api/chats/${chatToRename}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle }),
      });

      if (!response.ok) {
        throw new Error('Failed to rename chat');
      }

      toast.success('Chat renamed');
      
      // Update the chat in state
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === chatToRename
            ? { ...chat, title: newTitle }
            : chat
        )
      );
      
      // Reset state
      setChatToRename(null);
      setNewTitle('');
      setRenameInputVisible(false);
    } catch (error) {
      console.error('Error renaming chat:', error);
      toast.error('Failed to rename chat');
    }
  };

  const startRenameChat = (chatId: string, currentTitle: string) => {
    setChatToRename(chatId);
    setNewTitle(currentTitle);
    setRenameInputVisible(true);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search input */}
      <div className="px-4 py-2">
        <div className="relative">
          <Input
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full"
              onClick={() => setSearchTerm('')}
            >
              <span className="sr-only">Clear search</span>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-4">
                <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
              </svg>
            </Button>
          )}
        </div>
      </div>

      {/* History title with clear all button */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center">
          <Clock className="mr-2 size-4" />
          <h2 className="text-sm font-semibold">Chat History</h2>
        </div>
        {chats.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
              >
                <Trash className="size-4" />
                <span className="sr-only">Clear history</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear chat history</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all your chats. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearAllChats}
                >
                  Clear all
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-auto px-2">
        {loading ? (
          <div className="space-y-2 p-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
            <p className="mb-2">No chats found</p>
            {searchTerm ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm('')}
              >
                Clear search
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
              >
                Start a new chat
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {groupedChats.map(([group, chats]) => (
              <div key={group}>
                <div
                  className="flex items-center justify-between px-2 py-1 text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground"
                  onClick={() => toggleGroup(group)}
                >
                  <span>{group}</span>
                  {collapsedGroups.includes(group) ? (
                    <ChevronDown className="size-4" />
                  ) : (
                    <ChevronUp className="size-4" />
                  )}
                </div>
                {!collapsedGroups.includes(group) && (
                  <div className="space-y-1 pl-2">
                    {chats.map((chat) => (
                      <div
                        key={chat.id}
                        className={`group flex items-center justify-between rounded px-2 py-1 text-sm ${
                          chat.id === activeChat
                            ? 'bg-accent'
                            : 'hover:bg-muted'
                        }`}
                      >
                        {renameInputVisible && chatToRename === chat.id ? (
                          <div className="flex-1 flex items-center">
                            <Input
                              value={newTitle}
                              onChange={(e) => setNewTitle(e.target.value)}
                              className="h-7 py-1"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleRenameChat();
                                } else if (e.key === 'Escape') {
                                  setRenameInputVisible(false);
                                }
                              }}
                              onBlur={handleRenameChat}
                            />
                          </div>
                        ) : (
                          <>
                            <Link
                              href={`/chat/${chat.id}`}
                              className="flex-1 truncate"
                            >
                              {chat.title || 'New Chat'}
                            </Link>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-7"
                                >
                                  <MoreHorizontal className="size-4" />
                                  <span className="sr-only">
                                    More options
                                  </span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    startRenameChat(
                                      chat.id,
                                      chat.title
                                    )
                                  }
                                >
                                  Rename
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem
                                      className="text-destructive focus:text-destructive"
                                      onSelect={(e) => {
                                        e.preventDefault();
                                      }}
                                    >
                                      Delete
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete chat</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will permanently delete this chat and all its messages. This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteChat(chat.id)}
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
