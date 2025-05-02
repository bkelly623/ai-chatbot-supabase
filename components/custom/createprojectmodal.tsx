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
import { experimental_useFormStatus as useFormStatus } from 'react-dom'; // Import useFormStatus
import { createProject } from '@/actions/project-actions'; // Import the Server Action

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
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

    const result = await createProject(projectName); // Call the imported Server Action

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
