'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createTechnologyAction, updateTechnologyAction } from '@/actions/taxonomy';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export interface TechnologyFormProps {
  mode: 'create' | 'edit';
  technologyId?: string;
  initialData?: {
    name?: string;
    slug?: string;
    category?: string | null;
    description?: string | null;
    websiteUrl?: string | null;
    iconName?: string | null;
  };
}

export function TechnologyForm({ mode, technologyId, initialData }: TechnologyFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Form State
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [category, setCategory] = useState(initialData?.category || 'DevOps & Cloud');
  const [description, setDescription] = useState(initialData?.description || '');
  const [websiteUrl, setWebsiteUrl] = useState(initialData?.websiteUrl || '');
  const [iconName, setIconName] = useState(initialData?.iconName || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    const payload = {
      name,
      slug: slug || undefined,
      category: category || undefined,
      description: description || undefined,
      websiteUrl: websiteUrl || undefined,
      iconName: iconName || undefined,
    };

    startTransition(async () => {
      let result;
      if (mode === 'create') {
        result = await createTechnologyAction(payload);
      } else if (mode === 'edit' && technologyId) {
        result = await updateTechnologyAction(technologyId, payload);
      }

      if (result && !result.success) {
        setErrorMessage(result.error || 'Failed to save technology.');
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
          href="/admin/technologies"
          className="inline-flex items-center space-x-1.5 text-xs font-mono text-terminal-text-muted hover:text-terminal-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Technologies</span>
        </Link>

        <div className="flex items-center space-x-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/technologies')}
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
              <span>{mode === 'create' ? 'Create Technology' : 'Save Changes'}</span>
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
          Technology Specification
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Technology Name *"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={fieldErrors.name?.[0]}
            placeholder="e.g. Kubernetes, PostgreSQL, TypeScript"
          />

          <Input
            label="URL Slug (leave empty for auto-generation)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            error={fieldErrors.slug?.[0]}
            placeholder="kubernetes"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              { value: 'DevOps & Cloud', label: 'DevOps & Cloud' },
              { value: 'Containers & Orchestration', label: 'Containers & Orchestration' },
              { value: 'Databases & Storage', label: 'Databases & Storage' },
              { value: 'Networking & Security', label: 'Networking & Security' },
              { value: 'Frontend & UI', label: 'Frontend & UI' },
              { value: 'Backend & APIs', label: 'Backend & APIs' },
              { value: 'AI & Data Science', label: 'AI & Data Science' },
            ]}
          />

          <Input
            label="Official Website URL"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            error={fieldErrors.websiteUrl?.[0]}
            placeholder="https://kubernetes.io"
          />
        </div>

        <Input
          label="Icon Identifier (Lucide / SimpleIcons slug)"
          value={iconName}
          onChange={(e) => setIconName(e.target.value)}
          placeholder="kubernetes"
        />

        <Textarea
          label="Description / Context"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of usage and architectural role..."
        />
      </div>
    </form>
  );
}
