'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createLearningPathAction, updateLearningPathAction } from '@/actions/learning-path';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { LearningPathEditorDTO, LearningPathStatus, ProgressMode } from '@/types/dtos';

const STATUS_OPTIONS: { value: LearningPathStatus; label: string }[] = [
  { value: 'planned', label: 'Planned' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

interface LearningPathFormProps {
  initialData?: LearningPathEditorDTO;
  skillOptions: { id: string; name: string }[];
  domainOptions: { id: string; name: string }[];
  technologyOptions: { id: string; name: string }[];
}

export function LearningPathForm({
  initialData,
  skillOptions,
  domainOptions,
  technologyOptions,
}: LearningPathFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [summary, setSummary] = useState(initialData?.summary || '');
  const [status, setStatus] = useState<LearningPathStatus>(initialData?.status || 'planned');
  const [startedAt, setStartedAt] = useState(initialData?.startedAt || '');
  const [completedAt, setCompletedAt] = useState(initialData?.completedAt || '');
  const [progressMode, setProgressMode] = useState<ProgressMode>(
    initialData?.progressMode || 'none'
  );
  const [progressValue, setProgressValue] = useState<string>(
    initialData?.progressValue !== null && initialData?.progressValue !== undefined
      ? String(initialData.progressValue)
      : ''
  );
  const [currentFocus, setCurrentFocus] = useState(initialData?.currentFocus || '');
  const [visibility, setVisibility] = useState<'private' | 'unlisted' | 'public'>(
    initialData?.visibility || 'private'
  );

  const [skillIds, setSkillIds] = useState<string[]>(initialData?.skillIds || []);
  const [domainIds, setDomainIds] = useState<string[]>(initialData?.domainIds || []);
  const [technologyIds, setTechnologyIds] = useState<string[]>(initialData?.technologyIds || []);

  const handleStatusChange = (newStatus: LearningPathStatus) => {
    setStatus(newStatus);
    if (newStatus === 'completed') {
      if (!completedAt) {
        setCompletedAt(new Date().toISOString().slice(0, 10));
      }
      setCurrentFocus('');
    } else if (newStatus === 'archived') {
      setCurrentFocus('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      summary: summary.trim() || null,
      status,
      startedAt: startedAt || null,
      completedAt: completedAt || null,
      progressMode,
      progressValue:
        progressMode === 'manual' && progressValue.trim() !== ''
          ? parseInt(progressValue, 10)
          : null,
      currentFocus: currentFocus.trim() || null,
      visibility,
      skillIds,
      domainIds,
      technologyIds,
    };

    startTransition(async () => {
      let res;
      if (initialData?.id) {
        res = await updateLearningPathAction(initialData.id, payload);
      } else {
        res = await createLearningPathAction(payload);
      }

      if (!res.success) {
        setError(res.error || 'Failed to save learning path.');
      } else {
        router.push('/admin/learning/paths');
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/learning/paths"
          className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Learning Paths</span>
        </Link>
      </div>

      {error && (
        <div className="p-3 text-xs text-rose-300 bg-rose-950/40 border border-rose-800/50 rounded-lg">
          {error}
        </div>
      )}

      {/* 1. Core Learning Journey Details */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider text-xs">
          Path Overview
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Path Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Deep Reinforcement Learning & Transformers"
              required
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Custom Slug (optional)
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="deep-reinforcement-learning"
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Summary / Goal</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={2}
            placeholder="High-level objective of this learning curriculum..."
            className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Lifecycle Status <span className="text-rose-400">*</span>
            </label>
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value as LearningPathStatus)}
              className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Started Date</label>
            <input
              type="date"
              value={startedAt}
              onChange={(e) => setStartedAt(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Completed Date</label>
            <input
              type="date"
              value={completedAt}
              onChange={(e) => setCompletedAt(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Strategic Focus & Progress Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-800">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Current Strategic Focus / Active Module
            </label>
            <input
              type="text"
              value={currentFocus}
              onChange={(e) => setCurrentFocus(e.target.value)}
              disabled={status === 'completed' || status === 'archived'}
              placeholder="e.g., Module 4: Policy Gradient Methods (PPO & SAC)"
              className="w-full px-3.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-slate-300">Progress Mode</label>
              <select
                value={progressMode}
                onChange={(e) => setProgressMode(e.target.value as ProgressMode)}
                className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-100"
              >
                <option value="none">None</option>
                <option value="manual">Manual %</option>
              </select>
            </div>
            {progressMode === 'manual' && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={progressValue}
                  onChange={(e) => setProgressValue(e.target.value)}
                  placeholder="0..100"
                  className="w-full px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100"
                />
                <span className="text-xs text-slate-400 font-semibold">%</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Taxonomy Links */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider text-xs">
          Taxonomy Alignment
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Target Skills</label>
            <select
              multiple
              value={skillIds}
              onChange={(e) =>
                setSkillIds(Array.from(e.target.selectedOptions, (option) => option.value))
              }
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 h-28 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {skillOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Target Domains</label>
            <select
              multiple
              value={domainIds}
              onChange={(e) =>
                setDomainIds(Array.from(e.target.selectedOptions, (option) => option.value))
              }
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 h-28 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {domainOptions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Target Technologies
            </label>
            <select
              multiple
              value={technologyIds}
              onChange={(e) =>
                setTechnologyIds(Array.from(e.target.selectedOptions, (option) => option.value))
              }
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 h-28 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {technologyOptions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Link
          href="/admin/learning/paths"
          className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isPending || !title.trim()}
          className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors shadow-sm shadow-emerald-500/20"
        >
          {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          <span>{initialData ? 'Update Learning Path' : 'Create Learning Path'}</span>
        </button>
      </div>
    </form>
  );
}
