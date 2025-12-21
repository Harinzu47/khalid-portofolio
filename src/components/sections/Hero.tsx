'use client';

import { Button } from '@/components/ui/Button';
import { Code2, LineChart } from 'lucide-react';

/**
 * Hero section with headline and dual CTAs
 */
export function Hero() {
  const scrollToProjects = (category?: string) => {
    const projectsSection = document.getElementById('projects');
    if (projectsSection) {
      projectsSection.scrollIntoView({ behavior: 'smooth' });
      
      // Trigger filter if category is specified
      if (category) {
        setTimeout(() => {
          const filterButton = document.querySelector(`[data-category="${category}"]`) as HTMLButtonElement;
          filterButton?.click();
        }, 500);
      }
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-8 animate-fade-in">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Available for opportunities
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-up">
          <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
            Crafting Robust Software &
          </span>
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
            Data-Driven Solutions
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Fullstack Developer specializing in <span className="text-blue-400 font-semibold">React & Laravel</span> | 
          Data Scientist leveraging <span className="text-purple-400 font-semibold">Python & ML</span>
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Button
            variant="primary"
            size="lg"
            onClick={() => scrollToProjects('Web Dev')}
            className="group"
          >
            <Code2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Lihat Kode
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => scrollToProjects('Data Science')}
            className="group"
          >
            <LineChart className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Lihat Analisis
          </Button>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-slate-600 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-slate-600 rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
