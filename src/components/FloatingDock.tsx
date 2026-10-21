import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  CloudRain,
  Sun,
  Moon,
  Cloud,
  Eye,
  EyeOff,
  MessageSquareQuote,
  Sliders,
  ChevronUp,
  Activity,
} from 'lucide-react';
import { useExperience } from '../context/ExperienceContext.tsx';
import { WeatherCondition } from '../types/index.ts';

export const FloatingDock: React.FC = () => {
  const {
    isFeatureEnabled,
    audioEnabled,
    volume,
    setVolume,
    toggleAudio,
    currentChordName,
    currentSentiment,

    weatherMode,
    activeWeather,
    weatherCity,
    weatherTemp,
    setWeatherMode,

    spotlightEnabled,
    toggleSpotlight,
    spotlightRadius,
    setSpotlightRadius,

    isChatOpen,
    setIsChatOpen,
    setIsSettingsOpen,
  } = useExperience();

  const [audioExpanded, setAudioExpanded] = useState(false);
  const [weatherExpanded, setWeatherExpanded] = useState(false);
  const [spotlightExpanded, setSpotlightExpanded] = useState(false);

  const getWeatherIcon = (cond: WeatherCondition) => {
    switch (cond) {
      case 'rain':
        return <CloudRain className="w-4 h-4 text-sky-400" />;
      case 'clear':
        return <Sun className="w-4 h-4 text-amber-400" />;
      case 'night':
        return <Moon className="w-4 h-4 text-indigo-300" />;
      case 'fog':
        return <Cloud className="w-4 h-4 text-stone-300" />;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 pointer-events-auto">
      {/* 1. Popover for Ambient Audio Controls */}
      {audioExpanded && isFeatureEnabled('ambient_soundscape') && (
        <div className="p-3.5 mb-1 w-64 bg-stone-900/90 text-stone-100 backdrop-blur-md border border-stone-700/60 rounded-xl shadow-2xl space-y-3 text-xs animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-stone-200 uppercase tracking-wider text-[11px]">
              Ambient Soundscape
            </span>
            <span className="font-mono-code text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/50">
              {currentChordName}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-stone-400 text-[11px]">
              <span>Volume</span>
              <span className="font-mono-code">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-1 bg-stone-700 rounded-lg appearance-none"
            />
          </div>

          <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-[11px] text-stone-400 font-mono-code">
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-400" />
              <span>Valence: {currentSentiment.valence.toFixed(2)}</span>
            </span>
            <span>Arousal: {currentSentiment.arousal.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* 2. Popover for Weather / Atmosphere */}
      {weatherExpanded && isFeatureEnabled('weather_adaptation') && (
        <div className="p-3 mb-1 w-56 bg-stone-900/90 text-stone-100 backdrop-blur-md border border-stone-700/60 rounded-xl shadow-2xl space-y-2 text-xs animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between pb-1 border-b border-stone-800">
            <span className="font-semibold text-stone-200 uppercase tracking-wider text-[11px]">
              Atmosphere Mode
            </span>
            <span className="font-mono-code text-[10px] text-stone-400">
              {weatherTemp}°C
            </span>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => {
                setWeatherMode('auto');
                setWeatherExpanded(false);
              }}
              className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                weatherMode === 'auto'
                  ? 'bg-amber-600/30 text-amber-300 font-medium border border-amber-600/40'
                  : 'hover:bg-stone-800 text-stone-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {getWeatherIcon(activeWeather)}
                <span>Auto ({weatherCity})</span>
              </div>
              {weatherMode === 'auto' && <span className="text-[10px]">Active</span>}
            </button>

            {(['rain', 'clear', 'night', 'fog'] as WeatherCondition[]).map((cond) => (
              <button
                key={cond}
                onClick={() => {
                  setWeatherMode(cond);
                  setWeatherExpanded(false);
                }}
                className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors capitalize ${
                  weatherMode === cond
                    ? 'bg-amber-600/30 text-amber-300 font-medium border border-amber-600/40'
                    : 'hover:bg-stone-800 text-stone-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {getWeatherIcon(cond)}
                  <span>{cond}</span>
                </div>
                {weatherMode === cond && <span className="text-[10px]">Override</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Popover for Spotlight Radius */}
      {spotlightExpanded && isFeatureEnabled('focus_spotlight') && (
        <div className="p-3 mb-1 w-52 bg-stone-900/90 text-stone-100 backdrop-blur-md border border-stone-700/60 rounded-xl shadow-2xl space-y-2 text-xs animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex justify-between items-center text-[11px]">
            <span className="font-semibold text-stone-200 uppercase tracking-wider">Spotlight Radius</span>
            <span className="font-mono-code text-stone-400">{spotlightRadius}px</span>
          </div>
          <input
            type="range"
            min="120"
            max="340"
            step="10"
            value={spotlightRadius}
            onChange={(e) => setSpotlightRadius(parseInt(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer h-1 bg-stone-700 rounded-lg appearance-none"
          />
        </div>
      )}

      {/* MAIN FLOATING GLASSMORPHIC DOCK CONTAINER */}
      <div className="flex items-center gap-1.5 p-1.5 bg-stone-900/85 backdrop-blur-md text-stone-200 border border-stone-700/50 rounded-2xl shadow-2xl">
        {/* Toggle 1: Ambient Audio */}
        {isFeatureEnabled('ambient_soundscape') && (
          <div className="flex items-center">
            <button
              onClick={toggleAudio}
              className={`p-2.5 rounded-xl transition-all flex items-center gap-1.5 ${
                audioEnabled
                  ? 'bg-amber-600/30 text-amber-400 border border-amber-500/40'
                  : 'hover:bg-stone-800 text-stone-400 hover:text-stone-200'
              }`}
              title={audioEnabled ? 'Mute ambient soundscape' : 'Start ambient soundscape'}
              aria-label="Toggle ambient audio"
            >
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            {audioEnabled && (
              <button
                onClick={() => setAudioExpanded((prev) => !prev)}
                className="p-1 rounded-md text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
                title="Soundscape settings"
              >
                <ChevronUp className={`w-3 h-3 transition-transform ${audioExpanded ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
        )}

        {/* Toggle 2: Weather Mode */}
        {isFeatureEnabled('weather_adaptation') && (
          <button
            onClick={() => {
              setWeatherExpanded((prev) => !prev);
              setAudioExpanded(false);
              setSpotlightExpanded(false);
            }}
            className={`p-2.5 rounded-xl transition-all flex items-center gap-1.5 ${
              weatherExpanded
                ? 'bg-stone-800 text-amber-300'
                : 'hover:bg-stone-800 text-stone-300'
            }`}
            title={`Atmosphere: ${weatherMode === 'auto' ? `Auto (${activeWeather})` : activeWeather}`}
            aria-label="Weather mode selector"
          >
            {getWeatherIcon(activeWeather)}
          </button>
        )}

        {/* Toggle 3: Focus Spotlight */}
        {isFeatureEnabled('focus_spotlight') && (
          <div className="flex items-center">
            <button
              onClick={toggleSpotlight}
              className={`p-2.5 rounded-xl transition-all ${
                spotlightEnabled
                  ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40'
                  : 'hover:bg-stone-800 text-stone-400 hover:text-stone-200'
              }`}
              title={spotlightEnabled ? 'Disable focus spotlight' : 'Enable focus spotlight'}
              aria-label="Toggle focus spotlight"
            >
              {spotlightEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            {spotlightEnabled && (
              <button
                onClick={() => setSpotlightExpanded((prev) => !prev)}
                className="p-1 rounded-md text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
                title="Spotlight radius"
              >
                <ChevronUp className={`w-3 h-3 transition-transform ${spotlightExpanded ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="w-px h-5 bg-stone-700/60 mx-0.5" />

        {/* Toggle 4: Ask the Archive RAG */}
        {isFeatureEnabled('rag_archive_chat') && (
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`p-2.5 rounded-xl transition-all flex items-center gap-1.5 ${
              isChatOpen
                ? 'bg-purple-900/50 text-purple-300 border border-purple-500/50'
                : 'hover:bg-stone-800 text-stone-300 hover:text-white'
            }`}
            title="Ask the Archive (Literary RAG)"
            aria-label="Ask the Archive drawer"
          >
            <MessageSquareQuote className="w-4 h-4" />
            <span className="text-xs font-medium pr-1 hidden sm:inline">Ask Archive</span>
          </button>
        )}

        {/* Feature Registry & Kill-Switches */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2.5 rounded-xl hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
          title="Feature Registry & Extensible Toggles"
          aria-label="Sensory Settings"
        >
          <Sliders className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
