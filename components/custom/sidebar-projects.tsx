'use client';

import { MoreHorizontalIcon, PencilIcon, TrashIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import CreateProjectModal from '@/components/custom/createprojectmodal';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export interface SidebarProjectsProps {
  user?: User | undefined;
  setSelectedProjectId?: (id: string) => void;
}

export interface Project {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}

export default function SidebarProjects(props: SidebarProjectsProps) {
  const { user, setSelectedProjectId } = props;
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showCreateProjectModal, setShowCreateProjectModal] = useState<boolean>(false);
  const [showRenameProjectModal, setShowRenameProjectModal] = useState<boolean>(false);
  const [showDeleteProjectModal, setShowDeleteProjectModal] = useState<boolean>(false);
  
  // Edit/Delete states
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [newProjectName, setNewProjectName] = useState<string>('');
  
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
    } catch (e) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSelectProject = (projectId: string) => {
    setSelectedProject(projectId);
    if (setSelectedProjectId) {
      setSelectedProjectId(projectId);
    }
    // Navigate to project page
    router.push(`/projects/${projectId}`);
  };

  const handleCloseCreateProjectModal = () => {
    setShowCreateProjectModal(false);
    fetchProjects(); // Refresh projects after creating
  };
  
  // Open rename project modal
  const handleRenameProject = (project: Project) => {
    setProjectToEdit(project);
    setNewProjectName(project.name);
    setShowRenameProjectModal(true);
  };
  
  // Submit project rename
  const handleSubmitRename = async () => {
    if (!projectToEdit || !newProjectName.trim()) return;
    
    try {
      const { error } = await supabase
        .from('projects')
        .update({ name: newProjectName.trim() })
        .eq('id', projectToEdit.id);
        
      if (error) throw error;
      
      toast.success('Project renamed successfully');
      fetchProjects(); // Refresh project list
    } catch (error) {
      console.error('Error renaming project:', error);
      toast.error('Failed to rename project');
    } finally {
      setShowRenameProjectModal(false);
      setProjectToEdit(null);
      setNewProjectName('');
    }
  };
  
  // Open delete project confirmation
  const handleDeleteProject = (project: Project) => {
    setProjectToDelete(project);
    setShowDeleteProjectModal(true);
  };
  
  // Confirm project deletion
  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    
    try {
      // First update any chats in this project to have null project_id
      const { error: chatUpdateError } = await supabase
        .from('chats')
        .update({ project_id: null })
        .eq('project_id', projectToDelete.id);
        
      if (chatUpdateError) throw chatUpdateError;
      
      // Then delete the project
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectToDelete.id);
        
      if (error) throw error;
      
      toast.success('Project deleted successfully');
      
      // If we were on the deleted project's page, redirect to home
      if (selectedProject === projectToDelete.id) {
        router.push('/');
      }
      
      fetchProjects(); // Refresh project list
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    } finally {
      setShowDeleteProjectModal(false);
      setProjectToDelete(null);
    }
  };

  return (
    <div className="p-2 space-y-2">
      <h2 className="text-sm font-semibold text-muted-foreground flex items-center justify-between">
        Projects
        <Button variant="ghost" size="sm" onClick={() => setShowCreateProjectModal(true)}>
          + New Project
        </Button>
      </h2>

      {loading && <div className="animate-pulse bg-muted/50 h-8 w-full rounded-md" />}

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="space-y-1">
        {projects.map(project => (
          <div
            key={project.id}
            className={`relative flex items-center justify-between text-sm text-white pr-2 pl-2 py-1 rounded hover:bg-muted cursor-pointer ${selectedProject === project.id ? 'bg-muted' : ''}`}
          >
            <div
              className="truncate flex-1"
              onClick={() => handleSelectProject(project.id)}
            >
              {project.name}
            </div>
            
            <DropdownMenu modal={true}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 ml-2 opacity-0 group-hover:opacity-100 hover:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontalIcon className="size-4" />
                  <span className="sr-only">Project options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => handleRenameProject(project)}
                >
                  <PencilIcon className="size-4 mr-2" />
                  <span>Rename</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:bg-destructive/15 focus:text-destructive"
                  onClick={() => handleDeleteProject(project)}
                >
                  <TrashIcon className="size-4 mr-2" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>

      {/* Project Creation Modal */}
      <CreateProjectModal open={showCreateProjectModal} onClose={handleCloseCreateProjectModal} />
      
      {/* Project Rename Modal */}
      <Dialog open={showRenameProjectModal} onOpenChange={setShowRenameProjectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Project</DialogTitle>
            <DialogDescription>
              Enter a new name for the project.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="project-name" className="text-right">
                Project Name
              </label>
              <Input
                id="project-name"
                className="col-span-3"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setShowRenameProjectModal(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleSubmitRename}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Project Delete Confirmation */}
      <AlertDialog open={showDeleteProjectModal} onOpenChange={setShowDeleteProjectModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the project "{projectToDelete?.name}". 
              Chats in this project will be preserved but will no longer be associated with any project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={handleConfirmDelete}
            >
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
