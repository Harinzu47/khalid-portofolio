'use client';

import { useTransition } from 'react';
import { completeNowEntryAction } from '@/actions/now';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface CompleteNowButtonProps {
  id: string;
  title: string;
}

export function CompleteNowButton({ id, title }: CompleteNowButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleComplete = () => {
    if (confirm(`Mark "${title}" as completed? This will update history and clear its current status.`)) {
      startTransition(async () => {
        const res = await completeNowEntryAction(id);
        if (!res.success) {
          alert(res.error || 'Failed to complete entry.');
        }
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleComplete}
      disabled={isPending}
      title="Complete entry"
      className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-950/30 rounded-md transition-colors"
    >
      {isPending ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <CheckCircle2 className="w-3.5 h-3.5" />
      )}
    </button>
  );
}
