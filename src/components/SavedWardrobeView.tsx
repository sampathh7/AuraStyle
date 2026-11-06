import React, { useState, useMemo } from 'react';
import { Bookmark, Sparkles, Plus, Shuffle, Layers, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OutfitLook } from '../types';
import { OutfitCard } from './OutfitCard';
import { rankCommunityPostsByCompatibility } from '../utils/styleCompatibility';
import { StyleCompatibilityBadge } from './StyleCompatibilityBadge';
import { WardrobeMixMatchModal } from './WardrobeMixMatchModal';

interface SavedWardrobeViewProps {
  onOpenStudio: () => void;
}

export const SavedWardrobeView: React.FC<SavedWardrobeViewProps> = ({ onOpenStudio }) => {
  const { savedLooks, setActiveOutfitModalLook, communityPosts } = useApp();
  const [filter, setFilter] = useState<string>('all');
  const [activeMixMatchLook, setActiveMixMatchLook] = useState<OutfitLook | null>(null);

  // Compute complementary community pieces based on saved wardrobe
  const rankedCommunityMatches = useMemo(() => {
    return rankCommunityPostsByCompatibility(communityPosts, savedLooks);
  }, [communityPosts, savedLooks]);

  const filtered =
    filter === 'all'
      ? savedLooks
      : filter === 'photo'
      ? savedLooks.filter((l) => l.sourceType === 'photo')
      : filter === 'links'
      ? savedLooks.filter((l) => l.sourceType === 'links')
      : filter === 'curated'
      ? savedLooks.filter((l) => l.sourceType === 'curated')
      : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
            <span>Personal Collection</span>
            <span aria-hidden="true">·</span>
            <span>Saved Offline</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-editorial text-slate-950 dark:text-white">
            Your Recreated Wardrobe ({savedLooks.length})
          </h2>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {savedLooks.length > 0 && (
            <button
              onClick={() => setFilter('mixmatch')}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-slate-800 dark:text-amber-400 border border-slate-700 hover:border-amber-400 text-xs font-semibold transition active:scale-95 whitespace-nowrap"
            >
              <Shuffle className="w-4 h-4 text-amber-400" />
              <span>Mix & Match Community Finds</span>
            </button>
          )}

          <button
            onClick={onOpenStudio}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-semibold shadow-sm transition active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Deconstruct New Look</span>
          </button>
        </div>
      </div>

      {/* Wardrobe Synergy Recommendation Callout Banner */}
      {savedLooks.length > 0 && (
        <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#181f30] to-slate-900 border border-amber-500/25 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0">
              <Shuffle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Closet Expansion Synergy Score</span>
                <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Active
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                AI analyzed {savedLooks.reduce((acc, l) => acc + l.items.length, 0)} garments in your collection. Top community match scores up to{' '}
                <span className="text-amber-400 font-bold">{rankedCommunityMatches[0]?.compatibility.score}%</span> compatibility.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {rankedCommunityMatches[0] && (
              <button
                onClick={() => setActiveMixMatchLook(rankedCommunityMatches[0].post.look)}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl shadow-xs transition active:scale-95 w-full md:w-auto"
              >
                <span>Test Top Match ({rankedCommunityMatches[0].compatibility.score}%)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 text-xs font-medium scrollbar-none">
        {[
          { id: 'all', label: `All Looks (${savedLooks.length})` },
          { id: 'photo', label: 'From Photos' },
          { id: 'links', label: 'From Store Links' },
          { id: 'curated', label: 'Curated Editorials' },
          { id: 'mixmatch', label: `Mix & Match Community Picks (${rankedCommunityMatches.length}) ✨` },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-colors ${
              filter === f.id
                ? 'bg-slate-950 text-white dark:bg-amber-400 dark:text-slate-950 font-semibold'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* View Mode: Mix & Match Recommendations */}
      {filter === 'mixmatch' ? (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Community Pieces Ranked by Style Compatibility:
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rankedCommunityMatches.map(({ post, compatibility }) => (
              <div
                key={post.id}
                className="p-5 rounded-3xl bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm hover:border-amber-400/50 transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Shared by {post.look.authorName} · {post.look.occasion}
                      </span>
                      <h4 className="text-base font-bold font-editorial text-slate-900 dark:text-white mt-0.5">
                        {post.look.title}
                      </h4>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-amber-400/20 text-amber-500 dark:text-amber-300 border border-amber-400/30 tabular-nums">
                        {compatibility.score}% Match
                      </span>
                    </div>
                  </div>

                  {/* Compatibility Badge & Accordion */}
                  <StyleCompatibilityBadge
                    compatibility={compatibility}
                    onExploreMixMatch={() => setActiveMixMatchLook(post.look)}
                  />

                  {/* Deconstructed preview chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {post.look.items.map((it) => (
                      <span
                        key={it.id}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px]"
                      >
                        {it.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => setActiveOutfitModalLook(post.look)}
                    className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-amber-500 transition"
                  >
                    View Deals & Deconstruction →
                  </button>

                  <button
                    onClick={() => setActiveMixMatchLook(post.look)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition active:scale-95"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>Mix & Match Lab</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Regular Grid of Saved Outfits */
        filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-400/10 text-amber-500 mx-auto flex items-center justify-center mb-3">
              <Bookmark className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold font-editorial text-slate-950 dark:text-white">
              No Outfits in this Filter
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Upload an outfit photo or link products in the AI Stylist to save looks here.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((look) => (
              <OutfitCard
                key={look.id}
                look={look}
                onOpenDetails={(l) => setActiveOutfitModalLook(l)}
              />
            ))}
          </div>
        )
      )}

      {/* Interactive Mix & Match Modal */}
      {activeMixMatchLook && (
        <WardrobeMixMatchModal
          communityLook={activeMixMatchLook}
          onClose={() => setActiveMixMatchLook(null)}
        />
      )}
    </div>
  );
};
