'use client';

import { useTransition } from 'react';
import { archiveRoadmapItemAction } from '@/actions/roadmap';
import { Archive, Loader2 } from 'lucide-react';

interface ArchiveRoadmapButtonProps {
  id: string;
  title: string;
}

export function ArchiveRoadmapButton({ id, title }: ArchiveRoadmapButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleArchive = () => {
    if (confirm(`Archive roadmap milestone "${title}"? It will be preserved in historical records.`)) {
      startTransition(async () => {
        const res = await archiveRoadmapItemAction(id);
        if (!res.success) {
          alert(res.error || 'Failed to archive roadmap milestone.');
        }
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleArchive}
      disabled={isPending}
      title="Archive Roadmap Item"
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
