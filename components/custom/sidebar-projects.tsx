'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

import {
  FolderIcon,
  PlusIcon,
  MoreHorizontalIcon,
} from '@/components/custom/icons';
import { BetterTooltip } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const FormSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
});

export function SidebarProjects({ projects = [] }) {
  const [newProject, setNewProject] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get projectId from search params
  useEffect(() => {
    const projectId = searchParams.get('projectId');
    if (projectId) {
      setSelectedProjectId(projectId);
    }
  }, [searchParams]);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
    },
  });

  const handleSelectProject = useCallback((projectId: string) => {
    setSelectedProjectId(projectId);
    router.push(`/projects/${projectId}`);
  }, [router]);

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
      // Create project
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      const project = await response.json();
      toast.success('Project created successfully');
      setNewProject(false);
      form.reset();
      
      // Navigate to the new project
      router.push(`/projects/${project.id}`);
      router.refresh();
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    }
  };

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-2 px-4">
        <div className="flex items-center gap-2">
          <FolderIcon className="w-4 h-4" />
          <h2 className="font-semibold">Projects</h2>
        </div>

        <BetterTooltip content="Create new project">
          <Button
            onClick={() => setNewProject(true)}
            variant="ghost"
            size="icon"
            className="h-7 w-7"
          >
            <PlusIcon className="h-4 w-4" />
            <span className="sr-only">Create new project</span>
          </Button>
        </BetterTooltip>
      </div>

      <Separator className="mb-2" />

      <div className="space-y-1 px-2">
        {projects.map((project) => (
          <div
            key={project.id}
            className={`text-sm text-white truncate px-2 py-1 rounded hover:bg-muted cursor-pointer flex items-center gap-2 ${
              selectedProjectId === project.id ? 'bg-muted' : ''
            }`}
            onClick={() => handleSelectProject(project.id)}
          >
            <FolderIcon className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{project.name}</span>
            
            <div className="flex-1" />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 ml-auto opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <MoreHorizontalIcon className="h-4 w-4" />
                  <span className="sr-only">Project options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle rename (to be implemented)
                    toast.info('Rename feature coming soon');
                  }}
                >
                  Rename
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle delete (to be implemented)
                    toast.info('Delete feature coming soon');
                  }}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}

        {projects.length === 0 && (
          <div className="px-2 py-1 text-sm text-muted-foreground">
            No projects yet
          </div>
        )}
      </div>

      {/* Create project dialog */}
      <Dialog open={newProject} onOpenChange={setNewProject}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create new project</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter project name..."
                        {...field}
                        autoFocus
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setNewProject(false);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Create</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
