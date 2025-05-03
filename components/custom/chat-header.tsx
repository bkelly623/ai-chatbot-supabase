'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EllipsisVertical } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { Database } from '@/types/supabase';
import { createClient } from '@/utils/supabase/client';
import { moveChatToProject } from '@/app/actions/project-actions';

interface ChatHeaderProps {
  chatId?: string;
  userId?: string;
  userProjects?: Database['public']['Tables']['projects']['Row'][];
}

export function ChatHeader({ chatId, userId, userProjects }: ChatHeaderProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleMoveToProject = async (projectId: string) => {
    if (!chatId) return;

    setLoading(true);
    try {
      await moveChatToProject(chatId, projectId);
      router.refresh();
    } catch (error) {
      console.error('Failed to move chat to project:', error);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <div className="flex items-center justify-between border-b px-4 py-2">
      <div className="text-lg font-semibold">Chat</div>
      {chatId && userProjects?.length ? (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={loading}
            >
              <EllipsisVertical className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0">
            <Command>
              <CommandInput placeholder="Select project..." />
              <CommandEmpty>No projects found.</CommandEmpty>
              <CommandGroup heading="Projects">
                {userProjects.map((project) => (
                  <CommandItem
                    key={project.id}
                    value={project.name}
                    onSelect={() => handleMoveToProject(project.id)}
                  >
                    {project.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      ) : null}
    </div>
  );
}
