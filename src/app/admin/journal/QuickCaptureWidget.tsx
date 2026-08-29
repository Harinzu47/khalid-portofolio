'use client';

import React, { useState, useTransition } from 'react';
import { quickCaptureJournalAction } from '@/actions/journal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { Zap, Loader2, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

export function QuickCaptureWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [workState, setWorkState] = useState('');
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const handleQuickCapture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setStatusMessage(null);
    const tags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    startTransition(async () => {
      const res = await quickCaptureJournalAction({
        title: title.trim() || undefined,
        content: content.trim(),
        workState: workState.trim() || undefined,
        tagNames: tags,
      });

      if (res && res.success) {
        setContent('');
        setTitle('');
        setTagInput('');
        setWorkState('');
        setStatusMessage({ type: 'success', text: 'Engineering log captured to private draft!' });
        setTimeout(() => setStatusMessage(null), 4000);
      } else {
        setStatusMessage({
          type: 'error',
          text: res?.error || 'Failed to capture engineering log.',
        });
      }
    });
  };

  return (
    <div className="p-4 rounded-lg border border-terminal-primary/30 bg-terminal-primary/5 space-y-3 font-mono">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-terminal-primary" />
          <span className="text-xs font-bold text-terminal-text-primary uppercase tracking-wider">
            Quick Log Capture (Private Draft)
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs text-terminal-text-muted hover:text-terminal-primary flex items-center space-x-1"
        >
          <span>{isOpen ? 'Compact' : 'Expand Options'}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {statusMessage && (
        <Alert
          variant={statusMessage.type === 'success' ? 'success' : 'destructive'}
          title={statusMessage.type === 'success' ? 'Saved' : 'Error'}
        >
          <div className="flex items-center space-x-1.5">
            {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-terminal-primary" />}
            <span>{statusMessage.text}</span>
          </div>
        </Alert>
      )}

      <form onSubmit={handleQuickCapture} className="space-y-3">
        {isOpen && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              placeholder="Optional title (e.g. Debugging Connection Pool Timeout)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Input
              placeholder="Work state (e.g. In Progress, Spike, Review)"
              value={workState}
              onChange={(e) => setWorkState(e.target.value)}
            />
          </div>
        )}

        <Textarea
          rows={isOpen ? 4 : 2}
          required
          placeholder="What did you build, debug, or decide today? (Type markdown and save rapidly...)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          {isOpen ? (
            <Input
              placeholder="Tags (comma-separated, e.g. postgres, bugfix, docker)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="sm:max-w-md"
            />
          ) : (
            <div className="text-[11px] text-terminal-text-muted">
              Auto-timestamped and saved to private draft.
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isPending || !content.trim()}
            className="self-end sm:self-auto"
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                <span>Capturing...</span>
              </>
            ) : (
              <span>Quick Capture</span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
