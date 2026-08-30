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
    <article className="border border-border-subtle bg-surface-container/30 p-6 md:p-8 hover:border-text-primary transition-colors space-y-4 flex flex-col justify-between">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 font-mono">
          <span className="text-[10px] uppercase tracking-wider text-text-primary px-2 py-0.5 border border-border-subtle bg-surface-container-high font-semibold flex items-center gap-1.5">
            <Icon className="w-3 h-3 text-text-secondary" />
            <span>{CATEGORY_META[item.category]?.label || item.category}</span>
          </span>

          {typeof item.progressPercent === 'number' && (
            <span className="text-xs text-text-secondary">
              {item.progressPercent}% PROGRESS
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-headline text-lg sm:text-xl font-bold text-text-primary">
          {item.title}
        </h3>

        {/* Description */}
        {item.description && (
          <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
            {item.description}
          </p>
        )}
      </div>

      {/* Linked Project / Context Link */}
      {(item.linkedProject || item.contextUrl) && (
        <div className="pt-4 border-t border-border-subtle font-mono text-xs flex flex-wrap items-center gap-4">
          {item.linkedProject && (
            <Link
              href={`/work/${item.linkedProject.slug}`}
              className="text-text-primary font-semibold hover:underline inline-flex items-center gap-1"
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
              className="text-text-secondary hover:text-text-primary hover:underline inline-flex items-center gap-1"
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
    <div className="space-y-16 md:space-y-20">
      {/* Active Attention Streams */}
      {activeCategories.length === 0 && nowData.activeEntries.length === 0 ? (
        <div className="border border-border-subtle p-12 text-center bg-surface-container/30">
          <p className="text-text-secondary text-sm font-mono uppercase tracking-widest">
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

      {/* Bounded Recent Completed Context */}
      {nowData.recentCompletedEntries.length > 0 && (
        <section className="border-t border-border-subtle pt-12 space-y-6">
          <div className="flex items-center gap-2 border-b border-border-subtle pb-4">
            <CheckCircle2 className="w-4 h-4 text-text-primary" />
            <h2 className="font-mono text-xs uppercase tracking-widest text-text-secondary">
              RECENTLY COMPLETED OBJECTIVES (PAST 30 DAYS)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nowData.recentCompletedEntries.map((item, idx) => (
              <div
                key={idx}
                className="border border-border-subtle bg-surface-container/30 p-5 space-y-2"
              >
                <div className="flex items-center justify-between text-xs font-mono text-text-secondary">
                  <span className="uppercase text-[10px] font-semibold text-text-primary">[{item.category}]</span>
                  {item.completedAt && (
                    <span>{new Date(item.completedAt).toLocaleDateString()}</span>
                  )}
                </div>
                <h3 className="font-headline font-bold text-text-primary text-sm line-through text-text-secondary">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-xs text-text-secondary line-clamp-2">
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
