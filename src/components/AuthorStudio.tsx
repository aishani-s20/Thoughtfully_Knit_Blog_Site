import React, { useState } from 'react';
import { Sparkles, Play, Check, BookOpen, Layers, Activity, Volume2, ArrowRight, RefreshCw, Feather } from 'lucide-react';
import { useExperience } from '../context/ExperienceContext.tsx';
import { Poem, Stanza } from '../types/index.ts';
import { soundscapeEngine } from '../services/audioEngine.ts';

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
  stanzas: Stanza[];
}

export const AuthorStudio: React.FC<{ onPublishSuccess: (slug: string) => void }> = ({ onPublishSuccess }) => {
  const { addPublishedPoem, toggleAudio, audioEnabled } = useExperience();

  const [markdown, setMarkdown] = useState(SAMPLE_MANUSCRIPT);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [ingestedData, setIngestedData] = useState<IngestedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activePreviewStanza, setActivePreviewStanza] = useState<number | null>(null);
  const [selectedWeatherTab, setSelectedWeatherTab] = useState<'rain' | 'clear' | 'night' | 'fog'>('rain');

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

      // Normalize into Poem stanzas
      const stanzas: Stanza[] = (data.stanzas || []).map((s: any, idx: number) => ({
        id: `ingested-s${idx}`,
        index: idx,
        baseText: s.baseText || '',
        weatherVariants: s.weatherVariants || {},
        sentiment: {
          valence: typeof s.sentiment?.valence === 'number' ? s.sentiment.valence : 0,
          arousal: typeof s.sentiment?.arousal === 'number' ? s.sentiment.arousal : 0.3,
          dominantEmotion: s.sentiment?.dominantEmotion || 'Reflective Stillness',
          musicalKey: s.sentiment?.musicalKey || 'D Minor 9th',
        },
      }));

      setIngestedData({
        title: data.title || 'Untitled Manuscript',
        subtitle: data.subtitle || 'A new study in verse',
        tags: data.tags || ['Poetry', 'Sensory'],
        authorNotes: data.authorNotes || 'No author notes provided.',
        stanzas,
      });
    } catch (err: unknown) {
      console.warn('Ingestion error:', err);
      const msg = err instanceof Error ? err.message : 'Analysis failed';
      setError(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTestStanzaSound = async (stanza: Stanza) => {
    setActivePreviewStanza(stanza.index);
    if (!audioEnabled) {
      await toggleAudio();
    }
    soundscapeEngine.updateSentiment(stanza.sentiment.valence, stanza.sentiment.arousal);
  };

  const handlePublish = () => {
    if (!ingestedData) return;

    const slug = ingestedData.title
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
      readTime: `${Math.max(2, Math.ceil(ingestedData.stanzas.length * 1.5))} min read`,
      coverGradient: 'linear-gradient(135deg, #27272a 0%, #3f3f46 50%, #18181b 100%)',
      tags: ingestedData.tags,
      authorNotes: ingestedData.authorNotes,
      stanzas: ingestedData.stanzas,
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
            <span>Author Ingestion Workbench</span>
          </span>
          <h1 className="font-editorial text-3xl md:text-4xl font-bold text-stone-900 dark:text-stone-100 mt-1">
            Poetic NLP & 2D Sentiment Ingestion
          </h1>
          <p className="font-sans-ui text-xs md:text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-2xl leading-relaxed">
            Drop or edit poetry in Markdown. The pipeline automatically segments stanzas, scores emotional valence & arousal for Tone.js audio mapping, and synthesizes weather variations.
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
                <span>Analyzing Verse...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
                <span>Run Ingestion Pipeline</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300">
          <strong>Ingestion Note:</strong> {error}
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
              placeholder="Paste or write your poem..."
              rows={22}
              className="w-full p-5 font-mono-code text-xs leading-relaxed text-stone-800 dark:text-stone-200 bg-transparent focus:outline-hidden resize-y"
            />
          </div>
          <p className="text-[11px] text-stone-500 leading-normal">
            Tip: Use standard YAML frontmatter for title, subtitle, and tags. Include a <code className="font-mono-code bg-stone-200/60 dark:bg-stone-800 px-1 py-0.5 rounded">## Author Notes</code> section at the bottom for private RAG context.
          </p>
        </div>

        {/* Right Column: Ingestion Results / Analysis */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>Machine Learning Pipeline Output</span>
            {ingestedData && (
              <span className="font-mono-code text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Ready to publish
              </span>
            )}
          </div>

          {!ingestedData ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-stone-300 dark:border-stone-800 bg-stone-50/50 dark:bg-[#151413] space-y-3">
              <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center mx-auto text-stone-500">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-editorial text-lg font-bold text-stone-800 dark:text-stone-200">
                Awaiting Analysis
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                Click <strong>"Run Ingestion Pipeline"</strong> above to extract metadata, segment stanzas, and compute 2D valence/arousal coordinates.
              </p>
            </div>
          ) : (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Metadata Card */}
              <div className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1a1816] shadow-xs space-y-3">
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

                <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500 pt-1">
                  {ingestedData.tags.map((t, idx) => (
                    <span key={idx} className="font-mono-code text-[11px] text-stone-600 dark:text-stone-400">
                      #{t}{idx < ingestedData.tags.length - 1 ? ' · ' : ''}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stanzas & Sentiment Scores */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-medium text-stone-600 dark:text-stone-400">
                  <span>Segmented Stanzas ({ingestedData.stanzas.length})</span>
                  <div className="flex items-center gap-1 text-[11px]">
                    <span className="text-stone-400">Preview Variant:</span>
                    {(['rain', 'clear', 'night', 'fog'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setSelectedWeatherTab(mode)}
                        className={`capitalize px-1.5 py-0.5 rounded ${
                          selectedWeatherTab === mode
                            ? 'bg-stone-800 text-white dark:bg-stone-200 dark:text-stone-900 font-semibold'
                            : 'hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-500'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                {ingestedData.stanzas.map((stanza) => (
                  <div
                    key={stanza.index}
                    className={`p-4 rounded-xl border transition-all ${
                      activePreviewStanza === stanza.index
                        ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700'
                        : 'bg-white dark:bg-[#1a1816] border-stone-200 dark:border-stone-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 pb-2 border-b border-stone-100 dark:border-stone-800/80">
                      <div className="flex items-center gap-2">
                        <span className="font-mono-code text-xs text-stone-400">
                          Stanza {stanza.index + 1}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium">
                          {stanza.sentiment.dominantEmotion}
                        </span>
                        <span className="font-mono-code text-[11px] text-amber-700 dark:text-amber-400">
                          {stanza.sentiment.musicalKey}
                        </span>
                      </div>

                      <button
                        onClick={() => handleTestStanzaSound(stanza)}
                        className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-stone-700 dark:text-stone-300 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 rounded-lg transition-colors"
                        title="Audition ambient chord mapping"
                      >
                        <Volume2 className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        <span>Test Sound</span>
                      </button>
                    </div>

                    {/* Stanza Lines */}
                    <div className="py-3 font-editorial text-sm text-stone-800 dark:text-stone-200 whitespace-pre-wrap leading-relaxed">
                      {stanza.weatherVariants[selectedWeatherTab] || stanza.baseText}
                    </div>

                    {/* 2D Sentiment Gauges */}
                    <div className="pt-2 border-t border-stone-100 dark:border-stone-800/80 grid grid-cols-2 gap-4 text-[11px]">
                      <div>
                        <div className="flex justify-between text-stone-500 mb-1">
                          <span>Valence (Mood)</span>
                          <span className="font-mono-code">{stanza.sentiment.valence.toFixed(2)}</span>
                        </div>
                        <div className="h-1.5 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden flex">
                          <div
                            className={`h-full ${
                              stanza.sentiment.valence < -0.1
                                ? 'bg-indigo-500'
                                : stanza.sentiment.valence > 0.1
                                ? 'bg-emerald-500'
                                : 'bg-amber-500'
                            }`}
                            style={{
                              width: `${Math.round(((stanza.sentiment.valence + 1) / 2) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-stone-500 mb-1">
                          <span>Arousal (Energy)</span>
                          <span className="font-mono-code">{stanza.sentiment.arousal.toFixed(2)}</span>
                        </div>
                        <div className="h-1.5 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-rose-500"
                            style={{ width: `${Math.round(stanza.sentiment.arousal * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
