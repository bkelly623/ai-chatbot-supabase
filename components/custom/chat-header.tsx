'use client'

import { Chat } from '@/types'
import { Button } from '@/components/ui/button'
import { MoreVertical, PlusCircle } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from '@/components/ui/command'
import { moveChatToProject } from '@/app/actions/user-projects'
import { useSidebar } from '@/components/sidebar/use-sidebar'
import { SidebarToggle } from '@/components/sidebar/sidebar-toggle'

interface ChatHeaderProps {
  chat: Chat
  projects: { id: string; name: string }[]
}

export function ChatHeader({ chat, projects }: ChatHeaderProps) {
  const [open, setOpen] = useState(false)
  const [selectingProject, setSelectingProject] = useState(false)
  const router = useRouter()

  const handleSelectProject = async (projectId: string) => {
    await moveChatToProject(chat.id, projectId)
    setOpen(false)
    setSelectingProject(false)
    router.refresh()
  }

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center space-x-2">
        <SidebarToggle />
        <Button variant="ghost" onClick={() => router.push('/')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-64 p-0" align="end">
          {selectingProject ? (
            <Command>
              <CommandInput placeholder="Select project..." />
              <CommandEmpty>No projects found.</CommandEmpty>
              <CommandGroup>
                {projects.map(project => (
                  <CommandItem
                    key={project.id}
                    value={project.name}
                    onSelect={() => handleSelectProject(project.id)}
                  >
                    {project.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          ) : (
            <Command>
              <CommandGroup>
                <CommandItem onSelect={() => setSelectingProject(true)}>
                  Move to Project
                </CommandItem>
              </CommandGroup>
            </Command>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
