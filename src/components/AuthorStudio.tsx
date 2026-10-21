import React, { useState } from 'react';
import { Sparkles, Check, BookOpen, Volume2, ArrowRight, RefreshCw, Feather, Music, Tag } from 'lucide-react';
import { useExperience } from '../context/ExperienceContext.tsx';
import { Poem } from '../types/index.ts';
import { PRESET_SOUNDSCAPES, getSoundscapeById } from '../config/soundscapes.ts';

const SAMPLE_MANUSCRIPT = `---
title: The Glassmaker's Breath
subtitle: On thermal tension, silica, and the fragility of vows
tags:
  - Craft
  - Fire
  - Solitude
---

The furnace holds sixteen hundred degrees of yellow sun.
Gathering honey-thick glass upon the iron blowpipe,
the craftsman leans his cheek toward the blast,
measuring temperature not with dials, but with the dry heat against his eyelashes.

To shape molten silica is to negotiate with time.
Before the amber cools to stubborn grey,
the breath must travel through four feet of hollow steel
to expand a hollow chamber where light can rest.

## Author Notes
Drafted after visiting an artisanal hot-shop in Firozabad during early winter. The glassmaker remarked that the most dangerous moment is not when the glass is red-hot, but during the annealing cycle—when cooling too rapidly causes internal crystallization fractures. The poem meditates on emotional annealing: how sudden cooling shatters trust that fire had patiently forged.`;

interface IngestedResult {
  title: string;
  subtitle: string;
  tags: string[];
  authorNotes: string;
  fullText: string;
  selectedSoundscapeId: string;
  soundscapeName: string;
  soundscapeRationale: string;
  overallMood: string;
}

export const AuthorStudio: React.FC<{ onPublishSuccess: (slug: string) => void }> = ({ onPublishSuccess }) => {
  const { addPublishedPoem, toggleAudio, audioEnabled, setActiveSoundscape, activeSoundscape } = useExperience();

  const [markdown, setMarkdown] = useState(SAMPLE_MANUSCRIPT);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [ingestedData, setIngestedData] = useState<IngestedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunAnalysis = async () => {
    if (!markdown.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/gemini/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawMarkdown: markdown }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with ${response.status}`);
      }

      const data = await response.json();

      setIngestedData({
        title: data.title || 'Untitled Manuscript',
        subtitle: data.subtitle || 'A study in literary verse',
        tags: data.tags || ['Poetry', 'Sensory'],
        authorNotes: data.authorNotes || 'No author notes provided.',
        fullText: data.fullText || markdown,
        selectedSoundscapeId: data.selectedSoundscapeId || 'crackling_hearth',
        soundscapeName: data.soundscapeName || 'Fireplace & Hearth Sound',
        soundscapeRationale: data.soundscapeRationale || 'Warm crackling fire embers matching the artisanal glass furnace.',
        overallMood: data.overallMood || 'Warm Craft & Fire',
      });

      // Automatically cue the chosen soundscape
      setActiveSoundscape(data.selectedSoundscapeId || 'crackling_hearth');
    } catch (err: unknown) {
      console.warn('Ingestion error:', err);
      const msg = err instanceof Error ? err.message : 'Analysis failed';
      setError(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTestSoundscape = async () => {
    if (!audioEnabled) {
      await toggleAudio();
    }
    if (ingestedData) {
      setActiveSoundscape(ingestedData.selectedSoundscapeId);
    }
  };

  const handleSoundscapeChange = (presetId: string) => {
    if (!ingestedData) return;
    const preset = getSoundscapeById(presetId);
    setIngestedData({
      ...ingestedData,
      selectedSoundscapeId: preset.id,
      soundscapeName: preset.name,
    });
    setActiveSoundscape(preset.id);
  };

  const handlePublish = () => {
    if (!ingestedData) return;

    const slug =
      ingestedData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || `poem-${Date.now()}`;

    const newPoem: Poem = {
      id: slug,
      slug,
      title: ingestedData.title,
      subtitle: ingestedData.subtitle,
      author: 'A. Samit',
      publishedAt: 'Today',
      readTime: '3 min read',
      coverGradient: 'linear-gradient(135deg, #27272a 0%, #3f3f46 50%, #18181b 100%)',
      tags: ingestedData.tags,
      authorNotes: ingestedData.authorNotes,
      fullText: ingestedData.fullText,
      soundscapeId: ingestedData.selectedSoundscapeId,
      soundscapeName: ingestedData.soundscapeName,
      soundscapeRationale: ingestedData.soundscapeRationale,
      overallMood: ingestedData.overallMood,
    };

    addPublishedPoem(newPoem);
    onPublishSuccess(slug);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#e5e0d8] dark:border-[#2d2a26]">
        <div>
          <span className="font-mono-code text-xs uppercase tracking-widest text-amber-800 dark:text-amber-500 font-semibold flex items-center gap-1.5">
            <Feather className="w-3.5 h-3.5" />
            <span>Whole-Text Literary Evaluator</span>
          </span>
          <h1 className="font-editorial text-3xl md:text-4xl font-bold text-stone-900 dark:text-stone-100 mt-1">
            Poetic Evaluation & Predetermined Soundscape Matching
          </h1>
          <p className="font-sans-ui text-xs md:text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-2xl leading-relaxed">
            The AI evaluates the manuscript as an unbroken literary whole, preserves your exact text, and selects the most cohesive predetermined soundscape palette from our curated library.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setMarkdown(SAMPLE_MANUSCRIPT)}
            className="px-3 py-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
          >
            Reset Sample
          </button>
          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-medium text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-sm"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Evaluating Manuscript...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
                <span>Evaluate Entire Text</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300">
          <strong>Evaluation Note:</strong> {error}
        </div>
      )}

      {/* Split-Screen Workbench Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Markdown Input */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>Manuscript Source (Markdown + Frontmatter)</span>
            <span className="font-mono-code">{markdown.length} chars</span>
          </div>

          <div className="relative rounded-2xl border border-stone-300 dark:border-stone-800 bg-white dark:bg-[#1a1816] shadow-xs overflow-hidden">
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Paste or write your complete poem..."
              rows={22}
              className="w-full p-5 font-mono-code text-xs leading-relaxed text-stone-800 dark:text-stone-200 bg-transparent focus:outline-hidden resize-y"
            />
          </div>
          <p className="text-[11px] text-stone-500 leading-normal">
            Your text is evaluated as a single cohesive unit. Line breaks, punctuation, and stanza spacing are preserved without alterations.
          </p>
        </div>

        {/* Right Column: Ingestion Results / Analysis */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>Evaluated Literary & Acoustic Profile</span>
            {ingestedData && (
              <span className="font-mono-code text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Ready to publish
              </span>
            )}
          </div>

          {!ingestedData ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-stone-300 dark:border-stone-800 bg-stone-50/50 dark:bg-[#151413] space-y-3">
              <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center mx-auto text-stone-500">
                <Volume2 className="w-5 h-5" />
              </div>
              <h3 className="font-editorial text-lg font-bold text-stone-800 dark:text-stone-200">
                Awaiting Evaluation
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                Click <strong>"Evaluate Entire Text"</strong> to analyze your poem's mood and assign a cohesive predetermined soundscape.
              </p>
            </div>
          ) : (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Metadata & Chosen Soundscape Card */}
              <div className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1a1816] shadow-xs space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-editorial text-2xl font-bold text-stone-900 dark:text-stone-100">
                      {ingestedData.title}
                    </h2>
                    <p className="font-editorial italic text-stone-600 dark:text-stone-400 text-sm mt-0.5">
                      {ingestedData.subtitle}
                    </p>
                  </div>
                  <button
                    onClick={handlePublish}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-amber-800 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500 rounded-xl transition-all shadow-xs"
                  >
                    <span>Publish Live</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500">
                  {ingestedData.tags.map((t, idx) => (
                    <span key={idx} className="font-mono-code text-[11px] text-stone-600 dark:text-stone-400">
                      #{t}{idx < ingestedData.tags.length - 1 ? ' · ' : ''}
                    </span>
                  ))}
                </div>

                {/* AI Selected Predetermined Soundscape Box */}
                <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/60 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                          Selected Natural Soundscape
                        </span>
                      </div>
                      <h4 className="font-editorial text-lg font-bold text-stone-900 dark:text-stone-100">
                        {ingestedData.soundscapeName}
                      </h4>
                      <p className="text-xs text-stone-600 dark:text-stone-400 italic">
                        "{ingestedData.soundscapeRationale}"
                      </p>
                    </div>

                    <button
                      onClick={handleTestSoundscape}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-900 dark:text-amber-200 bg-amber-200/60 dark:bg-amber-900/40 hover:bg-amber-200 dark:hover:bg-amber-800/60 rounded-lg transition-colors border border-amber-300 dark:border-amber-700/60 shrink-0"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Audition Sound</span>
                    </button>
                  </div>

                  {/* Manual Soundscape Override Dropdown */}
                  <div className="pt-2 border-t border-amber-200/50 dark:border-amber-800/40 flex items-center justify-between text-xs">
                    <span className="text-stone-500 text-[11px]">Override soundscape:</span>
                    <select
                      value={ingestedData.selectedSoundscapeId}
                      onChange={(e) => handleSoundscapeChange(e.target.value)}
                      className="px-2 py-1 text-xs rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#1a1816] text-stone-900 dark:text-stone-100 focus:outline-hidden"
                    >
                      {PRESET_SOUNDSCAPES.map((preset) => (
                        <option key={preset.id} value={preset.id}>
                          {preset.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Full Unbroken Manuscript Preview */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Unbroken Manuscript Preview
                  </span>
                  <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-[#151413] font-editorial text-sm text-stone-800 dark:text-stone-200 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                    {ingestedData.fullText}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
