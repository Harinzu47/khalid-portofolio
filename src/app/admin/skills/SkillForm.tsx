'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createSkillAction, updateSkillAction } from '@/actions/taxonomy';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export interface SkillFormProps {
  mode: 'create' | 'edit';
  skillId?: string;
  initialData?: {
    name?: string;
    slug?: string;
    category?: string;
    description?: string | null;
    proficiencyLevel?: number | null;
    visibility?: 'public' | 'unlisted' | 'private';
  };
}

export function SkillForm({ mode, skillId, initialData }: SkillFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Form State
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [category, setCategory] = useState(initialData?.category || 'Infrastructure');
  const [description, setDescription] = useState(initialData?.description || '');
  const [proficiencyLevel, setProficiencyLevel] = useState<string>(
    initialData?.proficiencyLevel ? String(initialData.proficiencyLevel) : '4'
  );
  const [visibility, setVisibility] = useState<'public' | 'unlisted' | 'private'>(
    initialData?.visibility || 'public'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    const payload = {
      name,
      slug: slug || undefined,
      category,
      description: description || undefined,
      proficiencyLevel: proficiencyLevel ? Number(proficiencyLevel) : null,
      visibility,
    };

    startTransition(async () => {
      let result;
      if (mode === 'create') {
        result = await createSkillAction(payload);
      } else if (mode === 'edit' && skillId) {
        result = await updateSkillAction(skillId, payload);
      }

      if (result && !result.success) {
        setErrorMessage(result.error || 'Failed to save skill.');
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
          href="/admin/skills"
          className="inline-flex items-center space-x-1.5 text-xs font-mono text-terminal-text-muted hover:text-terminal-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Skills</span>
        </Link>

        <div className="flex items-center space-x-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/skills')}
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
              <span>{mode === 'create' ? 'Create Skill' : 'Save Changes'}</span>
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
          Engineering Skill Specification
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Skill Name *"
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Pillar / Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              { value: 'Infrastructure', label: 'Infrastructure & Cloud' },
              { value: 'Networking', label: 'Networking & Telecommunications' },
              { value: 'Web Development', label: 'Web Development & Fullstack' },
              { value: 'AI & Machine Learning', label: 'AI & Data Intelligence' },
              { value: 'Databases', label: 'Database Engineering' },
              { value: 'Security', label: 'Security & DevSecOps' },
            ]}
          />

          <Select
            label="Proficiency Level (1–5)"
            value={proficiencyLevel}
            onChange={(e) => setProficiencyLevel(e.target.value)}
            options={[
              { value: '1', label: '1 - Fundamental / Familiar' },
              { value: '2', label: '2 - Intermediate' },
              { value: '3', label: '3 - Competent Production' },
              { value: '4', label: '4 - Advanced Specialist' },
              { value: '5', label: '5 - Master / Architect' },
            ]}
          />

          <Select
            label="Visibility Privacy Level"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as any)}
            options={[
              { value: 'public', label: 'PUBLIC — Visible on /expertise' },
              { value: 'unlisted', label: 'UNLISTED — Direct reference only' },
              { value: 'private', label: 'PRIVATE — Internal OS only' },
            ]}
          />
        </div>

        <Textarea
          label="Description / Context"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of practical experience or scope of expertise..."
        />
      </div>
    </form>
  );
}
