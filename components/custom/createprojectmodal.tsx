'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/server'; // Use server client
import { getSession } from '@/db/cached-queries'; // Import getSession
import { experimental_useFormStatus as useFormStatus } from 'react-dom'; // Import useFormStatus

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
}

async function createProject(projectName: string) {
  'use server'; // Mark this as a Server Action

  const session = await getSession(); // Get the session
  if (!session?.user?.id) {
    return { error: 'You must be logged in to create a project.' };
  }

  const supabase = await createClient(); // Initialize Supabase client *after* getting the session
  const { data, error } = await supabase
    .from('projects')
    .insert([{ name: projectName, user_id: session.user.id }]) // Include user_id
    .select();

  if (error) {
    console.error('Error creating project:', error);
    return { error: 'Failed to create project.' };
  }

  return { data };
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ open, onClose }) => {
  const [projectName, setProjectName] = useState('');
  const router = useRouter();
  const { pending } = useFormStatus(); // Get the form status

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      alert('Project name cannot be empty.');
      return;
    }

    const result = await createProject(projectName); // Call the Server Action

    if (result?.error) {
      alert(result.error);
    } else {
      console.log('Project created successfully!', result.data);
      onClose();
      setProjectName('');
      router.refresh(); // Refresh the route to update the sidebar
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Create New Project</AlertDialogTitle>
        </AlertDialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="project-name" className="text-right">
              Project Name
            </label>
            <Input
              id="project-name"
              className="col-span-3"
              placeholder="E.g. Party planning"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              disabled={pending} // Disable input while processing
            />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              Projects keep chats, files, and custom instructions in one place.
              Use them for ongoing work, or just to keep things tidy.
            </p>
          </div>
        </div>
        <AlertDialogFooter>
          <Button type="button" variant="secondary" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleCreateProject} disabled={pending}>
            {pending ? 'Creating...' : 'Create Project'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CreateProjectModal;
