'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ExternalLink, Github, Calendar, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion } from 'framer-motion';
import {
  SiReact,
  SiLaravel,
  SiPython,
  SiTypescript,
  SiTailwindcss,
  SiMysql,
  SiPostgresql,
  SiRedis,
  SiDocker,
  SiNextdotjs,
  SiNodedotjs,
  SiMongodb,
  SiPrisma,
  SiGit,
  SiGithub,
  SiStreamlit,
  SiPandas,
  SiNumpy,
} from 'react-icons/si';
import { IconType } from 'react-icons';
import { Project } from '@/types';

type Props = {
  project: Project;
};

// Tech icon mapping with brand colors
const techIcons: Record<string, { icon: IconType; color: string }> = {
  'React': { icon: SiReact, color: '#61DAFB' },
  'Laravel': { icon: SiLaravel, color: '#FF2D20' },
  'Python': { icon: SiPython, color: '#3776AB' },
  'TypeScript': { icon: SiTypescript, color: '#3178C6' },
  'Tailwind CSS': { icon: SiTailwindcss, color: '#06B6D4' },
  'MySQL': { icon: SiMysql, color: '#4479A1' },
  'PostgreSQL': { icon: SiPostgresql, color: '#4169E1' },
  'Redis': { icon: SiRedis, color: '#DC382D' },
  'Docker': { icon: SiDocker, color: '#2496ED' },
  'Next.js': { icon: SiNextdotjs, color: '#FFFFFF' },
  'Node.js': { icon: SiNodedotjs, color: '#339933' },
  'MongoDB': { icon: SiMongodb, color: '#47A248' },
  'Prisma': { icon: SiPrisma, color: '#2D3748' },
  'Git': { icon: SiGit, color: '#F05032' },
  'GitHub': { icon: SiGithub, color: '#FFFFFF' },
  'Streamlit': { icon: SiStreamlit, color: '#FF4B4B' },
  'Pandas': { icon: SiPandas, color: '#150458' },
  'NumPy': { icon: SiNumpy, color: '#013243' },
};

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 }
};

/**
 * Project detail page client component with animations
 */
export default function ProjectPageClient({ project }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-all duration-300 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform duration-300" />
            <span className="font-medium">Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <motion.div 
          className="mb-16"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Category & Year Badge */}
          <motion.div 
            className="flex items-center gap-3 mb-6"
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
          >
            <span
              className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                project.category === 'Web Dev'
                  ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border border-purple-500/30'
              }`}
            >
              {project.category}
            </span>
            {project.year && (
              <span className="text-slate-500 text-sm font-medium">• {project.year}</span>
            )}
          </motion.div>

          {/* Title */}
          <motion.h1 
            className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight"
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {project.title}
          </motion.h1>

          {/* Short Description */}
          <motion.p 
            className="text-xl md:text-2xl text-slate-400 mb-8 max-w-3xl leading-relaxed"
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {project.shortDescription}
          </motion.p>
        </motion.div>

        {/* Hero Image Section */}
        {project.image && (
          <motion.div 
            className="mb-16"
            initial="hidden"
            animate="visible"
            variants={scaleIn}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="relative group rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/10 hover:shadow-purple-500/20 transition-shadow duration-500">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Image
                src={project.image}
                alt={project.title}
                width={1200}
                height={675}
                className="w-full aspect-video object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                priority
              />
              {/* Decorative gradient border */}
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 group-hover:ring-purple-500/30 transition-all duration-500" />
            </div>
          </motion.div>
        )}

        {/* Quick Info & Tech Stack Grid */}
        <motion.div 
          className="grid md:grid-cols-3 gap-6 mb-16"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Quick Info Card */}
          <motion.div 
            className="md:col-span-1 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-colors duration-300"
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Tag className="w-5 h-5 text-blue-400" />
              Quick Info
            </h3>
            
            <div className="space-y-4">
              {/* Year */}
              {project.year && (
                <div className="flex items-center gap-3 text-slate-300">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span className="text-sm">Year: <span className="text-white font-medium">{project.year}</span></span>
                </div>
              )}
              
              {/* Category */}
              <div className="flex items-center gap-3 text-slate-300">
                <Tag className="w-4 h-4 text-slate-500" />
                <span className="text-sm">Category: <span className="text-white font-medium">{project.category}</span></span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 space-y-3">
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-xl transition-all duration-300 font-medium group border border-slate-600/50 hover:border-slate-500/50"
                >
                  <Github className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  View Source Code
                </a>
              )}
              {project.demo && (
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl transition-all duration-300 font-medium group shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
                >
                  <ExternalLink className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                  Live Demo
                </a>
              )}
            </div>
          </motion.div>

          {/* Tech Stack Card */}
          <motion.div 
            className="md:col-span-2 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-colors duration-300"
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold text-white mb-6">Tech Stack</h3>
            
            <div className="flex flex-wrap gap-3">
              {project.technologies.map((tech, index) => {
                const techInfo = techIcons[tech];
                const IconComponent = techInfo?.icon;
                
                return (
                  <motion.div
                    key={tech}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700/30 border border-slate-600/30 hover:border-slate-500/50 hover:bg-slate-700/50 transition-all duration-300 group cursor-default"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {IconComponent ? (
                      <IconComponent 
                        className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" 
                        style={{ color: techInfo.color }}
                      />
                    ) : (
                      <div className="w-5 h-5 rounded bg-slate-600 flex items-center justify-center text-xs font-bold text-slate-300">
                        {tech[0]}
                      </div>
                    )}
                    <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors duration-300">
                      {tech}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>

        {/* Full Content - Markdown */}
        <motion.article 
          className="prose prose-invert prose-lg max-w-none"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-slate-700/50">
            <div className="text-slate-300 leading-relaxed">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-3xl md:text-4xl font-bold text-white mt-10 mb-6 pb-4 border-b border-slate-700/50">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl md:text-3xl font-bold text-white mt-10 mb-5 flex items-center gap-3">
                      <span className="w-1.5 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl md:text-2xl font-semibold text-slate-200 mt-8 mb-4">{children}</h3>
                  ),
                  p: ({ children }) => (
                    <p className="mb-6 text-slate-300 leading-relaxed text-lg">{children}</p>
                  ),
                  strong: ({ children }) => (
                    <strong className="text-white font-semibold">{children}</strong>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-none ml-0 mb-6 space-y-3">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal ml-6 mb-6 space-y-3">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-slate-300 flex items-start gap-3">
                      <span className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mt-2.5 flex-shrink-0" />
                      <span>{children}</span>
                    </li>
                  ),
                  a: ({ href, children }) => (
                    <a 
                      href={href} 
                      className="text-blue-400 hover:text-blue-300 underline underline-offset-4 decoration-blue-400/50 hover:decoration-blue-300 transition-colors duration-300"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-gradient-to-b from-blue-500 to-purple-500 pl-6 italic text-slate-400 my-6 bg-slate-800/30 py-4 pr-6 rounded-r-xl">
                      {children}
                    </blockquote>
                  ),
                  code: ({ className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeString = String(children).replace(/\n$/, '');
                    
                    // Check if this is an inline code or a code block
                    const isInline = !match && !className;
                    
                    if (isInline) {
                      return (
                        <code className="bg-slate-800/80 text-blue-300 px-2 py-1 rounded-md text-sm font-mono border border-slate-700/50" {...props}>
                          {children}
                        </code>
                      );
                    }
                    
                    return (
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match ? match[1] : 'text'}
                        PreTag="div"
                        className="rounded-xl !bg-slate-900/80 !my-8 border border-slate-700/50 shadow-xl"
                        customStyle={{
                          padding: '1.5rem',
                          fontSize: '0.9rem',
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
          </div>
        </motion.article>

        {/* Back to Projects Button */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white rounded-2xl font-medium transition-all duration-300 group border border-slate-600/50 hover:border-slate-500/50 shadow-lg hover:shadow-xl"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform duration-300" />
            Back to All Projects
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
