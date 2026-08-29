'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Archive, Loader2 } from 'lucide-react';
import { archiveRelationshipAction } from '@/actions/relationships';

interface ArchiveRelationshipButtonProps {
  relationshipId: string;
  relationshipTypeCode: string;
  isProvenance?: boolean;
  onSuccess?: () => void;
}

export function ArchiveRelationshipButton({
  relationshipId,
  relationshipTypeCode,
  isProvenance = false,
  onSuccess,
}: ArchiveRelationshipButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleArchive = () => {
    setError(null);
    startTransition(async () => {
      const res = await archiveRelationshipAction(relationshipId);
      if (res.success) {
        setConfirmOpen(false);
        onSuccess?.();
        router.refresh();
      } else {
        setError(res.error || 'Failed to archive relationship.');
      }
    });
  };

  if (!confirmOpen) {
    return (
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        className="text-terminal-text-muted hover:text-terminal-error transition-colors p-1.5 rounded hover:bg-terminal-error/10 text-xs flex items-center gap-1"
        title={isProvenance ? 'Archive provenance edge' : 'Archive relationship'}
      >
        <Archive className="w-3.5 h-3.5" />
        <span className="sr-only">Archive</span>
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 bg-terminal-surface-card border border-terminal-error/30 rounded px-2 py-1 text-xs">
      {error && <span className="text-terminal-error text-[10px]">{error}</span>}
      <span className="text-terminal-text-muted text-[11px]">
        {isProvenance ? 'Archive provenance?' : 'Archive edge?'}
      </span>
      <button
        type="button"
        onClick={handleArchive}
        disabled={isPending}
        className="text-terminal-error hover:underline font-mono text-xs flex items-center gap-1 disabled:opacity-50"
      >
        {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Yes'}
      </button>
      <button
        type="button"
        onClick={() => setConfirmOpen(false)}
        disabled={isPending}
        className="text-terminal-text-muted hover:text-terminal-text-primary text-xs"
      >
        Cancel
      </button>
    </div>
  );
}
