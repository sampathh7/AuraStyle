import React, { useState } from 'react';
import { Camera, Link2, Sparkles, TrendingDown, Globe2, ShieldCheck, Search, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface HeroSectionProps {
  onOpenPhotoStudio: () => void;
  onOpenLinkStudio: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenPhotoStudio,
  onOpenLinkStudio,
}) => {
  const { setActiveTab, savedLooks, setActiveOutfitModalLook, executeGlobalSearch, omniSearchText } = useApp();
  const [heroQuery, setHeroQuery] = useState(omniSearchText || '');

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroQuery.trim()) return;
    executeGlobalSearch(heroQuery);
  };

  const handleOpenSnapchatStudio = () => {
    if (savedLooks.length > 0) {
      setActiveOutfitModalLook(savedLooks[0]);
    }
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-16 border-b border-slate-200/60 dark:border-slate-800/60">
      {/* Subtle luxury ambient backlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-amber-500/10 via-amber-400/5 to-transparent blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          {/* Top subtle kicker without pill badges */}
          <div className="flex items-center justify-center gap-2 text-xs font-semibold tracking-wider uppercase text-amber-600 dark:text-amber-400 mb-3">
            <span className="text-[#FFFC00] font-black">●</span>
            <span>Snapchat 3D Bitmoji Studio Ready</span>
            <span aria-hidden="true">·</span>
            <span>Global & Indian Markets</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-editorial font-bold text-slate-950 dark:text-white tracking-tight leading-[1.15] text-balance">
            Recreate any event outfit. <br className="hidden sm:block" />
            <span className="italic font-normal bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 dark:from-amber-300 dark:via-amber-400 dark:to-amber-200 bg-clip-text text-transparent">
              Discovered on a budget.
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Upload an outfit photo or paste garment links. AuraStyle’s AI deconstructs silhouettes, finds identical budget dupes, and offers live Snapchat 3D Bitmoji dressing try-ons and AR camera lenses.
          </p>

          {/* Hero Omni-Search Bar */}
          <div className="mt-8 max-w-2xl mx-auto">
            <form onSubmit={handleHeroSearchSubmit} className="relative flex items-center gap-2 bg-[#101724]/90 p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl border border-slate-800 shadow-xl shadow-black/40 backdrop-blur-md">
              <div className="relative flex-1">
                <Search className="w-4 sm:w-5 h-4 sm:h-5 absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-amber-400" />
                <input
                  type="text"
                  value={heroQuery}
                  onChange={(e) => setHeroQuery(e.target.value)}
                  placeholder="Search any product, outfit, or book across Amazon, Zara, Myntra, Walmart..."
                  className="w-full pl-10 sm:pl-12 pr-8 sm:pr-10 py-2.5 sm:py-3 bg-transparent text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none"
                />
                {heroQuery && (
                  <button
                    type="button"
                    onClick={() => setHeroQuery('')}
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 cursor-pointer"
                  >
                    <X className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition active:scale-95 shadow-md shadow-amber-500/20 shrink-0 cursor-pointer"
              >
                <Search className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                <span className="hidden sm:inline">Search Deals</span>
                <span className="sm:hidden">Go</span>
              </button>
            </form>

            {/* Trending Quick Search Chips */}
            <div className="mt-3 flex items-center justify-center gap-1.5 flex-wrap text-xs">
              <span className="text-slate-400 text-[11px] font-medium">Trending:</span>
              {[
                { label: 'Atomic Habits', tab: 'books' as const },
                { label: 'Sony WH-1000XM5', tab: 'universal' as const },
                { label: 'Zara Linen Blazer', tab: 'stylist' as const },
                { label: 'iPhone 15 Pro', tab: 'universal' as const },
                { label: 'Dune', tab: 'books' as const },
                { label: 'Silk Sangeet', tab: 'stylist' as const },
              ].map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => {
                    setHeroQuery(chip.label);
                    executeGlobalSearch(chip.label, chip.tab);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-800 hover:border-slate-700 transition text-[11px] cursor-pointer"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Triggers */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleOpenSnapchatStudio}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-slate-950 bg-[#FFFC00] hover:bg-yellow-300 rounded-xl shadow-lg shadow-yellow-500/25 active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950" />
              <span>Snapchat 3D Bitmoji Studio</span>
            </button>

            <button
              onClick={onOpenPhotoStudio}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 dark:bg-amber-400 dark:hover:bg-amber-300 rounded-xl shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer"
            >
              <Camera className="w-4 h-4 text-slate-950" />
              <span>Deconstruct from Photo</span>
            </button>

            <button
              onClick={onOpenLinkStudio}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold text-slate-800 dark:text-slate-100 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700/90 border border-slate-200 dark:border-slate-700 rounded-xl active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer"
            >
              <Link2 className="w-4 h-4 text-amber-500" />
              <span>Pair Store Links</span>
            </button>
          </div>

          {/* Quick Domain Switchers */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Also search:</span>
            <button
              onClick={() => setActiveTab('books')}
              className="font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Books Finder</span>
              <span aria-hidden="true">→</span>
            </button>
            <span className="text-slate-400 dark:text-slate-600">·</span>
            <button
              onClick={() => setActiveTab('universal')}
              className="font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Universal Product Search</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>

          {/* Value Props Strip */}
          <div className="mt-10 pt-8 border-t border-slate-200/60 dark:border-slate-800/60 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50">
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 shrink-0">
                <Globe2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white">Dual-Market Search</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Simultaneous deals across Indian (Myntra, Ajio) and foreign retailers (Zara, ASOS).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50">
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 shrink-0">
                <TrendingDown className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white">50%–70% Savings</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  High-street identical fabrics and cuts sorted from the lowest price.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50">
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white">Offline Access</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Access saved invitation checklists at the store or venue without internet.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
