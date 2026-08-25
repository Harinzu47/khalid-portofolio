'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createJournalAction, updateJournalAction } from '@/actions/journal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Plus, X, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { JournalFormInput } from '@/validations/journal';

export interface JournalFormProps {
  mode: 'create' | 'edit';
  journalId?: string;
  initialData?: {
    title?: string;
    slug?: string;
    entryDate?: string;
    content?: string;
    summary?: string | null;
    status?: 'draft' | 'review' | 'published' | 'archived';
    visibility?: 'private' | 'unlisted' | 'public';
    reflection?: string | null;
    published?: boolean;
    tagNames?: string[];
    projectIds?: string[];
    technologyIds?: string[];
  };
  availableProjects: { id: string; title: string }[];
  availableTechnologies: { id: string; name: string }[];
}

export function JournalForm({
  mode,
  journalId,
  initialData,
  availableProjects,
  availableTechnologies,
}: JournalFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Form State
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [entryDate, setEntryDate] = useState(
    initialData?.entryDate || new Date().toISOString().split('T')[0]
  );
  const [summary, setSummary] = useState(initialData?.summary || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [reflection, setReflection] = useState(initialData?.reflection || '');
  const [status, setStatus] = useState<JournalFormInput['status']>(initialData?.status || 'draft');
  const [visibility, setVisibility] = useState<JournalFormInput['visibility']>(
    initialData?.visibility || 'private'
  );
  const [published, setPublished] = useState(initialData?.published || false);
  const [tagsList, setTagsList] = useState<string[]>(initialData?.tagNames || []);
  const [tagInput, setTagInput] = useState('');
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>(
    initialData?.projectIds || []
  );
  const [selectedTechIds, setSelectedTechIds] = useState<string[]>(
    initialData?.technologyIds || []
  );

  const addTag = () => {
    const clean = tagInput.trim();
    if (clean && !tagsList.includes(clean)) {
      setTagsList((prev) => [...prev, clean]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTagsList((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const toggleProject = (id: string) => {
    setSelectedProjectIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleTech = (id: string) => {
    setSelectedTechIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    const payload = {
      title,
      slug: slug || undefined,
      entryDate,
      content,
      summary: summary || undefined,
      status,
      visibility,
      reflection: reflection || undefined,
      published,
      tagNames: tagsList,
      projectIds: selectedProjectIds,
      technologyIds: selectedTechIds,
    };

    startTransition(async () => {
      let result;
      if (mode === 'create') {
        result = await createJournalAction(payload);
      } else if (mode === 'edit' && journalId) {
        result = await updateJournalAction(journalId, payload);
      }

      if (result && !result.success) {
        setErrorMessage(result.error || 'Failed to save journal log.');
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/journal"
          className="inline-flex items-center space-x-1.5 text-xs font-mono text-terminal-text-muted hover:text-terminal-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Journal</span>
        </Link>

        <div className="flex items-center space-x-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/journal')}
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
              <span>{mode === 'create' ? 'Create Journal Log' : 'Save Changes'}</span>
            )}
          </Button>
        </div>
      </div>

      {errorMessage && (
        <Alert variant="destructive" title="Validation Error">
          {errorMessage}
        </Alert>
      )}

      {/* Log Header & Date */}
      <div className="p-6 rounded-lg border border-terminal-border bg-terminal-surface space-y-4">
        <h2 className="text-xs font-mono font-bold text-terminal-text-primary uppercase tracking-wider">
          Log Overview & Date
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Log Title *"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={fieldErrors.title?.[0]}
              placeholder="e.g. Solving PostgreSQL Connection Storms"
            />
          </div>
          <Input
            label="Log Date (YYYY-MM-DD) *"
            type="date"
            required
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
            error={fieldErrors.entryDate?.[0]}
          />
        </div>

        <Input
          label="URL Slug (leave empty for auto-generation)"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          error={fieldErrors.slug?.[0]}
          placeholder="solving-postgresql-connection-storms"
        />

        <Input
          label="Short Summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          error={fieldErrors.summary?.[0]}
          placeholder="One-line synopsis of the investigation or daily work"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Workflow Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as JournalFormInput['status'])}
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'review', label: 'In Review' },
              { value: 'published', label: 'Published' },
              { value: 'archived', label: 'Archived' },
            ]}
          />

          <Select
            label="Visibility Security Level *"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as JournalFormInput['visibility'])}
            options={[
              { value: 'private', label: 'Private (Owner Only - Never Public)' },
              { value: 'unlisted', label: 'Unlisted (Accessible via Direct Link)' },
              { value: 'public', label: 'Public (Appears on Portfolio Feed)' },
            ]}
          />
        </div>
      </div>

      {/* Markdown Content & Retrospective */}
      <div className="p-6 rounded-lg border border-terminal-border bg-terminal-surface space-y-4">
        <h2 className="text-xs font-mono font-bold text-terminal-text-primary uppercase tracking-wider">
          Engineering Content & Retrospective
        </h2>

        <Textarea
          label="Daily Log Markdown Content *"
          rows={12}
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          error={fieldErrors.content?.[0]}
          placeholder="Document the technical challenge, command line outputs, error traces, and architectural solution..."
        />

        <Textarea
          label="Retrospective & Lessons Learned (optional)"
          rows={3}
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="What would you do differently next time? Key engineering takeaways..."
        />
      </div>

      {/* Taxonomy & Linked Entities */}
      <div className="p-6 rounded-lg border border-terminal-border bg-terminal-surface space-y-6">
        <div className="space-y-3">
          <h2 className="text-xs font-mono font-bold text-terminal-text-primary uppercase tracking-wider">
            Tags & Taxonomy
          </h2>
          <div className="flex items-center space-x-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="Add tag (e.g. pgpool, docker, kubernetes) and press Enter"
            />
            <Button type="button" variant="outline" size="sm" onClick={addTag}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Add</span>
            </Button>
          </div>

          {tagsList.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {tagsList.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-terminal-bg border border-terminal-border text-xs font-mono text-terminal-text-primary"
                >
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-terminal-text-muted hover:text-terminal-accent"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {availableTechnologies.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-terminal-border">
            <h2 className="text-xs font-mono font-bold text-terminal-text-primary uppercase tracking-wider">
              Relevant Technologies ({selectedTechIds.length} Selected)
            </h2>
            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2 border border-terminal-border rounded bg-terminal-bg">
              {availableTechnologies.map((t) => {
                const isSelected = selectedTechIds.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTech(t.id)}
                    className={`px-2.5 py-1 text-xs font-mono rounded border transition-colors ${
                      isSelected
                        ? 'bg-terminal-primary/20 border-terminal-primary text-terminal-primary font-semibold'
                        : 'border-terminal-border text-terminal-text-secondary hover:border-terminal-text-muted'
                    }`}
                  >
                    {t.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {availableProjects.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-terminal-border">
            <h2 className="text-xs font-mono font-bold text-terminal-text-primary uppercase tracking-wider">
              Associated Projects ({selectedProjectIds.length} Selected)
            </h2>
            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2 border border-terminal-border rounded bg-terminal-bg">
              {availableProjects.map((p) => {
                const isSelected = selectedProjectIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleProject(p.id)}
                    className={`px-2.5 py-1 text-xs font-mono rounded border transition-colors ${
                      isSelected
                        ? 'bg-terminal-secondary/20 border-terminal-secondary text-terminal-secondary font-semibold'
                        : 'border-terminal-border text-terminal-text-secondary hover:border-terminal-text-muted'
                    }`}
                  >
                    {p.title}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Visibility & Publishing */}
      <div className="p-6 rounded-lg border border-terminal-border bg-terminal-surface space-y-4">
        <h2 className="text-xs font-mono font-bold text-terminal-text-primary uppercase tracking-wider">
          Publishing Activation
        </h2>

        <Switch
          checked={published}
          onCheckedChange={setPublished}
          label="Mark as Active Publication"
          description="Sets published_at timestamp. Content will be governed by the Visibility Security Level configured above."
        />
      </div>
    </form>
  );
}
