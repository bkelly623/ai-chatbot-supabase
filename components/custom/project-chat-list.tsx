'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { updateChatProjectId } from '@/app/(chat)/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  MoreHorizontalIcon,
  MessageIcon,
  PlusIcon,
  TrashIcon,
} from '@/components/custom/icons';
import { Database } from '@/lib/supabase/types';

type Chat = Database['public']['Tables']['chats']['Row'];

interface ProjectChatListProps {
  chats: Chat[];
  projectId: string;
  userId: string;
}

export function ProjectChatList({ chats, projectId, userId }: ProjectChatListProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Function to create a new chat in this project
  const handleCreateNewChat = () => {
    router.push(`/?project=${projectId}`);
  };

  // Function to handle removing a chat from the project
  const handleRemoveFromProject = async (chatId: string) => {
    try {
      await updateChatProjectId(chatId, null);
      toast.success('Chat removed from project');
      router.refresh();
    } catch (error) {
      console.error('Error removing chat from project:', error);
      toast.error('Failed to remove chat from project');
    }
  };

  // Function to handle deleting a chat
  const handleDelete = async () => {
    if (!deleteId) return;

    const deletePromise = fetch(`/api/chat?id=${deleteId}`, {
      method: 'DELETE',
    });

    toast.promise(deletePromise, {
      loading: 'Deleting chat...',
      success: () => {
        router.refresh();
        return 'Chat deleted successfully';
      },
      error: 'Failed to delete chat',
    });

    setShowDeleteDialog(false);
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">
          {chats.length > 0 
            ? `${chats.length} chat${chats.length === 1 ? '' : 's'} in this project`
            : 'No chats in this project yet'}
        </h2>
        <Button 
          onClick={handleCreateNewChat} 
          className="flex items-center gap-1"
        >
          <PlusIcon className="size-4" />
          <span>New Chat</span>
        </Button>
      </div>

      {chats.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {chats.map((chat) => (
            <Card key={chat.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between p-4">
                <CardTitle className="text-sm truncate">
                  {chat.title || 'New Chat'}
                </CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                      <MoreHorizontalIcon className="size-4" />
                      <span className="sr-only">Menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => handleRemoveFromProject(chat.id)}
                    >
                      Remove from project
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer text-destructive"
                      onClick={() => {
                        setDeleteId(chat.id);
                        setShowDeleteDialog(true);
                      }}
                    >
                      <TrashIcon className="size-4 mr-2" />
                      Delete chat
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    {chat.updated_at
                      ? format(new Date(chat.updated_at), 'MMM d, yyyy')
                      : 'Just now'}
                  </span>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/chat/${chat.id}`} className="flex items-center gap-1">
                      <MessageIcon className="size-4" />
                      <span>Open</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 bg-muted/50 rounded-lg">
          <MessageIcon className="size-10 mb-4 text-muted-foreground" />
          <p className="text-center text-muted-foreground">
            No chats in this project yet. Create a new chat to get started.
          </p>
          <Button 
            onClick={handleCreateNewChat} 
            className="mt-4 flex items-center gap-1"
          >
            <PlusIcon className="size-4" />
            <span>Create New Chat</span>
          </Button>
        </div>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              chat and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={handleDelete}
            >
              Delete chat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
