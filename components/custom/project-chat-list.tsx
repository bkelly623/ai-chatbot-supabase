'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontalIcon, TrashIcon } from '@/components/custom/icons';

interface ProjectChatListProps {
  chats: any[];
  projectId: string;
  userId: string;
}

export function ProjectChatList({
  chats,
  projectId,
  userId,
}: ProjectChatListProps) {
  const router = useRouter();
  const [isRemoving, setIsRemoving] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const handleRemoveFromProject = async (chatId: string) => {
    setIsRemoving(true);
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove chat from project');
      }

      toast.success('Chat removed from project');
      router.refresh();
    } catch (error) {
      console.error('Error removing chat from project:', error);
      toast.error('Failed to remove chat from project');
    } finally {
      setIsRemoving(false);
      setSelectedChatId(null);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    setIsRemoving(true);
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete chat');
      }

      toast.success('Chat deleted');
      router.refresh();
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast.error('Failed to delete chat');
    } finally {
      setIsRemoving(false);
      setSelectedChatId(null);
    }
  };

  if (chats.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>No chats in this project</CardTitle>
          <CardDescription>
            Start a new chat or add existing chats to this project.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            onClick={() => {
              router.push(`/?projectId=${projectId}`);
            }}
          >
            Create New Chat
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {chats.map((chat) => (
        <Card key={chat.id}>
          <CardHeader className="relative">
            <CardTitle className="pr-8 truncate">{chat.title}</CardTitle>
            <CardDescription className="truncate">
              {format(new Date(chat.updated_at), 'MMM d, yyyy')}
            </CardDescription>
            <div className="absolute top-2 right-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8">
                    <MoreHorizontalIcon className="size-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedChatId(chat.id);
                      handleRemoveFromProject(chat.id);
                    }}
                  >
                    Remove from project
                  </DropdownMenuItem>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        className="text-destructive"
                        onSelect={(e) => {
                          e.preventDefault();
                          setSelectedChatId(chat.id);
                        }}
                      >
                        <div className="flex items-center">
                          <TrashIcon className="mr-2 size-4" />
                          Delete permanently
                        </div>
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this chat and all its messages.
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive hover:bg-destructive/90"
                          onClick={() => {
                            if (selectedChatId) {
                              handleDeleteChat(selectedChatId);
                            }
                          }}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <p className="line-clamp-2 text-muted-foreground h-10">
              {chat.messages?.length > 0
                ? chat.messages[chat.messages.length - 1]?.content
                : 'No messages yet'}
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="secondary" className="w-full" asChild>
              <Link href={`/chat/${chat.id}`}>Open Chat</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
