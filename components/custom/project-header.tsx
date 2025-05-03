'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { 
  BetterTooltip,
} from '@/components/ui/tooltip';
import { 
  PlusIcon,
  FolderIcon,
} from '@/components/custom/icons';
import { Database } from '@/lib/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectHeaderProps {
  project: Project;
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const router = useRouter();

  // Function to create a new chat in this project
  const handleCreateNewChat = () => {
    // Navigate to new chat page with project query param
    // The chat creation logic will read this param to associate with project
    router.push(`/?project=${project.id}`);
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
            <span>New Chat</span>
          </Button>
        </BetterTooltip>
        
        <Button variant="outline" size="sm" asChild>
          <Link href="/">Back to Chats</Link>
        </Button>
      </div>
    </header>
  );
}
