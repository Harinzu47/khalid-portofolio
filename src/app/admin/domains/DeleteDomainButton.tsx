'use client';

import React, { useTransition } from 'react';
import { deleteDomainAction } from '@/actions/taxonomy';
import { Trash2, Loader2 } from 'lucide-react';

export function DeleteDomainButton({
  domainId,
  domainName,
}: {
  domainId: string;
  domainName: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!window.confirm(`Are you sure you want to delete domain "${domainName}"?`)) {
      return;
    }

    startTransition(async () => {
      await deleteDomainAction(domainId);
    });
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="p-1.5 rounded text-terminal-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
      title="Delete Domain"
    >
      {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
  );
}
