'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createADRAction, updateADRAction } from '@/actions/adrs';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Loader2, ArrowLeft, Info, Scale } from 'lucide-react';
import Link from 'next/link';
import type { ADREditorDTO } from '@/types/dtos';

export interface ADRFormProps {
  mode: 'create' | 'edit';
  adrId?: string;
  initialData?: Partial<ADREditorDTO>;
  availableProjects?: { id: string; name: string }[];
  availableADRs?: { id: string; name: string }[];
}

export function ADRForm({
  mode,
  adrId,
  initialData,
  availableProjects = [],
  availableADRs = [],
}: ADRFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Form State
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [number, setNumber] = useState<number | undefined>(initialData?.number || undefined);
  const [status, setStatus] = useState<ADREditorDTO['status']>(initialData?.status || 'proposed');
  const [context, setContext] = useState(initialData?.context || '');
  const [decision, setDecision] = useState(initialData?.decision || '');
  const [alternativesText, setAlternativesText] = useState(
    initialData?.alternatives ? JSON.stringify(initialData.alternatives, null, 2) : ''
  );
  const [consequencesText, setConsequencesText] = useState(
    initialData?.consequences ? JSON.stringify(initialData.consequences, null, 2) : ''
  );
  const [projectId, setProjectId] = useState(initialData?.projectId || '');
  const [supersededById, setSupersededById] = useState(initialData?.supersededById || '');
  const [visibility, setVisibility] = useState(initialData?.visibility || 'private');
  const [decidedAt, setDecidedAt] = useState(
    initialData?.decidedAt ? initialData.decidedAt.slice(0, 10) : ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    let parsedAlternatives = null;
    if (alternativesText.trim()) {
      try {
        parsedAlternatives = JSON.parse(alternativesText);
      } catch {
        parsedAlternatives = { raw: alternativesText };
      }
    }

    let parsedConsequences = null;
    if (consequencesText.trim()) {
      try {
        parsedConsequences = JSON.parse(consequencesText);
      } catch {
        parsedConsequences = { raw: consequencesText };
      }
    }

    const payload = {
      title,
      slug: slug || undefined,
      number: number ? Number(number) : undefined,
      status,
      context: context || undefined,
      decision: decision || undefined,
      alternatives: parsedAlternatives,
      consequences: parsedConsequences,
      projectId: projectId || undefined,
      supersededById: supersededById || undefined,
      visibility,
      decidedAt: decidedAt ? new Date(decidedAt).toISOString() : undefined,
    };

    startTransition(async () => {
      let result;
      if (mode === 'create') {
        result = await createADRAction(payload);
      } else if (mode === 'edit' && adrId) {
        result = await updateADRAction(adrId, payload);
      }

      if (result && !result.success) {
        setErrorMessage(result.error || 'Failed to save ADR.');
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
          href="/admin/adrs"
          className="inline-flex items-center space-x-1.5 text-xs text-terminal-text-muted hover:text-terminal-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to ADRs</span>
        </Link>

        <div className="flex items-center space-x-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/adrs')}
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
              <span>{mode === 'create' ? 'Create ADR' : 'Save Changes'}</span>
            )}
          </Button>
        </div>
      </div>

      {errorMessage && (
        <Alert variant="destructive" title="Validation Error">
          {errorMessage}
        </Alert>
      )}

      {/* 1. Decision Identification */}
      <div className="p-6 rounded-lg border border-terminal-border bg-terminal-surface space-y-4">
        <div className="flex items-center space-x-2">
          <Scale className="w-4 h-4 text-terminal-secondary" />
          <h2 className="text-xs font-bold text-terminal-text-primary uppercase tracking-wider">
            Decision Identification
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            label="ADR Number"
            type="number"
            value={number || ''}
            onChange={(e) => setNumber(e.target.value ? Number(e.target.value) : undefined)}
            placeholder="Auto (#)"
          />
          <div className="md:col-span-3">
            <Input
              label="ADR Title *"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={fieldErrors.title?.[0]}
              placeholder="e.g. Adopt Dual-Layer RLS and Session Scoping for Multi-Tenancy"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="URL Slug (leave empty for auto-generation)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            error={fieldErrors.slug?.[0]}
            placeholder="adopt-dual-layer-rls-session-scoping"
          />

          <Select
            label="Domain Lifecycle Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ADREditorDTO['status'])}
            options={[
              { value: 'proposed', label: 'Proposed' },
              { value: 'accepted', label: 'Accepted' },
              { value: 'superseded', label: 'Superseded' },
              { value: 'rejected', label: 'Rejected' },
              { value: 'deprecated', label: 'Deprecated' },
            ]}
          />

          <Input
            label="Decided Date"
            type="date"
            value={decidedAt}
            onChange={(e) => setDecidedAt(e.target.value)}
          />
        </div>
      </div>

      {/* 2. Context & Decision Body */}
      <div className="p-6 rounded-lg border border-terminal-border bg-terminal-surface space-y-4">
        <h2 className="text-xs font-bold text-terminal-text-primary uppercase tracking-wider">
          Context & Architectural Decision
        </h2>

        <Textarea
          label="Context & Problem Statement *"
          rows={6}
          required
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="What is the architectural context, requirement, or constraint motivating this choice?"
        />

        <Textarea
          label="Decision & Strategy *"
          rows={8}
          required
          value={decision}
          onChange={(e) => setDecision(e.target.value)}
          placeholder="What is the explicit decision and technical approach chosen?"
        />
      </div>

      {/* 3. Alternatives & Consequences */}
      <div className="p-6 rounded-lg border border-terminal-border bg-terminal-surface space-y-4">
        <h2 className="text-xs font-bold text-terminal-text-primary uppercase tracking-wider">
          Alternatives & Trade-Offs
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Textarea
            label="Alternatives Considered (JSON or text)"
            rows={5}
            value={alternativesText}
            onChange={(e) => setAlternativesText(e.target.value)}
            placeholder={`{\n  "optionA": "Single-tenant database",\n  "optionB": "Application-only filter"\n}`}
          />

          <Textarea
            label="Consequences & Trade-offs (JSON or text)"
            rows={5}
            value={consequencesText}
            onChange={(e) => setConsequencesText(e.target.value)}
            placeholder={`{\n  "positive": ["Strict isolation", "Zero data leakage"],\n  "negative": ["Requires dual-layer test suites"]\n}`}
          />
        </div>
      </div>

      {/* 4. Structural Relations & Supersession */}
      <div className="p-6 rounded-lg border border-terminal-border bg-terminal-surface space-y-4">
        <h2 className="text-xs font-bold text-terminal-text-primary uppercase tracking-wider">
          Structural Relations & Supersession
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Associated Project"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            options={[
              { value: '', label: '— None (System Wide) —' },
              ...availableProjects.map((p) => ({ value: p.id, label: p.name })),
            ]}
          />

          <Select
            label="Superseded By (Another ADR)"
            value={supersededById}
            onChange={(e) => setSupersededById(e.target.value)}
            options={[
              { value: '', label: '— None (Current Active) —' },
              ...availableADRs
                .filter((a) => a.id !== adrId)
                .map((a) => ({ value: a.id, label: a.name })),
            ]}
          />
        </div>
      </div>

      {/* 5. Visibility & Readiness */}
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
        </div>

        <div className="p-3 rounded bg-terminal-bg border border-terminal-border flex items-start space-x-2.5 text-xs text-terminal-text-muted">
          <Info className="w-4 h-4 text-terminal-secondary shrink-0 mt-0.5" />
          <div>
            <span>Publication Status: </span>
            <strong className="text-terminal-text-primary uppercase">
              {initialData?.publicationStatus || 'draft'}
            </strong>
            <p className="text-[11px] text-terminal-text-muted mt-0.5">
              ADR domain lifecycle (proposed/accepted/superseded) is decoupled from publication lifecycle (draft/published).
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
