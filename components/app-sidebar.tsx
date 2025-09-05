'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  Folder,
} from 'lucide-react';
import Link from 'next/link';

import { NavMain } from '@/components/nav-main';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';

const data = {
  navMain: [
    {
      title: 'Projects',
      url: '/projects',
      icon: Folder,
    },
  ],
};


export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <div className="flex items-center justify-center">
          <Link href="/">
            <Image
              src="/logo.svg"
              alt="Bug0"
              width={24}
              height={24}
              className=""
            />
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar >
  );
}
