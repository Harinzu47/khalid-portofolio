import Link from 'next/link';
import { ExternalLink, Award, Layers, Cpu, Wrench } from 'lucide-react';
import type { ExpertiseReadModelDTO, ExpertiseItemDTO } from '@/types/dtos/public-read-models.dto';

interface ExpertiseViewProps {
  expertise: ExpertiseReadModelDTO;
}

function CapabilityCard({ item }: { item: ExpertiseItemDTO }) {
  return (
    <article className="border border-border-subtle bg-surface-container/30 p-6 md:p-8 hover:border-text-primary transition-colors flex flex-col justify-between space-y-6">
      <div>
        {/* Category & Evidence Counter */}
        <div className="flex items-center justify-between gap-2 mb-3 font-mono">
          <span className="text-[10px] uppercase tracking-wider text-text-primary px-2 py-0.5 border border-border-subtle bg-surface-container-high font-semibold">
            {item.category || item.type}
          </span>
          <span className="text-xs text-text-secondary">
            [{item.evidenceCount.total} ARTIFACTS]
          </span>
        </div>

        {/* Title */}
        <h3 className="font-headline text-xl font-bold text-text-primary mb-2">
          {item.name}
        </h3>

        {/* Description */}
        {item.description && (
          <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
            {item.description}
          </p>
        )}
      </div>

      {/* Evidence Breakdown */}
      <div className="space-y-4 pt-4 border-t border-border-subtle font-mono text-xs">
        {/* Representative Projects */}
        {item.representativeProjects.length > 0 && (
          <div>
            <span className="text-text-secondary block text-[10px] uppercase tracking-wider mb-1">
              PROVEN IN PRODUCTION:
            </span>
            <div className="flex flex-wrap gap-2">
              {item.representativeProjects.map((p) => (
                <Link
                  key={p.slug}
                  href={`/work/${p.slug}`}
                  className="text-text-primary font-medium hover:underline text-xs inline-flex items-center gap-0.5"
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
            <span className="text-text-secondary block text-[10px] uppercase tracking-wider mb-1">
              DOCUMENTED KNOWLEDGE:
            </span>
            <div className="flex flex-wrap gap-2">
              {item.representativeKnowledge.map((k) => (
                <Link
                  key={k.slug}
                  href={k.href}
                  className="text-text-secondary hover:text-text-primary hover:underline text-xs inline-flex items-center gap-0.5"
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
            <span className="text-text-secondary block text-[10px] uppercase tracking-wider mb-1">
              VERIFIED CREDENTIALS:
            </span>
            <div className="space-y-1">
              {item.linkedCertificates.map((c, idx) => (
                <div key={idx} className="flex items-center justify-between text-[11px] text-text-secondary">
                  <span className="flex items-center gap-1.5 text-text-primary">
                    <Award className="w-3.5 h-3.5 text-text-secondary" />
                    <span>{c.name} ({c.issuer})</span>
                  </span>
                  {c.verificationUrl && (
                    <a
                      href={c.verificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-secondary hover:text-text-primary"
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
    <div className="space-y-16 md:space-y-20">
      {/* 1. Domain Pillars */}
      {expertise.domains.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border-subtle pb-4">
            <Layers className="w-5 h-5 text-text-primary" />
            <h2 className="font-headline text-2xl font-bold text-text-primary uppercase tracking-tight">
              Domain Pillars &amp; Systems Specialization
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
          <div className="flex items-center gap-3 border-b border-border-subtle pb-4">
            <Cpu className="w-5 h-5 text-text-primary" />
            <h2 className="font-headline text-2xl font-bold text-text-primary uppercase tracking-tight">
              Core Technologies &amp; Engineering Platforms
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
          <div className="flex items-center gap-3 border-b border-border-subtle pb-4">
            <Wrench className="w-5 h-5 text-text-primary" />
            <h2 className="font-headline text-2xl font-bold text-text-primary uppercase tracking-tight">
              Engineering Competencies &amp; Methodologies
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
