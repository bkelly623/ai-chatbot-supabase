'use client';

import { User } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';
import React, { useEffect, useState, useCallback } from 'react';

import CreateProjectModal from '@/components/custom/createprojectmodal';
import { BotIcon, PlusIcon } from '@/components/custom/icons';
import { SidebarHistory } from '@/components/custom/sidebar-history';
import SidebarProjects, { SidebarProjectsProps } from '@/components/custom/sidebar-projects';
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
    const pathname = usePathname();

    // Function to safely convert User | null to User | undefined
    const getSafeUser = (): User | undefined => {
        return user === null ? undefined : user;
    };

    const safeUser = getSafeUser();

    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

    const handleNewChat = useCallback(() => {
        setOpenMobile(false);
        let newChatUrl = '/';
        if (selectedProjectId) {
            newChatUrl += `?projectId=${selectedProjectId}`;
        }
        router.push(newChatUrl);
        router.refresh();
    }, [router, setOpenMobile, selectedProjectId]);

    useEffect(() => {
        // Reset selected project when navigating outside of a project
        if (!pathname.startsWith('/projects/')) {
            setSelectedProjectId(null);
        }
    }, [pathname]);

    return (
        <Sidebar className="group-data-[side=left]:border-r-0">
            <SidebarHeader>
                <SidebarMenu>
                    <div className="flex flex-row justify-between items-center">
                        <div
                            onClick={() => {
                                setOpenMobile(false);
                                router.push('/');
                                router.refresh();
                            }}
                            className="flex flex-row gap-3 items-center"
                        >
                            <BotIcon className="size-6" />
                            <span className="text-lg font-semibold px-2 hover:bg-muted rounded-md cursor-pointer">
                                Chatbot
                            </span>
                        </div>
                        <BetterTooltip content="New Chat" align="start">
                            <Button
                                variant="ghost"
                                className="p-2 h-fit"
                                onClick={handleNewChat}
                            >
                                <PlusIcon />
                            </Button>
                        </BetterTooltip>
                    </div>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarProjects
                            user={safeUser}
                            {...({ setSelectedProjectId } as any)}
                        />
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarHistory user={safeUser} />
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="gap-0">
                {user && (
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarUserNav user={user} />
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarFooter>
        </Sidebar>
    );
}
