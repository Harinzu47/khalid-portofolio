'use client';

import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { Sheet } from '@/components/ui/Sheet';

export interface AdminShellProps {
  userEmail: string;
  children: React.ReactNode;
}

export function AdminShell({ userEmail, children }: AdminShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-terminal-bg text-terminal-text-primary overflow-hidden">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:flex md:shrink-0">
        <AdminSidebar />
      </div>

      {/* Mobile Drawer Navigation */}
      <Sheet
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        side="left"
        className="p-0 max-w-[260px]"
      >
        <AdminSidebar onItemClick={() => setMobileNavOpen(false)} />
      </Sheet>

      {/* Main Workspace Column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AdminHeader
          userEmail={userEmail}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-terminal-bg">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
