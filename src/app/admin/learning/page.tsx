import Link from 'next/link';
import { requireOwnerSession } from '@/lib/auth';
import { LearningOverviewService } from '@/services/learning-overview.service';
import {
  GraduationCap,
  BookOpen,
  Compass,
  MapPin,
  Award,
  Plus,
  ArrowRight,
  Sparkles,
  Calendar,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminLearningOverviewPage() {
  const session = await requireOwnerSession();
  const overview = await LearningOverviewService.getOverview(session.userId);

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl font-bold text-slate-100">Learning & Growth Hub</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Structured skill progressions, active focus journeys, roadmap milestones, and verified credentials.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/learning/paths/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors shadow-sm shadow-emerald-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Learning Path</span>
          </Link>
          <Link
            href="/admin/certificates/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors border border-slate-700"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Certificate</span>
          </Link>
        </div>
      </div>

      {/* 2. Real Metrics Cards (Amendment 17) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Learning Paths</span>
            <BookOpen className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-slate-100">{overview.totalLearningPaths}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Current Now Focus</span>
            <Compass className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-slate-100">{overview.totalCurrentNow}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Roadmap Milestones</span>
            <MapPin className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-slate-100">{overview.totalRoadmapItems}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Certificates</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-slate-100">{overview.totalCertificates}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3. Left 2 Columns: Active Learning Paths */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider text-xs flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Active Learning Paths ({overview.activeLearningPaths.length})</span>
            </h2>
            <Link
              href="/admin/learning/paths"
              className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 font-medium"
            >
              <span>View All Paths</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {overview.activeLearningPaths.length === 0 ? (
            <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl">
              <p className="text-xs text-slate-400">No active learning paths currently in progress.</p>
              <Link
                href="/admin/learning/paths/new"
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Your First Path</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {overview.activeLearningPaths.map((path) => (
                <div
                  key={path.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <Link
                        href={`/admin/learning/paths/${path.id}/edit`}
                        className="text-sm font-semibold text-slate-100 hover:text-emerald-400 transition-colors"
                      >
                        {path.title}
                      </Link>
                      {path.summary && (
                        <p className="text-xs text-slate-400 line-clamp-2">{path.summary}</p>
                      )}
                    </div>
                    {path.progressMode === 'manual' && path.progressValue !== null && (
                      <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 rounded-lg shrink-0">
                        {path.progressValue}%
                      </span>
                    )}
                  </div>

                  {path.currentFocus && (
                    <div className="flex items-center gap-2 p-2 bg-slate-950 border border-slate-800/80 rounded-lg text-xs text-slate-300">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="font-medium text-slate-400">Current Focus:</span>
                      <span className="truncate">{path.currentFocus}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {path.skills.map((s) => (
                        <span
                          key={s.id}
                          className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px]"
                        >
                          {s.name}
                        </span>
                      ))}
                      {path.technologies.map((t) => (
                        <span
                          key={t.id}
                          className="px-1.5 py-0.5 bg-blue-950/40 text-blue-300 border border-blue-800/30 rounded text-[10px]"
                        >
                          {t.name}
                        </span>
                      ))}
                    </div>

                    <Link
                      href={`/admin/learning/paths/${path.id}/edit`}
                      className="text-emerald-400 hover:text-emerald-300 text-xs font-medium"
                    >
                      Manage Path →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Right Column: Current Learning Focus + Roadmap Preview */}
        <div className="space-y-6">
          {/* Current Learning NowEntries */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider text-xs flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-400" />
                <span>Learning Focus Now</span>
              </h2>
              <Link
                href="/admin/now"
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 font-medium"
              >
                <span>Now Hub</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {overview.currentLearningNowEntries.length === 0 ? (
              <div className="p-4 text-center bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-500">
                No active learning entries in Now.
              </div>
            ) : (
              <div className="space-y-2">
                {overview.currentLearningNowEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5"
                  >
                    <p className="text-xs font-medium text-slate-200">{entry.title}</p>
                    {entry.description && (
                      <p className="text-[11px] text-slate-400 line-clamp-2">{entry.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Roadmap Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider text-xs flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-400" />
                <span>Upcoming Milestones</span>
              </h2>
              <Link
                href="/admin/roadmap"
                className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 font-medium"
              >
                <span>Roadmap</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {overview.upcomingRoadmapItems.length === 0 ? (
              <div className="p-4 text-center bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-500">
                No roadmap items found.
              </div>
            ) : (
              <div className="space-y-2">
                {overview.upcomingRoadmapItems.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-2"
                  >
                    <div className="space-y-0.5 truncate">
                      <p className="text-xs font-medium text-slate-200 truncate">{item.title}</p>
                      {item.targetDate && (
                        <p className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5" />
                          Target: {item.targetDate}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full shrink-0 ${
                        item.status === 'in_progress'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
