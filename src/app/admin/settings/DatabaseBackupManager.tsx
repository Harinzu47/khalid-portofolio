'use client';

import React, { useState, useTransition } from 'react';
import { exportDatabaseBackupAction } from '@/actions/settings';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Database, Download, Loader2, ShieldCheck } from 'lucide-react';

export function DatabaseBackupManager() {
  const [isExporting, startExport] = useTransition();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleExportBackup = () => {
    setStatusMessage(null);
    setErrorMessage(null);

    startExport(async () => {
      const res = await exportDatabaseBackupAction();
      if (res.success && res.data) {
        const jsonStr =
          'data:text/json;charset=utf-8,' +
          encodeURIComponent(JSON.stringify(res.data, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', jsonStr);
        downloadAnchor.setAttribute(
          'download',
          `developer-os-backup-${new Date().toISOString().split('T')[0]}.json`
        );
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();

        setStatusMessage('Complete system backup successfully generated and downloaded.');
      } else {
        setErrorMessage(res.error || 'Failed to export backup.');
      }
    });
  };

  return (
    <div className="p-6 rounded-lg border border-terminal-border bg-terminal-surface space-y-4 font-mono">
      <h2 className="text-xs font-bold text-terminal-text-primary uppercase tracking-wider flex items-center space-x-2">
        <Database className="w-4 h-4 text-terminal-warning" />
        <span>Data Portability & Disaster Recovery</span>
      </h2>

      <p className="text-xs text-terminal-text-secondary leading-relaxed">
        Export a full snapshot of your Developer OS database (all 25 relational tables including articles, journal logs, projects, credentials, and taxonomies) as an immutable JSON archive.
      </p>

      {statusMessage && (
        <div className="p-3 rounded bg-terminal-primary/10 border border-terminal-primary/40 text-terminal-primary text-xs flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <Alert variant="destructive" title="Backup Failed">
          {errorMessage}
        </Alert>
      )}

      <div className="pt-2 flex items-center justify-between">
        <span className="text-[11px] text-terminal-text-muted">
          Format: JSON Document • Schema Version 2.0.0
        </span>
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={handleExportBackup}
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
              <span>Generating Snapshot...</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5 mr-1.5" />
              <span>Export Full Database JSON</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
