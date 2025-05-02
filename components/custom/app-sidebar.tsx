'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { PlusIcon } from '@radix-ui/react-icons';
import { GeistLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { ProjectDropdown } from '@/components/custom/project-dropdown';
import { CreateProjectModal } from '@/components/custom/createprojectmodal';
import { SidebarProjects } from '@/components/custom/sidebar-projects';
import { ChatHistory } from '@/components/custom/chat-history';

export const AppSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  useEffect(() => {
    // Reset selected project when navigating outside of a project
    if (!pathname.startsWith('/projects/')) {
      setSelectedProjectId(null);
    }
  }, [pathname]);

  return (
    <>
      <aside className="fixed top-0 z-50 flex flex-col md:flex-row md:static">
        <div
          className={`fixed md:static flex flex-col gap-2 w-[52px] md:w-[260px] h-full bg-popover border-r border-border px-2 pb-4 ${
            openMobile ? 'block' : 'hidden md:block'
          }`}
        >
          <div className="py-4 md:px-3">
            <GeistLogo />
          </div>
          <Separator />
          <div className="flex-1">
            <ScrollArea>
              <SidebarMenu
                setOpenMobile={setOpenMobile}
                selectedProjectId={selectedProjectId}
              />
              <Separator className="my-4" />
              <SidebarProjects
                setSelectedProjectId={setSelectedProjectId}
                setOpen={setOpen}
              />
            </ScrollArea>
          </div>
        </div>
      </aside>
      <CreateProjectModal open={open} onClose={() => setOpen(false)} />
    </>
  );
};

const SidebarMenu = ({
  setOpenMobile,
  selectedProjectId,
}: {
  setOpenMobile: (open: boolean) => void;
  selectedProjectId: string | null;
}) => {
  const router = useRouter();

  return (
    <div className="flex flex-col space-y-1">
      <Button
        variant="ghost"
        className="p-2 h-fit"
        onClick={() => {
          setOpenMobile(false);
          console.log('New chat clicked. selectedProjectId:', selectedProjectId); //  ✅  Added log
          router.push(`/?projectId=${selectedProjectId}`); //  ✅  Pass as URL parameter
          router.refresh();
        }}
      >
        <PlusIcon />
      </Button>
      <ProjectDropdown selectedProjectId={selectedProjectId} />
      <ChatHistory selectedProjectId={selectedProjectId} />
    </div>
  );
};
