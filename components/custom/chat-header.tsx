'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EllipsisVertical, Plus } from 'lucide-react';

import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '../ui/command';

import { moveChatToProject } from '../../app/actions/project-actions';
import type { Database } from '../../types/supabase';

interface ChatHeaderProps {
  chatId?: string;
  userId?: string;
  userProjects?: Database['public']['Tables']['projects']['Row'][];
}

export function ChatHeader({ chatId, userId, userProjects }: ChatHeaderProps) {
  const [open, setOpen] = useState(false);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleMoveToProject = async (projectId: string) => {
    if (!chatId || !projectId) return;
    try {
      setLoading(true);
      await moveChatToProject(chatId, projectId);
      setOpen(false);
      setShowProjectSelector(false);
      router.refresh();
    } catch (error) {
      console.error('Failed to move chat:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between border-b px-4 py-3">
      <Button variant="outline" size="sm" onClick={() => router.push('/')}>
        <Plus className="h-4 w-4 mr-2" />
        New Chat
      </Button>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon">
            <EllipsisVertical className="h-5 w-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[240px] p-2">
          {!showProjectSelector ? (
            <div className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start text-sm"
                onClick={() => setShowProjectSelector(true)}
              >
                Move to Project
              </Button>
            </div>
          ) : (
            <Command>
              <CommandInput placeholder="Select project..." />
              <CommandEmpty>No project found.</CommandEmpty>
              <CommandGroup>
                {userProjects?.map((project) => (
                  <CommandItem
                    key={project.id}
                    onSelect={() => handleMoveToProject(project.id)}
                    disabled={loading}
                  >
                    {project.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
