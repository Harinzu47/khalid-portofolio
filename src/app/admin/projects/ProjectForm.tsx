'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createProjectAction, updateProjectAction } from '@/actions/projects';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Plus, Trash2, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { ProjectFormInput } from '@/validations/project';

export interface ProjectFormProps {
  mode: 'create' | 'edit';
  projectId?: string;
  initialData?: {
    title?: string;
    slug?: string;
    shortDescription?: string | null;
    description?: string | null;
    problemStatement?: string | null;
    solution?: string | null;
    architecture?: string | null;
    role?: string | null;
    status?: ProjectFormInput['status'];
    startDate?: string | null;
    endDate?: string | null;
    repositoryUrl?: string | null;
    liveUrl?: string | null;
    featured?: boolean;
    published?: boolean;
    technologyIds?: string[];
    skillIds?: string[];
    links?: { label: string; url: string; linkType?: string }[];
  };
  technologies: { id: string; name: string; category?: string | null }[];
  skills: { id: string; name: string; category?: string | null }[];
}

export function ProjectForm({
  mode,
  projectId,
  initialData,
  technologies,
  skills,
}: ProjectFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Form State
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [problemStatement, setProblemStatement] = useState(initialData?.problemStatement || '');
  const [solution, setSolution] = useState(initialData?.solution || '');
  const [architecture, setArchitecture] = useState(initialData?.architecture || '');
  const [role, setRole] = useState(initialData?.role || '');
  const [status, setStatus] = useState<ProjectFormInput['status']>(initialData?.status || 'planning');
  const [startDate, setStartDate] = useState(initialData?.startDate || '');
  const [endDate, setEndDate] = useState(initialData?.endDate || '');
  const [repositoryUrl, setRepositoryUrl] = useState(initialData?.repositoryUrl || '');
  const [liveUrl, setLiveUrl] = useState(initialData?.liveUrl || '');
  const [featured, setFeatured] = useState(initialData?.featured || false);
  const [published, setPublished] = useState(initialData?.published || false);
  const [selectedTechIds, setSelectedTechIds] = useState<string[]>(initialData?.technologyIds || []);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>(initialData?.skillIds || []);
  const [links, setLinks] = useState<{ label: string; url: string; linkType?: string }[]>(
    initialData?.links || []
  );

  const toggleTech = (id: string) => {
    setSelectedTechIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const toggleSkill = (id: string) => {
    setSelectedSkillIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const addLink = () => {
    setLinks((prev) => [...prev, { label: '', url: '', linkType: 'external' }]);
  };

  const updateLink = (index: number, field: string, val: string) => {
    setLinks((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const removeLink = (index: number) => {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    const payload = {
      title,
      slug: slug || undefined,
      shortDescription: shortDescription || undefined,
      description: description || undefined,
      problemStatement: problemStatement || undefined,
      solution: solution || undefined,
      architecture: architecture || undefined,
      role: role || undefined,
      status,
      startDate: startDate || null,
      endDate: endDate || null,
      repositoryUrl: repositoryUrl || undefined,
      liveUrl: liveUrl || undefined,
      featured,
      published,
      technologyIds: selectedTechIds,
      skillIds: selectedSkillIds,
      links: links.filter((l) => l.label && l.url),
    };

    startTransition(async () => {
      let result;
      if (mode === 'create') {
        result = await createProjectAction(payload);
      } else if (mode === 'edit' && projectId) {
        result = await updateProjectAction(projectId, payload);
      }

      if (result && !result.success) {
        setErrorMessage(result.error || 'Failed to save project.');
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
          href="/admin/projects"
          className="inline-flex items-center space-x-1.5 text-xs font-mono text-terminal-text-muted hover:text-terminal-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </Link>

        <div className="flex items-center space-x-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/projects')}
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
              <span>{mode === 'create' ? 'Create Project' : 'Save Changes'}</span>
            )}
          </Button>
        </div>
      </div>

      {errorMessage && (
        <Alert variant="destructive" title="Validation Failed">
          {errorMessage}
        </Alert>
      )}

      {/* Core Identity */}
      <div className="p-6 rounded-lg border border-terminal-border bg-terminal-surface space-y-4">
        <h2 className="text-xs font-mono font-bold text-terminal-text-primary uppercase tracking-wider">
          Core Identification
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Project Title *"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={fieldErrors.title?.[0]}
            placeholder="e.g. ESG Sentiment Analyzer"
          />
          <Input
            label="URL Slug (leave empty for auto-generation)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            error={fieldErrors.slug?.[0]}
            placeholder="esg-sentiment-analyzer"
          />
        </div>

        <Input
          label="Short Summary / Subtitle"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          error={fieldErrors.shortDescription?.[0]}
          placeholder="Brief 1-2 sentence overview for cards and meta descriptions"
        />

        <Textarea
          label="Full Overview / Executive Summary"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={fieldErrors.description?.[0]}
          placeholder="High-level project scope and background..."
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Project Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectFormInput['status'])}
            options={[
              { value: 'planning', label: 'Planning' },
              { value: 'active', label: 'Active / In Progress' },
              { value: 'completed', label: 'Completed' },
              { value: 'archived', label: 'Archived' },
              { value: 'idea', label: 'Idea / Concept' },
            ]}
          />
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* Deep Dive Case Study Content */}
      <div className="p-6 rounded-lg border border-terminal-border bg-terminal-surface space-y-4">
        <h2 className="text-xs font-mono font-bold text-terminal-text-primary uppercase tracking-wider">
          Case Study & Engineering Breakdown
        </h2>

        <Textarea
          label="Problem Statement"
          rows={3}
          value={problemStatement}
          onChange={(e) => setProblemStatement(e.target.value)}
          placeholder="What specific technical/business bottleneck or challenge did this solve?"
        />

        <Textarea
          label="Proposed Solution & Key Features"
          rows={4}
          value={solution}
          onChange={(e) => setSolution(e.target.value)}
          placeholder="How was the architecture designed and implemented to address the problem?"
        />

        <Textarea
          label="System Architecture & Tech Specs"
          rows={4}
          value={architecture}
          onChange={(e) => setArchitecture(e.target.value)}
          placeholder="Database schemas, indexing strategies, pipeline flows, microservices..."
        />

        <Input
          label="Engineering Role / Capacity"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Lead Infrastructure Architect, Fullstack Developer, etc."
        />
      </div>

      {/* URLs & External Links */}
      <div className="p-6 rounded-lg border border-terminal-border bg-terminal-surface space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-bold text-terminal-text-primary uppercase tracking-wider">
            Links & Repositories
          </h2>
          <Button type="button" variant="outline" size="sm" onClick={addLink}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>Add Link</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Repository URL"
            type="url"
            value={repositoryUrl}
            onChange={(e) => setRepositoryUrl(e.target.value)}
            placeholder="https://github.com/..."
          />
          <Input
            label="Live Demo URL"
            type="url"
            value={liveUrl}
            onChange={(e) => setLiveUrl(e.target.value)}
            placeholder="https://app.domain.com"
          />
        </div>

        {links.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-terminal-border">
            {links.map((link, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Label (e.g. API Docs)"
                  value={link.label}
                  onChange={(e) => updateLink(idx, 'label', e.target.value)}
                  className="flex-1 py-1.5 px-2.5 text-xs font-mono bg-terminal-bg border border-terminal-border rounded text-terminal-text-primary placeholder:text-terminal-text-muted focus:outline-none focus:border-terminal-secondary"
                />
                <input
                  type="url"
                  placeholder="https://..."
                  value={link.url}
                  onChange={(e) => updateLink(idx, 'url', e.target.value)}
                  className="flex-2 py-1.5 px-2.5 text-xs font-mono bg-terminal-bg border border-terminal-border rounded text-terminal-text-primary placeholder:text-terminal-text-muted focus:outline-none focus:border-terminal-secondary"
                />
                <button
                  type="button"
                  onClick={() => removeLink(idx)}
                  className="p-1.5 text-terminal-text-muted hover:text-terminal-accent"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Taxonomy Selection */}
      <div className="p-6 rounded-lg border border-terminal-border bg-terminal-surface space-y-6">
        <div className="space-y-2">
          <h2 className="text-xs font-mono font-bold text-terminal-text-primary uppercase tracking-wider">
            Technologies ({selectedTechIds.length} Selected)
          </h2>
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border border-terminal-border rounded bg-terminal-bg">
            {technologies.map((tech) => {
              const selected = selectedTechIds.includes(tech.id);
              return (
                <button
                  key={tech.id}
                  type="button"
                  onClick={() => toggleTech(tech.id)}
                  className={`px-2.5 py-1 text-xs font-mono rounded border transition-colors ${
                    selected
                      ? 'bg-terminal-primary/20 border-terminal-primary text-terminal-primary font-semibold'
                      : 'border-terminal-border text-terminal-text-secondary hover:border-terminal-text-muted'
                  }`}
                >
                  {tech.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xs font-mono font-bold text-terminal-text-primary uppercase tracking-wider">
            Competencies & Skills ({selectedSkillIds.length} Selected)
          </h2>
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border border-terminal-border rounded bg-terminal-bg">
            {skills.map((skill) => {
              const selected = selectedSkillIds.includes(skill.id);
              return (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => toggleSkill(skill.id)}
                  className={`px-2.5 py-1 text-xs font-mono rounded border transition-colors ${
                    selected
                      ? 'bg-terminal-secondary/20 border-terminal-secondary text-terminal-secondary font-semibold'
                      : 'border-terminal-border text-terminal-text-secondary hover:border-terminal-text-muted'
                  }`}
                >
                  {skill.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Visibility & Flags */}
      <div className="p-6 rounded-lg border border-terminal-border bg-terminal-surface space-y-4">
        <h2 className="text-xs font-mono font-bold text-terminal-text-primary uppercase tracking-wider">
          Publishing Controls
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Switch
            checked={published}
            onCheckedChange={setPublished}
            label="Published to Public Portfolio"
            description="When enabled, this completed project will appear in public feeds and sitemaps."
          />
          <Switch
            checked={featured}
            onCheckedChange={setFeatured}
            label="Featured on Homepage"
            description="Display in the top highlight reel on the root portfolio landing page."
          />
        </div>
      </div>
    </form>
  );
}
