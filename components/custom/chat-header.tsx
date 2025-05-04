"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateChatProjectId } from "@/app/actions";
import { ChatProjectSelector } from "./chat-project-selector";

interface ChatHeaderProps {
  chatId: string;
  isShareable?: boolean;
  projectId?: string | null;
}

export function ChatHeader({
  chatId,
  isShareable,
  projectId,
}: ChatHeaderProps) {
  const router = useRouter();
  const [showProjects, setShowProjects] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleProjectChange = async (newProjectId: string) => {
    await updateChatProjectId(chatId, newProjectId);
    router.refresh();
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b">
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push("/chat")}
        className="text-sm"
      >
        + New Chat
      </Button>

      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setMenuOpen(!menuOpen);
            setShowProjects(false);
          }}
        >
          <MoreHorizontal className="w-5 h-5" />
        </Button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow z-10">
            {!showProjects ? (
              <button
                onClick={() => setShowProjects(true)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Move to Project
              </button>
            ) : (
              <div className="px-2 py-2">
                <ChatProjectSelector
                  chatId={chatId}
                  currentProjectId={projectId}
                  onSelectProject={async (id) => {
                    await handleProjectChange(id);
                    setMenuOpen(false);
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
