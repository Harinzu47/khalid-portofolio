import Link from 'next/link';
import { requireOwnerSession } from '@/lib/auth';
import { RoadmapService } from '@/services/roadmap.service';
import { ArchiveRoadmapButton } from './ArchiveRoadmapButton';
import { Plus, Edit2, MapPin, Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminRoadmapPage() {
  const session = await requireOwnerSession();
  const paginated = await RoadmapService.getAdminRoadmapItems(session.userId, { pageSize: 100 });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-6 h-6 text-purple-400" />
            <h1 className="text-xl font-bold text-slate-100">Engineering Roadmap</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Where I am going — Strategic architecture milestones and development tracks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/learning-goals"
            className="inline-flex items-center px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors border border-slate-700"
          >
            <span>Legacy Goals</span>
          </Link>
          <Link
            href="/admin/roadmap/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium rounded-lg transition-colors shadow-sm shadow-purple-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Milestone</span>
          </Link>
        </div>
      </div>

      {/* Roadmap Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Milestone</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Target Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginated.data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No roadmap milestones registered.
                  </td>
                </tr>
              ) : (
                paginated.data.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-100">{item.title}</p>
                      {item.summary && (
                        <p className="text-slate-500 text-[11px] truncate max-w-sm">
                          {item.summary}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px]">
                        {item.category || 'General'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          item.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : item.status === 'in_progress'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : item.status === 'planned'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">P{item.priority}</td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {item.targetDate ? (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {item.targetDate}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Link
                          href={`/admin/roadmap/${item.id}/edit`}
                          className="p-1.5 text-slate-400 hover:text-purple-400 hover:bg-purple-950/30 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <ArchiveRoadmapButton id={item.id} title={item.title} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
