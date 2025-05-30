'use client';

import { User } from '@supabase/supabase-js';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import { Chat as PreviewChat } from '@/components/custom/chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getChatsByProjectId } from '@/db/cached-queries';
import { createClient } from '@/lib/supabase/client';

interface ProjectLandingPageProps {
  user: User | null;
}

const ProjectLandingPage: React.FC<ProjectLandingPageProps> = ({ user }) => {
  const [chats, setChats] = useState<any[]>([]);
  const [projectName, setProjectName] = useState<string | undefined>("");
  const [newChatName, setNewChatName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  useEffect(() => {
    if (projectId) {
      fetchChats(projectId);
      fetchProjectName(projectId);
    }
  }, [projectId]);

  const fetchChats = async (projectId: string) => {
    setLoading(true);
    setError(null);
    try {
      const fetchedChats = await getChatsByProjectId(projectId);
      if (fetchedChats) {
        setChats(fetchedChats);
      } else {
        setError("Failed to fetch chats for this project.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching chats.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectName = async (projectId: string) => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('projects')
        .select('name')
        .eq('id', projectId)
        .single();

      if (error) {
        setError(error.message);
      } else if (data) {
        setProjectName(data.name);
      } else {
        setError("Project not found.");
      }
    } catch (error: any) {
      setError(error.message || "An error occurred while fetching project details.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChat = async () => {
    if (!newChatName.trim() || !projectId || !user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: newChat, error: chatError } = await supabase
        .from('chats')
        .insert([{ project_id: projectId, title: newChatName, user_id: user.id }])
        .select()
        .single();

      if (chatError) {
        setError(chatError.message);
      } else if (newChat) {
        setChats(prevChats => [...prevChats, newChat]);
        setNewChatName("");
        router.push(`/?chatId=${newChat.id}`);
      }
    } catch (error: any) {
      setError(error.message || "Error creating new chat.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}

      {projectName && <h1 className="text-2xl font-bold mb-4">Project: {projectName}</h1>}

      <div className="mb-4">
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Enter new chat name"
            value={newChatName}
            onChange={(e) => setNewChatName(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleCreateChat} variant="default">
            New Chat
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => router.push(`/?chatId=${chat.id}`)}
            className="p-4 rounded-md shadow-md cursor-pointer hover:bg-gray-50"
          >
            <h2 className="text-lg font-semibold">{chat.title || `Chat ${chat.id}`}</h2>
            <p className="text-gray-500 text-sm">Created at: {chat.created_at}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectLandingPage;
