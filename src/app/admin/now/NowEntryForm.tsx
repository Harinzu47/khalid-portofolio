'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createNowEntryAction, updateNowEntryAction } from '@/actions/now';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { NowEntryEditorDTO, NowEntryType, NowEntryStatus } from '@/types/dtos';

const ENTRY_TYPES: { value: NowEntryType; label: string }[] = [
  { value: 'building', label: 'Building' },
  { value: 'learning', label: 'Learning' },
  { value: 'managing', label: 'Managing' },
  { value: 'researching', label: 'Researching' },
  { value: 'reading', label: 'Reading' },
  { value: 'watching', label: 'Watching' },
  { value: 'exploring', label: 'Exploring' },
  { value: 'using', label: 'Using' },
];

const STATUS_OPTIONS: { value: NowEntryStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'idle', label: 'Idle' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

interface NowEntryFormProps {
  initialData?: NowEntryEditorDTO;
  projectOptions: { id: string; name: string }[];
  learningPathOptions: { id: string; name: string }[];
  roadmapOptions: { id: string; name: string }[];
  domainOptions: { id: string; name: string }[];
  technologyOptions: { id: string; name: string }[];
}

export function NowEntryForm({
  initialData,
  projectOptions,
  learningPathOptions,
  roadmapOptions,
  domainOptions,
  technologyOptions,
}: NowEntryFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [entryType, setEntryType] = useState<NowEntryType>(initialData?.entryType || 'building');
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [status, setStatus] = useState<NowEntryStatus>(initialData?.status || 'active');
  const [isCurrent, setIsCurrent] = useState<boolean>(initialData?.isCurrent ?? true);
  const [startedAt, setStartedAt] = useState(initialData?.startedAt || '');
  const [endedAt, setEndedAt] = useState(initialData?.endedAt || '');
  const [sortOrder, setSortOrder] = useState<number>(initialData?.sortOrder ?? 0);
  const [visibility, setVisibility] = useState<'private' | 'unlisted' | 'public'>(
    initialData?.visibility || 'private'
  );

  const [projectIds, setProjectIds] = useState<string[]>(initialData?.projectIds || []);
  const [learningPathIds, setLearningPathIds] = useState<string[]>(
    initialData?.learningPathIds || []
  );
  const [roadmapIds, setRoadmapIds] = useState<string[]>(initialData?.roadmapIds || []);
  const [domainIds, setDomainIds] = useState<string[]>(initialData?.domainIds || []);
  const [technologyIds, setTechnologyIds] = useState<string[]>(initialData?.technologyIds || []);

  const handleStatusChange = (newStatus: NowEntryStatus) => {
    setStatus(newStatus);
    // Invariant: completed or archived entries cannot be current (Amendment 3)
    if (newStatus === 'completed' || newStatus === 'archived') {
      setIsCurrent(false);
    }
  };

  const handleIsCurrentChange = (newIsCurrent: boolean) => {
    setIsCurrent(newIsCurrent);
    if (newIsCurrent && (status === 'completed' || status === 'archived')) {
      setStatus('active');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload = {
      entryType,
      title: title.trim(),
      description: description.trim() || null,
      status,
      isCurrent,
      startedAt: startedAt || null,
      endedAt: endedAt || null,
      sortOrder,
      visibility,
      projectIds,
      learningPathIds,
      roadmapIds,
      domainIds,
      technologyIds,
    };

    startTransition(async () => {
      let res;
      if (initialData?.id) {
        res = await updateNowEntryAction(initialData.id, payload);
      } else {
        res = await createNowEntryAction(payload);
      }

      if (!res.success) {
        setError(res.error || 'Failed to save now entry.');
      } else {
        router.push('/admin/now');
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/now"
          className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Now Workspace</span>
        </Link>
      </div>

      {error && (
        <div className="p-3 text-xs text-rose-300 bg-rose-950/40 border border-rose-800/50 rounded-lg">
          {error}
        </div>
      )}

      {/* 1. Core Focus Data */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider text-xs">
          Focus Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Focus Type <span className="text-rose-400">*</span>
            </label>
            <select
              value={entryType}
              onChange={(e) => setEntryType(e.target.value as NowEntryType)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ENTRY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Lifecycle Status <span className="text-rose-400">*</span>
            </label>
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value as NowEntryStatus)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Focus Title <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Implementing Knowledge Graph & Semantic Edges"
            required
            className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Description & Milestones
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Optional context, current goals, or specific tasks being tackled..."
            className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Started Date</label>
            <input
              type="date"
              value={startedAt}
              onChange={(e) => setStartedAt(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Ended Date</label>
            <input
              type="date"
              value={endedAt}
              onChange={(e) => setEndedAt(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Sort Priority</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
              className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-6 pt-2 border-t border-slate-800">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isCurrent}
              onChange={(e) => handleIsCurrentChange(e.target.checked)}
              disabled={status === 'completed' || status === 'archived'}
              className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <span className="text-xs font-medium text-slate-200">Is Currently Active Focus</span>
          </label>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Visibility:</span>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as any)}
              className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-slate-100"
            >
              <option value="private">Private (Default)</option>
              <option value="unlisted">Unlisted</option>
              <option value="public">Public</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Structural Relationships */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider text-xs">
          Structural Relationships
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Linked Projects */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Related Projects
            </label>
            <select
              multiple
              value={projectIds}
              onChange={(e) =>
                setProjectIds(Array.from(e.target.selectedOptions, (option) => option.value))
              }
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 h-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {projectOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Hold Ctrl/Cmd to select multiple
            </span>
          </div>

          {/* Linked Learning Paths */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Related Learning Paths
            </label>
            <select
              multiple
              value={learningPathIds}
              onChange={(e) =>
                setLearningPathIds(Array.from(e.target.selectedOptions, (option) => option.value))
              }
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 h-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {learningPathOptions.map((lp) => (
                <option key={lp.id} value={lp.id}>
                  {lp.name}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Hold Ctrl/Cmd to select multiple
            </span>
          </div>

          {/* Linked Roadmaps */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Related Roadmap Milestones
            </label>
            <select
              multiple
              value={roadmapIds}
              onChange={(e) =>
                setRoadmapIds(Array.from(e.target.selectedOptions, (option) => option.value))
              }
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 h-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {roadmapOptions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Linked Technologies */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Related Technologies
            </label>
            <select
              multiple
              value={technologyIds}
              onChange={(e) =>
                setTechnologyIds(Array.from(e.target.selectedOptions, (option) => option.value))
              }
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 h-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          href="/admin/now"
          className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isPending || !title.trim()}
          className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors shadow-sm shadow-blue-500/20"
        >
          {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          <span>{initialData ? 'Update Focus Entry' : 'Create Focus Entry'}</span>
        </button>
      </div>
    </form>
  );
}
