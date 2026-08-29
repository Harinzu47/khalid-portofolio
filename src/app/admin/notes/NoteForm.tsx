'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createNoteAction, updateNoteAction } from '@/actions/notes';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Plus, X, Loader2, ArrowLeft, Info, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import type { TechNoteEditorDTO } from '@/types/dtos';

export interface NoteFormProps {
  mode: 'create' | 'edit';
  noteId?: string;
  initialData?: Partial<TechNoteEditorDTO>;
  availableProjects?: { id: string; name: string }[];
  availableDomains?: { id: string; name: string }[];
  availableSkills?: { id: string; name: string }[];
  availableTechnologies?: { id: string; name: string }[];
  availableTags?: { id: string; name: string }[];
}

export function NoteForm({
  mode,
  noteId,
  initialData,
  availableProjects = [],
  availableDomains = [],
  availableSkills = [],
  availableTechnologies = [],
  availableTags = [],
}: NoteFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Form State
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [summary, setSummary] = useState(initialData?.summary || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [difficulty, setDifficulty] = useState(initialData?.difficulty || 'intermediate');
  const [verificationStatus, setVerificationStatus] = useState(
    initialData?.verificationStatus || 'unverified'
  );
  const [lastVerifiedAt, setLastVerifiedAt] = useState(
    initialData?.lastVerifiedAt ? initialData.lastVerifiedAt.slice(0, 10) : ''
  );
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured || false);
  const [visibility, setVisibility] = useState(initialData?.visibility || 'private');

  // Junction State
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>(
    initialData?.projectIds || []
  );
  const [selectedDomainIds, setSelectedDomainIds] = useState<string[]>(
    (initialData?.domains || []).map((d) => d.id)
  );
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>(
    (initialData?.skills || []).map((s) => s.id)
  );
  const [selectedTechnologyIds, setSelectedTechnologyIds] = useState<string[]>(
    (initialData?.technologies || []).map((t) => t.id)
  );
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    (initialData?.tags || []).map((t) => t.id)
  );
  const [customTagNames, setCustomTagNames] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const addCustomTag = () => {
    const clean = tagInput.trim();
    if (clean && !customTagNames.includes(clean)) {
      setCustomTagNames((prev) => [...prev, clean]);
      setTagInput('');
    }
  };

  const removeCustomTag = (tagToRemove: string) => {
    setCustomTagNames((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const toggleItem = (list: string[], setList: (l: string[]) => void, id: string) => {
    setList(list.includes(id) ? list.filter((i) => i !== id) : [...list, id]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    const payload = {
      title,
      slug: slug || undefined,
      summary: summary || undefined,
      content,
      difficulty: difficulty as any,
      verificationStatus: verificationStatus as any,
      lastVerifiedAt: lastVerifiedAt ? new Date(lastVerifiedAt).toISOString() : undefined,
      isFeatured,
      visibility,
      domainIds: selectedDomainIds,
      skillIds: selectedSkillIds,
      technologyIds: selectedTechnologyIds,
      tagIds: selectedTagIds,
      tagNames: customTagNames,
      projectIds: selectedProjectIds,
    };

    startTransition(async () => {
      let result;
      if (mode === 'create') {
        result = await createNoteAction(payload);
      } else if (mode === 'edit' && noteId) {
        result = await updateNoteAction(noteId, payload);
      }

      if (result && !result.success) {
        setErrorMessage(result.error || 'Failed to save tech note.');
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl font-mono">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/notes"
          className="inline-flex items-center space-x-1.5 text-xs text-terminal-text-muted hover:text-terminal-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tech Notes</span>
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
              <span>{mode === 'create' ? 'Create Tech Note' : 'Save Changes'}</span>
            )}
          </Button>
        </div>
      </div>

      {errorMessage && (
        <Alert variant="destructive" title="Validation Error">
          {errorMessage}
        </Alert>
      )}

      {/* 1. Reference Content */}
      <div className="p-6 rounded-lg border border-terminal-border bg-terminal-surface space-y-4">
        <h2 className="text-xs font-bold text-terminal-text-primary uppercase tracking-wider">
          Reference Composition
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Note Title *"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={fieldErrors.title?.[0]}
            placeholder="e.g. Docker Multi-Stage Build Pattern with Alpine"
          />
          <Input
            label="URL Slug (leave empty for auto-generation)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            error={fieldErrors.slug?.[0]}
            placeholder="docker-multistage-build-alpine"
          />
        </div>

        <Input
          label="Short Summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          error={fieldErrors.summary?.[0]}
          placeholder="Concise technical description of this recipe or note"
        />

        <Textarea
          label="Technical Note Content *"
          rows={14}
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          error={fieldErrors.content?.[0]}
          placeholder="```typescript&#10;// Type-safe implementation snippet&#10;```&#10;&#10;Explain applicability and verification steps..."
        />
      </div>

      {/* 2. Technical Quality & Verification */}
      <div className="p-6 rounded-lg border border-terminal-border bg-terminal-surface space-y-4">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-terminal-primary" />
          <h2 className="text-xs font-bold text-terminal-text-primary uppercase tracking-wider">
            Technical Quality & Verification
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Verification Status"
            value={verificationStatus}
            onChange={(e) => setVerificationStatus(e.target.value)}
            options={[
              { value: 'unverified', label: 'Unverified / In Draft' },
              { value: 'verified', label: 'Verified & Tested' },
              { value: 'outdated', label: 'Outdated / Legacy' },
              { value: 'deprecated', label: 'Deprecated' },
            ]}
          />

          <Select
            label="Difficulty Level"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            options={[
              { value: 'beginner', label: 'Beginner' },
              { value: 'intermediate', label: 'Intermediate' },
              { value: 'advanced', label: 'Advanced' },
              { value: 'expert', label: 'Expert' },
            ]}
          />

          <Input
            label="Last Verified Date"
            type="date"
            value={lastVerifiedAt}
            onChange={(e) => setLastVerifiedAt(e.target.value)}
          />
        </div>
      </div>

      {/* 3. Taxonomy & Structural Connections */}
      <div className="p-6 rounded-lg border border-terminal-border bg-terminal-surface space-y-6">
        <h2 className="text-xs font-bold text-terminal-text-primary uppercase tracking-wider">
          Taxonomy & Structural Connections
        </h2>

        {/* Domains */}
        {availableDomains.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs text-terminal-text-secondary">Engineering Domains</label>
            <div className="flex flex-wrap gap-2">
              {availableDomains.map((domain) => (
                <button
                  type="button"
                  key={domain.id}
                  onClick={() => toggleItem(selectedDomainIds, setSelectedDomainIds, domain.id)}
                  className={`px-2.5 py-1 rounded text-xs border transition-colors ${
                    selectedDomainIds.includes(domain.id)
                      ? 'bg-terminal-secondary/15 text-terminal-secondary border-terminal-secondary/40'
                      : 'bg-terminal-bg text-terminal-text-muted border-terminal-border hover:text-terminal-text-primary'
                  }`}
                >
                  {domain.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Technologies */}
        {availableTechnologies.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs text-terminal-text-secondary">Technologies</label>
            <div className="flex flex-wrap gap-2">
              {availableTechnologies.map((tech) => (
                <button
                  type="button"
                  key={tech.id}
                  onClick={() => toggleItem(selectedTechnologyIds, setSelectedTechnologyIds, tech.id)}
                  className={`px-2.5 py-1 rounded text-xs border transition-colors ${
                    selectedTechnologyIds.includes(tech.id)
                      ? 'bg-terminal-primary/15 text-terminal-primary border-terminal-primary/40'
                      : 'bg-terminal-bg text-terminal-text-muted border-terminal-border hover:text-terminal-text-primary'
                  }`}
                >
                  {tech.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {availableProjects.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs text-terminal-text-secondary">Linked Projects</label>
            <div className="flex flex-wrap gap-2">
              {availableProjects.map((proj) => (
                <button
                  type="button"
                  key={proj.id}
                  onClick={() => toggleItem(selectedProjectIds, setSelectedProjectIds, proj.id)}
                  className={`px-2.5 py-1 rounded text-xs border transition-colors ${
                    selectedProjectIds.includes(proj.id)
                      ? 'bg-terminal-accent/15 text-terminal-accent border-terminal-accent/40'
                      : 'bg-terminal-bg text-terminal-text-muted border-terminal-border hover:text-terminal-text-primary'
                  }`}
                >
                  {proj.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        <div className="space-y-3">
          <label className="text-xs text-terminal-text-secondary">Tags</label>
          {availableTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  type="button"
                  key={tag.id}
                  onClick={() => toggleItem(selectedTagIds, setSelectedTagIds, tag.id)}
                  className={`px-2.5 py-1 rounded text-xs border transition-colors ${
                    selectedTagIds.includes(tag.id)
                      ? 'bg-terminal-primary/15 text-terminal-primary border-terminal-primary/40'
                      : 'bg-terminal-bg text-terminal-text-muted border-terminal-border hover:text-terminal-text-primary'
                  }`}
                >
                  #{tag.name}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center space-x-2 pt-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustomTag();
                }
              }}
              placeholder="Type a new tag name and press Enter"
            />
            <Button type="button" variant="outline" size="sm" onClick={addCustomTag}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Add</span>
            </Button>
          </div>

          {customTagNames.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {customTagNames.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-terminal-bg border border-terminal-border text-xs text-terminal-text-primary"
                >
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeCustomTag(tag)}
                    className="text-terminal-text-muted hover:text-terminal-accent"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Visibility & Readiness */}
      <div className="p-6 rounded-lg border border-terminal-border bg-terminal-surface space-y-4">
        <h2 className="text-xs font-bold text-terminal-text-primary uppercase tracking-wider">
          Visibility & Readiness
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Visibility"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as 'private' | 'unlisted' | 'public')}
            options={[
              { value: 'private', label: 'Private (Owner only)' },
              { value: 'unlisted', label: 'Unlisted (Direct link only)' },
              { value: 'public', label: 'Public (Discoverable when published)' },
            ]}
          />

          <div className="flex flex-col justify-center space-y-1">
            <label className="text-xs text-terminal-text-secondary">Featured Note</label>
            <div className="flex items-center space-x-2 pt-1">
              <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
              <span className="text-xs text-terminal-text-muted">
                Pin to tech notes highlight section
              </span>
            </div>
          </div>
        </div>

        <div className="p-3 rounded bg-terminal-bg border border-terminal-border flex items-start space-x-2.5 text-xs text-terminal-text-muted">
          <Info className="w-4 h-4 text-terminal-secondary shrink-0 mt-0.5" />
          <div>
            <span>Publication Status: </span>
            <strong className="text-terminal-text-primary uppercase">
              {initialData?.publicationStatus || 'draft'}
            </strong>
            <p className="text-[11px] text-terminal-text-muted mt-0.5">
              New tech notes default to DRAFT. Public publishing transitions are managed by the Publishing Engine.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
