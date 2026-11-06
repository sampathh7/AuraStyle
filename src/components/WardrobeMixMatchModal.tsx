import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Layers,
  ArrowRight,
  Plus,
  Check,
  ShoppingBag,
  ExternalLink,
  Shuffle,
  Camera,
} from 'lucide-react';
import { OutfitLook, ClothingItem } from '../types';
import { useApp } from '../context/AppContext';
import { calculateStyleCompatibility, WardrobeMatchResult } from '../utils/styleCompatibility';
import { formatPrice, convertAmount } from '../utils/currencies';
import { VirtualTryOnModal } from './VirtualTryOnModal';

interface WardrobeMixMatchModalProps {
  communityLook: OutfitLook;
  onClose: () => void;
}

export const WardrobeMixMatchModal: React.FC<WardrobeMixMatchModalProps> = ({
  communityLook,
  onClose,
}) => {
  const { savedLooks, currency, capsules, addPieceToCapsule, setActiveOutfitModalLook } = useApp();

  const compatibility = calculateStyleCompatibility(communityLook, savedLooks);

  // Pick selected community item and matching saved item for interactive pairing
  const [selectedCommunityItem, setSelectedCommunityItem] = useState<ClothingItem>(
    communityLook.items[0] || communityLook.items[0]
  );

  // Flatten saved wardrobe items
  const allSavedItems = savedLooks.flatMap((l) =>
    l.items.map((item) => ({ look: l, item }))
  );

  const [selectedSavedPairIndex, setSelectedSavedPairIndex] = useState<number>(0);
  const [isTryOnActive, setIsTryOnActive] = useState<boolean>(false);
  const [isAddedToCapsule, setIsAddedToCapsule] = useState<boolean>(false);

  // Available pairings for this community item
  const matchingPairs = allSavedItems.filter(
    ({ item }) => item.category.toLowerCase() !== selectedCommunityItem.category.toLowerCase()
  );

  const activeSavedItem = matchingPairs[selectedSavedPairIndex] || allSavedItems[0];

  const handleCyclePairing = () => {
    if (matchingPairs.length > 0) {
      setSelectedSavedPairIndex((prev) => (prev + 1) % matchingPairs.length);
    }
  };

  const handleAddHybridPieceToCapsule = () => {
    const targetCap = capsules[0];
    if (!targetCap || !selectedCommunityItem) return;

    const topDeal = selectedCommunityItem.deals[0];
    const converted = convertAmount(
      topDeal?.estimatedPrice || 999,
      topDeal?.currency || 'INR',
      currency
    );

    addPieceToCapsule(targetCap.id, {
      itemName: `${selectedCommunityItem.name} (Mix & Match)`,
      category: selectedCommunityItem.category,
      price: converted,
      currency,
      storeName: topDeal?.storeName || 'Online Store',
      storeUrl: topDeal?.searchUrl || '#',
    });

    setIsAddedToCapsule(true);
    setTimeout(() => setIsAddedToCapsule(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#0E131F] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-500 dark:text-amber-400 flex items-center justify-center border border-amber-400/30">
              <Shuffle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider text-[10px]">
                  Wardrobe Synergy Lab
                </span>
                <span aria-hidden="true">·</span>
                <span>Mix & Match Compatibility</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-editorial text-slate-950 dark:text-white">
                Mix Community Piece with Your Saved Closet
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTryOnActive(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300 transition"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>3D Try-On</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Compatibility Score Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex flex-col items-center justify-center font-black shadow-md shrink-0">
                <span className="text-xl leading-none tabular-nums">{compatibility.score}%</span>
                <span className="text-[9px] uppercase tracking-wider mt-0.5">Match</span>
              </div>
              <div>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                  {compatibility.matchLevel}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {communityLook.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  {compatibility.paletteHarmonyDescription}
                </p>
              </div>
            </div>

            {/* Score pill components */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="text-center px-3 py-1.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block">Color</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                  {compatibility.colorHarmonyScore}%
                </span>
              </div>
              <div className="text-center px-3 py-1.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block">Versatility</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                  {compatibility.versatilityScore}%
                </span>
              </div>
              <div className="text-center px-3 py-1.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block">Aesthetic</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                  {compatibility.aestheticScore}%
                </span>
              </div>
            </div>
          </div>

          {/* Piece Selector Chips from Community Look */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
              Select Community Piece to Test:
            </span>
            <div className="flex flex-wrap gap-2">
              {communityLook.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedCommunityItem(item);
                    setSelectedSavedPairIndex(0);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                    selectedCommunityItem.id === item.id
                      ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <span className="capitalize">{item.category}:</span> {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Mix-and-Match Duet Visualizer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            {/* Left Box: Selected Community Item */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121826] border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider text-[10px]">
                    Community Piece
                  </span>
                  <span className="capitalize">{selectedCommunityItem.category}</span>
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mt-2">
                  {selectedCommunityItem.name}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  {selectedCommunityItem.description}
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                  <span>Color: {selectedCommunityItem.color}</span>
                  <span aria-hidden="true">·</span>
                  <span>Cut: {selectedCommunityItem.silhouette}</span>
                </div>
              </div>

              {/* Best dupe price callout */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Lowest Dupe Deal:</span>
                  <span className="text-sm font-bold text-slate-950 dark:text-white tabular-nums">
                    {formatPrice(
                      convertAmount(
                        selectedCommunityItem.deals[0]?.estimatedPrice || 999,
                        selectedCommunityItem.deals[0]?.currency || 'INR',
                        currency
                      ),
                      currency
                    )}
                  </span>
                </div>
                <a
                  href={selectedCommunityItem.deals[0]?.searchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                >
                  <span>{selectedCommunityItem.deals[0]?.storeName}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Right Box: Paired Wardrobe Item */}
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/5 dark:bg-amber-400/5 border border-amber-500/20 space-y-3 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between text-xs pb-2 border-b border-amber-500/15">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    From Your Saved Closet
                  </span>
                  {matchingPairs.length > 1 && (
                    <button
                      onClick={handleCyclePairing}
                      className="text-[11px] text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Shuffle className="w-3 h-3" />
                      <span>Next Pair ({selectedSavedPairIndex + 1}/{matchingPairs.length})</span>
                    </button>
                  )}
                </div>

                {activeSavedItem ? (
                  <>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mt-2">
                      {activeSavedItem.item.name}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      {activeSavedItem.item.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>Saved in: {activeSavedItem.look.title}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-slate-500 py-4">
                    Save more looks in your wardrobe to generate deeper pairing options!
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-amber-500/15 flex items-center justify-between">
                <span className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                  Synergy: Balances proportions & color tones
                </span>
                {matchingPairs.length > 1 && (
                  <button
                    onClick={handleCyclePairing}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-900 dark:text-amber-300"
                  >
                    Shuffle
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Styling Formulas */}
          {compatibility.mixMatchCombos.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Haute Styling Prescription
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {compatibility.mixMatchCombos[0]?.stylingAdvice}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => {
              setActiveOutfitModalLook(communityLook);
              onClose();
            }}
            className="text-xs text-slate-600 dark:text-slate-400 hover:underline"
          >
            Inspect Complete Community Ensemble
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {capsules.length > 0 && (
              <button
                onClick={handleAddHybridPieceToCapsule}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition shadow-xs ${
                  isAddedToCapsule
                    ? 'bg-emerald-500 text-white'
                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                }`}
              >
                {isAddedToCapsule ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Added to Checklist</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add Mix & Match Piece to Capsule</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 transition shadow-sm"
            >
              Done
            </button>
          </div>
        </div>

        {/* Virtual Try-On submodal */}
        {isTryOnActive && (
          <VirtualTryOnModal
            look={communityLook}
            onClose={() => setIsTryOnActive(false)}
          />
        )}
      </div>
    </div>
  );
};
