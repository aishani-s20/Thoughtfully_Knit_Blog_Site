import React, { useState } from 'react';
import { BookOpen, Sparkles, Feather, Compass, Volume2, ArrowUpRight, CloudRain } from 'lucide-react';
import { useExperience } from '../context/ExperienceContext.tsx';
import { Poem } from '../types/index.ts';

interface CuratedGalleryProps {
  onSelectPoem: (slug: string) => void;
  onOpenStudio: () => void;
}

export const CuratedGallery: React.FC<CuratedGalleryProps> = ({ onSelectPoem, onOpenStudio }) => {
  const { poems, isFeatureEnabled, setIsSettingsOpen } = useExperience();
  const [selectedTag, setSelectedTag] = useState<string>('All');

  // Extract unique tags across all poems
  const allTags = ['All', ...Array.from(new Set(poems.flatMap((p) => p.tags)))];

  const filteredPoems = selectedTag === 'All'
    ? poems
    : poems.filter((p) => p.tags.includes(selectedTag));

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-16 animate-in fade-in duration-300">
      {/* 1. Hero Monograph Introduction */}
      <section className="space-y-6 pt-4 border-b border-[#e5e0d8] dark:border-[#2d2a26] pb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-mono-code text-stone-500 uppercase tracking-widest">
              <span>Issue No. 04</span>
              <span aria-hidden="true">·</span>
              <span>Sensory Literature & AI</span>
              <span aria-hidden="true">·</span>
              <span>Autumn 2026</span>
            </div>

            <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 dark:text-stone-100 leading-[1.08] text-balance">
              Literature that listens to the rain and breathes with the reader.
            </h1>

            <p className="font-sans-ui text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed pt-1">
              Thoughtfully Knit pairs classical editorial typography with an opt-in sensory layer: ambient harmonic soundscapes dynamically scored to stanza sentiment, zero-prompt weather verse adaptation, conversational RAG archive notes, and reading focus spotlighting.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {isFeatureEnabled('author_studio') && (
              <button
                onClick={onOpenStudio}
                className="flex items-center justify-center gap-2 px-5 py-3 text-xs font-medium text-stone-800 dark:text-stone-200 bg-white dark:bg-stone-800/80 hover:bg-stone-100 dark:hover:bg-stone-700/80 border border-stone-300 dark:border-stone-700 rounded-xl transition-all shadow-xs"
              >
                <Feather className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                <span>Author Ingestion Studio</span>
              </button>
            )}

            <button
              onClick={() => onSelectPoem(poems[0].slug)}
              className="flex items-center justify-center gap-2 px-6 py-3 text-xs font-medium text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 rounded-xl hover:opacity-90 transition-all shadow-sm"
            >
              <span>Begin Reading</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sensory Dimension Badges / Overview (Clean unboxed line) */}
        <div className="pt-2 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-stone-500 dark:text-stone-400 border-t border-stone-200/60 dark:border-stone-800/60">
          <div className="flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            <span>Valence/Arousal Audio Engine</span>
          </div>
          <span aria-hidden="true" className="text-stone-300 dark:text-stone-700">/</span>
          <div className="flex items-center gap-1.5">
            <CloudRain className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>Open-Meteo Edge Weather Crossfade</span>
          </div>
          <span aria-hidden="true" className="text-stone-300 dark:text-stone-700">/</span>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Gemini 2.5 Stanza & Note RAG</span>
          </div>
          <span aria-hidden="true" className="text-stone-300 dark:text-stone-700">/</span>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="text-stone-700 dark:text-stone-300 underline underline-offset-4 hover:text-stone-950 dark:hover:text-white"
          >
            Customize in Settings
          </button>
        </div>
      </section>

      {/* 2. Interactive Filter Bar (Segmented button controls) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 p-1 bg-stone-200/60 dark:bg-stone-800/80 rounded-xl max-w-full overflow-x-auto">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
                  selectedTag === tag
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs font-semibold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="text-xs text-stone-500 font-mono-code">
            Showing {filteredPoems.length} of {poems.length} works
          </div>
        </div>

        {/* 3. Bento Grid Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPoems.map((poem, idx) => {
            const isFeatured = idx === 0 && selectedTag === 'All';
            const firstStanza = poem.stanzas[0];

            return (
              <article
                key={poem.id}
                onClick={() => onSelectPoem(poem.slug)}
                className={`group cursor-pointer rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1a1816] hover:border-stone-300 dark:hover:border-stone-700 transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md ${
                  isFeatured ? 'md:col-span-2 md:row-span-2' : 'col-span-1'
                }`}
              >
                {/* Generative Visual Art Canvas Banner */}
                <div
                  className={`w-full relative overflow-hidden flex flex-col justify-between p-6 ${
                    isFeatured ? 'h-64 sm:h-72' : 'h-48'
                  }`}
                  style={{ background: poem.coverGradient }}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono-code text-stone-300/80 uppercase tracking-widest z-10">
                    <span>{poem.tags[0] || 'Poem'}</span>
                    <span>{poem.stanzas.length} Stanzas</span>
                  </div>

                  {/* Atmospheric Monograph Typography on Canvas */}
                  <div className="z-10 space-y-1">
                    <span className="font-editorial text-stone-300 text-xs italic tracking-wider block">
                      Plate {String(idx + 1).padStart(2, '0')}
                    </span>
                    <h3
                      className={`font-editorial font-bold text-white tracking-tight leading-tight ${
                        isFeatured ? 'text-3xl sm:text-4xl max-w-lg' : 'text-2xl'
                      }`}
                    >
                      {poem.title}
                    </h3>
                  </div>

                  {/* Subtle Geometric Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
                </div>

                {/* Card Content & Metadata */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <p className="font-editorial italic text-stone-600 dark:text-stone-300 text-sm leading-relaxed line-clamp-2">
                      "{firstStanza?.baseText.split('\n')[0]}..."
                    </p>

                    <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                      {poem.subtitle}
                    </p>
                  </div>

                  {/* Unboxed Metadata (Zero Pill Discipline!) */}
                  <div className="pt-4 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                    <div className="flex items-center gap-2">
                      <span>{poem.author}</span>
                      <span aria-hidden="true">·</span>
                      <span>{poem.readTime}</span>
                      <span aria-hidden="true">·</span>
                      <span>{poem.publishedAt}</span>
                    </div>

                    <span className="font-mono-code text-stone-600 dark:text-stone-300 text-[11px] group-hover:translate-x-0.5 transition-transform flex items-center gap-1 font-medium">
                      Read <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};
