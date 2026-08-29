import Link from 'next/link';
import { ExternalLink, Award, Layers, Cpu, Wrench, FileText, CheckCircle2 } from 'lucide-react';
import type { ExpertiseReadModelDTO, ExpertiseItemDTO } from '@/types/dtos/public-read-models.dto';

interface ExpertiseViewProps {
  expertise: ExpertiseReadModelDTO;
}

function CapabilityCard({ item }: { item: ExpertiseItemDTO }) {
  return (
    <article className="border border-terminal-border bg-terminal-surface/30 p-6 md:p-7 hover:border-terminal-primary/60 transition-colors flex flex-col justify-between">
      <div>
        {/* Category & Evidence Counter */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="font-mono text-[10px] uppercase tracking-wider text-terminal-primary px-1.5 py-0.5 border border-terminal-primary/30 bg-terminal-primary/5">
            {item.category || item.type}
          </span>
          <span className="font-mono text-[11px] text-terminal-text-muted">
            [{item.evidenceCount.total} EVIDENCE ARTIFACTS]
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg md:text-xl font-bold text-terminal-text-primary mb-2">
          {item.name}
        </h3>

        {/* Description */}
        {item.description && (
          <p className="text-xs md:text-sm text-terminal-text-secondary leading-relaxed mb-5">
            {item.description}
          </p>
        )}
      </div>

      {/* Evidence Breakdown */}
      <div className="space-y-4 pt-4 border-t border-terminal-border/50 font-mono text-xs">
        {/* Representative Projects */}
        {item.representativeProjects.length > 0 && (
          <div>
            <span className="text-terminal-text-muted block text-[10px] uppercase mb-1">
              PROVEN IN PRODUCTION PROJECTS:
            </span>
            <div className="flex flex-wrap gap-2">
              {item.representativeProjects.map((p) => (
                <Link
                  key={p.slug}
                  href={`/work/${p.slug}`}
                  className="text-terminal-primary hover:underline text-xs inline-flex items-center gap-0.5"
                >
                  <span>{p.title}</span>
                  <span>&rarr;</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Representative Knowledge */}
        {item.representativeKnowledge.length > 0 && (
          <div>
            <span className="text-terminal-text-muted block text-[10px] uppercase mb-1">
              DOCUMENTED KNOWLEDGE:
            </span>
            <div className="flex flex-wrap gap-2">
              {item.representativeKnowledge.map((k) => (
                <Link
                  key={k.slug}
                  href={k.href}
                  className="text-terminal-secondary hover:underline text-xs inline-flex items-center gap-0.5"
                >
                  <span>{k.title}</span>
                  <span>&rarr;</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Linked Certificates */}
        {item.linkedCertificates.length > 0 && (
          <div>
            <span className="text-terminal-text-muted block text-[10px] uppercase mb-1">
              VERIFIED CREDENTIALS:
            </span>
            <div className="space-y-1">
              {item.linkedCertificates.map((c, idx) => (
                <div key={idx} className="flex items-center justify-between text-[11px] text-terminal-text-secondary">
                  <span className="flex items-center gap-1">
                    <Award className="w-3 h-3 text-terminal-primary" />
                    <span>{c.name} ({c.issuer})</span>
                  </span>
                  {c.verificationUrl && (
                    <a
                      href={c.verificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-terminal-text-muted hover:text-terminal-primary"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export function ExpertiseView({ expertise }: ExpertiseViewProps) {
  return (
    <div className="space-y-16">
      {/* 1. Domain Pillars */}
      {expertise.domains.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-terminal-primary" />
            <h2 className="text-xl md:text-2xl font-bold text-terminal-text-primary">
              Domain Pillars & Systems Specialization
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {expertise.domains.map((d) => (
              <CapabilityCard key={d.slug} item={d} />
            ))}
          </div>
        </section>
      )}

      {/* 2. Core Technologies */}
      {expertise.technologies.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Cpu className="w-5 h-5 text-terminal-secondary" />
            <h2 className="text-xl md:text-2xl font-bold text-terminal-text-primary">
              Core Technologies & Engineering Platforms
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {expertise.technologies.map((t) => (
              <CapabilityCard key={t.slug} item={t} />
            ))}
          </div>
        </section>
      )}

      {/* 3. Competencies & Skills */}
      {expertise.skills.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Wrench className="w-5 h-5 text-terminal-primary" />
            <h2 className="text-xl md:text-2xl font-bold text-terminal-text-primary">
              Engineering Competencies & Methodologies
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {expertise.skills.map((s) => (
              <CapabilityCard key={s.slug} item={s} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
