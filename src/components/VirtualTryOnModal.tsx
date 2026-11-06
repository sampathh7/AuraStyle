import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Layers,
  Camera,
  Shirt,
  ShoppingBag,
  Share2,
  Check,
  TrendingDown,
  Download,
  Smile,
  User,
} from 'lucide-react';
import { OutfitLook, ClothingItem } from '../types';
import { useApp } from '../context/AppContext';
import { formatPrice, convertAmount } from '../utils/currencies';
import { MannequinCanvas3D, DressingModelType } from './MannequinCanvas3D';
import { SnapchatCameraAR } from './SnapchatCameraAR';
import { BitmojiStickerDrawer } from './BitmojiStickerDrawer';

interface VirtualTryOnModalProps {
  look: OutfitLook;
  onClose: () => void;
}

export const VirtualTryOnModal: React.FC<VirtualTryOnModalProps> = ({ look, onClose }) => {
  const { currency, capsules, addPieceToCapsule, setShareModalLook } = useApp();

  // Mode: Snapchat 3D Bitmoji (default) vs Live Snap AR Camera vs Realistic Replica
  const [activeTab, setActiveTab] = useState<'bitmoji' | 'ar' | '3d'>('bitmoji');
  const [selectedLayerIds, setSelectedLayerIds] = useState<string[]>(
    look.items.map((i) => i.id)
  );
  const [activeLighting, setActiveLighting] = useState<'studio' | 'golden' | 'runway'>('studio');
  const [capturedSnapshotUrl, setCapturedSnapshotUrl] = useState<string | null>(null);
  const [isAddedToCapsule, setIsAddedToCapsule] = useState(false);
  const [stickerDrawerOpen, setStickerDrawerOpen] = useState(false);

  // Toggle individual garment layers in the try-on
  const handleToggleLayer = (itemId: string) => {
    setSelectedLayerIds((prev) => {
      if (prev.includes(itemId)) {
        if (prev.length === 1) return prev;
        return prev.filter((id) => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleSelectAllLayers = () => {
    setSelectedLayerIds(look.items.map((i) => i.id));
  };

  // Add all pieces to default capsule
  const handleAddLookToCapsule = () => {
    const targetCapsule = capsules[0];
    if (!targetCapsule) return;

    look.items.forEach((item) => {
      const topDeal = item.deals[0];
      const converted = convertAmount(
        topDeal?.estimatedPrice || 999,
        topDeal?.currency || 'INR',
        currency
      );
      addPieceToCapsule(targetCapsule.id, {
        itemName: item.name,
        category: item.category,
        price: converted,
        currency,
        storeName: topDeal?.storeName || 'Online Store',
        storeUrl: topDeal?.searchUrl || '#',
      });
    });

    setIsAddedToCapsule(true);
    setTimeout(() => setIsAddedToCapsule(false), 3000);
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-white dark:bg-[#0E131F] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[96vh] flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFFC00] text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-yellow-500/20">
              <Sparkles className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-extrabold text-amber-500 dark:text-[#FFFC00] uppercase tracking-wider text-[10px]">
                  Snapchat 3D Try-On Studio
                </span>
                <span aria-hidden="true">·</span>
                <span>{look.occasion}</span>
                <span aria-hidden="true">·</span>
                <span>{look.vibe}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-editorial text-slate-950 dark:text-white">
                {look.title} · Bitmoji Dressing Model
              </h2>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2">
            <div className="flex p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700">
              <button
                onClick={() => setActiveTab('bitmoji')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  activeTab === 'bitmoji'
                    ? 'bg-[#FFFC00] text-slate-950 shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                <Smile className="w-3.5 h-3.5" />
                <span>3D Bitmoji</span>
              </button>
              <button
                onClick={() => setActiveTab('ar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  activeTab === 'ar'
                    ? 'bg-[#FFFC00] text-slate-950 shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Live AR Cam</span>
              </button>
              <button
                onClick={() => setActiveTab('3d')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  activeTab === '3d'
                    ? 'bg-[#FFFC00] text-slate-950 shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Human Replica</span>
              </button>
            </div>

            <button
              onClick={() => setStickerDrawerOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-[#FFFC00] text-slate-950 text-xs font-black shadow-xs hover:brightness-105 transition"
            >
              <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
              <span>Stickers ✨</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Garment Layer Filter Bar */}
        <div className="px-4 py-2.5 bg-slate-100/70 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 shrink-0 mr-1">
            <Layers className="w-3.5 h-3.5 text-amber-500" />
            <span>Garment Layers:</span>
          </div>

          <button
            onClick={handleSelectAllLayers}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition shrink-0 ${
              selectedLayerIds.length === look.items.length
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-semibold'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            All Pieces ({look.items.length})
          </button>

          {look.items.map((item) => {
            const isSelected = selectedLayerIds.includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => handleToggleLayer(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg font-medium transition shrink-0 border ${
                  isSelected
                    ? 'bg-[#FFFC00]/20 text-amber-950 dark:text-amber-200 border-[#FFFC00]/60 font-semibold'
                    : 'bg-white dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 opacity-60'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: item.color || '#f59e0b' }}
                />
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Main Viewport Body */}
        <div className="p-3 sm:p-5 overflow-y-auto flex-1 space-y-4 bg-slate-950/20">
          {activeTab === 'ar' ? (
            <div className="space-y-4">
              <SnapchatCameraAR
                look={look}
                selectedLayerIds={selectedLayerIds}
                onSnapshot={(dataUrl) => setCapturedSnapshotUrl(dataUrl)}
                onSwitchTo3DMannequin={() => setActiveTab('bitmoji')}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <MannequinCanvas3D
                look={look}
                selectedLayerIds={selectedLayerIds}
                activeLighting={activeLighting}
                onLightingChange={setActiveLighting}
                onSnapshot={(dataUrl) => setCapturedSnapshotUrl(dataUrl)}
                initialDressingMode={activeTab === 'bitmoji' ? 'bitmoji' : 'realistic'}
              />
            </div>
          )}
        </div>

        {/* Modal Bottom Sticky Summary & Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/90 dark:bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-base sm:text-lg font-bold text-slate-950 dark:text-white tabular-nums">
                  {formatPrice(convertedDupePrice, currency)}
                </span>
                <span className="text-xs text-slate-400 line-through tabular-nums">
                  {formatPrice(convertedOriginalPrice, currency)}
                </span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                Dupe Savings: {look.budgetSummary.potentialSavingsPercentage}% across{' '}
                {selectedLayerIds.length} active pieces
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setShareModalLook(look)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition border border-slate-200 dark:border-slate-800"
              title="Share lookbook"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleAddLookToCapsule}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition ${
                isAddedToCapsule
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {isAddedToCapsule ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added to Capsule!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add All to Capsule</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 transition shadow-sm"
            >
              Exit Studio
            </button>
          </div>
        </div>

        {/* Snapshot Preview Dialog if user snapped a photo */}
        {capturedSnapshotUrl && (
          <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 max-w-md w-full space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#FFFC00] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Snap Captured!
                </span>
                <button
                  onClick={() => setCapturedSnapshotUrl(null)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="rounded-xl overflow-hidden border border-slate-800 max-h-80 flex items-center justify-center bg-black">
                <img
                  src={capturedSnapshotUrl}
                  alt="Snapchat Try-On Snapshot"
                  className="max-h-80 object-contain w-auto"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    setStickerDrawerOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-xl transition"
                >
                  <Smile className="w-3.5 h-3.5 text-[#FFFC00]" />
                  <span>Make Stickers</span>
                </button>
                <a
                  href={capturedSnapshotUrl}
                  download={`Snapchat-Bitmoji-${look.title.replace(/\s+/g, '_')}.png`}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#FFFC00] hover:bg-yellow-300 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Image</span>
                </a>
                <button
                  onClick={() => setCapturedSnapshotUrl(null)}
                  className="px-3 py-2 text-xs text-slate-300 hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Global Sticker Studio Drawer */}
        <BitmojiStickerDrawer
          isOpen={stickerDrawerOpen}
          onClose={() => setStickerDrawerOpen(false)}
          look={look}
          avatarSnapshotUrl={capturedSnapshotUrl}
        />
      </div>
    </div>
  );
};
