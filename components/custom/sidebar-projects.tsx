'use client';

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState, useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import CreateProjectModal from '@/components/custom/createprojectmodal'; // Corrected import

import type { User } from '@supabase/supabase-js';

interface SidebarProjectsProps {
  user: User | undefined;
}

export default function SidebarProjects({ user }: SidebarProjectsProps) {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState<boolean>(false); // State for modal visibility
  const supabase = createClient();
  const router = useRouter();

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
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    router.push(`/?projectId=${projectId}`);
  };

  const handleCloseCreateProjectModal = () => {
    setShowCreateProjectModal(false);
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
            className={`text-sm text-white truncate px-2 py-1 rounded hover:bg-muted cursor-pointer ${selectedProjectId === project.id ? 'bg-muted' : ''}`}
            onClick={() => handleSelectProject(project.id)}
          >
            {project.name}
          </div>
        ))}
      </div>

      {/* Conditionally render the CreateProjectModal */}
      <CreateProjectModal open={showCreateProjectModal} onClose={handleCloseCreateProjectModal} />
    </div>
  );
}
