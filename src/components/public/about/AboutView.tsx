import {
  Github,
  Linkedin,
  Mail,
  MapPin,
  CheckCircle2,
  Terminal,
  Shield,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import type { AboutPublicDTO } from '@/types/dtos/public-read-models.dto';

interface AboutViewProps {
  about: AboutPublicDTO;
}

export function AboutView({ about }: AboutViewProps) {
  const { profile, principles, workingStyle, currentFocusSummary } = about;

  return (
    <div className="space-y-16 max-w-4xl">
      {/* 1. Profile Identity Card */}
      <div className="border border-terminal-border bg-terminal-surface/40 p-8 md:p-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-terminal-border">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs text-terminal-primary">[ ENGINEER PROFILE ]</span>
              {profile.availabilityStatus && (
                <span className="font-mono text-[10px] px-2 py-0.5 border border-terminal-primary/30 text-terminal-primary bg-terminal-primary/5 uppercase">
                  STATUS: {profile.availabilityStatus}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-terminal-text-primary">
              {profile.fullName}
            </h1>
            {profile.headline && (
              <p className="mt-1 text-sm md:text-base font-mono text-terminal-secondary">
                {profile.headline}
              </p>
            )}
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3 pt-2 sm:pt-0 font-mono text-xs">
            {profile.githubUrl && (
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="p-2 border border-terminal-border text-terminal-text-muted hover:text-terminal-primary hover:border-terminal-primary transition-colors"
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
                className="p-2 border border-terminal-border text-terminal-text-muted hover:text-terminal-secondary hover:border-terminal-secondary transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {profile.email && (
              <a
                href={`mailto:${profile.email}`}
                aria-label="Email"
                className="p-2 border border-terminal-border text-terminal-text-muted hover:text-terminal-accent hover:border-terminal-accent transition-colors"
              >
                <Mail className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Bio Narrative */}
        {profile.bio && (
          <p className="text-base md:text-lg text-terminal-text-primary leading-relaxed">
            {profile.bio}
          </p>
        )}

        {profile.location && (
          <div className="flex items-center gap-1.5 font-mono text-xs text-terminal-text-muted">
            <MapPin className="w-3.5 h-3.5" />
            <span>BASE OF OPERATIONS: {profile.location}</span>
          </div>
        )}
      </div>

      {/* 2. Engineering Thesis */}
      <section className="space-y-6">
        <h2 className="font-mono text-xs uppercase tracking-widest text-terminal-primary flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          <span>// ENGINEERING THESIS & PHILOSOPHY</span>
        </h2>
        <div className="prose prose-invert max-w-none text-terminal-text-secondary text-base md:text-lg leading-relaxed space-y-4">
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
        <h2 className="font-mono text-xs uppercase tracking-widest text-terminal-primary flex items-center gap-2">
          <Shield className="w-4 h-4" />
          <span>// CORE ENGINEERING PRINCIPLES</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {principles.map((p, idx) => (
            <div
              key={idx}
              className="border border-terminal-border bg-terminal-surface/30 p-6 space-y-3"
            >
              <span className="font-mono text-[10px] text-terminal-primary">
                0{idx + 1}.
              </span>
              <h3 className="font-bold text-terminal-text-primary text-base">
                {p.title}
              </h3>
              <p className="text-xs md:text-sm text-terminal-text-secondary leading-relaxed">
                {p.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Working Style */}
      <section className="space-y-6">
        <h2 className="font-mono text-xs uppercase tracking-widest text-terminal-primary flex items-center gap-2">
          <Layers className="w-4 h-4" />
          <span>// OPERATING MODE & EXECUTION STYLE</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workingStyle.map((w, idx) => (
            <div
              key={idx}
              className="border border-terminal-border bg-terminal-surface/30 p-6 space-y-2"
            >
              <h3 className="font-bold text-terminal-text-primary text-base flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-terminal-primary shrink-0" />
                <span>{w.title}</span>
              </h3>
              <p className="text-xs md:text-sm text-terminal-text-secondary leading-relaxed">
                {w.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Contact / Direct Communication */}
      <section className="border-t border-terminal-border pt-10 space-y-6">
        <h2 className="font-mono text-xs uppercase tracking-widest text-terminal-primary">
          // DIRECT COMMUNICATION
        </h2>
        <div className="border border-terminal-border bg-terminal-surface/40 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-terminal-text-primary">
              Initiate Technical Collaboration
            </h3>
            <p className="mt-1 text-sm text-terminal-text-secondary">
              Available for distributed infrastructure consulting, backend architecture, and technical advisory.
            </p>
          </div>
          <div className="shrink-0 font-mono text-xs flex flex-wrap gap-3">
            {profile.email && (
              <a
                href={`mailto:${profile.email}`}
                className="px-4 py-2 border border-terminal-primary text-terminal-primary hover:bg-terminal-primary/10 transition-colors inline-flex items-center gap-1.5 font-semibold"
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
