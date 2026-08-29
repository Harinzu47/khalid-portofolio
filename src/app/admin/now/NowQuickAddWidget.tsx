'use client';

import { useState, useTransition } from 'react';
import { quickAddNowAction } from '@/actions/now';
import { Zap, Plus, Loader2 } from 'lucide-react';
import type { NowEntryType } from '@/types/dtos';

const ENTRY_TYPES: { value: NowEntryType; label: string; icon: string }[] = [
  { value: 'building', label: 'Building', icon: '🔨' },
  { value: 'learning', label: 'Learning', icon: '📚' },
  { value: 'managing', label: 'Managing', icon: '💼' },
  { value: 'researching', label: 'Researching', icon: '🔬' },
  { value: 'reading', label: 'Reading', icon: '📖' },
  { value: 'watching', label: 'Watching', icon: '📺' },
  { value: 'exploring', label: 'Exploring', icon: '🧭' },
  { value: 'using', label: 'Using', icon: '⚡' },
];

export function NowQuickAddWidget() {
  const [entryType, setEntryType] = useState<NowEntryType>('building');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setError(null);
    startTransition(async () => {
      const res = await quickAddNowAction({
        entryType,
        title: title.trim(),
        description: description.trim() || undefined,
        projectIds: [],
        learningPathIds: [],
        domainIds: [],
        technologyIds: [],
      });

      if (!res.success) {
        setError(res.error || 'Failed to add entry.');
      } else {
        setTitle('');
        setDescription('');
        setIsExpanded(false);
      }
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Quick Capture Focus</span>
          </div>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            {isExpanded ? 'Less options' : '+ Description'}
          </button>
        </div>

        {error && (
          <div className="p-2.5 text-xs text-rose-300 bg-rose-950/40 border border-rose-800/50 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {ENTRY_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setEntryType(t.value)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                entryType === t.value
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-slate-800/70 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <span className="mr-1">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={`What are you currently ${entryType}?...`}
            disabled={isPending}
            className="flex-1 px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isPending || !title.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors shrink-0"
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            <span>Capture</span>
          </button>
        </div>

        {isExpanded && (
          <div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional notes, current milestone or context..."
              rows={2}
              disabled={isPending}
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </form>
    </div>
  );
}
