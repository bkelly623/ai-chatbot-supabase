'use client';

import { MoreHorizontalIcon, PencilIcon, TrashIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

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
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import CreateProjectModal from '@/components/custom/createprojectmodal';
import { createClient } from '@/lib/supabase/client';

import type { User } from '@supabase/supabase-js';

// Define Chat interface to match the one in sidebar-history.tsx
interface Chat {
  id: string;
  title: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  project_id?: string | null;
}

// Define Project interface
interface Project {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}

export interface SidebarProjectsProps {
  user?: User | undefined;
  setSelectedProjectId?: (id: string) => void;
}

export default function SidebarProjects(props: SidebarProjectsProps) {
  const { user, setSelectedProjectId } = props;
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState<boolean>(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [showRenameModal, setShowRenameModal] = useState<boolean>(false);
  const [newProjectName, setNewProjectName] = useState<string>('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  
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
    // Eventually, we will navigate to project page
    router.push(`/?projectId=${projectId}`);
  };

  const handleCloseCreateProjectModal = () => {
    setShowCreateProjectModal(false);
    fetchProjects(); // Refresh projects after creating
  };
  
  // Handle project deletion
  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      // First update any chats in this project to have null project_id
      // Using "as any" to bypass TypeScript's type checking for the update
      const { error: chatUpdateError } = await supabase
        .from('chats')
        .update({ project_id: null } as any)
        .eq('project_id', deleteId);
        
      if (chatUpdateError) throw chatUpdateError;
      
      // Then delete the project
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', deleteId);
        
      if (error) throw error;
      
      // Success feedback
      toast.success('Project deleted successfully');
      
      // Update local state
      setProjects(projects.filter(p => p.id !== deleteId));
      
      // If currently selected project was deleted, clear selection
      if (selectedProject === deleteId) {
        setSelectedProject(null);
        router.push('/');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    } finally {
      setShowDeleteDialog(false);
      setDeleteId(null);
    }
  };
  
  // Handle project rename
  const handleRename = async () => {
    if (!projectToEdit || !newProjectName.trim()) return;
    
    try {
      const { error } = await supabase
        .from('projects')
        .update({ name: newProjectName.trim() })
        .eq('id', projectToEdit.id);
        
      if (error) throw error;
      
      // Update local projects state
      setProjects(projects.map(p => 
        p.id === projectToEdit.id ? { ...p, name: newProjectName.trim() } : p
      ));
      
      toast.success('Project renamed successfully');
    } catch (error) {
      console.error('Error renaming project:', error);
      toast.error('Failed to rename project');
    } finally {
      setShowRenameModal(false);
      setProjectToEdit(null);
      setNewProjectName('');
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

      {loading && <div className="animate-pulse bg-muted/50 h-8 w-full rounded-md">
        {/* Placeholder while loading */}
      </div>}

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="space-y-1">
        {projects.map(project => (
          <div
            key={project.id}
            className="flex items-center justify-between text-sm text-white px-2 py-1 rounded hover:bg-muted group"
          >
            <div 
              onClick={() => handleSelectProject(project.id)}
              className={`truncate flex-1 cursor-pointer ${selectedProject === project.id ? 'font-medium' : ''}`}
            >
              {project.name}
            </div>
            
            <DropdownMenu modal={true}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="size-6 opacity-0 group-hover:opacity-100 focus:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontalIcon className="size-4" />
                  <span className="sr-only">Project options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={(e) => {
                    e.preventDefault();
                    setProjectToEdit(project);
                    setNewProjectName(project.name);
                    setShowRenameModal(true);
                  }}
                >
                  <PencilIcon className="size-4 mr-2" />
                  <span>Rename</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:bg-destructive/15 focus:text-destructive"
                  onSelect={(e) => {
                    e.preventDefault();
                    setDeleteId(project.id);
                    setShowDeleteDialog(true);
                  }}
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
      
      {/* Project Rename UI - using the same pattern as CreateProjectModal */}
      {showRenameModal && (
        <AlertDialog open={showRenameModal} onOpenChange={setShowRenameModal}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Rename Project</AlertDialogTitle>
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
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowRenameModal(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleRename}>
                Save Changes
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      
      {/* Project Delete Confirmation - using the exact same pattern as in sidebar-history */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              project and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={handleDelete}
            >
              Delete project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
