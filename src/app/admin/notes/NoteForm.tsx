'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createNoteAction, updateNoteAction } from '@/actions/notes';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { NoteFormInput } from '@/validations/note';

export interface NoteFormProps {
  mode: 'create' | 'edit';
  noteId?: string;
  initialData?: {
    title?: string;
    slug?: string;
    content?: string;
    status?: 'draft' | 'review' | 'published' | 'archived';
  };
}

export function NoteForm({ mode, noteId, initialData }: NoteFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Form State
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [status, setStatus] = useState<NoteFormInput['status']>(initialData?.status || 'draft');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    const payload = {
      title,
      slug: slug || undefined,
      content,
      status,
    };

    startTransition(async () => {
      let result;
      if (mode === 'create') {
        result = await createNoteAction(payload);
      } else if (mode === 'edit' && noteId) {
        result = await updateNoteAction(noteId, payload);
      }

      if (result && !result.success) {
        setErrorMessage(result.error || 'Failed to save note.');
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/notes"
          className="inline-flex items-center space-x-1.5 text-xs font-mono text-terminal-text-muted hover:text-terminal-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Notes</span>
        </Link>

        <div className="flex items-center space-x-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/notes')}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                <span>Saving...</span>
              </>
            ) : (
              <span>{mode === 'create' ? 'Create Note' : 'Save Changes'}</span>
            )}
          </Button>
        </div>
      </div>

      {errorMessage && (
        <Alert variant="destructive" title="Validation Error">
          {errorMessage}
        </Alert>
      )}

      {/* Note Fields */}
      <div className="p-6 rounded-lg border border-terminal-border bg-terminal-surface space-y-4">
        <h2 className="text-xs font-mono font-bold text-terminal-text-primary uppercase tracking-wider">
          Technical Note & Snippet
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Note Title *"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={fieldErrors.title?.[0]}
            placeholder="e.g. Docker Compose Traefik SSL Config"
          />
          <Input
            label="URL Slug (leave empty for auto-generation)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            error={fieldErrors.slug?.[0]}
            placeholder="docker-compose-traefik-ssl-config"
          />
        </div>

        <Textarea
          label="Code Snippet / Markdown Notes *"
          rows={12}
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          error={fieldErrors.content?.[0]}
          placeholder="```yaml&#10;version: '3.8'&#10;...&#10;```"
        />

        <div className="max-w-xs">
          <Select
            label="Publication Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as NoteFormInput['status'])}
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'review', label: 'In Review' },
              { value: 'published', label: 'Published (Public)' },
              { value: 'archived', label: 'Archived' },
            ]}
          />
        </div>
      </div>
    </form>
  );
}
