'use client';

import { PlusIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

import type { User } from '@supabase/supabase-js';

interface Chat {
  id: string;
  title: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  project_id: string;
}

interface ProjectDetailProps {
  id: string;
  name: string;
  user: User;
  selectedModelId: string;
}

export default function ProjectDetail({ id, name, user, selectedModelId }: ProjectDetailProps) {
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [newChatTitle, setNewChatTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchChats();
  }, [id]);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('project_id', id)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      setChats(data || []);
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast.error('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChat = async () => {
    if (!newChatTitle.trim()) return;
    
    try {
      setCreating(true);
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('chats')
        .insert([{ 
          title: newChatTitle.trim(),
          user_id: user.id,
          project_id: id
        }])
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      if (data) {
        toast.success('Chat created successfully');
        setNewChatTitle('');
        // Navigate to the new chat
        router.push(`/chat/${data.id}`);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to create chat');
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    
    // If it's less than 24 hours ago, show relative time
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      // Less than a day ago
      if (diffInHours < 1) {
        const minutes = Math.floor(diffInHours * 60);
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
      } else {
        const hours = Math.floor(diffInHours);
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
      }
    } else if (diffInHours < 48) {
      // Yesterday
      return 'yesterday';
    } else {
      // Format as date
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const handleOpenChat = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{name}</h1>
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="New chat title..."
            value={newChatTitle}
            onChange={(e) => setNewChatTitle(e.target.value)}
            className="w-64"
            disabled={creating}
          />
          <Button 
            onClick={handleCreateChat} 
            disabled={!newChatTitle.trim() || creating}
          >
            <PlusIcon className="size-4 mr-2" />
            Create Chat
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border shadow-sm">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : chats.length === 0 ? (
        <div className="text-center py-12 bg-muted/40 rounded-lg">
          <h2 className="text-xl font-medium mb-2">No chats in this project yet</h2>
          <p className="text-muted-foreground mb-4">
            Create your first chat to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chats.map((chat) => (
            <Card 
              key={chat.id} 
              className="border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleOpenChat(chat.id)}
            >
              <CardHeader>
                <CardTitle className="truncate">{chat.title || 'Untitled Chat'}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Last updated {formatDate(chat.updated_at)}
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" size="sm" className="ml-auto">
                  Open
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
