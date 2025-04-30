'use client';

import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

import SidebarProjects from '@/components/custom/sidebar-projects';
import { PlusIcon } from '@/components/custom/icons';
import { SidebarHistory } from '@/components/custom/sidebar-history';
import { SidebarUserNav } from '@/components/custom/sidebar-user-nav';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from '@/components/ui/sidebar';
import { BetterTooltip } from '@/components/ui/tooltip';

export function AppSidebar({ user }: { user: User | null }) {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar className="group-data-[side=left]:border-r-0">
      <SidebarHeader>
        <SidebarMenu>
          <div className="flex items-center gap-1.5">
            <Button
              size="icon"
              variant="outline"
              className="h-6 w-6 border-muted-foreground/20 text-muted-foreground hover:border-muted-foreground hover:text-white"
              onClick={() => {
                router.push('/');
                setOpenMobile(false);
              }}
            >
              <PlusIcon size={12} />
              <span className="sr-only">New chat</span>
            </Button>
            <BetterTooltip side="bottom" content={<span>New chat</span>}>
              <span className="text-xs text-muted-foreground">New chat</span>
            </BetterTooltip>
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarHistory user={user} />
            <SidebarProjects />
            <SidebarUserNav user={user} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
