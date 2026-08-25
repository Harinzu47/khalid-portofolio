import type { Metadata } from 'next';
import { RoadmapService } from '@/services/roadmap.service';
import { Target, BookOpen, CheckCircle2, Clock, ListOrdered, Calendar } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Engineering Roadmap & Learning Goals | Khalid',
  description:
    'Public engineering roadmap, architectural milestones, and active learning trajectories in infrastructure, networking, and systems.',
};

export const dynamic = 'force-dynamic';

type RoadmapData = Awaited<ReturnType<typeof RoadmapService.getPublicRoadmap>>;

export default async function RoadmapPage() {
  let data: RoadmapData = { roadmapItems: [], learningGoals: [] };
  try {
    data = await RoadmapService.getPublicRoadmap();
  } catch (err) {
    console.error('Failed to load public roadmap data:', err);
  }

  const { roadmapItems, learningGoals } = data;

  const inProgressItems = roadmapItems.filter((i) => i.status === 'in_progress');
  const plannedItems = roadmapItems.filter((i) => i.status === 'planned');
  const completedItems = roadmapItems.filter((i) => i.status === 'completed');
  const backlogItems = roadmapItems.filter((i) => i.status === 'backlog');

  return (
    <main className="min-h-screen bg-terminal-bg pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-terminal-primary font-mono text-xs">
            <Target className="w-4 h-4" />
            <span>engineering.roadmap</span>
          </div>
          <h1 className="text-3xl font-bold font-mono text-terminal-text-primary tracking-tight">
            Roadmap & Learning Tracks
          </h1>
          <p className="text-sm font-mono text-terminal-text-secondary leading-relaxed max-w-2xl">
            Live tracker of active systems engineering milestones, architecture explorations, and continuous skill acquisition.
          </p>
        </div>

        {/* Active Learning Objectives Section */}
        {learningGoals.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center space-x-2 text-terminal-secondary font-mono text-xs">
              <BookOpen className="w-4 h-4" />
              <span>learning_goals.active</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {learningGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="p-5 rounded-lg border border-terminal-border bg-terminal-surface space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold font-mono text-terminal-text-primary">
                      {goal.title}
                    </h3>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-terminal-bg border border-terminal-border text-terminal-secondary uppercase">
                      {goal.status}
                    </span>
                  </div>

                  {goal.description && (
                    <p className="text-xs font-mono text-terminal-text-secondary leading-relaxed line-clamp-2">
                      {goal.description}
                    </p>
                  )}

                  {/* Progress Bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-terminal-text-muted">Mastery Progress</span>
                      <span className="text-terminal-primary font-bold">{goal.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-terminal-bg rounded-full overflow-hidden border border-terminal-border">
                      <div
                        className="h-full bg-terminal-primary rounded-full transition-all"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Roadmap Milestones Board */}
        <section className="space-y-6">
          <div className="flex items-center space-x-2 text-terminal-primary font-mono text-xs">
            <ListOrdered className="w-4 h-4" />
            <span>architecture_milestones.board</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Backlog Column */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-terminal-border text-xs font-mono">
                <span className="text-terminal-text-secondary font-bold flex items-center space-x-1.5">
                  <ListOrdered className="w-3.5 h-3.5" />
                  <span>Backlog</span>
                </span>
                <span className="text-terminal-text-muted">({backlogItems.length})</span>
              </div>

              <div className="space-y-3">
                {backlogItems.length === 0 ? (
                  <div className="p-4 rounded border border-terminal-border/60 bg-terminal-surface/50 text-xs font-mono text-terminal-text-muted text-center">
                    No backlog items
                  </div>
                ) : (
                  backlogItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-lg border border-terminal-border bg-terminal-surface space-y-2"
                    >
                      <h4 className="text-xs font-bold font-mono text-terminal-text-primary">
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-[11px] font-mono text-terminal-text-secondary leading-relaxed">
                          {item.description}
                        </p>
                      )}
                      {item.category && (
                        <span className="inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-terminal-bg border border-terminal-border text-terminal-text-muted">
                          {item.category}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
            {/* In Progress Column */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-terminal-warning/30 text-xs font-mono">
                <span className="text-terminal-warning font-bold flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>In Progress</span>
                </span>
                <span className="text-terminal-text-muted">({inProgressItems.length})</span>
              </div>

              <div className="space-y-3">
                {inProgressItems.length === 0 ? (
                  <div className="p-4 rounded border border-terminal-border/60 bg-terminal-surface/50 text-xs font-mono text-terminal-text-muted text-center">
                    No active tasks
                  </div>
                ) : (
                  inProgressItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-lg border border-terminal-warning/40 bg-terminal-surface space-y-2"
                    >
                      <h4 className="text-xs font-bold font-mono text-terminal-text-primary">
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-[11px] font-mono text-terminal-text-secondary leading-relaxed">
                          {item.description}
                        </p>
                      )}
                      {item.category && (
                        <span className="inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-terminal-bg border border-terminal-border text-terminal-text-muted">
                          {item.category}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Planned Column */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-terminal-primary/30 text-xs font-mono">
                <span className="text-terminal-primary font-bold flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Planned / Next</span>
                </span>
                <span className="text-terminal-text-muted">({plannedItems.length})</span>
              </div>

              <div className="space-y-3">
                {plannedItems.length === 0 ? (
                  <div className="p-4 rounded border border-terminal-border/60 bg-terminal-surface/50 text-xs font-mono text-terminal-text-muted text-center">
                    No planned tasks
                  </div>
                ) : (
                  plannedItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-lg border border-terminal-border bg-terminal-surface space-y-2"
                    >
                      <h4 className="text-xs font-bold font-mono text-terminal-text-primary">
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-[11px] font-mono text-terminal-text-secondary leading-relaxed">
                          {item.description}
                        </p>
                      )}
                      {item.category && (
                        <span className="inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-terminal-bg border border-terminal-border text-terminal-text-muted">
                          {item.category}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Completed Column */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-terminal-primary/30 text-xs font-mono">
                <span className="text-terminal-primary font-bold flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Shipped / Completed</span>
                </span>
                <span className="text-terminal-text-muted">({completedItems.length})</span>
              </div>

              <div className="space-y-3">
                {completedItems.length === 0 ? (
                  <div className="p-4 rounded border border-terminal-border/60 bg-terminal-surface/50 text-xs font-mono text-terminal-text-muted text-center">
                    No completed milestones
                  </div>
                ) : (
                  completedItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-lg border border-terminal-border bg-terminal-surface/70 space-y-2"
                    >
                      <h4 className="text-xs font-bold font-mono text-terminal-text-primary line-through text-terminal-text-muted">
                        {item.title}
                      </h4>
                      {item.category && (
                        <span className="inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-terminal-bg border border-terminal-border text-terminal-text-muted">
                          {item.category}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
