'use client';

/* eslint-disable import/order */
import { Plus } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';

import CreateProjectModal from '@/components/custom/createprojectmodal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { FolderIcon } from '@/components/custom/icons';
/* eslint-enable import/order */

export interface SidebarProjectsProps {
  user?: User | undefined;
  setSelectedProjectId?: (id: string | null) => void;
}

export default function SidebarProjects(props: SidebarProjectsProps) {
  const { user, setSelectedProjectId } = props;
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectIdLocal] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState<boolean>(false);
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from('projects').select('*').order('created_at', {
        ascending: false
      });

      if (user?.id) {
        query = query.eq('user_id', user.id);
      }

      const {
        data,
        error
      } = await query;

      if (error) {
        setError(error.message);
      } else {
        setProjects(data || []);
      }
    } catch (e) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Extract project ID from pathname if on a project page
  useEffect(() => {
    if (pathname.startsWith('/projects/')) {
      const projectId = pathname.split('/')[2];
      setSelectedProjectIdLocal(projectId);
      if (setSelectedProjectId) {
        setSelectedProjectId(projectId);
      }
    } else {
      setSelectedProjectIdLocal(null);
    }
  }, [pathname, setSelectedProjectId]);

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectIdLocal(projectId);
    if (setSelectedProjectId) {
      setSelectedProjectId(projectId);
    }
    
    // Instead of setting a query parameter, navigate to the project page
    router.push(`/projects/${projectId}`);
  };

  const handleCloseCreateProjectModal = () => {
    setShowCreateProjectModal(false);
    // Refresh the projects list after creating a new project
    fetchProjects();
  };

  return (
    <div className="p-2 space-y-2">
      <h2 className="text-sm font-semibold text-muted-foreground flex items-center justify-between">
        Projects
        <Button variant="ghost" size="sm" onClick={() => setShowCreateProjectModal(true)}>
          + New Project
        </Button>
      </h2>

      {loading && <div className="animate-pulse bg-muted/50 h-8 w-full rounded-md">
        {/* Placeholder while loading */}
      </div>}

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="space-y-1">
        {projects.map(project => (
          <div
            key={project.id}
            className={`text-sm text-white truncate px-2 py-1 rounded hover:bg-muted cursor-pointer flex items-center gap-2 ${
              selectedProjectIdLocal === project.id ? 'bg-muted' : ''
            }`}
            onClick={() => handleSelectProject(project.id)}
          >
            <FolderIcon className="size-4" />
            {project.name}
          </div>
        ))}
      </div>

      {/* Conditionally render the CreateProjectModal */}
      <CreateProjectModal open={showCreateProjectModal} onClose={handleCloseCreateProjectModal} />
    </div>
  );
}
