"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useMediaQuery } from "usehooks-ts";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { EllipsisVertical } from "lucide-react";
import { moveChatToProject } from "@/actions/move-chat-to-project";

interface ChatHeaderProps {
  chatId?: string;
  isDisabled?: boolean;
}

export function ChatHeader({ chatId, isDisabled }: ChatHeaderProps) {
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [loading, setLoading] = useState(false);

  const handleMoveToProject = async () => {
    if (!chatId) return;
    setLoading(true);
    try {
      await moveChatToProject(chatId);
      // You can add logic here if you want to update the UI
    } catch (error) {
      console.error("Failed to move chat to project:", error);
    } finally {
      setLoading(false);
    }
  };

  // Hide toggle on home screen or new chat creation screen
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
          <DropdownMenuItem onClick={handleMoveToProject}>
            Move to Project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
