'use client';

import { Home as HomeIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { FolderIcon, PlusIcon } from '@/components/custom/icons';
import { Button } from '@/components/ui/button';
import { BetterTooltip } from '@/components/ui/tooltip';
import { Database } from '@/lib/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectHeaderProps {
  project: Project;
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const router = useRouter();

  // Function to create a new chat in this project
  const handleCreateNewChat = () => {
    // Navigate to home page with project query param
    // We're using projectId parameter to match your existing code
    router.push(`/?projectId=${project.id}`);
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-background border-b">
      <div className="flex items-center gap-2">
        <FolderIcon className="size-5" />
        <h1 className="text-xl font-semibold truncate">{project.name}</h1>
      </div>
      
      <div className="flex items-center gap-2">
        <BetterTooltip content="New chat in this project">
          <Button
            onClick={handleCreateNewChat}
            size="sm"
            className="flex items-center gap-1"
          >
            <PlusIcon className="size-4" />
            <span className="hidden sm:inline">New Chat</span>
          </Button>
        </BetterTooltip>
        
        <BetterTooltip content="Back to home">
          <Button variant="outline" size="icon" asChild>
            <Link href="/">
              <HomeIcon className="size-4" />
              <span className="sr-only">Home</span>
            </Link>
          </Button>
        </BetterTooltip>
      </div>
    </header>
  );
}
