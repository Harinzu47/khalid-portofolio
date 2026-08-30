import {
  Github,
  Linkedin,
  Mail,
  MapPin,
  CheckCircle2,
  Terminal,
  Shield,
  Layers,
} from 'lucide-react';
import type { AboutPublicDTO } from '@/types/dtos/public-read-models.dto';

interface AboutViewProps {
  about: AboutPublicDTO;
}

export function AboutView({ about }: AboutViewProps) {
  const { profile, principles, workingStyle } = about;

  return (
    <div className="space-y-16 md:space-y-24 max-w-5xl">
      {/* 1. Profile Identity Card */}
      <div className="border border-border-subtle bg-surface-container/30 p-8 md:p-12 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-8 border-b border-border-subtle">
          <div className="space-y-2">
            <div className="flex items-center gap-3 font-mono text-xs text-text-secondary">
              <span>01 / PROFILE</span>
              {profile.availabilityStatus && (
                <span className="font-mono text-[10px] px-2 py-0.5 border border-border-subtle bg-surface-container-high text-text-primary font-semibold uppercase">
                  STATUS: {profile.availabilityStatus}
                </span>
              )}
            </div>
            <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl font-extrabold text-text-primary uppercase tracking-tight">
              {profile.fullName}
            </h2>
            {profile.headline && (
              <p className="text-base md:text-lg font-mono text-text-secondary">
                {profile.headline}
              </p>
            )}
          </div>

          {/* Social Channels */}
          <div className="flex items-center gap-3 font-mono text-xs">
            {profile.githubUrl && (
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="p-2.5 border border-border-subtle bg-surface-main text-text-secondary hover:text-text-primary hover:border-text-primary transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
            )}
            {profile.linkedinUrl && (
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="p-2.5 border border-border-subtle bg-surface-main text-text-secondary hover:text-text-primary hover:border-text-primary transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {profile.email && (
              <a
                href={`mailto:${profile.email}`}
                aria-label="Email"
                className="p-2.5 border border-border-subtle bg-surface-main text-text-secondary hover:text-text-primary hover:border-text-primary transition-colors"
              >
                <Mail className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Bio Narrative */}
        {profile.bio && (
          <p className="font-sans text-lg md:text-xl text-text-primary leading-relaxed">
            {profile.bio}
          </p>
        )}

        {profile.location && (
          <div className="flex items-center gap-2 font-mono text-xs text-text-secondary pt-2">
            <MapPin className="w-4 h-4 text-text-secondary" />
            <span className="uppercase tracking-wider">BASE OF OPERATIONS: {profile.location}</span>
          </div>
        )}
      </div>

      {/* 2. Engineering Thesis */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-border-subtle pb-4">
          <Terminal className="w-5 h-5 text-text-primary" />
          <h2 className="font-headline text-2xl md:text-3xl font-extrabold text-text-primary uppercase tracking-tight">
            Engineering Thesis &amp; Philosophy
          </h2>
        </div>
        <div className="prose-editorial max-w-none text-text-primary text-base md:text-lg leading-relaxed space-y-4">
          <p>
            I approach software and infrastructure as deterministic systems designed for
            resilience, auditability, and long-term durability. From kernel routing tables to
            multi-tenant database schemas with PostgreSQL Row-Level Security, reliability is not
            an afterthought—it is the foundational constraint.
          </p>
          <p>
            HZCODE is built as a personal knowledge and development operating system: every
            architectural decision, operational pattern, and technical investigation is
            documented, indexed, and synthesized into reusable engineering artifacts.
          </p>
        </div>
      </section>

      {/* 3. Core Principles */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-border-subtle pb-4">
          <Shield className="w-5 h-5 text-text-primary" />
          <h2 className="font-headline text-2xl md:text-3xl font-extrabold text-text-primary uppercase tracking-tight">
            Core Engineering Principles
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {principles.map((p, idx) => (
            <div
              key={idx}
              className="border border-border-subtle bg-surface-container/30 p-6 md:p-8 space-y-3"
            >
              <span className="font-mono text-xs font-semibold text-text-primary">
                0{idx + 1}.
              </span>
              <h3 className="font-headline font-bold text-text-primary text-base md:text-lg">
                {p.title}
              </h3>
              <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
                {p.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Working Style */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-border-subtle pb-4">
          <Layers className="w-5 h-5 text-text-primary" />
          <h2 className="font-headline text-2xl md:text-3xl font-extrabold text-text-primary uppercase tracking-tight">
            Operating Mode &amp; Execution Style
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workingStyle.map((w, idx) => (
            <div
              key={idx}
              className="border border-border-subtle bg-surface-container/30 p-6 space-y-2.5"
            >
              <h3 className="font-headline font-bold text-text-primary text-base flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-text-primary shrink-0" />
                <span>{w.title}</span>
              </h3>
              <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
                {w.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Direct Communication */}
      <section id="contact" className="border-t border-border-subtle pt-12 space-y-6">
        <div className="border border-border-subtle bg-surface-container/50 p-8 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="font-mono text-xs uppercase tracking-widest text-text-secondary block">
              CONTACT &amp; COLLABORATION
            </span>
            <h3 className="font-headline text-2xl md:text-3xl font-extrabold text-text-primary uppercase tracking-tight">
              Initiate Technical Collaboration
            </h3>
            <p className="text-sm md:text-base text-text-secondary max-w-xl leading-relaxed">
              Available for distributed infrastructure consulting, backend architecture, and technical advisory.
            </p>
          </div>
          <div className="shrink-0 font-mono text-xs flex flex-wrap gap-3">
            {profile.email && (
              <a
                href={`mailto:${profile.email}`}
                className="px-6 py-3.5 bg-text-primary text-surface-main font-semibold uppercase tracking-wider hover:bg-accent-technical transition-colors inline-flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                <span>SEND INQUIRY &rarr;</span>
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
