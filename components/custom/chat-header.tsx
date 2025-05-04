'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { updateChatProject } from '@/app/actions';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical } from 'lucide-react';
import { Project } from '@/types';
import { useSidebar } from '@/components/sidebar/use-sidebar';
import SidebarToggle from '@/components/sidebar/sidebar-toggle';

interface ChatHeaderProps {
  chatId: string;
  projectId: string | null;
  projects: Project[];
}

export default function ChatHeader({ chatId, projectId, projects }: ChatHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isCollapsed } = useSidebar();

  const [showProjectSelect, setShowProjectSelect] = useState(false);

  const handleMoveToProject = async (targetProjectId: string) => {
    if (!chatId || !targetProjectId) return;

    await updateChatProject(chatId, targetProjectId);
    router.refresh();
    setShowProjectSelect(false);
  };

  const renderProjectOptions = () => (
    <>
      {projects
        .filter((p) => p.id !== projectId)
        .map((project) => (
          <DropdownMenuItem
            key={project.id}
            onClick={() => handleMoveToProject(project.id)}
          >
            {project.title}
          </DropdownMenuItem>
        ))}
    </>
  );

  return (
    <div className="flex items-center justify-between border-b border-muted px-4 py-3">
      <div className="flex items-center gap-2">
        {!isCollapsed && <SidebarToggle />}
        <Button onClick={() => router.push('/chat')} variant="outline" size="sm">
          + New Chat
        </Button>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!showProjectSelect ? (
            <DropdownMenuItem onClick={() => setShowProjectSelect(true)}>
              Move to project
            </DropdownMenuItem>
          ) : (
            renderProjectOptions()
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
