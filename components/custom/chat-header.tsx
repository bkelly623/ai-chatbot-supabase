'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EllipsisVertical } from 'lucide-react';
import { moveChatToProject } from '../../app/actions/project-actions';
import { getUserProjects } from '../../app/actions/user-projects';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandGroup, CommandItem } from '../ui/command';

interface ChatHeaderProps {
  chatId?: string;
}

export default function ChatHeader({ chatId }: ChatHeaderProps) {
  const router = useRouter();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleMoveToProject = async () => {
    if (!chatId) return;
    setLoading(true);
    try {
      const fetchedProjects = await getUserProjects();
      setProjects(fetchedProjects);
      setIsPopoverOpen(true);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSelect = async (projectId: string) => {
    if (!chatId) return;
    try {
      await moveChatToProject(chatId, projectId);
      router.refresh();
    } catch (error) {
      console.error('Failed to move chat to project:', error);
    } finally {
      setIsPopoverOpen(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      {chatId && (
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="text-muted-foreground"
              onClick={handleMoveToProject}
              disabled={loading}
            >
              <EllipsisVertical className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-0">
            <Command>
              <CommandGroup heading="Move to Project">
                {projects.map((project) => (
                  <CommandItem
                    key={project.id}
                    onSelect={() => handleProjectSelect(project.id)}
                  >
                    {project.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
