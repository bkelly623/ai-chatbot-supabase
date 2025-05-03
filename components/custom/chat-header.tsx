'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useWindowSize } from 'usehooks-ts';

import { updateChatProjectId } from '@/app/(chat)/actions';
import { CheckIcon, FolderIcon, LoaderIcon, MoreHorizontalIcon } from '@/components/custom/icons';
import { SidebarToggle } from '@/components/custom/sidebar-toggle';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BetterTooltip } from '@/components/ui/tooltip';
import { createClient } from '@/lib/supabase/client';

type Project = {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
};

export function ChatHeader({ selectedModelId }: { selectedModelId: string }) {
  const router = useRouter();
  const { width } = useWindowSize();
  const { id: chatId } = useParams() as { id: string };

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from('projects').select('*');
      if (!error && data) setProjects(data);
    };
    fetchProjects();
  }, []);

  const handleMoveChat = async (projectId: string) => {
    if (!chatId || !projectId) return;
    try {
      setIsLoading(true);
      await updateChatProjectId(chatId, projectId);
      setCurrentProjectId(projectId);
      toast.success('Chat moved successfully.');
      router.refresh();
    } catch (err) {
      toast.error('Failed to move chat.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-16 items-center justify-between border-b px-4">
      <SidebarToggle />
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Chat Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Move to Project</DropdownMenuLabel>
            {projects.length === 0 && (
              <DropdownMenuItem disabled>
                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                Loading projects...
              </DropdownMenuItem>
            )}
            {projects.map((project) => (
              <DropdownMenuItem
                key={project.id}
                onClick={() => handleMoveChat(project.id)}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <FolderIcon className="h-4 w-4" />
                  {project.name}
                </div>
                {project.id === currentProjectId && <CheckIcon className="h-4 w-4 text-primary" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
