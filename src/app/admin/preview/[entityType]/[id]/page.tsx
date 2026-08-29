import React from 'react';
import { notFound } from 'next/navigation';
import { requireOwnerSession } from '@/lib/auth';
import { PreviewService } from '@/services/preview.service';
import {
  isPublishableEntityType,
  type PublishableEntityType,
} from '@/domain/publishing';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Preview | HZCODE Owner Preview',
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = 'force-dynamic';

interface PreviewPageProps {
  params: Promise<{
    entityType: string;
    id: string;
  }>;
}

export default async function AdminPreviewPage({ params }: PreviewPageProps) {
  const session = await requireOwnerSession();
  const resolvedParams = await params;
  const { entityType, id } = resolvedParams;

  if (!isPublishableEntityType(entityType)) {
    notFound();
  }

  let previewData;
  try {
    previewData = await PreviewService.resolveOwnerPreview(
      session.userId,
      entityType as PublishableEntityType,
      id
    );
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-16">
      {/* Preview Bar Banner */}
      <div className="sticky top-0 z-50 bg-amber-950/90 border-b border-amber-800/80 backdrop-blur px-4 py-2 flex items-center justify-between text-xs text-amber-200">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-semibold uppercase tracking-wider">Preview Mode</span>
          <span className="text-amber-300/80">| Private projection (noindex, nofollow)</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span>Status: <strong className="uppercase">{previewData.publicationStatus}</strong></span>
          <span>Visibility: <strong className="uppercase">{previewData.visibility}</strong></span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        <div className="border-b border-zinc-800 pb-6">
          <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">
            {previewData.entityType}
          </div>
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">
            {previewData.title}
          </h1>
          {previewData.slug && (
            <p className="text-xs font-mono text-zinc-500 mt-1">
              Slug: /{previewData.slug}
            </p>
          )}
        </div>

        {/* Content Projection Area */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 border-b border-zinc-800 pb-2">
            Rendered Payload Content
          </div>
          <pre className="text-xs font-mono text-zinc-300 whitespace-pre-wrap overflow-x-auto bg-zinc-950/80 p-4 rounded-lg border border-zinc-800/80">
            {JSON.stringify(previewData.rawContent, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
