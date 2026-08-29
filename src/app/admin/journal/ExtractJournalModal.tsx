'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  extractJournalToTechNoteAction,
  extractJournalToArticleAction,
  extractJournalToADRAction,
} from '@/actions/journal';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { FileText, StickyNote, Scale, Loader2, Sparkles } from 'lucide-react';
import type { KnowledgeExtractionTargetType } from '@/types/dtos';

export function ExtractJournalModal({
  isOpen,
  onClose,
  journalId,
  journalTitle,
}: {
  isOpen: boolean;
  onClose: () => void;
  journalId: string;
  journalTitle: string;
}) {
  const router = useRouter();
  const [targetType, setTargetType] = useState<KnowledgeExtractionTargetType>('TECH_NOTE');
  const [customTitle, setCustomTitle] = useState('');
  const [isExtracting, startExtract] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleExtract = () => {
    setErrorMessage(null);

    startExtract(async () => {
      let res;
      const overrides = customTitle.trim() ? { title: customTitle.trim() } : {};

      if (targetType === 'TECH_NOTE') {
        res = await extractJournalToTechNoteAction(journalId, overrides);
      } else if (targetType === 'ARTICLE') {
        res = await extractJournalToArticleAction(journalId, overrides);
      } else if (targetType === 'ADR') {
        res = await extractJournalToADRAction(journalId, overrides);
      }

      if (res && res.success && res.data) {
        onClose();
        const extracted = res.data;
        if (targetType === 'TECH_NOTE') {
          router.push(`/admin/notes/${extracted.targetId}/edit`);
        } else if (targetType === 'ARTICLE') {
          router.push(`/admin/articles/${extracted.targetId}/edit`);
        } else if (targetType === 'ADR') {
          router.push(`/admin/adrs/${extracted.targetId}/edit`);
        }
      } else {
        setErrorMessage(res?.error || 'Failed to extract journal entry.');
      }
    });
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Extract Journal to Knowledge Target" maxWidth="md">
      <div className="space-y-5 font-mono text-xs">
        <p className="text-terminal-text-secondary">
          Transform <strong className="text-terminal-text-primary">"{journalTitle}"</strong> into a structured knowledge artifact. An atomic <code className="text-terminal-secondary">DERIVED_INTO</code> provenance edge will link the source log to the new starting draft.
        </p>

        {errorMessage && (
          <Alert variant="destructive" title="Extraction Failed">
            {errorMessage}
          </Alert>
        )}

        {/* Target Selector Buttons */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-terminal-text-secondary">Target Knowledge Type</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setTargetType('TECH_NOTE')}
              className={`p-3 rounded-lg border text-left space-y-1 transition-all ${
                targetType === 'TECH_NOTE'
                  ? 'bg-terminal-primary/10 border-terminal-primary text-terminal-primary'
                  : 'bg-terminal-bg border-terminal-border text-terminal-text-muted hover:text-terminal-text-primary'
              }`}
            >
              <div className="flex items-center space-x-1.5 font-bold">
                <StickyNote className="w-4 h-4" />
                <span>Tech Note</span>
              </div>
              <p className="text-[10px] text-terminal-text-muted">
                Reusable technical recipe or reference.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setTargetType('ARTICLE')}
              className={`p-3 rounded-lg border text-left space-y-1 transition-all ${
                targetType === 'ARTICLE'
                  ? 'bg-terminal-secondary/10 border-terminal-secondary text-terminal-secondary'
                  : 'bg-terminal-bg border-terminal-border text-terminal-text-muted hover:text-terminal-text-primary'
              }`}
            >
              <div className="flex items-center space-x-1.5 font-bold">
                <FileText className="w-4 h-4" />
                <span>Article</span>
              </div>
              <p className="text-[10px] text-terminal-text-muted">
                Long-form explanatory engineering essay.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setTargetType('ADR')}
              className={`p-3 rounded-lg border text-left space-y-1 transition-all ${
                targetType === 'ADR'
                  ? 'bg-terminal-accent/10 border-terminal-accent text-terminal-accent'
                  : 'bg-terminal-bg border-terminal-border text-terminal-text-muted hover:text-terminal-text-primary'
              }`}
            >
              <div className="flex items-center space-x-1.5 font-bold">
                <Scale className="w-4 h-4" />
                <span>ADR</span>
              </div>
              <p className="text-[10px] text-terminal-text-muted">
                Architectural decision record candidate.
              </p>
            </button>
          </div>
        </div>

        <Input
          label="Target Title (Optional override)"
          placeholder={`Leave empty to auto-title from "${journalTitle}"`}
          value={customTitle}
          onChange={(e) => setCustomTitle(e.target.value)}
        />

        <div className="p-3 rounded bg-terminal-bg border border-terminal-border space-y-1 text-[11px] text-terminal-text-muted">
          <div className="flex items-center space-x-1 text-terminal-primary font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Safety & Provenance Guarantees</span>
          </div>
          <p>
            • The target artifact is created as <strong>PRIVATE + DRAFT</strong>.<br />
            • The source journal entry remains completely untouched.<br />
            • If provenance linkage fails, creation rolls back automatically.
          </p>
        </div>

        <div className="flex justify-end space-x-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isExtracting}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleExtract} disabled={isExtracting}>
            {isExtracting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                <span>Extracting...</span>
              </>
            ) : (
              <span>Extract to Draft</span>
            )}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
