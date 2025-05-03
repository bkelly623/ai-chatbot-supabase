'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ChatShareButton } from '../chat/chat-share-button'
import { ChatShareModal } from '../chat/chat-share-modal'
import { IconNewChat } from '../ui/icons'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'
import { useSidebar } from '../sidebar/use-sidebar'
import { SidebarToggle } from '../sidebar/sidebar-toggle'
import { ChatHeaderDropdown } from './chat-header-dropdown'
import { useChatStore } from '../../lib/stores/chat-store'
import { type Project } from '../../types/project'
import { getUserProjects } from '../../lib/queries'

interface ChatHeaderProps {
  chatId?: string
  projectId?: string
  title?: string
}

export function ChatHeader({ chatId, projectId, title }: ChatHeaderProps) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)
  const { isSidebarOpen } = useSidebar()
  const router = useRouter()
  const pathname = usePathname()
  const setSelectedChatId = useChatStore((s) => s.setSelectedChatId)

  useEffect(() => {
    async function fetchProjects() {
      try {
        const data = await getUserProjects()
        setProjects(data)
      } catch (err) {
        console.error('Failed to load projects', err)
      } finally {
        setIsLoadingProjects(false)
      }
    }

    fetchProjects()
  }, [])

  const handleNewChat = () => {
    router.push('/chat/new')
    setSelectedChatId(null)
  }

  return (
    <>
      <div className="flex items-center justify-between h-14 px-4 border-b shrink-0">
        <div className="flex items-center gap-1">
          {!isSidebarOpen && <SidebarToggle />}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNewChat}
            className="text-muted-foreground"
          >
            <IconNewChat className="h-5 w-5" />
            <span className="sr-only">New Chat</span>
          </Button>
        </div>

        <div className="flex items-center space-x-1">
          {chatId && (
            <ChatHeaderDropdown
              chatId={chatId}
              currentProjectId={projectId}
              availableProjects={projects}
              isLoading={isLoadingProjects}
            />
          )}
          <ChatShareButton onClick={() => setShareDialogOpen(true)} />
        </div>
      </div>

      <ChatShareModal
        chatId={chatId}
        title={title}
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
      />
    </>
  )
}
