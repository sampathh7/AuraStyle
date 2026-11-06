import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Sparkles,
  ShoppingBag,
  Star,
  Truck,
  ShieldCheck,
  ZoomIn,
  ZoomOut,
  Layers,
  ChevronRight,
  Eye,
  Check,
  ArrowRight,
  Share2,
} from 'lucide-react';
import { StoreDeal, ClothingItem, CurrencyCode } from '../types';
import { useApp } from '../context/AppContext';
import { formatPrice, convertAmount } from '../utils/currencies';
import { getGarmentImageSet, getStoreProductImage } from '../utils/fashionImageRegistry';

interface WebsiteProductModalProps {
  deal: StoreDeal | null;
  item: ClothingItem | null;
  allDeals?: StoreDeal[];
  onClose: () => void;
  onAddToChecklist?: (deal: StoreDeal, item: ClothingItem) => void;
}

export const WebsiteProductModal: React.FC<WebsiteProductModalProps> = ({
  deal,
  item,
  allDeals = [],
  onClose,
  onAddToChecklist,
}) => {
  const { currency } = useApp();
  const [selectedDeal, setSelectedDeal] = useState<StoreDeal | null>(deal);
  const [activeViewMode, setActiveViewMode] = useState<'main' | 'onModel' | 'fabric' | 'back'>('main');
  const [isZoomed, setIsZoomed] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [isCopied, setIsCopied] = useState(false);

  // Sync if prop changes
  React.useEffect(() => {
    if (deal) {
      setSelectedDeal(deal);
      setActiveViewMode('main');
      setIsZoomed(false);
    }
  }, [deal]);

  if (!selectedDeal || !item) return null;

  const currentDeal = selectedDeal;
  const imageSet = getGarmentImageSet(item.name, item.category, item.color);

  // Resolve current active image based on angle
  const getActiveImageUrl = () => {
    if (activeViewMode === 'main') {
      return currentDeal.imageUrl || imageSet.main;
    }
    if (activeViewMode === 'onModel') {
      return imageSet.onModel;
    }
    if (activeViewMode === 'fabric') {
      return imageSet.fabricCloseup;
    }
    return imageSet.backAngle;
  };

  const activeImageUrl = getActiveImageUrl();

  const convertedPrice = convertAmount(
    currentDeal.estimatedPrice,
    currentDeal.currency,
    currency
  );
  const convertedOriginal = currentDeal.originalPrice
    ? convertAmount(currentDeal.originalPrice, currentDeal.currency, currency)
    : null;

  const discountPercent = convertedOriginal
    ? Math.max(0, Math.round(((convertedOriginal - convertedPrice) / convertedOriginal) * 100))
    : 45;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentDeal.searchUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const storeBadgeColors: Record<string, { bg: string; text: string; border: string }> = {
    Myntra: { bg: 'bg-rose-500/10 dark:bg-rose-500/20', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-500/30' },
    Ajio: { bg: 'bg-amber-500/10 dark:bg-amber-500/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/30' },
    'Amazon India': { bg: 'bg-yellow-500/10 dark:bg-yellow-500/20', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-500/30' },
    Zara: { bg: 'bg-slate-900/10 dark:bg-white/10', text: 'text-slate-900 dark:text-white', border: 'border-slate-300 dark:border-slate-700' },
    ASOS: { bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/30' },
    'H&M': { bg: 'bg-red-500/10 dark:bg-red-500/20', text: 'text-red-600 dark:text-red-400', border: 'border-red-500/30' },
    Uniqlo: { bg: 'bg-red-600/10 dark:bg-red-600/20', text: 'text-red-600 dark:text-red-400', border: 'border-red-600/30' },
  };

  const badgeStyle = storeBadgeColors[currentDeal.storeName] || {
    bg: 'bg-amber-500/10',
    text: 'text-amber-500',
    border: 'border-amber-500/30',
  };

  const dealsToCompare = allDeals.length > 0 ? allDeals : item.deals;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#0E1420] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
            >
              <span>{currentDeal.storeName}</span>
              <span className="text-[10px] uppercase font-semibold tracking-wider opacity-75">
                {currentDeal.region === 'india' ? 'IN Store' : 'Global'}
              </span>
            </span>
            <div className="hidden sm:block text-xs text-slate-500 dark:text-slate-400">
              <span>{item.category.toUpperCase()}</span>
              <span className="mx-1.5">·</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{item.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl transition hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Copy product link"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Content Grid */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: High-Res Website Shirt Image Viewport */}
          <div className="md:col-span-7 flex flex-col space-y-3">
            {/* Interactive Image Frame with Zoom */}
            <div
              className={`relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#151D2A] aspect-[4/3] sm:aspect-[4/3] flex items-center justify-center cursor-zoom-in transition-all ${
                isZoomed ? 'cursor-zoom-out' : ''
              }`}
              onClick={() => setIsZoomed(!isZoomed)}
            >
              <img
                src={activeImageUrl}
                alt={`${currentDeal.storeName} - ${item.name}`}
                className={`w-full h-full object-cover transition-transform duration-300 ${
                  isZoomed ? 'scale-150' : 'scale-100'
                }`}
                referrerPolicy="no-referrer"
              />

              {/* View Overlay Indicators */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 pointer-events-none">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/70 text-white backdrop-blur-md border border-white/20">
                  {activeViewMode === 'main' && 'Official Website Image'}
                  {activeViewMode === 'onModel' && 'On-Model Fit Silhouette'}
                  {activeViewMode === 'fabric' && 'Macro Fabric & Weave Texture'}
                  {activeViewMode === 'back' && 'Back Angle Cut'}
                </span>
                {currentDeal.isBestDeal && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFFC00] text-slate-950 shadow-xs">
                    ★ Lowest Price Dupe
                  </span>
                )}
              </div>

              {/* Zoom Trigger Button */}
              <div className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-xl backdrop-blur-md pointer-events-none text-xs flex items-center gap-1">
                {isZoomed ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5" />}
                <span className="text-[10px]">{isZoomed ? 'Reset Zoom' : 'Click to Inspect'}</span>
              </div>
            </div>

            {/* Angle Switcher Thumbnails */}
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => {
                  setActiveViewMode('main');
                  setIsZoomed(false);
                }}
                className={`p-1.5 rounded-xl border text-left flex flex-col items-center gap-1 transition-all ${
                  activeViewMode === 'main'
                    ? 'border-amber-400 bg-amber-400/10 ring-2 ring-amber-400/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="w-full aspect-square rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800">
                  <img
                    src={currentDeal.imageUrl || imageSet.main}
                    alt="Front"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">Front View</span>
              </button>

              <button
                onClick={() => {
                  setActiveViewMode('onModel');
                  setIsZoomed(false);
                }}
                className={`p-1.5 rounded-xl border text-left flex flex-col items-center gap-1 transition-all ${
                  activeViewMode === 'onModel'
                    ? 'border-amber-400 bg-amber-400/10 ring-2 ring-amber-400/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="w-full aspect-square rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800">
                  <img src={imageSet.onModel} alt="Model" className="w-full h-full object-cover" />
                </div>
                <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">On Model</span>
              </button>

              <button
                onClick={() => {
                  setActiveViewMode('fabric');
                  setIsZoomed(false);
                }}
                className={`p-1.5 rounded-xl border text-left flex flex-col items-center gap-1 transition-all ${
                  activeViewMode === 'fabric'
                    ? 'border-amber-400 bg-amber-400/10 ring-2 ring-amber-400/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="w-full aspect-square rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800">
                  <img src={imageSet.fabricCloseup} alt="Fabric" className="w-full h-full object-cover" />
                </div>
                <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">Fabric Texture</span>
              </button>

              <button
                onClick={() => {
                  setActiveViewMode('back');
                  setIsZoomed(false);
                }}
                className={`p-1.5 rounded-xl border text-left flex flex-col items-center gap-1 transition-all ${
                  activeViewMode === 'back'
                    ? 'border-amber-400 bg-amber-400/10 ring-2 ring-amber-400/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="w-full aspect-square rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800">
                  <img src={imageSet.backAngle} alt="Back" className="w-full h-full object-cover" />
                </div>
                <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">Back Angle</span>
              </button>
            </div>

            {/* Cross-Website Shirt Switcher (Compare Myntra vs Zara vs Ajio) */}
            <div className="mt-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                Compare Shirt Photo Across Websites:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {dealsToCompare.map((d, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedDeal(d);
                      setActiveViewMode('main');
                      setIsZoomed(false);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition border ${
                      currentDeal.storeName === d.storeName
                        ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <span>{d.storeName}</span>
                    <span className="text-[10px] opacity-75">
                      ({formatPrice(convertAmount(d.estimatedPrice, d.currency, currency), currency)})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Garment Specs, Pricing & Direct Action */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  {currentDeal.brand || 'Verified Retailer'}
                </span>
                <h3 className="text-xl font-bold font-editorial text-slate-950 dark:text-white mt-0.5 leading-snug">
                  {currentDeal.productTitle}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Price Block */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-bold text-slate-950 dark:text-white tabular-nums">
                      {formatPrice(convertedPrice, currency)}
                    </span>
                    {convertedOriginal && (
                      <span className="text-xs text-slate-400 line-through ml-2 tabular-nums">
                        {formatPrice(convertedOriginal, currency)}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {discountPercent}% OFF
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                  <div className="flex items-center gap-1 text-amber-500 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{currentDeal.rating || 4.5}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({currentDeal.reviewCount || '1.8k'}+ ratings)
                    </span>
                  </div>
                  <span aria-hidden="true">·</span>
                  <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                    <Truck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{currentDeal.deliveryEstimate || 'Express Delivery'}</span>
                  </div>
                </div>
              </div>

              {/* Garment Silhouette & Fabric Details */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Silhouette Cut:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{item.silhouette}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Primary Color:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{item.color}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Fabric Composition:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {currentDeal.fabricDetails || 'Fine Textured Weave'}
                  </span>
                </div>
              </div>

              {/* Size Selector */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  <span>Available Sizes on {currentDeal.storeName}:</span>
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-normal">Size Guide Ready</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                        selectedSize === sz
                          ? 'bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 border-slate-900 dark:border-amber-400'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Haute Styling Tip */}
              {item.stylingNote && (
                <div className="p-3 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 italic">
                  Stylist Note: {item.stylingNote}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <a
                href={currentDeal.searchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all"
              >
                <span>Buy on {currentDeal.storeName} ({formatPrice(convertedPrice, currency)})</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              {onAddToChecklist && (
                <button
                  onClick={() => onAddToChecklist(currentDeal, item)}
                  className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2 transition"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Event Checklist</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
