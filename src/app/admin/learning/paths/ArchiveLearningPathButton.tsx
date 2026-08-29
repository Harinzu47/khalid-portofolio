'use client';

import { useTransition } from 'react';
import { archiveLearningPathAction } from '@/actions/learning-path';
import { Archive, Loader2 } from 'lucide-react';

interface ArchiveLearningPathButtonProps {
  id: string;
  title: string;
}

export function ArchiveLearningPathButton({ id, title }: ArchiveLearningPathButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleArchive = () => {
    if (confirm(`Archive learning path "${title}"? It will be preserved in historical records.`)) {
      startTransition(async () => {
        const res = await archiveLearningPathAction(id);
        if (!res.success) {
          alert(res.error || 'Failed to archive learning path.');
        }
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleArchive}
      disabled={isPending}
      title="Archive Learning Path"
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
