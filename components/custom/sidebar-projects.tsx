'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

import {
  FolderIcon,
  PlusIcon,
} from '@/components/custom/icons';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { BetterTooltip } from '@/components/ui/tooltip';

export function SidebarProjects({ projects = [] }) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get projectId from search params
  useEffect(() => {
    const projectId = searchParams.get('projectId');
    if (projectId) {
      setSelectedProjectId(projectId);
    }
  }, [searchParams]);

  const handleSelectProject = useCallback((projectId: string) => {
    setSelectedProjectId(projectId);
    router.push(`/projects/${projectId}`);
  }, [router]);

  const handleCreateProject = useCallback(() => {
    // Simple prompt for project name instead of using a modal
    const projectName = prompt('Enter project name:');
    
    if (!projectName || projectName.trim() === '') {
      return;
    }

    // Create project
    fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: projectName }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to create project');
        }
        return response.json();
      })
      .then(project => {
        toast.success('Project created successfully');
        router.push(`/projects/${project.id}`);
        router.refresh();
      })
      .catch(error => {
        console.error('Error creating project:', error);
        toast.error('Failed to create project');
      });
  }, [router]);

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-2 px-4">
        <div className="flex items-center gap-2">
          <FolderIcon className="w-4 h-4" />
          <h2 className="font-semibold">Projects</h2>
        </div>

        <BetterTooltip content="Create new project">
          <Button
            onClick={handleCreateProject}
            variant="ghost"
            size="icon"
            className="h-7 w-7"
          >
            <PlusIcon className="h-4 w-4" />
            <span className="sr-only">Create new project</span>
          </Button>
        </BetterTooltip>
      </div>

      <Separator className="mb-2" />

      <div className="space-y-1 px-2">
        {projects.map((project) => (
          <div
            key={project.id}
            className={`text-sm text-white truncate px-2 py-1 rounded hover:bg-muted cursor-pointer flex items-center gap-2 ${
              selectedProjectId === project.id ? 'bg-muted' : ''
            }`}
            onClick={() => handleSelectProject(project.id)}
          >
            <FolderIcon className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{project.name}</span>
          </div>
        ))}

        {projects.length === 0 && (
          <div className="px-2 py-1 text-sm text-muted-foreground">
            No projects yet
          </div>
        )}
      </div>
    </div>
  );
}
