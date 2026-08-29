import React from 'react';
import { requireOwnerSession } from '@/lib/auth';
import { PublishingService } from '@/services/publishing.service';
import { PublishingConsoleClient } from './PublishingConsoleClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Publishing Center | HZCODE Admin',
  description: 'Manage cross-entity editorial lifecycle, publication readiness, and scheduled releases.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function PublishingCenterPage() {
  const session = await requireOwnerSession();

  const [overview, items] = await Promise.all([
    PublishingService.getPublishingOverview(session.userId),
    PublishingService.listPublishingItems(session.userId),
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
          Publishing Center
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Operational control for editorial states, readiness gates, exposure scopes, and scheduled releases across the system.
        </p>
      </div>

      <PublishingConsoleClient
        initialOverview={overview}
        initialItems={items}
      />
    </div>
  );
}
