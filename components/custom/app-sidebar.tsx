'use client';

import * as React from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { IconPlus } from '@/components/ui/icons';
import { Sidebar } from '@/components/layouts/sidebar';
import { SidebarContent } from '@/components/layouts/sidebar-content';
import { SidebarFooter } from '@/components/layouts/sidebar-footer';
import { SidebarGroup } from '@/components/layouts/sidebar-group';
import { SidebarHeader } from '@/components/layouts/sidebar-header';
import { SidebarList } from '@/components/layouts/sidebar-list';
import { SidebarToggle } from '@/components/layouts/sidebar-toggle';
import { SidebarUserNav } from '@/components/layouts/sidebar-user-nav';
import { SidebarHistory } from '@/components/custom/sidebar-history';
import SidebarProjects from '@/components/custom/sidebar-projects'; // ADDED

export interface AppSidebarProps {
  children?: React.ReactNode;
  className?: string;
}

export function AppSidebar({ className }: AppSidebarProps) {
  const user = useUser();

  return (
    <Sidebar className={cn('bg-muted/40', className)}>
      <SidebarToggle />

      <SidebarHeader>
        <h1 className="text-lg font-semibold tracking-tight">Chatbot</h1>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <IconPlus className="h-4 w-4" />
              <span className="sr-only">New Chat</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-4">
            New Chat
          </TooltipContent>
        </Tooltip>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarProjects /> {/* ADDED */}
        </SidebarGroup>
        <SidebarGroup>
          <SidebarHistory user={user ?? undefined} />
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarUserNav />
      </SidebarFooter>
    </Sidebar>
  );
}
