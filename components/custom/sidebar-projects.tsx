'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { useUser } from '@/lib/hooks/use-user';

export default function SidebarProjects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const { user } = useUser();
  const supabase = createClient();

  const fetchProjects = async (uid: string) => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });

    if (!error) {
      setProjects(data || []);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchProjects(user.id);
    }
  }, [user]);

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
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
