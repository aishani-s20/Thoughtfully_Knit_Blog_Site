import React, { useState, useEffect } from 'react';
import { ExperienceProvider, useExperience } from './context/ExperienceContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { CuratedGallery } from './components/CuratedGallery.tsx';
import { ReadingRoom } from './components/ReadingRoom.tsx';
import { AuthorStudio } from './components/AuthorStudio.tsx';
import { FloatingDock } from './components/FloatingDock.tsx';
import { FocusSpotlight } from './components/FocusSpotlight.tsx';
import { ArchiveChatDrawer } from './components/ArchiveChatDrawer.tsx';
import { FeatureSettingsModal } from './components/FeatureSettingsModal.tsx';

function MainApp() {
  const { activePoemSlug, setActivePoemSlug } = useExperience();
  const [currentView, setCurrentView] = useState<'gallery' | 'reading' | 'studio'>(
    activePoemSlug ? 'reading' : 'gallery'
  );

  useEffect(() => {
    if (activePoemSlug) {
      setCurrentView('reading');
    }
  }, [activePoemSlug]);

  const handleSelectPoem = (slug: string) => {
    setActivePoemSlug(slug);
    setCurrentView('reading');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePublishSuccess = (slug: string) => {
    setActivePoemSlug(slug);
    setCurrentView('reading');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#fbf9f5] dark:bg-[#121110] text-[#292524] dark:text-[#e7e5e4] transition-colors relative flex flex-col justify-between selection:bg-amber-200 dark:selection:bg-amber-900/60">
      {/* Dynamic Focus Spotlight Overlay */}
      <FocusSpotlight />

      {/* Top Bar Navigation */}
      <Navbar currentView={currentView} onNavigate={setCurrentView} />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'gallery' && (
          <CuratedGallery
            onSelectPoem={handleSelectPoem}
            onOpenStudio={() => setCurrentView('studio')}
          />
        )}

        {currentView === 'reading' && (
          <ReadingRoom
            poemSlug={activePoemSlug || 'the-weight-of-rain'}
            onBack={() => {
              setActivePoemSlug(null);
              setCurrentView('gallery');
            }}
            onNavigatePoem={(slug) => {
              setActivePoemSlug(slug);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'studio' && (
          <AuthorStudio onPublishSuccess={handlePublishSuccess} />
        )}
      </main>

      {/* Literary Footnote / Colophon (Clean & quiet) */}
      <footer className="w-full border-t border-[#e5e0d8] dark:border-[#2d2a26] py-10 px-6 mt-16 text-xs text-stone-500 dark:text-stone-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-editorial text-sm font-semibold text-stone-900 dark:text-stone-100">
              Thoughtfully Knit
            </span>
            <span aria-hidden="true">·</span>
            <span>A Monograph in Sensory Literature & ML</span>
          </div>

          <div className="flex items-center gap-6 font-mono-code text-[11px]">
            <span>Web Audio Synthesis</span>
            <span aria-hidden="true">·</span>
            <span>Open-Meteo Grounding</span>
            <span aria-hidden="true">·</span>
            <span>Gemini 2.5 RAG</span>
          </div>
        </div>
      </footer>

      {/* Floating Sensory Experience Dock */}
      <FloatingDock />

      {/* Ask the Archive RAG Chat Drawer */}
      <ArchiveChatDrawer />

      {/* Feature Registry & Extensible Toggles Modal */}
      <FeatureSettingsModal />
    </div>
  );
}

export default function App() {
  return (
    <ExperienceProvider>
      <MainApp />
    </ExperienceProvider>
  );
}
