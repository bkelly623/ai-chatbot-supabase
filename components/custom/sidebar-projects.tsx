'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

interface SidebarProjectsProps {
  user: User | undefined;
}

export default function SidebarProjects({ user }: SidebarProjectsProps) {
  const [projects, setProjects] = useState<any[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchProjects = async () => {
      let query = supabase.from('projects').select('*').order('created_at', { ascending: false });

      if (user?.id) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (!error) {
        setProjects(data || []);
      }
    };

    fetchProjects();
  }, [user, supabase]);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;

    if (user?.id) {
      const { data, error } = await supabase
        .from('projects')
        .insert([{ user_id: user.id, name: newProjectName }])
        .select();

      if (!error && data?.length) {
        setProjects((prev) => [data[0], ...prev]);
        setNewProjectName('');
      }
    } else {
      console.warn("User ID is not available. Project creation failed.");
    }
  };

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    // Navigate the user to the main chat view, passing the projectId as a query parameter
    router.push(`/?projectId=${projectId}`);
  };

  return (
    <div className="p-2 space-y-2">
      <h2 className="text-sm font-semibold text-muted-foreground">Projects</h2>
      <div className="space-y-1">
        {projects.map((project) => (
          <div
            key={project.id}
            className={`text-sm text-white truncate px-2 py-1 rounded hover:bg-muted cursor-pointer ${
              selectedProjectId === project.id ? 'bg-muted' : ''
            }`}
            onClick={() => handleSelectProject(project.id)}
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
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
