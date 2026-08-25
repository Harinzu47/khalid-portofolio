'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createArticleAction, updateArticleAction } from '@/actions/articles';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Plus, X, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { ArticleFormInput } from '@/validations/article';

export interface ArticleFormProps {
  mode: 'create' | 'edit';
  articleId?: string;
  initialData?: {
    title?: string;
    slug?: string;
    excerpt?: string | null;
    content?: string;
    status?: 'draft' | 'review' | 'published' | 'archived';
    featured?: boolean;
    published?: boolean;
    seoTitle?: string | null;
    seoDescription?: string | null;
    tagNames?: string[];
    projectIds?: string[];
  };
  availableProjects: { id: string; title: string }[];
}

export function ArticleForm({
  mode,
  articleId,
  initialData,
  availableProjects,
}: ArticleFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Form State
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [status, setStatus] = useState<ArticleFormInput['status']>(initialData?.status || 'draft');
  const [featured, setFeatured] = useState(initialData?.featured || false);
  const [published, setPublished] = useState(initialData?.published || false);
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription || '');
  const [tagsList, setTagsList] = useState<string[]>(initialData?.tagNames || []);
  const [tagInput, setTagInput] = useState('');
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>(
    initialData?.projectIds || []
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    const payload = {
      title,
      slug: slug || undefined,
      excerpt: excerpt || undefined,
      content,
      status,
      featured,
      published,
      seoTitle: seoTitle || undefined,
      seoDescription: seoDescription || undefined,
      tagNames: tagsList,
      projectIds: selectedProjectIds,
    };

    startTransition(async () => {
      let result;
      if (mode === 'create') {
        result = await createArticleAction(payload);
      } else if (mode === 'edit' && articleId) {
        result = await updateArticleAction(articleId, payload);
      }

      if (result && !result.success) {
        setErrorMessage(result.error || 'Failed to save article.');
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
          href="/admin/articles"
          className="inline-flex items-center space-x-1.5 text-xs font-mono text-terminal-text-muted hover:text-terminal-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Articles</span>
        </Link>

        <div className="flex items-center space-x-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/articles')}
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
              <span>{mode === 'create' ? 'Publish Article' : 'Save Changes'}</span>
            )}
          </Button>
        </div>
      </div>

      {errorMessage && (
        <Alert variant="destructive" title="Validation Error">
          {errorMessage}
        </Alert>
      )}

      {/* Main Content & Title */}
      <div className="p-6 rounded-lg border border-terminal-border bg-terminal-surface space-y-4">
        <h2 className="text-xs font-mono font-bold text-terminal-text-primary uppercase tracking-wider">
          Article Composition
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Article Title *"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={fieldErrors.title?.[0]}
            placeholder="e.g. Deep Dive: Zero-Downtime Migration in PostgreSQL"
          />
          <Input
            label="URL Slug (leave empty for auto-generation)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            error={fieldErrors.slug?.[0]}
            placeholder="zero-downtime-migration-postgresql"
          />
        </div>

        <Input
          label="Short Excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          error={fieldErrors.excerpt?.[0]}
          placeholder="Brief summary displayed in article cards and RSS feeds"
        />

        <Textarea
          label="Markdown / MDX Content *"
          rows={14}
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          error={fieldErrors.content?.[0]}
          placeholder="# Introduction&#10;&#10;Write your deep technical breakdown in standard markdown..."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Publication Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ArticleFormInput['status'])}
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'review', label: 'In Review' },
              { value: 'published', label: 'Published' },
              { value: 'archived', label: 'Archived' },
            ]}
          />
        </div>
      </div>

      {/* Taxonomy & Linked Projects */}
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
              placeholder="Type a tag (e.g. postgres, performance, devops) and press Enter"
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

        {availableProjects.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-terminal-border">
            <h2 className="text-xs font-mono font-bold text-terminal-text-primary uppercase tracking-wider">
              Linked Case Studies / Projects ({selectedProjectIds.length} Selected)
            </h2>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border border-terminal-border rounded bg-terminal-bg">
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

      {/* SEO & Meta */}
      <div className="p-6 rounded-lg border border-terminal-border bg-terminal-surface space-y-4">
        <h2 className="text-xs font-mono font-bold text-terminal-text-primary uppercase tracking-wider">
          SEO & OpenGraph Metadata
        </h2>

        <Input
          label="Custom SEO Title (optional)"
          value={seoTitle}
          onChange={(e) => setSeoTitle(e.target.value)}
          placeholder="Defaults to Article Title"
        />

        <Textarea
          label="Custom SEO Description (optional)"
          rows={2}
          value={seoDescription}
          onChange={(e) => setSeoDescription(e.target.value)}
          placeholder="Defaults to Short Excerpt"
        />
      </div>

      {/* Visibility & Publishing */}
      <div className="p-6 rounded-lg border border-terminal-border bg-terminal-surface space-y-4">
        <h2 className="text-xs font-mono font-bold text-terminal-text-primary uppercase tracking-wider">
          Publishing Controls
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Switch
            checked={published}
            onCheckedChange={setPublished}
            label="Published to Public Feed"
            description="When active, this article will appear in public index, RSS, and sitemaps."
          />
          <Switch
            checked={featured}
            onCheckedChange={setFeatured}
            label="Featured Article"
            description="Highlight this article on the homepage knowledge base showcase."
          />
        </div>
      </div>
    </form>
  );
}
