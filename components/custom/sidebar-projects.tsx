'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface SidebarProjectsProps {
  user?: { id: string };
}

export function SidebarProjects({ user }: SidebarProjectsProps) {
  const [projects, setProjects] = useState<any[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const supabase = createClient();

  useEffect(() => {
    if (user?.id) fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (!error) {
      setProjects(data || []);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    const { data, error } = await supabase
      .from('projects')
      .insert([{ user_id: user?.id, name: newProjectName }])
      .select();

    if (!error && data?.length) {
      setProjects((prev) => [data[0], ...prev]);
      setNewProjectName('');
    }
  };

  return (
    <div className="mb-4">
      <h2 className="text-xs font-semibold text-muted-foreground mb-2">Projects</h2>
      <div className="space-y-1 mb-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="text-sm text-white px-2 py-1 rounded hover:bg-muted cursor-pointer truncate"
          >
            {project.name}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          className="text-sm"
          placeholder="New project..."
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
        />
        <Button variant="ghost" size="icon" onClick={handleCreateProject}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
