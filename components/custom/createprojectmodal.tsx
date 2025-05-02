'use client';

import React, { useState } from 'react'; //  ✅  Import useState
import { useRouter } from 'next/navigation'; //  ✅ Import useRouter

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';  //  ✅  Import Supabase client

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ open, onClose }) => {
  const [projectName, setProjectName] = useState('');  //  ✅  State for project name
  const supabase = createClient();  //  ✅  Initialize Supabase client
  const router = useRouter();  //  ✅  Initialize useRouter

  const handleCreateProject = async () => {  //  ✅  Async function to create project
    if (!projectName.trim()) {
      //  ✅  Basic validation
      alert('Project name cannot be empty.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{ name: projectName }])  //  ✅  Insert project into Supabase
        .select();  //  ✅  Select the newly created row

      if (error) {
        console.error('Error creating project:', error);
        alert('Failed to create project.');
      } else {
        console.log('Project created successfully!', data);
        onClose();  //  ✅  Close the modal
        setProjectName('');  //  ✅  Clear the input
        router.refresh(); // ✅ Refresh the route to update the sidebar
      }
    } catch (error) {
      console.error('An unexpected error occurred:', error);
      alert('An unexpected error occurred.');
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
              value={projectName}  //  ✅  Bind input value
              onChange={(e) => setProjectName(e.target.value)}  //  ✅  Update state on change
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
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleCreateProject}>  {/* ✅  Call handleCreateProject */}
            Create Project
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CreateProjectModal;
