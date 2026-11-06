import React from 'react';
import { Heart, Share2, Sparkles, PlusCircle, ArrowUpRight } from 'lucide-react';
import { OutfitLook } from '../types';
import { useApp } from '../context/AppContext';
import { formatPrice, convertAmount } from '../utils/currencies';

interface OutfitCardProps {
  look: OutfitLook;
  onOpenDetails: (look: OutfitLook) => void;
  onAddToCapsule?: (look: OutfitLook) => void;
}

export const OutfitCard: React.FC<OutfitCardProps> = ({
  look,
  onOpenDetails,
  onAddToCapsule,
}) => {
  const { currency, toggleLikeLook, setShareModalLook } = useApp();

  const convertedDupePrice = convertAmount(
    look.budgetSummary.budgetDupeTotal,
    look.budgetSummary.currency,
    currency
  );
  const convertedOriginalPrice = convertAmount(
    look.budgetSummary.totalOriginalEstimate,
    look.budgetSummary.currency,
    currency
  );

  return (
    <article className="group bg-[#121824] rounded-2xl border border-slate-800/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
      {/* Visual Canvas Area with Fallback Silhouette */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-100 via-amber-50/30 to-slate-200 dark:from-slate-900 dark:via-[#161F30] dark:to-slate-950 flex items-center justify-center overflow-hidden">
        {look.imageVisualUrl ? (
          <img
            src={look.imageVisualUrl}
            alt={look.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="text-center p-6 flex flex-col items-center">
            {/* Elegant SVG mannequin / couture geometry */}
            <div className="w-16 h-16 rounded-full bg-amber-400/10 dark:bg-amber-400/5 border border-amber-400/20 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-3 group-hover:scale-110 transition-transform">
              <Sparkles className="w-7 h-7" />
            </div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 font-editorial tracking-wide">
              {look.occasion}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {look.items.length} pieces coordinated
            </span>
          </div>
        )}

        {/* Top Left Badges: 3D Try-On Ready */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10 pointer-events-none">
          <span className="flex items-center gap-1 text-[10px] font-bold bg-black/65 text-amber-300 backdrop-blur-md px-2 py-0.5 rounded-full border border-amber-400/30 shadow-xs">
            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
            <span>3D AR Ready</span>
          </span>
        </div>

        {/* Floating Top Actions: Like & Share */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShareModalLook(look);
            }}
            className="p-2 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 backdrop-blur-md shadow-sm transition-transform active:scale-90"
            title="Share with friends"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleLikeLook(look.id);
            }}
            className="p-2 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 backdrop-blur-md shadow-sm transition-transform active:scale-90 flex items-center gap-1"
            title="Save to favorites"
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                look.hasLiked ? 'fill-rose-500 text-rose-500' : 'hover:text-rose-500'
              }`}
            />
            <span className="text-[10px] font-semibold tabular-nums pr-0.5">
              {look.likesCount}
            </span>
          </button>
        </div>

        {/* Bottom Color Swatches Bar */}
        <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full text-white z-10">
          {look.colorPalette.slice(0, 4).map((c, idx) => (
            <span
              key={idx}
              className="w-3 h-3 rounded-full border border-white/40 shadow-sm"
              style={{ backgroundColor: c.hex }}
              title={c.name}
            />
          ))}
          <span className="text-[10px] font-medium text-slate-200 pl-0.5">
            {look.colorPalette[0]?.name}
          </span>
        </div>
      </div>

      {/* Card Content Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata clean unboxed text */}
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>{look.occasion}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{look.vibe}</span>
          </div>

          <h3 className="text-base sm:text-lg font-semibold font-editorial text-white mt-1 group-hover:text-amber-400 transition-colors line-clamp-1">
            {look.title}
          </h3>

          <p className="mt-1.5 text-xs text-slate-300 line-clamp-2 leading-relaxed">
            {look.styleBreakdown}
          </p>

          {/* Garments Preview List with Garment / Shirt Images */}
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
            {look.items.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300"
              >
                <div className="flex items-center gap-2 truncate max-w-[200px]">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-5 h-5 rounded-md object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  )}
                  <span className="truncate">{item.name}</span>
                </div>
                <span className="text-slate-500 dark:text-slate-400 text-[11px] shrink-0 font-medium tabular-nums">
                  {formatPrice(
                    convertAmount(
                      item.deals[0]?.estimatedPrice || 999,
                      item.deals[0]?.currency || 'INR',
                      currency
                    ),
                    currency
                  )}
                </span>
              </div>
            ))}
            {look.items.length > 3 && (
              <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium pl-7">
                +{look.items.length - 3} more footwear & accessories
              </div>
            )}
          </div>
        </div>

        {/* Pricing & CTA Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 line-through tabular-nums">
              {formatPrice(convertedOriginalPrice, currency)}
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-slate-950 dark:text-white tabular-nums">
                {formatPrice(convertedDupePrice, currency)}
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                {look.budgetSummary.potentialSavingsPercentage}% off
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onAddToCapsule && (
              <button
                onClick={() => onAddToCapsule(look)}
                className="p-2 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Add to Event Capsule"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => onOpenDetails(look)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100 bg-slate-100 hover:bg-amber-400 hover:text-slate-950 dark:bg-slate-800 dark:hover:bg-amber-400 dark:hover:text-slate-950 rounded-lg transition-all"
            >
              <span>View Deals</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
