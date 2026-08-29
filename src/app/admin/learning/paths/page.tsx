import Link from 'next/link';
import { requireOwnerSession } from '@/lib/auth';
import { LearningPathService } from '@/services/learning-path.service';
import { ArchiveLearningPathButton } from './ArchiveLearningPathButton';
import {
  BookOpen,
  Plus,
  Edit2,
  Calendar,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminLearningPathsPage() {
  const session = await requireOwnerSession();
  const paginated = await LearningPathService.getAdminLearningPaths(session.userId, { pageSize: 100 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/learning"
              className="text-slate-400 hover:text-slate-200 transition-colors p-1"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <BookOpen className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl font-bold text-slate-100">Learning Paths</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Structured skill progressions and domain study curricula.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/learning/paths/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors shadow-sm shadow-emerald-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Learning Path</span>
          </Link>
        </div>
      </div>

      {/* Listing Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Title / Focus</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Progress</th>
                <th className="py-3 px-4">Timeframe</th>
                <th className="py-3 px-4">Taxonomy</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginated.data.map((path) => (
                <tr key={path.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-medium text-slate-100">{path.title}</p>
                    {path.currentFocus && (
                      <p className="text-emerald-400 text-[11px] flex items-center gap-1 mt-0.5">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>Focus: {path.currentFocus}</span>
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        path.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : path.status === 'completed'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : path.status === 'paused'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {path.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {path.progressMode === 'manual' && path.progressValue !== null ? (
                      <span className="font-semibold text-slate-200">
                        {path.progressValue}% <span className="text-[10px] text-slate-500 font-normal">(manual)</span>
                      </span>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[11px]">
                    {path.startedAt || '—'}
                    {path.completedAt ? ` → ${path.completedAt}` : path.status === 'active' ? ' (In progress)' : ''}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {path.skills.slice(0, 2).map((s) => (
                        <span
                          key={s.id}
                          className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px]"
                        >
                          {s.name}
                        </span>
                      ))}
                      {path.technologies.slice(0, 2).map((t) => (
                        <span
                          key={t.id}
                          className="px-1.5 py-0.5 bg-blue-950/40 text-blue-300 rounded text-[10px]"
                        >
                          {t.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <Link
                        href={`/admin/learning/paths/${path.id}/edit`}
                        className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-950/30 rounded-md transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Link>
                      <ArchiveLearningPathButton id={path.id} title={path.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
