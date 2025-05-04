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

export function ChatHeader({ selectedModelId }: { selectedModelId: string }) {
  const router = useRouter();
  const { open } = useSidebar();
  const { width: windowWidth } = useWindowSize();
  const params = useParams();
  const chatId = params?.id as string | undefined;
  
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  
  // Get current project ID
  useEffect(() => {
    if (!chatId) return;
    
    const fetchChatProject = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('chats')
          .select('project_id')
          .eq('id', chatId)
          .single();
          
        if (error) throw error;
        setCurrentProjectId(data?.project_id || null);
      } catch (error) {
        console.error('Error fetching chat project:', error);
      }
    };
    
    fetchChatProject();
  }, [chatId]);
  
  // Function to load projects
  const loadProjects = async () => {
    if (projects.length > 0) return; // Only load once

    setIsLoadingProjects(true);
    try {
      const supabase = createClient();
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');
      
      // Get projects for the current user
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setIsLoadingProjects(false);
    }
  };

  // Function to handle moving chat to a project
  const handleMoveToProject = async (projectId: string | null) => {
    if (!chatId) return;
    
    try {
      // Call the server action to update the chat's project
      await updateChatProjectId(chatId, projectId);
      
      toast.success(
        projectId 
          ? 'Chat moved to project' 
          : 'Chat removed from project'
      );
      
      // Update local state
      setCurrentProjectId(projectId);
      
      // Refresh the page to update the UI
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

      {/* Only show Options button if we're in a chat (chatId exists) */}
      {chatId && (
        <BetterTooltip content="Chat Options">
          <DropdownMenu 
            open={isDropdownOpen}
            onOpenChange={(open) => {
              setIsDropdownOpen(open);
              if (open) {
                loadProjects();
              } else {
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
                  onClick={() => {
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
                        onClick={() => handleMoveToProject(null)}
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
                          <span>No projects found</span>
                        </DropdownMenuItem>
                      ) : (
                        projects.map((project) => (
                          <DropdownMenuItem
                            key={project.id}
                            onClick={() => handleMoveToProject(project.id)}
                            className="cursor-pointer"
                          >
                            <span>{project.name}</span>
                            {currentProjectId === project.id && (
                              <CheckIcon className="ml-auto size-4" />
                            )}
                          </DropdownMenuItem>
                        ))
                      )}
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setShowProjectSelector(false)}
                    className="cursor-pointer"
                  >
                    <span>Back</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </BetterTooltip>
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
