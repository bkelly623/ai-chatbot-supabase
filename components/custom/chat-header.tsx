"use client"

import { useRouter } from "next/navigation"
import { ChatShareDialog } from "@/components/chat-share-dialog"
import { Button } from "@/components/ui/button"
import { Chat } from "@/lib/types"
import { useState } from "react"
import { DotsHorizontalIcon, PlusIcon } from "@radix-ui/react-icons"
import { updateChatProject } from "@/app/actions/update-chat-project"
import { useUserProjects } from "@/lib/hooks/use-user-projects"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"

interface ChatHeaderProps {
  chat: Chat
}

export function ChatHeader({ chat }: ChatHeaderProps) {
  const router = useRouter()
  const { projects } = useUserProjects()
  const [showProjects, setShowProjects] = useState(false)

  const moveToProject = async (projectId: string) => {
    await updateChatProject(chat.id, projectId)
    router.refresh()
  }

  return (
    <div className="flex items-center justify-between border-b px-4 py-2">
      <Button
        variant="ghost"
        size="sm"
        className="gap-1 text-sm text-muted-foreground"
        onClick={() => router.push("/")}
      >
        <PlusIcon className="h-4 w-4" />
        New Chat
      </Button>

      <div className="flex items-center space-x-2">
        <ChatShareDialog chat={chat} />

        <Popover open={showProjects} onOpenChange={setShowProjects}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon">
              <DotsHorizontalIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-52 p-0">
            {!showProjects ? (
              <div className="text-sm font-medium text-center py-2 border-b">
                Chat Options
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left px-2 py-1.5 text-sm"
                  onClick={() => setShowProjects(true)}
                >
                  Move to Project
                </Button>
              </div>
            ) : (
              <Command>
                <CommandInput placeholder="Search projects..." />
                <CommandEmpty>No projects found.</CommandEmpty>
                <CommandGroup>
                  {projects.map((project) => (
                    <CommandItem
                      key={project.id}
                      value={project.name}
                      onSelect={() => {
                        setShowProjects(false)
                        moveToProject(project.id)
                      }}
                    >
                      {project.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
