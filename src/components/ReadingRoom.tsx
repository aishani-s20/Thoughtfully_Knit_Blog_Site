import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Volume2,
  CloudRain,
  MessageSquareQuote,
  Sparkles,
  BookOpen,
  ChevronDown,
  Activity,
  Layers,
} from 'lucide-react';
import { useExperience } from '../context/ExperienceContext.tsx';
import { Poem, Stanza } from '../types/index.ts';

interface ReadingRoomProps {
  poemSlug: string;
  onBack: () => void;
  onNavigatePoem: (slug: string) => void;
}

export const ReadingRoom: React.FC<ReadingRoomProps> = ({ poemSlug, onBack, onNavigatePoem }) => {
  const {
    poems,
    activeWeather,
    isFeatureEnabled,
    spotlightEnabled,
    activeStanzaIndex,
    setActiveStanzaIndex,
    audioEnabled,
    toggleAudio,
    currentChordName,
    setIsChatOpen,
  } = useExperience();

  const poem = poems.find((p) => p.slug === poemSlug) || poems[0];
  const stanzaRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [showAuthorNotes, setShowAuthorNotes] = useState(false);

  // IntersectionObserver to detect which stanza is currently centered in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-stanza-index'));
            if (!isNaN(index)) {
              setActiveStanzaIndex(index);
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '-30% 0px -40% 0px', // Center active zone
        threshold: 0.2,
      }
    );

    stanzaRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [poem, setActiveStanzaIndex]);

  // Find next and prev poems
  const currentIndex = poems.findIndex((p) => p.slug === poem.slug);
  const prevPoem = currentIndex > 0 ? poems[currentIndex - 1] : null;
  const nextPoem = currentIndex < poems.length - 1 ? poems[currentIndex + 1] : null;

  return (
    <div className="min-w-full pb-32 animate-in fade-in duration-300">
      {/* Top Reading Navigation Bar */}
      <div className="sticky top-16 z-30 w-full backdrop-blur-md bg-[#fbf9f5]/85 dark:bg-[#121110]/85 border-b border-[#e5e0d8] dark:border-[#2d2a26]">
        <div className="max-w-3xl mx-auto px-6 h-12 flex items-center justify-between text-xs text-stone-500">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 hover:text-stone-900 dark:hover:text-stone-100 transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Archive</span>
          </button>

          <div className="flex items-center gap-3">
            {isFeatureEnabled('weather_adaptation') && (
              <span className="flex items-center gap-1 font-mono-code text-[11px] text-stone-600 dark:text-stone-400 capitalize">
                <CloudRain className="w-3 h-3 text-sky-500" />
                <span>{activeWeather} variant active</span>
              </span>
            )}

            {isFeatureEnabled('ambient_soundscape') && (
              <button
                onClick={toggleAudio}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-mono-code text-[11px] transition-colors ${
                  audioEnabled
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                    : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
                }`}
              >
                <Volume2 className="w-3 h-3" />
                <span>{audioEnabled ? currentChordName : 'Sound Off'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Reading Room Container */}
      <main className="max-w-2xl mx-auto px-6 pt-16 space-y-16">
        {/* Poem Header */}
        <header className="space-y-4 text-center border-b border-stone-200/80 dark:border-stone-800/80 pb-12">
          <div className="flex items-center justify-center gap-2 text-xs font-mono-code text-stone-400 uppercase tracking-widest">
            <span>{poem.publishedAt}</span>
            <span aria-hidden="true">·</span>
            <span>{poem.readTime}</span>
            <span aria-hidden="true">·</span>
            <span>By {poem.author}</span>
          </div>

          <h1 className="font-editorial text-4xl sm:text-5xl font-bold tracking-tight text-stone-900 dark:text-stone-100 leading-tight">
            {poem.title}
          </h1>

          <p className="font-editorial italic text-stone-600 dark:text-stone-400 text-lg sm:text-xl max-w-xl mx-auto leading-relaxed">
            {poem.subtitle}
          </p>

          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {poem.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-mono-code text-stone-500 dark:text-stone-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        </header>

        {/* Stanzas List */}
        <article
          id="reading-prose"
          className={`space-y-16 leading-relaxed ${
            spotlightEnabled && isFeatureEnabled('focus_spotlight') ? 'spotlight-reading-mask' : ''
          }`}
        >
          {poem.stanzas.map((stanza, idx) => {
            const isActive = activeStanzaIndex === idx;

            // Pick text based on weather adaptation
            let renderedText = stanza.baseText;
            if (isFeatureEnabled('weather_adaptation') && stanza.weatherVariants[activeWeather]) {
              renderedText = stanza.weatherVariants[activeWeather]!;
            }

            return (
              <div
                key={stanza.id}
                ref={(el) => {
                  stanzaRefs.current[idx] = el;
                }}
                data-stanza-index={idx}
                className={`group relative p-6 sm:p-8 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? 'bg-stone-50/70 dark:bg-[#181615] border border-stone-200/80 dark:border-stone-800 shadow-xs'
                    : 'opacity-75 hover:opacity-100'
                }`}
              >
                {/* Active Stanza Emotional Telemetry Indicator */}
                <div className="flex items-center justify-between text-xs text-stone-400 mb-4 pb-2 border-b border-stone-200/50 dark:border-stone-800/50">
                  <span className="font-mono-code text-[11px] tracking-wider uppercase">
                    Stanza {idx + 1} of {poem.stanzas.length}
                  </span>

                  <div className="flex items-center gap-3 font-mono-code text-[11px]">
                    <span className="text-stone-600 dark:text-stone-300">
                      {stanza.sentiment.dominantEmotion}
                    </span>
                    <span className="hidden sm:inline text-amber-700 dark:text-amber-400">
                      {stanza.sentiment.musicalKey}
                    </span>
                  </div>
                </div>

                {/* Stanza Verse Typography */}
                <div className="font-editorial text-xl sm:text-2xl text-stone-900 dark:text-stone-100 whitespace-pre-wrap leading-relaxed tracking-wide font-normal">
                  {renderedText}
                </div>
              </div>
            );
          })}
        </article>

        {/* Author Notes & Backstory Section */}
        <section className="pt-12 border-t border-stone-200 dark:border-stone-800 space-y-4">
          <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1a1816] overflow-hidden">
            <button
              onClick={() => setShowAuthorNotes(!showAuthorNotes)}
              className="w-full p-5 flex items-center justify-between text-left hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                <div>
                  <h3 className="font-editorial text-base font-bold text-stone-900 dark:text-stone-100">
                    Author's Private Archive Notes
                  </h3>
                  <p className="text-xs text-stone-500">
                    Hidden backstory and personal geography used in RAG retrieval
                  </p>
                </div>
              </div>

              <ChevronDown
                className={`w-4 h-4 text-stone-400 transition-transform ${
                  showAuthorNotes ? 'rotate-180' : ''
                }`}
              />
            </button>

            {showAuthorNotes && (
              <div className="px-6 pb-6 pt-2 space-y-4 border-t border-stone-100 dark:border-stone-800/70 text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-sans-ui animate-in fade-in duration-150">
                <p className="whitespace-pre-wrap">{poem.authorNotes}</p>

                <div className="pt-2">
                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-lg transition-colors border border-purple-200 dark:border-purple-800"
                  >
                    <MessageSquareQuote className="w-3.5 h-3.5" />
                    <span>Converse with Archivist about these notes</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Previous / Next Reading Navigation */}
        <nav className="flex items-center justify-between pt-8 border-t border-stone-200 dark:border-stone-800">
          {prevPoem ? (
            <button
              onClick={() => onNavigatePoem(prevPoem.slug)}
              className="text-left group space-y-1"
            >
              <span className="text-[11px] font-mono-code text-stone-400 uppercase tracking-wider block">
                ← Previous Work
              </span>
              <span className="font-editorial text-base font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                {prevPoem.title}
              </span>
            </button>
          ) : (
            <div />
          )}

          {nextPoem ? (
            <button
              onClick={() => onNavigatePoem(nextPoem.slug)}
              className="text-right group space-y-1"
            >
              <span className="text-[11px] font-mono-code text-stone-400 uppercase tracking-wider block">
                Next Work →
              </span>
              <span className="font-editorial text-base font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                {nextPoem.title}
              </span>
            </button>
          ) : (
            <div />
          )}
        </nav>
      </main>
    </div>
  );
};
