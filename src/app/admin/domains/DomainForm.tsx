'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createDomainAction, updateDomainAction } from '@/actions/taxonomy';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export interface DomainFormProps {
  mode: 'create' | 'edit';
  domainId?: string;
  initialData?: {
    name?: string;
    slug?: string;
    description?: string | null;
    sortOrder?: number;
    visibility?: string;
  };
}

export function DomainForm({ mode, domainId, initialData }: DomainFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [sortOrder, setSortOrder] = useState(initialData?.sortOrder ?? 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    const payload = {
      name,
      slug: slug || undefined,
      description: description || undefined,
      sortOrder,
    };

    startTransition(async () => {
      let result;
      if (mode === 'create') {
        result = await createDomainAction(payload);
      } else if (mode === 'edit' && domainId) {
        result = await updateDomainAction(domainId, payload);
      }

      if (result && !result.success) {
        setErrorMessage(result.error || 'Failed to save domain.');
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/domains"
          className="inline-flex items-center space-x-1.5 text-xs font-mono text-terminal-text-muted hover:text-terminal-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Domains</span>
        </Link>

        <div className="flex items-center space-x-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/domains')}
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
              <span>{mode === 'create' ? 'Create Domain' : 'Save Changes'}</span>
            )}
          </Button>
        </div>
      </div>

      {errorMessage && (
        <Alert variant="destructive" title="Validation Error">
          {errorMessage}
        </Alert>
      )}

      <div className="p-6 rounded-lg border border-terminal-border bg-terminal-surface space-y-4">
        <h2 className="text-xs font-mono font-bold text-terminal-text-primary uppercase tracking-wider">
          Engineering Knowledge Domain
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Domain Name *"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={fieldErrors.name?.[0]}
            placeholder="e.g. Distributed Systems"
          />

          <Input
            label="URL Slug (leave empty for auto-generation)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            error={fieldErrors.slug?.[0]}
            placeholder="distributed-systems"
          />
        </div>

        <Input
          type="number"
          label="Display Order"
          value={String(sortOrder)}
          onChange={(e) => setSortOrder(Number(e.target.value))}
        />

        <Textarea
          label="Description / Scope"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detailed definition of this domain boundary..."
        />
      </div>
    </form>
  );
}
