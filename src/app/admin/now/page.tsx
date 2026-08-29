import Link from 'next/link';
import { requireOwnerSession } from '@/lib/auth';
import { NowService } from '@/services/now.service';
import { NowQuickAddWidget } from './NowQuickAddWidget';
import { CompleteNowButton } from './CompleteNowButton';
import { ArchiveNowButton } from './ArchiveNowButton';
import {
  Compass,
  Plus,
  Edit2,
  Calendar,
  Layers,
  Sparkles,
  History,
} from 'lucide-react';
import type { NowEntryType } from '@/types/dtos';

export const dynamic = 'force-dynamic';

const TYPE_CONFIG: Record<
  NowEntryType,
  { label: string; icon: string; border: string; bg: string }
> = {
  building: { label: 'Building', icon: '🔨', border: 'border-blue-500/30', bg: 'bg-blue-500/10' },
  learning: { label: 'Learning', icon: '📚', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
  managing: { label: 'Managing', icon: '💼', border: 'border-purple-500/30', bg: 'bg-purple-500/10' },
  researching: { label: 'Researching', icon: '🔬', border: 'border-amber-500/30', bg: 'bg-amber-500/10' },
  reading: { label: 'Reading', icon: '📖', border: 'border-teal-500/30', bg: 'bg-teal-500/10' },
  watching: { label: 'Watching', icon: '📺', border: 'border-indigo-500/30', bg: 'bg-indigo-500/10' },
  exploring: { label: 'Exploring', icon: '🧭', border: 'border-cyan-500/30', bg: 'bg-cyan-500/10' },
  using: { label: 'Using', icon: '⚡', border: 'border-rose-500/30', bg: 'bg-rose-500/10' },
};

export default async function AdminNowPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await requireOwnerSession();
  const { tab = 'current' } = await searchParams;

  const currentOverview = await NowService.getCurrentNowEntries(session.userId);
  const allEntriesPaginated = await NowService.getAdminNowEntries(session.userId, { pageSize: 100 });

  const activeTypes = (Object.keys(currentOverview.groupedByType) as NowEntryType[]).filter(
    (type) => currentOverview.groupedByType[type].length > 0
  );

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-6 h-6 text-blue-400" />
            <h1 className="text-xl font-bold text-slate-100">Now Workspace</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Temporal attention and current engineering focus — What I am building, learning, and exploring right now.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/now/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors shadow-sm shadow-blue-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Detailed Entry</span>
          </Link>
        </div>
      </div>

      {/* 2. Low-friction Quick Add */}
      <NowQuickAddWidget />

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <Link
          href="/admin/now?tab=current"
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            tab === 'current'
              ? 'bg-slate-800 text-blue-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Current Focus ({currentOverview.totalCurrent})</span>
        </Link>
        <Link
          href="/admin/now?tab=history"
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            tab === 'history'
              ? 'bg-slate-800 text-blue-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Timeline History ({allEntriesPaginated.meta.totalRecords})</span>
        </Link>
      </div>

      {/* 4. Tab Content */}
      {tab === 'current' ? (
        <div className="space-y-6">
          {activeTypes.length === 0 ? (
            <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-xl">
              <Compass className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-300">No active focus entries</p>
              <p className="text-xs text-slate-500 mt-1">
                Use the quick capture above to log what you are currently building or learning.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeTypes.map((type) => {
                const config = TYPE_CONFIG[type];
                const items = currentOverview.groupedByType[type];

                return (
                  <div
                    key={type}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{config.icon}</span>
                        <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider text-xs">
                          {config.label} ({items.length})
                        </h2>
                      </div>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${config.border} ${config.bg} text-slate-300`}
                      >
                        Active
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="bg-slate-950 border border-slate-800/80 hover:border-slate-700 rounded-lg p-3 transition-colors group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1 flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-100 truncate">
                                {item.title}
                              </p>
                              {item.description && (
                                <p className="text-xs text-slate-400 line-clamp-2">
                                  {item.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <CompleteNowButton id={item.id} title={item.title} />
                              <Link
                                href={`/admin/now/${item.id}/edit`}
                                className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-950/30 rounded-md transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </Link>
                              <ArchiveNowButton id={item.id} title={item.title} />
                            </div>
                          </div>

                          {/* Related Junction Badges */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-2 border-t border-slate-900 text-[10px] text-slate-400">
                            {item.startedAt && (
                              <span className="flex items-center gap-1 text-slate-500">
                                <Calendar className="w-3 h-3" />
                                {item.startedAt}
                              </span>
                            )}
                            {item.projectNames.map((pn) => (
                              <span
                                key={pn}
                                className="px-1.5 py-0.5 bg-blue-950/50 text-blue-300 border border-blue-800/40 rounded"
                              >
                                🚀 {pn}
                              </span>
                            ))}
                            {item.learningPathNames.map((lpn) => (
                              <span
                                key={lpn}
                                className="px-1.5 py-0.5 bg-emerald-950/50 text-emerald-300 border border-emerald-800/40 rounded"
                              >
                                📚 {lpn}
                              </span>
                            ))}
                            {item.roadmapItemNames.map((rn) => (
                              <span
                                key={rn}
                                className="px-1.5 py-0.5 bg-purple-950/50 text-purple-300 border border-purple-800/40 rounded"
                              >
                                🗺️ {rn}
                              </span>
                            ))}
                            {item.technologyNames.map((tn) => (
                              <span
                                key={tn}
                                className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded"
                              >
                                {tn}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* History Timeline Tab */
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Focus Title</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Timeframe</th>
                  <th className="py-3 px-4">Relations</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {allEntriesPaginated.data.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-300 capitalize">
                        {TYPE_CONFIG[entry.entryType]?.icon} {entry.entryType}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-200">{entry.title}</p>
                      {entry.description && (
                        <p className="text-slate-500 text-[11px] truncate max-w-xs">
                          {entry.description}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          entry.isCurrent
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : entry.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {entry.isCurrent ? 'Current' : entry.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {entry.startedAt ? entry.startedAt : '—'}
                      {entry.endedAt ? ` → ${entry.endedAt}` : entry.isCurrent ? ' (Ongoing)' : ''}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {entry.projectNames.slice(0, 1).map((pn) => (
                          <span
                            key={pn}
                            className="px-1.5 py-0.5 bg-blue-950/40 text-blue-300 rounded text-[10px]"
                          >
                            {pn}
                          </span>
                        ))}
                        {entry.learningPathNames.slice(0, 1).map((lpn) => (
                          <span
                            key={lpn}
                            className="px-1.5 py-0.5 bg-emerald-950/40 text-emerald-300 rounded text-[10px]"
                          >
                            {lpn}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        {entry.isCurrent && (
                          <CompleteNowButton id={entry.id} title={entry.title} />
                        )}
                        <Link
                          href={`/admin/now/${entry.id}/edit`}
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-950/30 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <ArchiveNowButton id={entry.id} title={entry.title} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
