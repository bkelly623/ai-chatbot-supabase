'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useWindowSize } from 'usehooks-ts';

import { updateChatProjectId } from '@/app/(chat)/actions';
import { 
  CheckIcon, 
  FolderIcon, 
  LoaderIcon, 
  MoreHorizontalIcon, 
  PlusIcon, 
  VercelIcon 
} from '@/components/custom/icons';
import { SidebarToggle } from '@/components/custom/sidebar-toggle';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BetterTooltip } from '@/components/ui/tooltip';
import { createClient } from '@/lib/supabase/client';
import { useSidebar } from '../ui/sidebar';

type Project = {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
};

// Define the expected chat data structure
interface ChatData {
  id: string;
  title: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  project_id: string | null;
}

export function ChatHeader({ selectedModelId }: { selectedModelId: string }) {
  const router = useRouter();
  const { open } = useSidebar();
  const { width: windowWidth } = useWindowSize();
  const params = useParams();
  const chatId = params?.id as string | undefined;
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentProjectName, setCurrentProjectName] = useState<string | null>(null);

  // Fetch current chat's project (if any)
  useEffect(() => {
    const fetchChatProject = async () => {
      if (!chatId) return;

      try {
        const supabase = createClient();
        // Add explicit type annotation to the query result
        const { data, error } = await supabase
          .from('chats')
          .select('id, title, user_id, created_at, updated_at, project_id')
          .eq('id', chatId)
          .single<ChatData>();

        if (error) throw error;
        
        // Now TypeScript knows data has project_id
        setCurrentProjectId(data?.project_id || null);

        // Fetch project name if there's a project_id
        if (data?.project_id) {
          const { data: projectData, error: projectError } = await supabase
            .from('projects')
            .select('name')
            .eq('id', data.project_id)
            .single();

          if (!projectError && projectData) {
            setCurrentProjectName(projectData.name);
          }
        }
      } catch (error) {
        console.error('Error fetching chat project:', error);
      }
    };

    fetchChatProject();
  }, [chatId]);

  // Load projects when needed
  const loadProjects = async () => {
    if (projects.length > 0) return; // Only load once

    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset project selector when dropdown is closed
  useEffect(() => {
    if (!isDropdownOpen) {
      setShowProjectSelector(false);
    }
  }, [isDropdownOpen]);

  // Handle moving chat to project
  const handleMoveToProject = async (projectId: string | null) => {
    if (!chatId) return;
    
    try {
      // Call the server action to update the chat's project
      await updateChatProjectId(chatId, projectId);
      
      // Update local state
      setCurrentProjectId(projectId);
      
      if (projectId) {
        const project = projects.find(p => p.id === projectId);
        setCurrentProjectName(project?.name || null);
        toast.success(`Chat moved to "${project?.name || 'project'}"`);
      } else {
        setCurrentProjectName(null);
        toast.success('Chat removed from project');
      }
      
      // Refresh the page to reflect changes
      router.refresh();
    } catch (error) {
      console.error('Error moving chat to project:', error);
      toast.error('Failed to move chat');
    } finally {
      setShowProjectSelector(false);
      setIsDropdownOpen(false);
    }
  };

  return (
    <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
      <SidebarToggle />
      {(!open || windowWidth < 768) && (
        <BetterTooltip content="New Chat">
          <Button
            variant="outline"
            className="order-2 md:order-1 md:px-2 px-2 md:h-fit ml-auto md:ml-0"
            onClick={() => {
              router.push('/');
              router.refresh();
            }}
          >
            <PlusIcon />
            <span className="md:sr-only">New Chat</span>
          </Button>
        </BetterTooltip>
      )}

      {/* Chat Options Menu - Only show when in a chat */}
      {chatId && (
        <DropdownMenu 
          open={isDropdownOpen} 
          onOpenChange={setIsDropdownOpen}
        >
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="size-8 order-3"
            >
              <MoreHorizontalIcon className="size-4" />
              <span className="sr-only">Chat options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!showProjectSelector ? (
              <>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    loadProjects();
                    setShowProjectSelector(true);
                  }}
                >
                  <FolderIcon className="size-4 mr-2" />
                  <span>Move to project</span>
                </DropdownMenuItem>
                {currentProjectId && (
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      handleMoveToProject(null);
                    }}
                  >
                    <FolderIcon className="size-4 mr-2 text-destructive" />
                    <span className="text-destructive">Remove from project</span>
                  </DropdownMenuItem>
                )}
              </>
            ) : (
              <>
                <DropdownMenuLabel>
                  Select a project
                </DropdownMenuLabel>
                {isLoading ? (
                  <DropdownMenuItem disabled>
                    <LoaderIcon className="size-4 animate-spin mr-2" />
                    <span>Loading projects...</span>
                  </DropdownMenuItem>
                ) : (
                  <>
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        handleMoveToProject(null);
                      }}
                    >
                      <span>Remove from project</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {projects.length === 0 ? (
                      <DropdownMenuItem disabled>
                        <span>No projects found</span>
                      </DropdownMenuItem>
                    ) : (
                      projects.map((project) => (
                        <DropdownMenuItem
                          key={project.id}
                          onSelect={(e) => {
                            e.preventDefault();
                            handleMoveToProject(project.id);
                          }}
                        >
                          <span>{project.name}</span>
                          {currentProjectId === project.id && (
                            <CheckIcon className="ml-auto size-4" />
                          )}
                        </DropdownMenuItem>
                      ))
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        setShowProjectSelector(false);
                      }}
                    >
                      <span>Cancel</span>
                    </DropdownMenuItem>
                  </>
                )}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <Button
        className="bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-zinc-50 dark:text-zinc-900 hidden md:flex py-1.5 px-2 h-fit md:h-[34px] order-4 md:ml-auto"
        asChild
      >
        <Link
          href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fai-chatbot&env=AUTH_SECRET,OPENAI_API_KEY&envDescription=Learn%20more%20about%20how%20to%20get%20the%20API%20Keys%20for%20the%20application&envLink=https%3A%2F%2Fgithub.com%2Fvercel%2Fai-chatbot%2Fblob%2Fmain%2F.env.example&demo-title=AI%20Chatbot&demo-description=An%20Open-Source%20AI%20Chatbot%20Template%20Built%20With%20Next.js%20and%20the%20AI%20SDK%20by%20Vercel.&demo-url=https%3A%2F%2Fchat.vercel.ai&stores=%5B%7B%22type%22:%22postgres%22%7D,%7B%22type%22:%22blob%22%7D%5D"
          target="_noblank"
        >
          <VercelIcon size={16} />
          Deploy with Vercel
        </Link>
      </Button>
    </header>
  );
}
