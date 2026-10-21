import React from 'react';
import { Sliders, Sparkles, BookOpen, Feather, Sun, Moon } from 'lucide-react';
import { useExperience } from '../context/ExperienceContext.tsx';

interface NavbarProps {
  currentView: 'gallery' | 'reading' | 'studio';
  onNavigate: (view: 'gallery' | 'reading' | 'studio') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    isFeatureEnabled,
    features,
    setActivePoemSlug,
    theme,
    toggleTheme,
  } = useExperience();

  const enabledCount = features.filter((f) => f.enabled).length;

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setActivePoemSlug(null);
    onNavigate('gallery');
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#fbf9f5]/85 dark:bg-[#121110]/85 border-b border-[#e5e0d8] dark:border-[#2d2a26] transition-colors">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element in editorial serif) */}
        <a
          href="/"
          onClick={handleLogoClick}
          className="font-editorial text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 hover:opacity-85 transition-opacity whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <span>Thoughtfully Knit</span>
          <span className="font-sans-ui text-[11px] font-normal tracking-widest uppercase text-stone-400 dark:text-stone-500 hidden sm:inline">
            · Lit & ML
          </span>
        </a>

        {/* Zone 2: Navigation Links (Single-line unboxed text with hover underline) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600 dark:text-stone-300">
          <button
            onClick={() => {
              setActivePoemSlug(null);
              onNavigate('gallery');
            }}
            className={`transition-colors hover:text-stone-950 dark:hover:text-white whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              currentView === 'gallery' ? 'text-stone-950 dark:text-white font-semibold' : ''
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-stone-400" />
            <span>Archive</span>
          </button>

          {isFeatureEnabled('author_studio') && (
            <button
              onClick={() => onNavigate('studio')}
              className={`transition-colors hover:text-stone-950 dark:hover:text-white whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                currentView === 'studio' ? 'text-stone-950 dark:text-white font-semibold' : ''
              }`}
            >
              <Feather className="w-3.5 h-3.5 text-stone-400" />
              <span>Ingestion Studio</span>
            </button>
          )}

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="transition-colors hover:text-stone-950 dark:hover:text-white whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5 text-stone-400" />
            <span>Feature Toggles</span>
            <span className="text-[11px] px-1.5 py-0.2 bg-stone-200/70 dark:bg-stone-800 text-stone-600 dark:text-stone-400 rounded-full font-mono-code">
              {enabledCount}/{features.length}
            </span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action & Theme Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
            title={theme === 'light' ? 'Switch to Dark Obsidian mode' : 'Switch to Warm Parchment mode'}
            aria-label="Toggle visual theme"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-stone-600" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-stone-800 dark:text-stone-200 bg-stone-100 dark:bg-stone-800/80 hover:bg-stone-200/70 dark:hover:bg-stone-700/80 border border-stone-200 dark:border-stone-700/70 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            <span className="hidden sm:inline">Sensory Controls</span>
            <span className="sm:hidden">Features</span>
          </button>
        </div>
      </div>
    </header>
  );
};
