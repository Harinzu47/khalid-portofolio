import Link from 'next/link';
import {
  Hammer,
  GraduationCap,
  Briefcase,
  Search,
  BookOpen,
  Eye,
  Compass,
  Laptop,
  CheckCircle2,
  ExternalLink,
  Clock,
} from 'lucide-react';
import type { NowPublicDTO, NowEntryPublicDTO, NowCategory } from '@/types/dtos/public-read-models.dto';

interface NowViewProps {
  nowData: NowPublicDTO;
}

const CATEGORY_META: Record<
  NowCategory,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  BUILDING: { label: 'BUILDING & ENGINEERING', icon: Hammer },
  LEARNING: { label: 'LEARNING & CURRICULUM', icon: GraduationCap },
  MANAGING: { label: 'OPERATIONS & LEADERSHIP', icon: Briefcase },
  RESEARCHING: { label: 'SYSTEMS RESEARCH', icon: Search },
  READING: { label: 'TECHNICAL READING', icon: BookOpen },
  WATCHING: { label: 'TALKS & LECTURES', icon: Eye },
  EXPLORING: { label: 'EXPLORATION & EXPERIMENTS', icon: Compass },
  USING: { label: 'STACK & TOOLS IN USE', icon: Laptop },
};

function NowCard({ item }: { item: NowEntryPublicDTO }) {
  const Icon = CATEGORY_META[item.category]?.icon || Compass;

  return (
    <article className="border border-terminal-border bg-terminal-surface/30 p-6 hover:border-terminal-primary/60 transition-colors space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-terminal-primary px-1.5 py-0.5 border border-terminal-primary/30 bg-terminal-primary/5 flex items-center gap-1">
          <Icon className="w-3 h-3" />
          <span>{CATEGORY_META[item.category]?.label || item.category}</span>
        </span>

        {typeof item.progressPercent === 'number' && (
          <span className="font-mono text-xs text-terminal-text-muted">
            {item.progressPercent}% PROGRESS
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-lg md:text-xl font-bold text-terminal-text-primary">
        {item.title}
      </h3>

      {/* Description */}
      {item.description && (
        <p className="text-sm text-terminal-text-secondary leading-relaxed">
          {item.description}
        </p>
      )}

      {/* Linked Project / Context Link */}
      {(item.linkedProject || item.contextUrl) && (
        <div className="pt-3 border-t border-terminal-border/50 font-mono text-xs flex flex-wrap items-center gap-3">
          {item.linkedProject && (
            <Link
              href={`/work/${item.linkedProject.slug}`}
              className="text-terminal-primary hover:underline inline-flex items-center gap-1"
            >
              <span>PROJECT: {item.linkedProject.title}</span>
              <span>&rarr;</span>
            </Link>
          )}

          {item.contextUrl && (
            <a
              href={item.contextUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-terminal-secondary hover:underline inline-flex items-center gap-1"
            >
              <span>{item.contextTitle || 'REFERENCE LINK'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}
    </article>
  );
}

export function NowView({ nowData }: NowViewProps) {
  const activeCategories = Object.keys(nowData.categories) as NowCategory[];

  return (
    <div className="space-y-16">
      {/* Active Attention Streams */}
      {activeCategories.length === 0 && nowData.activeEntries.length === 0 ? (
        <div className="border border-dashed border-terminal-border p-12 text-center bg-terminal-surface/20">
          <p className="text-terminal-text-secondary text-sm font-mono">
            [ CURRENTLY RE-INDEXING ATTENTION QUEUES ]
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {nowData.activeEntries.map((item, idx) => (
            <NowCard key={idx} item={item} />
          ))}
        </div>
      )}

      {/* Bounded Recent Completed Context (Amendment 11) */}
      {nowData.recentCompletedEntries.length > 0 && (
        <section className="border-t border-terminal-border pt-12 space-y-6">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-terminal-primary" />
            <h2 className="font-mono text-xs uppercase tracking-widest text-terminal-text-muted">
              RECENTLY COMPLETED OBJECTIVES (PAST 30 DAYS)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nowData.recentCompletedEntries.map((item, idx) => (
              <div
                key={idx}
                className="border border-terminal-border/60 bg-terminal-surface/20 p-5 space-y-2 opacity-80 hover:opacity-100 transition-opacity"
              >
                <div className="flex items-center justify-between text-xs font-mono text-terminal-text-muted">
                  <span className="uppercase text-[10px]">[{item.category}]</span>
                  {item.completedAt && (
                    <span>{new Date(item.completedAt).toLocaleDateString()}</span>
                  )}
                </div>
                <h3 className="font-semibold text-terminal-text-primary text-sm line-through decoration-terminal-primary/40">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-xs text-terminal-text-secondary line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
