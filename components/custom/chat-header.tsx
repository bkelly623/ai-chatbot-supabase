"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMediaQuery } from "usehooks-ts";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Command, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { EllipsisVertical } from "lucide-react";
import { moveChatToProject } from "@/app/actions/project-actions";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

interface ChatHeaderProps {
  chatId?: string;
  isDisabled?: boolean;
}

export function ChatHeader({ chatId, isDisabled }: ChatHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      const supabase = createClient();
      const { data } = await supabase.from("projects").select("id, name");
      setProjects(data || []);
    };
    fetchProjects();
  }, []);

  const handleMoveToProject = async (projectId: string) => {
    if (!chatId) return;
    setLoading(true);
    try {
      const result = await moveChatToProject(chatId, projectId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Chat moved to project");
        router.refresh();
      }
    } catch (error) {
      toast.error("Failed to move chat.");
      console.error(error);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const shouldHideToggle =
    !chatId || pathname === "/" || pathname === "/chat/new";

  if (shouldHideToggle) return null;

  return (
    <div className="ml-2 flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "h-8 w-8 p-0",
              isDisabled || loading ? "opacity-50 cursor-not-allowed" : ""
            )}
            disabled={isDisabled || loading}
            aria-label="Chat menu"
          >
            <EllipsisVertical className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                Move to Project
              </DropdownMenuItem>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0" align="end">
              <Command>
                <CommandInput placeholder="Select a project..." />
                <CommandList>
                  {projects.map((project) => (
                    <CommandItem
                      key={project.id}
                      onSelect={() => handleMoveToProject(project.id)}
                    >
                      {project.name}
                    </CommandItem>
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
