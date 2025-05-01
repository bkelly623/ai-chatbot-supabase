'use client';

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState, useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // We'll remove this
import { createClient } from '@/lib/supabase/client';

import type { User } from '@supabase/supabase-js';

interface SidebarProjectsProps {
  user: User | undefined;
}

export default function SidebarProjects({ user }: SidebarProjectsProps) {
  const [projects, setProjects] = useState<any[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState<boolean>(false); // New state for modal visibility
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

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      setError('Project name is required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (user?.id) {
        const {
          data,
          error
        } = await supabase.from('projects').insert([{
          user_id: user.id,
          name: newProjectName
        }]).select();
        if (error) {
          setError(error.message);
        } else if (data?.length) {
          setProjects(prev => [data[0], ...prev]);
          setNewProjectName('');
        }
      } else {
        setError('User ID is not available.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    router.push(`/?projectId=${projectId}`);
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

      {/* We'll remove this entire div
      <div className="flex gap-2 pt-2">
        <Input
          className="text-sm"
          placeholder="New project..."
          value={newProjectName}
          onChange={e => {
            setNewProjectName(e.target.value);
            setError(null);
          }}
        />
        <Button variant="ghost" size="icon" onClick={handleCreateProject} disabled={loading}>
          {loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <Plus className="size-4" />}
        </Button>
      </div>
      */}
    </div>
  );
}
