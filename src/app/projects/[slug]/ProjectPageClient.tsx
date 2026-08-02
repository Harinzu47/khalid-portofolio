'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ExternalLink, Github, Calendar, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion } from 'framer-motion';
import {
  SiReact, SiLaravel, SiPython, SiTypescript, SiTailwindcss,
  SiMysql, SiPostgresql, SiRedis, SiDocker, SiNextdotjs,
  SiNodedotjs, SiMongodb, SiPrisma, SiGit, SiGithub,
  SiStreamlit, SiPandas, SiNumpy, SiNginx, SiGithubactions,
  SiLinux, SiFastapi,
} from 'react-icons/si';
import { IconType } from 'react-icons';
import { Project } from '@/types';
import { projects } from '@/data/projects';

type Props = { project: Project };

// Tech icon mapping
const techIcons: Record<string, { icon: IconType; color: string }> = {
  'React':         { icon: SiReact,         color: '#61DAFB' },
  'Laravel':       { icon: SiLaravel,       color: '#FF2D20' },
  'Python':        { icon: SiPython,        color: '#3776AB' },
  'TypeScript':    { icon: SiTypescript,    color: '#3178C6' },
  'Tailwind CSS':  { icon: SiTailwindcss,   color: '#06B6D4' },
  'MySQL':         { icon: SiMysql,         color: '#4479A1' },
  'PostgreSQL':    { icon: SiPostgresql,    color: '#4169E1' },
  'Redis':         { icon: SiRedis,         color: '#DC382D' },
  'Docker':        { icon: SiDocker,        color: '#2496ED' },
  'Next.js':       { icon: SiNextdotjs,     color: '#FFFFFF' },
  'Node.js':       { icon: SiNodedotjs,     color: '#339933' },
  'MongoDB':       { icon: SiMongodb,       color: '#47A248' },
  'Prisma':        { icon: SiPrisma,        color: '#2D3748' },
  'Git':           { icon: SiGit,           color: '#F05032' },
  'GitHub':        { icon: SiGithub,        color: '#FFFFFF' },
  'Streamlit':     { icon: SiStreamlit,     color: '#FF4B4B' },
  'Pandas':        { icon: SiPandas,        color: '#150458' },
  'NumPy':         { icon: SiNumpy,         color: '#013243' },
  'Nginx':         { icon: SiNginx,         color: '#009900' },
  'GitHub Actions':{ icon: SiGithubactions, color: '#2088FF' },
  'Linux':         { icon: SiLinux,         color: '#FCC624' },
  'FastAPI':       { icon: SiFastapi,       color: '#009688' },
};

// Category color mapping
const categoryColor: Record<string, string> = {
  'Infra':      'text-terminal-accent border-terminal-accent/40',
  'Networking': 'text-terminal-secondary border-terminal-secondary/40',
  'Web Dev':    'text-terminal-primary border-terminal-primary/40',
  'AI':         'text-terminal-purple border-terminal-purple/40',
};

const fadeInUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/**
 * Project detail page — terminal theme
 */
export default function ProjectPageClient({ project }: Props) {
  const catColor = categoryColor[project.category] ?? 'text-terminal-text-secondary border-terminal-border';

  // Find prev/next for navigation
  const currentIdx = projects.findIndex((p) => p.slug === project.slug);
  const prevProject = currentIdx > 0 ? projects[currentIdx - 1] : null;
  const nextProject = currentIdx < projects.length - 1 ? projects[currentIdx + 1] : null;

  return (
    <div className="min-h-screen bg-terminal-bg">

      {/* Sticky breadcrumb header */}
      <header className="sticky top-0 z-40 bg-terminal-bg/95 border-b border-terminal-border py-4">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 font-mono text-xs text-terminal-text-muted hover:text-terminal-secondary transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            back to projects
          </Link>
          <span className="font-mono text-xs text-terminal-text-muted hidden sm:block">
            ~/hzcode/projects/{project.slug}
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">

        {/* Hero header */}
        <motion.div
          className="mb-12"
          initial="hidden"
          animate="visible"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          transition={{ staggerChildren: 0.08 }}
        >
          {/* Category + year */}
          <motion.div className="flex items-center gap-3 mb-4" variants={fadeInUp}>
            <span className={`font-mono text-xs border px-2 py-0.5 rounded ${catColor}`}>
              [{project.category}]
            </span>
            {project.year && (
              <span className="font-mono text-xs text-terminal-text-muted">• {project.year}</span>
            )}
          </motion.div>

          {/* Title */}
          <motion.h1
            className="font-mono text-3xl md:text-4xl text-terminal-text-primary mb-4 leading-tight"
            variants={fadeInUp}
          >
            {project.title}
          </motion.h1>

          {/* Short description */}
          <motion.p
            className="text-terminal-text-secondary text-lg leading-relaxed mb-8 max-w-2xl"
            variants={fadeInUp}
          >
            {project.shortDescription}
          </motion.p>

          {/* Action buttons */}
          <motion.div className="flex flex-wrap gap-3" variants={fadeInUp}>
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 font-mono text-sm border border-terminal-border text-terminal-text-secondary hover:border-terminal-text-muted hover:text-terminal-text-primary rounded transition-colors"
              >
                <Github className="w-4 h-4" />
                source code
              </a>
            )}
            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 font-mono text-sm border border-terminal-secondary text-terminal-secondary hover:bg-terminal-secondary/10 rounded transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                live demo
              </a>
            )}
          </motion.div>
        </motion.div>

        {/* Hero image */}
        {project.image && (
          <motion.div
            className="mb-12 border border-terminal-border rounded overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Image
              src={project.image}
              alt={project.title}
              width={1200}
              height={630}
              className="w-full aspect-video object-cover"
              priority
            />
          </motion.div>
        )}

        {/* Quick info + tech stack */}
        <motion.div
          className="grid sm:grid-cols-3 gap-4 mb-12"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          {/* Quick info */}
          <div className="border border-terminal-border bg-terminal-surface rounded p-5">
            <p className="font-mono text-xs text-terminal-text-muted uppercase tracking-wider mb-4">
              // quick info
            </p>
            <div className="space-y-3 font-mono text-xs">
              {project.year && (
                <div className="flex items-center gap-2 text-terminal-text-secondary">
                  <Calendar className="w-3.5 h-3.5 text-terminal-text-muted" />
                  <span>year: <span className="text-terminal-text-primary">{project.year}</span></span>
                </div>
              )}
              <div className="flex items-center gap-2 text-terminal-text-secondary">
                <Tag className="w-3.5 h-3.5 text-terminal-text-muted" />
                <span>category: <span className={categoryColor[project.category]?.split(' ')[0] ?? ''}>{project.category}</span></span>
              </div>
            </div>
          </div>

          {/* Tech stack */}
          <div className="sm:col-span-2 border border-terminal-border bg-terminal-surface rounded p-5">
            <p className="font-mono text-xs text-terminal-text-muted uppercase tracking-wider mb-4">
              // tech stack
            </p>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech, idx) => {
                const techInfo = techIcons[tech];
                const Icon = techInfo?.icon;
                return (
                  <motion.div
                    key={tech}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-terminal-border bg-terminal-bg rounded font-mono text-xs text-terminal-text-secondary hover:border-terminal-text-muted transition-colors"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + idx * 0.04 }}
                  >
                    {Icon && (
                      <Icon className="w-3.5 h-3.5" style={{ color: techInfo.color }} />
                    )}
                    <span>{tech}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Markdown content */}
        <motion.article
          className="prose-terminal"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <div className="border border-terminal-border bg-terminal-surface rounded p-8 md:p-10">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="font-mono text-2xl text-terminal-text-primary mt-8 mb-5 pb-3 border-b border-terminal-border">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="font-mono text-xl text-terminal-text-primary mt-8 mb-4 flex items-center gap-3">
                    <span className="w-1 h-5 bg-terminal-primary rounded-full flex-shrink-0" />
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="font-mono text-base text-terminal-text-primary mt-6 mb-3">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="mb-5 text-terminal-text-secondary leading-relaxed">{children}</p>
                ),
                strong: ({ children }) => (
                  <strong className="text-terminal-text-primary font-semibold">{children}</strong>
                ),
                ul: ({ children }) => (
                  <ul className="list-none ml-0 mb-5 space-y-2">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal ml-5 mb-5 space-y-2 text-terminal-text-secondary">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="text-terminal-text-secondary flex items-start gap-2">
                    <span className="text-terminal-primary mt-1 flex-shrink-0">&gt;</span>
                    <span>{children}</span>
                  </li>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    className="text-terminal-secondary hover:text-terminal-secondary/80 underline underline-offset-3"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-terminal-primary pl-5 my-5 bg-terminal-bg py-3 pr-5 rounded-r text-terminal-text-secondary italic">
                    {children}
                  </blockquote>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-6">
                    <table className="w-full border-collapse font-mono text-sm">{children}</table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="border-b border-terminal-border bg-terminal-bg">{children}</thead>
                ),
                th: ({ children }) => (
                  <th className="text-left py-2 px-4 text-terminal-text-muted font-normal text-xs uppercase tracking-wider">
                    {children}
                  </th>
                ),
                tbody: ({ children }) => <tbody>{children}</tbody>,
                tr: ({ children }) => (
                  <tr className="border-b border-terminal-border/50 even:bg-terminal-bg odd:bg-terminal-surface">
                    {children}
                  </tr>
                ),
                td: ({ children }) => (
                  <td className="py-2 px-4 text-terminal-text-secondary text-sm">{children}</td>
                ),
                hr: () => <hr className="border-terminal-border my-8" />,
                code: ({ className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || '');
                  const codeString = String(children).replace(/\n$/, '');
                  const isInline = !match && !className;

                  if (isInline) {
                    return (
                      <code
                        className="font-mono text-terminal-secondary bg-terminal-bg border border-terminal-border px-1.5 py-0.5 rounded text-xs"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  }

                  return (
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match ? match[1] : 'text'}
                      PreTag="div"
                      className="!rounded !border !border-terminal-border !my-6"
                      customStyle={{
                        background: '#0d1117',
                        padding: '1.25rem',
                        fontSize: '0.8rem',
                        margin: '0',
                      }}
                    >
                      {codeString}
                    </SyntaxHighlighter>
                  );
                },
              }}
            >
              {project.fullContent}
            </ReactMarkdown>
          </div>
        </motion.article>

        {/* Prev / Next navigation */}
        <motion.div
          className="mt-12 grid grid-cols-2 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {prevProject ? (
            <Link
              href={`/projects/${prevProject.slug}`}
              className="border border-terminal-border bg-terminal-surface rounded p-4 hover:border-terminal-text-muted transition-colors group"
            >
              <p className="font-mono text-xs text-terminal-text-muted mb-1">&lt; prev</p>
              <p className="font-mono text-sm text-terminal-text-primary group-hover:text-terminal-secondary transition-colors truncate">
                {prevProject.title}
              </p>
            </Link>
          ) : (
            <div />
          )}

          {nextProject ? (
            <Link
              href={`/projects/${nextProject.slug}`}
              className="border border-terminal-border bg-terminal-surface rounded p-4 hover:border-terminal-text-muted transition-colors group text-right"
            >
              <p className="font-mono text-xs text-terminal-text-muted mb-1">next &gt;</p>
              <p className="font-mono text-sm text-terminal-text-primary group-hover:text-terminal-secondary transition-colors truncate">
                {nextProject.title}
              </p>
            </Link>
          ) : (
            <div />
          )}
        </motion.div>

        {/* Back button */}
        <div className="mt-8 text-center">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 font-mono text-sm text-terminal-text-muted hover:text-terminal-secondary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            back to all projects
          </Link>
        </div>
      </main>
    </div>
  );
}
