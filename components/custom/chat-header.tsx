'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useWindowSize } from 'usehooks-ts';

import { updateChatProjectId } from '@/app/(chat)/actions';
import { CheckIcon, FolderIcon, LoaderIcon, MoreHorizontalIcon, PlusIcon, VercelIcon } from '@/components/custom/icons';
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

export function ChatHeader({ selectedModelId }: { selectedModelId: string }) {
  const router = useRouter();
  const { open } = useSidebar();
  const { width: windowWidth } = useWindowSize();
  const params = useParams();
  const chatId = params?.id as string | undefined;
  
  // State for UI controls
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // State for data
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [fetchAttempted, setFetchAttempted] = useState(false);
  
  // First get the current user ID
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = createClient();
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          console.error('Error fetching user:', error);
          return;
        }
        
        console.log('User fetched:', user.id);
        setUserId(user.id);
      } catch (error) {
        console.error('Error in fetchUser:', error);
      }
    };
    
    fetchUser();
  }, []);
  
  // Then get the current project ID for the chat
  useEffect(() => {
    if (!chatId) return;
    
    const fetchChatProject = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('chats')
          .select('*')
          .eq('id', chatId)
          .single();
          
        if (error) {
          console.error('Error fetching chat:', error);
          return;
        }
        
        const chat = data as Chat;
        console.log('Chat project_id:', chat?.project_id);
        setCurrentProjectId(chat?.project_id || null);
      } catch (error) {
        console.error('Error in fetchChatProject:', error);
      }
    };
    
    fetchChatProject();
  }, [chatId]);
  
  // Function to load projects - with robust error handling and logging
  const loadProjects = async () => {
    if (!userId) {
      console.error('No userId available for loading projects');
      return;
    }
    
    // Skip if we already have projects or have attempted to fetch
    if (fetchAttempted && projects.length > 0) return;
    
    setIsLoadingProjects(true);
    setFetchAttempted(true);
    
    try {
      const supabase = createClient();
      
      console.log('Loading projects for user:', userId);
      
      // Get all projects first
      const { data: allProjects, error: allError } = await supabase
        .from('projects')
        .select('*');
        
      if (allError) {
        console.error('Error loading all projects:', allError);
        return;
      }
      
      console.log('All projects (before filtering):', allProjects);
      
      // Filter client-side as a fallback approach
      const userProjects = allProjects?.filter(p => p.user_id === userId) || [];
      
      console.log('User projects after filtering:', userProjects);
      
      setProjects(userProjects);
    } catch (error) {
      console.error('Error in loadProjects:', error);
      toast.error('Failed to load projects');
    } finally {
      setIsLoadingProjects(false);
    }
  };

  // Function to handle moving chat to a project
  const handleMoveToProject = async (projectId: string | null) => {
    if (!chatId) return;
    
    try {
      console.log('Moving chat to project:', projectId);
      
      // Call the server action to update the chat's project
      await updateChatProjectId(chatId, projectId);
      
      toast.success(
        projectId 
          ? 'Chat moved to project' 
          : 'Chat removed from project'
      );
      
      // Update local state
      setCurrentProjectId(projectId);
      
      // Reset the UI state
      setShowProjectSelector(false);
      setIsDropdownOpen(false);
      
      // Refresh the page to update the UI
      router.refresh();
    } catch (error) {
      console.error('Error moving chat to project:', error);
      toast.error('Failed to move chat');
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

      {/* Chat options dropdown */}
      <BetterTooltip content="Chat Options">
        <DropdownMenu 
          open={isDropdownOpen}
          onOpenChange={(open) => {
            setIsDropdownOpen(open);
            if (open && chatId && userId) {
              // Load projects when the dropdown is opened
              loadProjects();
            } else if (!open) {
              // Only reset project selector when dropdown is closed
              setShowProjectSelector(false);
            }
          }}
        >
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="order-3 md:order-2 md:px-2 px-2 md:h-fit"
            >
              <MoreHorizontalIcon />
              <span className="md:sr-only">Options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!showProjectSelector ? (
              <DropdownMenuItem 
                className="cursor-pointer"
                onSelect={(e) => {
                  e.preventDefault(); // Prevent dropdown from closing
                  console.log('Move to project clicked');
                  setShowProjectSelector(true);
                }}
              >
                <FolderIcon className="size-4 mr-2" />
                <span>Move to project</span>
              </DropdownMenuItem>
            ) : (
              <>
                <DropdownMenuLabel>Select a project</DropdownMenuLabel>
                {isLoadingProjects ? (
                  <DropdownMenuItem disabled>
                    <LoaderIcon className="size-4 animate-spin mr-2" />
                    <span>Loading projects...</span>
                  </DropdownMenuItem>
                ) : (
                  <>
                    <DropdownMenuItem 
                      onSelect={(e) => {
                        e.preventDefault(); // Prevent dropdown from closing
                        handleMoveToProject(null);
                      }}
                      className="cursor-pointer"
                    >
                      <span>Remove from project</span>
                      {currentProjectId === null && (
                        <CheckIcon className="ml-auto size-4" />
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {projects.length === 0 ? (
                      <DropdownMenuItem disabled>
                        <span>No projects found (UserId: {userId?.slice(0, 5)}...)</span>
                      </DropdownMenuItem>
                    ) : (
                      projects.map((project) => (
                        <DropdownMenuItem
                          key={project.id}
                          onSelect={(e) => {
                            e.preventDefault(); // Prevent dropdown from closing
                            handleMoveToProject(project.id);
                          }}
                          className="cursor-pointer"
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
                        e.preventDefault(); // Prevent dropdown from closing
                        setShowProjectSelector(false);
                      }}
                      className="cursor-pointer"
                    >
                      <span>Back</span>
                    </DropdownMenuItem>
                  </>
                )}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </BetterTooltip>

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
