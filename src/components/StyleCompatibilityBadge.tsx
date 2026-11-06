import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Layers, Palette, RefreshCw } from 'lucide-react';
import { WardrobeMatchResult } from '../utils/styleCompatibility';

interface StyleCompatibilityBadgeProps {
  compatibility: WardrobeMatchResult;
  onExploreMixMatch?: () => void;
  compact?: boolean;
}

export const StyleCompatibilityBadge: React.FC<StyleCompatibilityBadgeProps> = ({
  compatibility,
  onExploreMixMatch,
  compact = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 80) return 'text-amber-500 dark:text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-blue-500 dark:text-blue-400 bg-blue-500/10 border-blue-500/30';
  };

  const getBadgeGradient = (score: number) => {
    if (score >= 90) return 'from-emerald-500/20 via-teal-500/10 to-transparent';
    if (score >= 80) return 'from-amber-500/20 via-yellow-500/10 to-transparent';
    return 'from-blue-500/20 via-indigo-500/10 to-transparent';
  };

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border backdrop-blur-md bg-black/60 shadow-xs">
        <Sparkles className="w-3 h-3 text-amber-400" />
        <span className="text-white tabular-nums">{compatibility.score}%</span>
        <span className="text-slate-300 font-medium text-[10px]">Wardrobe Match</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-200">
      {/* Primary Summary Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3 sm:p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800/40 transition select-none"
      >
        <div className="flex items-center gap-3">
          {/* Radial / Pill Score Display */}
          <div
            className={`flex items-center justify-center px-2.5 py-1 rounded-xl border font-bold text-xs tabular-nums ${getScoreColor(
              compatibility.score
            )}`}
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            <span>{compatibility.score}% Match</span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {compatibility.matchLevel}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 hidden sm:inline">
                with your saved wardrobe
              </span>
            </div>
            {compatibility.matchingSavedItems.length > 0 && (
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium block truncate max-w-xs sm:max-w-md">
                Pairs with {compatibility.matchingSavedItems.length} of your saved closet pieces
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onExploreMixMatch && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onExploreMixMatch();
              }}
              className="px-2.5 py-1 text-[11px] font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg transition active:scale-95"
            >
              Mix & Match
            </button>
          )}
          <button
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
            aria-label={isExpanded ? 'Collapse breakdown' : 'Expand breakdown'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Dimensional Breakdown & Formulas */}
      {isExpanded && (
        <div className="p-3.5 sm:p-4 pt-1 border-t border-slate-200/80 dark:border-slate-800 space-y-3.5 bg-white/50 dark:bg-slate-950/40">
          {/* 3 Metric Dimension Progress Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            {/* Color Harmony */}
            <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                  <Palette className="w-3 h-3 text-amber-500" />
                  Color Harmony
                </span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                  {compatibility.colorHarmonyScore}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${compatibility.colorHarmonyScore}%` }}
                />
              </div>
            </div>

            {/* Mix Versatility */}
            <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                  <Layers className="w-3 h-3 text-emerald-500" />
                  Versatility
                </span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                  {compatibility.versatilityScore}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${compatibility.versatilityScore}%` }}
                />
              </div>
            </div>

            {/* Aesthetic Cohesion */}
            <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                  <RefreshCw className="w-3 h-3 text-blue-500" />
                  Aesthetic Fit
                </span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                  {compatibility.aestheticScore}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-400 rounded-full transition-all duration-500"
                  style={{ width: `${compatibility.aestheticScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Palette commentary */}
          <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-amber-500/5 dark:bg-amber-400/5 p-2 rounded-lg border border-amber-500/15">
            {compatibility.paletteHarmonyDescription}
          </p>

          {/* Specific Matching Wardrobe Items */}
          {compatibility.matchingSavedItems.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Complements Your Saved Closet:
              </span>
              <div className="space-y-1">
                {compatibility.matchingSavedItems.slice(0, 2).map((match, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-slate-100/50 dark:bg-slate-900/50 text-xs flex items-start gap-2 border border-slate-200/50 dark:border-slate-800/50"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {match.item.name}
                      </span>{' '}
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                        ({match.savedLookTitle})
                      </span>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                        {match.pairingReason}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Concrete Mix & Match Combo Formulas */}
          {compatibility.mixMatchCombos.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Suggested Mix-and-Match Formula:
              </span>
              {compatibility.mixMatchCombos.slice(0, 1).map((combo, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-500/20 text-xs space-y-1"
                >
                  <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400 text-[11px]">
                    <Sparkles className="w-3 h-3" />
                    <span>{combo.formulaName}</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 text-xs">
                    {combo.stylingAdvice}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
