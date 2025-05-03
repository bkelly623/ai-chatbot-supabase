'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

import { FolderIcon, PlusIcon } from '@/components/custom/icons';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { BetterTooltip } from '@/components/ui/tooltip';

interface SidebarProjectsProps {
  projects?: any[];
  user?: User;
  setSelectedProjectId?: (id: string | null) => void;
}

export function SidebarProjects({ 
  projects = [], 
  user,
  setSelectedProjectId 
}: SidebarProjectsProps) {
  const [localSelectedProjectId, setLocalSelectedProjectId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get projectId from search params
  useEffect(() => {
    const projectId = searchParams.get('projectId');
    if (projectId) {
      setLocalSelectedProjectId(projectId);
      if (setSelectedProjectId) {
        setSelectedProjectId(projectId);
      }
    }
  }, [searchParams, setSelectedProjectId]);

  const handleSelectProject = useCallback((projectId: string) => {
    setLocalSelectedProjectId(projectId);
    if (setSelectedProjectId) {
      setSelectedProjectId(projectId);
    }
    router.push(`/projects/${projectId}`);
  }, [router, setSelectedProjectId]);

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

  // When no projects are passed, fetch them from the API
  useEffect(() => {
    if (projects.length === 0 && user) {
      fetch('/api/projects')
        .then(response => response.json())
        .then(data => {
          // Handle projects if needed
        })
        .catch(error => {
          console.error('Error fetching projects:', error);
        });
    }
  }, [projects, user]);

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-2 px-4">
        <div className="flex items-center gap-2">
          <FolderIcon className="size-4" />
          <h2 className="font-semibold">Projects</h2
