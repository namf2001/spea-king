import React from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { AppSidebar } from '@/components/layout/sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <SidebarProvider>
        <AppSidebar />
        <div className="flex-1">
          <ScrollArea className="flex h-full flex-col gap-4 px-4">
            {children}
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </SidebarProvider>
    </div>
  );
}
