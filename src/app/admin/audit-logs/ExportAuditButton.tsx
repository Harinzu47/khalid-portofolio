'use client';

import React, { useTransition } from 'react';
import { exportAuditLogsAction } from '@/actions/analytics';
import { Download, Loader2 } from 'lucide-react';

export function ExportAuditButton() {
  const [isPending, startTransition] = useTransition();

  const handleExport = () => {
    startTransition(async () => {
      const res = await exportAuditLogsAction();
      if (res && res.success && res.data) {
        const dataStr =
          'data:text/json;charset=utf-8,' +
          encodeURIComponent(JSON.stringify(res.data, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute(
          'download',
          `audit-logs-${new Date().toISOString().split('T')[0]}.json`
        );
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isPending}
      className="inline-flex items-center space-x-1.5 px-3 py-2 rounded border border-terminal-border bg-terminal-surface text-terminal-text-primary font-mono text-xs hover:border-terminal-primary hover:text-terminal-primary transition-colors disabled:opacity-50"
    >
      {isPending ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Exporting...</span>
        </>
      ) : (
        <>
          <Download className="w-3.5 h-3.5" />
          <span>Export JSON</span>
        </>
      )}
    </button>
  );
}
