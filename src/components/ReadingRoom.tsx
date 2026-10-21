import React, { useState } from 'react';
import {
  ArrowLeft,
  Volume2,
  CloudRain,
  Sun,
  Moon,
  Cloud,
  MessageSquareQuote,
  BookOpen,
  ChevronDown,
  Music,
  Info,
} from 'lucide-react';
import { useExperience } from '../context/ExperienceContext.tsx';
import { Poem, WeatherCondition } from '../types/index.ts';

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
    audioEnabled,
    toggleAudio,
    activeSoundscape,
    setIsChatOpen,
  } = useExperience();

  const poem = poems.find((p) => p.slug === poemSlug) || poems[0];
  const [showAuthorNotes, setShowAuthorNotes] = useState(false);

  // Find next and prev poems
  const currentIndex = poems.findIndex((p) => p.slug === poem.slug);
  const prevPoem = currentIndex > 0 ? poems[currentIndex - 1] : null;
  const nextPoem = currentIndex < poems.length - 1 ? poems[currentIndex + 1] : null;

  const getWeatherIcon = (cond: WeatherCondition) => {
    switch (cond) {
      case 'rain':
        return <CloudRain className="w-3.5 h-3.5 text-sky-500" />;
      case 'clear':
        return <Sun className="w-3.5 h-3.5 text-amber-500" />;
      case 'night':
        return <Moon className="w-3.5 h-3.5 text-indigo-400" />;
      case 'fog':
        return <Cloud className="w-3.5 h-3.5 text-stone-400" />;
    }
  };

  const getWeatherSoundDescription = (cond: WeatherCondition) => {
    switch (cond) {
      case 'rain':
        return 'Layering gentle rain sound';
      case 'clear':
        return 'Gentle open air breeze';
      case 'night':
        return 'Peaceful nocturnal crickets';
      case 'fog':
        return 'Soft coastal mist and wind';
    }
  };

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

          <div className="flex items-center gap-4">
            {/* Atmospheric Sound Indicator */}
            {isFeatureEnabled('weather_adaptation') && (
              <span className="flex items-center gap-1.5 font-mono-code text-[11px] text-stone-600 dark:text-stone-300">
                {getWeatherIcon(activeWeather)}
                <span className="hidden sm:inline capitalize">{activeWeather} Acoustics</span>
              </span>
            )}

            {/* Predetermined Soundscape Button */}
            {isFeatureEnabled('ambient_soundscape') && (
              <button
                onClick={toggleAudio}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono-code text-[11px] transition-colors ${
                  audioEnabled
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800/60'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
                title="Toggle ambient soundscape"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span className="font-medium">{audioEnabled ? poem.soundscapeName : 'Sound Off'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Reading Room Container */}
      <main className="max-w-2xl mx-auto px-6 pt-16 space-y-12">
        {/* Poem Header */}
        <header className="space-y-4 text-center border-b border-stone-200/80 dark:border-stone-800/80 pb-10">
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

          {/* Predetermined Soundscape & Acoustic Profile Card */}
          {isFeatureEnabled('ambient_soundscape') && (
            <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800/60 max-w-lg mx-auto">
              <div className="flex items-center justify-center gap-2 text-xs text-stone-600 dark:text-stone-300">
                <Volume2 className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
                <span className="font-medium">Natural Soundscape: {poem.soundscapeName}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-code text-[11px] text-stone-400">{poem.overallMood}</span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 italic mt-1 leading-normal">
                "{poem.soundscapeRationale}"
              </p>
              {isFeatureEnabled('weather_adaptation') && (
                <p className="text-[10px] font-mono-code text-stone-400 mt-1 flex items-center justify-center gap-1">
                  <span>{getWeatherSoundDescription(activeWeather)}</span>
                </p>
              )}
            </div>
          )}
        </header>

        {/* Complete Unbroken Poem Text */}
        <article
          id="reading-prose"
          className={`py-4 space-y-8 leading-relaxed font-editorial text-xl sm:text-2xl text-stone-900 dark:text-stone-100 whitespace-pre-wrap tracking-wide font-normal ${
            spotlightEnabled && isFeatureEnabled('focus_spotlight') ? 'spotlight-reading-mask' : ''
          }`}
        >
          {poem.fullText}
        </article>

        {/* Author Notes & Backstory Section */}
        <section className="pt-10 border-t border-stone-200 dark:border-stone-800 space-y-4">
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
                    <span>Converse with Archivist about this piece</span>
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
