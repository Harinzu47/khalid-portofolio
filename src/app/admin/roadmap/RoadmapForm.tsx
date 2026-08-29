'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createRoadmapItemAction, updateRoadmapItemAction } from '@/actions/roadmap';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { RoadmapEditorDTO, RoadmapStatus } from '@/types/dtos';

const STATUS_OPTIONS: { value: RoadmapStatus; label: string }[] = [
  { value: 'backlog', label: 'Backlog (Queued)' },
  { value: 'planned', label: 'Planned (Next Up)' },
  { value: 'in_progress', label: 'In Progress (Active)' },
  { value: 'completed', label: 'Completed' },
];

const CATEGORY_OPTIONS = [
  'Infrastructure & Cloud',
  'AI & Machine Learning',
  'Distributed Systems',
  'Security & DevSecOps',
  'Web Engineering',
  'Developer Experience',
];

interface RoadmapFormProps {
  initialData?: RoadmapEditorDTO;
}

export function RoadmapForm({ initialData }: RoadmapFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [summary, setSummary] = useState(initialData?.summary || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState(initialData?.category || 'Infrastructure & Cloud');
  const [roadmapType, setRoadmapType] = useState(initialData?.roadmapType || 'technical');
  const [status, setStatus] = useState<RoadmapStatus>(initialData?.status || 'backlog');
  const [priority, setPriority] = useState<number>(initialData?.priority || 1);
  const [startDate, setStartDate] = useState(initialData?.startDate || '');
  const [targetDate, setTargetDate] = useState(initialData?.targetDate || '');
  const [sortOrder, setSortOrder] = useState<number>(initialData?.sortOrder ?? 0);
  const [visibility, setVisibility] = useState<'private' | 'unlisted' | 'public'>(
    initialData?.visibility || 'private'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      summary: summary.trim() || null,
      description: description.trim() || null,
      category: category.trim() || null,
      roadmapType: roadmapType.trim() || null,
      status,
      priority,
      startDate: startDate || null,
      targetDate: targetDate || null,
      sortOrder,
      visibility,
    };

    startTransition(async () => {
      let res;
      if (initialData?.id) {
        res = await updateRoadmapItemAction(initialData.id, payload);
      } else {
        res = await createRoadmapItemAction(payload);
      }

      if (!res.success) {
        setError(res.error || 'Failed to save roadmap item.');
      } else {
        router.push('/admin/roadmap');
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/roadmap"
          className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Roadmap</span>
        </Link>
      </div>

      {error && (
        <div className="p-3 text-xs text-rose-300 bg-rose-950/40 border border-rose-800/50 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider text-xs">
          Milestone Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Milestone Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Multi-Cluster Kubernetes Mesh Setup"
              required
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              placeholder="multi-cluster-kubernetes-mesh"
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as RoadmapStatus)}
              className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(parseInt(e.target.value, 10) || 1)}
              className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="1">1 - Low Priority</option>
              <option value="2">2 - Medium-Low</option>
              <option value="3">3 - Normal Priority</option>
              <option value="4">4 - High Priority</option>
              <option value="5">5 - Critical / Urgent</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Summary</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={2}
            placeholder="High level overview of the architectural goal..."
            className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Target Date</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Sort Order</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
              className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Detailed Scope & Objectives
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Technical requirements, architecture goals, and success criteria..."
            className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Link
          href="/admin/roadmap"
          className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isPending || !title.trim()}
          className="inline-flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors shadow-sm shadow-purple-500/20"
        >
          {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          <span>{initialData ? 'Update Milestone' : 'Create Milestone'}</span>
        </button>
      </div>
    </form>
  );
}
