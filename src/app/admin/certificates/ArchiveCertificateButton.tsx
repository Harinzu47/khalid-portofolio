'use client';

import { useTransition } from 'react';
import { archiveCertificateAction } from '@/actions/certificates';
import { Archive, Loader2 } from 'lucide-react';

interface ArchiveCertificateButtonProps {
  id: string;
  title: string;
}

export function ArchiveCertificateButton({ id, title }: ArchiveCertificateButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleArchive = () => {
    if (confirm(`Archive certificate "${title}"? It will be preserved in historical records.`)) {
      startTransition(async () => {
        const res = await archiveCertificateAction(id);
        if (!res.success) {
          alert(res.error || 'Failed to archive certificate.');
        }
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleArchive}
      disabled={isPending}
      title="Archive Certificate"
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
