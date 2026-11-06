import React, { useState } from 'react';
import {
  X,
  Share2,
  Heart,
  ExternalLink,
  Plus,
  Check,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  TrendingDown,
  Ruler,
  Camera,
  Eye,
  Image as ImageIcon,
} from 'lucide-react';
import { OutfitLook, ClothingItem, StoreDeal } from '../types';
import { useApp } from '../context/AppContext';
import { formatPrice, convertAmount } from '../utils/currencies';
import { SizeFitEstimator } from './SizeFitEstimator';
import { VirtualTryOnModal } from './VirtualTryOnModal';
import { calculateStyleCompatibility } from '../utils/styleCompatibility';
import { StyleCompatibilityBadge } from './StyleCompatibilityBadge';
import { WardrobeMixMatchModal } from './WardrobeMixMatchModal';
import { WebsiteProductModal } from './WebsiteProductModal';

interface OutfitDetailModalProps {
  look: OutfitLook | null;
  onClose: () => void;
}

export const OutfitDetailModal: React.FC<OutfitDetailModalProps> = ({ look, onClose }) => {
  const {
    currency,
    toggleLikeLook,
    setShareModalLook,
    capsules,
    addPieceToCapsule,
    savedLooks,
  } = useApp();

  const [selectedCapsuleId, setSelectedCapsuleId] = useState<string>(
    capsules[0]?.id || ''
  );
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});
  const [activeEstimatorItemId, setActiveEstimatorItemId] = useState<string | null>(null);
  const [isTryOnOpen, setIsTryOnOpen] = useState(false);
  const [isMixMatchModalOpen, setIsMixMatchModalOpen] = useState(false);
  const [inspectedDeal, setInspectedDeal] = useState<{ deal: StoreDeal; item: ClothingItem } | null>(null);

  if (!look) return null;

  const handleAddPiece = (item: ClothingItem) => {
    if (!selectedCapsuleId) return;
    const topDeal = item.deals[0];
    const converted = convertAmount(
      topDeal?.estimatedPrice || 999,
      topDeal?.currency || 'INR',
      currency
    );

    addPieceToCapsule(selectedCapsuleId, {
      itemName: item.name,
      category: item.category,
      price: converted,
      currency,
      storeName: topDeal?.storeName || 'Online Store',
      storeUrl: topDeal?.searchUrl || '#',
    });

    setAddedItemIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [item.id]: false }));
    }, 2500);
  };

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#0E131F] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>{look.occasion}</span>
              <span aria-hidden="true">·</span>
              <span>{look.vibe}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-editorial text-slate-950 dark:text-white mt-0.5">
              {look.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTryOnOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 shadow-xs transition active:scale-95"
              title="Virtual Try-On 3D / AR"
            >
              <Camera className="w-3.5 h-3.5 text-slate-950" />
              <span>Virtual Try-On 3D</span>
            </button>
            <button
              onClick={() => setShareModalLook(look)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              title="Share look"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => toggleLikeLook(look.id)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition flex items-center gap-1"
              title="Like"
            >
              <Heart
                className={`w-4 h-4 ${
                  look.hasLiked ? 'fill-rose-500 text-rose-500' : ''
                }`}
              />
              <span className="text-xs font-semibold tabular-nums">{look.likesCount}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1">
          {/* Snapchat 3D Bitmoji & Live AR Try-On Showcase Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#181a24] to-[#0d121c] text-white border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#FFFC00]/20 text-[#FFFC00] flex items-center justify-center shrink-0 border border-[#FFFC00]/30 shadow-md">
                <Sparkles className="w-5 h-5 fill-[#FFFC00]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Snapchat 3D Bitmoji Dressing Model</span>
                  <span className="text-[10px] bg-[#FFFC00] text-slate-950 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                    Snap AR Lens
                  </span>
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Stylized Bitmoji avatar with poses (Peace ✌️, Strut 💃, Selfie 🤳), live AR camera lens, circular lens carousel, and custom sticker generator.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsTryOnOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-[#FFFC00] hover:bg-yellow-300 text-slate-950 shadow-md transition shrink-0 w-full sm:w-auto justify-center active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>Launch Bitmoji AR Studio</span>
            </button>
          </div>

          {/* Style Compatibility Score with Saved Wardrobe */}
          <StyleCompatibilityBadge
            compatibility={calculateStyleCompatibility(look, savedLooks)}
            onExploreMixMatch={() => setIsMixMatchModalOpen(true)}
          />

          {/* Aesthetic Narrative & Palette Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/5 dark:bg-amber-400/5 border border-amber-500/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="max-w-xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                Silhouette & Aesthetic Blueprint
              </span>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {look.styleBreakdown}
              </p>
            </div>

            {/* Color Palette Swatches */}
            <div className="shrink-0">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
                Target Palette
              </span>
              <div className="flex items-center gap-2">
                {look.colorPalette.map((c, i) => (
                  <div key={i} className="text-center">
                    <span
                      className="w-7 h-7 rounded-xl border border-slate-300 dark:border-slate-700 shadow-sm block"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 block mt-1 max-w-[48px] truncate">
                      {c.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Capsule Selector Helper */}
          {capsules.length > 0 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <ShoppingBag className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Assign pieces to your invitation checklist:</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={selectedCapsuleId}
                  onChange={(e) => setSelectedCapsuleId(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium text-xs focus:ring-1 focus:ring-amber-500 outline-none w-full sm:w-auto"
                >
                  {capsules.map((cap) => (
                    <option key={cap.id} value={cap.id}>
                      {cap.eventName} ({cap.dressCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Itemized Garment Deconstruction List */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Itemized Garments & Cross-Store Dupe Matrix ({look.items.length} pieces)
            </h3>

            <div className="space-y-4">
              {look.items.map((item, index) => {
                const bestDeal = item.deals[0];
                const convertedBestPrice = bestDeal
                  ? convertAmount(bestDeal.estimatedPrice, bestDeal.currency, currency)
                  : 999;
                const convertedOrigItemPrice = bestDeal?.originalPrice
                  ? convertAmount(bestDeal.originalPrice, bestDeal.currency, currency)
                  : convertedBestPrice * 2.2;

                return (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121826] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition shadow-sm space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {/* Garment Image Thumbnail with in-app zoom trigger */}
                        <div
                          onClick={() => setInspectedDeal({ deal: item.deals[0] || null, item })}
                          className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 shrink-0 cursor-pointer group/thumb hover:ring-2 hover:ring-amber-400 transition-all shadow-xs"
                          title="Click to view full-size website shirt image & details in app"
                        >
                          <img
                            src={item.imageUrl || item.deals[0]?.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Eye className="w-4 h-4 text-white drop-shadow" />
                          </div>
                          <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[8px] font-bold text-center text-white py-0.5 truncate px-0.5">
                            In-App View
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <span className="capitalize">{item.category}</span>
                            <span aria-hidden="true">·</span>
                            <span>{item.silhouette}</span>
                            <span aria-hidden="true">·</span>
                            <span>{item.color}</span>
                          </div>
                          <h4 className="text-base font-semibold text-slate-900 dark:text-white mt-0.5">
                            {item.name}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 sm:self-center shrink-0 pl-19 sm:pl-0">
                        <div className="text-right">
                          <span className="text-[11px] text-slate-400 line-through block tabular-nums">
                            {formatPrice(convertedOrigItemPrice, currency)}
                          </span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                            {formatPrice(convertedBestPrice, currency)}
                          </span>
                        </div>

                        {capsules.length > 0 && (
                          <button
                            onClick={() => handleAddPiece(item)}
                            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                              addedItemIds[item.id]
                                ? 'bg-emerald-500 text-white'
                                : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-sm'
                            }`}
                          >
                            {addedItemIds[item.id] ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add to List</span>
                              </>
                            )}
                          </button>
                        )}
                        <button
                          onClick={() =>
                            setActiveEstimatorItemId(
                              activeEstimatorItemId === item.id ? null : item.id
                            )
                          }
                          className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                            activeEstimatorItemId === item.id
                              ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                          title="Suggest size based on benchmark brand measurements"
                        >
                          <Ruler className="w-3.5 h-3.5" />
                          <span>{activeEstimatorItemId === item.id ? 'Close Sizing' : 'Size Estimator'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Styling Note */}
                    {item.stylingNote && (
                      <div className="pl-0 sm:pl-23 text-xs text-amber-700 dark:text-amber-400/90 italic">
                        Tip: {item.stylingNote}
                      </div>
                    )}

                    {/* Interactive Size Fit Estimator Helper Tool */}
                    {activeEstimatorItemId === item.id && (
                      <div className="pl-0 sm:pl-23 pt-2">
                        <SizeFitEstimator
                          item={item}
                          onClose={() => setActiveEstimatorItemId(null)}
                        />
                      </div>
                    )}

                    {/* Store Deals Comparison Chips with Website Shirt Images */}
                    <div className="pl-0 sm:pl-23 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          Compare website shirt photos & deals across Indian & global stores:
                        </span>
                        <button
                          onClick={() => setInspectedDeal({ deal: item.deals[0], item })}
                          className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                        >
                          <ImageIcon className="w-3 h-3" />
                          <span>View Website Photos In-App</span>
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {item.deals.map((deal, dIdx) => {
                          const dealPrice = convertAmount(
                            deal.estimatedPrice,
                            deal.currency,
                            currency
                          );

                          return (
                            <div
                              key={dIdx}
                              onClick={() => setInspectedDeal({ deal, item })}
                              className={`flex items-center gap-2 p-1.5 pr-2.5 rounded-xl text-xs transition border cursor-pointer hover:shadow-sm ${
                                deal.isBestDeal
                                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700/60 font-semibold'
                                  : 'bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                              }`}
                              title={`View ${deal.storeName} shirt image in app`}
                            >
                              {deal.imageUrl && (
                                <img
                                  src={deal.imageUrl}
                                  alt={deal.storeName}
                                  className="w-6 h-6 rounded-md object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                              )}
                              <span>{deal.storeName}</span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 tabular-nums font-semibold">
                                ({formatPrice(dealPrice, currency)})
                              </span>
                              {deal.isBestDeal && (
                                <span className="text-[9px] bg-amber-400 text-slate-950 font-bold px-1 rounded">
                                  Lowest
                                </span>
                              )}
                              <a
                                href={deal.searchUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="p-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded transition ml-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                title={`Open ${deal.storeName} official site`}
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Expert Styling Advice */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Haute Styling Guidance & Proportion Rules
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              {look.expertStylingTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Modal Bottom Sticky Summary */}
        <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4 text-left w-full sm:w-auto">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg sm:text-xl font-bold text-slate-950 dark:text-white tabular-nums">
                  {formatPrice(convertedDupePrice, currency)}
                </span>
                <span className="text-xs text-slate-400 line-through tabular-nums">
                  {formatPrice(convertedOriginalPrice, currency)}
                </span>
              </div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                You save approx.{' '}
                {formatPrice(convertedOriginalPrice - convertedDupePrice, currency)} (
                {look.budgetSummary.potentialSavingsPercentage}%)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setIsTryOnOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 transition shadow-xs"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>3D / AR Try-On</span>
            </button>
            <button
              onClick={() => setShareModalLook(look)}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition"
            >
              Share Lookbook
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 transition shadow-sm"
            >
              Done
            </button>
          </div>
        </div>
      </div>

      {/* Virtual Try-On Modal */}
      {isTryOnOpen && (
        <VirtualTryOnModal
          look={look}
          onClose={() => setIsTryOnOpen(false)}
        />
      )}

      {/* Wardrobe Mix & Match Modal */}
      {isMixMatchModalOpen && (
        <WardrobeMixMatchModal
          communityLook={look}
          onClose={() => setIsMixMatchModalOpen(false)}
        />
      )}

      {/* In-App Website Shirt & Product Image Inspector Modal */}
      {inspectedDeal && (
        <WebsiteProductModal
          deal={inspectedDeal.deal}
          item={inspectedDeal.item}
          allDeals={inspectedDeal.item.deals}
          onClose={() => setInspectedDeal(null)}
          onAddToChecklist={(deal, itm) => handleAddPiece(itm)}
        />
      )}
    </div>
  );
};
