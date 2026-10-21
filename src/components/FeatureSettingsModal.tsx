import React, { useState } from 'react';
import { X, Sliders, Plus, Check, Shield, Sparkles, Volume2, CloudRain, MessageSquareQuote, Compass, Eye } from 'lucide-react';
import { useExperience } from '../context/ExperienceContext.tsx';
import { FeatureCategory } from '../types/index.ts';

export const FeatureSettingsModal: React.FC = () => {
  const { isSettingsOpen, setIsSettingsOpen, features, toggleFeature, addCustomFeature } = useExperience();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newFeatureName, setNewFeatureName] = useState('');
  const [newFeatureCategory, setNewFeatureCategory] = useState<FeatureCategory>('sensory');
  const [newFeatureDesc, setNewFeatureDesc] = useState('');

  if (!isSettingsOpen) return null;

  const handleAddFeature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeatureName.trim()) return;
    addCustomFeature(newFeatureName.trim(), newFeatureDesc.trim() || 'Custom registered module for Thoughtfully Knit.', newFeatureCategory);
    setNewFeatureName('');
    setNewFeatureDesc('');
    setShowAddForm(false);
  };

  const getCategoryIcon = (category: FeatureCategory) => {
    switch (category) {
      case 'sensory':
        return <Eye className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      case 'atmosphere':
        return <CloudRain className="w-4 h-4 text-sky-600 dark:text-sky-400" />;
      case 'intelligence':
        return <MessageSquareQuote className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'authoring':
        return <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      default:
        return <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-[#fbf9f5] dark:bg-[#181615] border border-[#e5e0d8] dark:border-[#2f2b28] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e0d8] dark:border-[#2f2b28]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-stone-200/60 dark:bg-stone-800 text-stone-800 dark:text-stone-200">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-editorial text-xl font-bold text-stone-900 dark:text-stone-100">
                Sensory & Feature Registry
              </h2>
              <p className="font-sans-ui text-xs text-stone-500 dark:text-stone-400">
                Toggle reading capabilities or register future extensions
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feature List */}
        <div className="p-6 overflow-y-auto space-y-3.5 flex-1">
          {features.map((feat) => (
            <div
              key={feat.id}
              className={`p-4 rounded-xl border transition-all ${
                feat.enabled
                  ? 'bg-white dark:bg-[#201d1a] border-stone-300 dark:border-stone-700/80 shadow-xs'
                  : 'bg-stone-100/60 dark:bg-[#141312] border-stone-200 dark:border-stone-800/60 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(feat.category)}
                    <span className="font-medium text-sm text-stone-900 dark:text-stone-100">
                      {feat.name}
                    </span>
                    {feat.badge && (
                      <span className="text-[10px] tracking-wide uppercase px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-mono-code">
                        {feat.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed pr-2">
                    {feat.description}
                  </p>
                </div>

                {/* Custom Toggle Switch */}
                <button
                  onClick={() => toggleFeature(feat.id)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    feat.enabled ? 'bg-amber-800 dark:bg-amber-600' : 'bg-stone-300 dark:bg-stone-700'
                  }`}
                  role="switch"
                  aria-checked={feat.enabled}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      feat.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}

          {/* Add Future Feature Section */}
          <div className="pt-2">
            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full py-2.5 px-4 rounded-xl border border-dashed border-stone-300 dark:border-stone-700 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:border-stone-400 dark:hover:border-stone-600 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register a Future Feature or Extension</span>
              </button>
            ) : (
              <form onSubmit={handleAddFeature} className="p-4 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#201d1a] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
                    Register New Sensory Module
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                    Feature Name
                  </label>
                  <input
                    type="text"
                    value={newFeatureName}
                    onChange={(e) => setNewFeatureName(e.target.value)}
                    placeholder="e.g., Binaural Beat Generator, RSVP Speed Pacer"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-[#fbf9f5] dark:bg-[#181615] text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-amber-700"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                      Category
                    </label>
                    <select
                      value={newFeatureCategory}
                      onChange={(e) => setNewFeatureCategory(e.target.value as FeatureCategory)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-[#fbf9f5] dark:bg-[#181615] text-stone-900 dark:text-stone-100 focus:outline-hidden"
                    >
                      <option value="sensory">Sensory / Audio</option>
                      <option value="atmosphere">Atmosphere / Environment</option>
                      <option value="intelligence">Intelligence / RAG</option>
                      <option value="authoring">Authoring / Studio</option>
                      <option value="platform">Platform / Tool</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                      Short Description
                    </label>
                    <input
                      type="text"
                      value={newFeatureDesc}
                      onChange={(e) => setNewFeatureDesc(e.target.value)}
                      placeholder="e.g., Generates 40Hz gamma waves"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-[#fbf9f5] dark:bg-[#181615] text-stone-900 dark:text-stone-100 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-1.5 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-medium text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Register Feature
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-stone-100/70 dark:bg-[#121110] border-t border-[#e5e0d8] dark:border-[#2f2b28] flex items-center justify-between text-xs text-stone-500">
          <span>Preferences persist automatically across reading sessions.</span>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="px-4 py-1.5 text-xs font-medium text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 rounded-lg hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
