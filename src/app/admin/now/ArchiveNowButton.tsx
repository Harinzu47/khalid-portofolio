'use client';

import { useTransition } from 'react';
import { archiveNowEntryAction } from '@/actions/now';
import { Archive, Loader2 } from 'lucide-react';

interface ArchiveNowButtonProps {
  id: string;
  title: string;
}

export function ArchiveNowButton({ id, title }: ArchiveNowButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleArchive = () => {
    if (confirm(`Archive "${title}"? It will be soft-archived and preserved in historical records.`)) {
      startTransition(async () => {
        const res = await archiveNowEntryAction(id);
        if (!res.success) {
          alert(res.error || 'Failed to archive entry.');
        }
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleArchive}
      disabled={isPending}
      title="Archive entry"
      className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-950/30 rounded-md transition-colors"
    >
      {isPending ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Archive className="w-3.5 h-3.5" />
      )}
    </button>
  );
}
