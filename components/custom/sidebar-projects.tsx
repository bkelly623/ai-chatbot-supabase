'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface SidebarProjectsProps {
  user: User | undefined;
}

export default function SidebarProjects({ user }: SidebarProjectsProps) {
  const [projects, setProjects] = useState<any[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const supabase = createClient();

  const fetchProjects = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error) {
      setProjects(data || []);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user, fetchProjects]); // FIXED dependency warning

  const handleCreateProject = async () => {
    if (!newProjectName.trim() || !user?.id) return;

    const { data, error } = await supabase
      .from('projects')
      .insert([{ user_id: user.id, name: newProjectName }])
      .select();

    if (!error && data?.length) {
      setProjects((prev) => [data[0], ...prev]);
      setNewProjectName('');
    }
  };

  return (
    <div className="p-2 space-y-2">
      <h2 className="text-sm font-semibold text-muted-foreground">Projects</h2>
      <div className="space-y-1">
        {projects.map((project) => (
          <div
            key={project.id}
            className="text-sm text-white truncate px-2 py-1 rounded hover:bg-muted cursor-pointer"
          >
            {project.name}
          </div>
        ))}
      </div>
      <div className="flex gap-2 pt-2">
        <Input
          className="text-sm"
          placeholder="New project..."
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
        />
        <Button variant="ghost" size="icon" onClick={handleCreateProject}>
          <Plus className="size-4" /> {/* FIXED Tailwind warning */}
        </Button>
      </div>
    </div>
  );
}
