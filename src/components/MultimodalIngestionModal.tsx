import React, { useState } from 'react';
import {
  X,
  Upload,
  Link2,
  Sparkles,
  Loader2,
  DollarSign,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OutfitLook, CurrencyCode } from '../types';
import { CURRENCIES, formatPrice } from '../utils/currencies';

interface MultimodalIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'photo' | 'links';
}

const OCCASIONS = [
  'Celebrations & Weddings',
  'Galas & Black Tie Soirées',
  'Cocktail Party & Receptions',
  'Dinner Date & Evening Lounge',
  'Streetwear & Urban Culture',
  'Daily Campus & Smart Casual',
  'Corporate Executive & Conferences',
];

export const MultimodalIngestionModal: React.FC<MultimodalIngestionModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'photo',
}) => {
  const { currency, saveLook, setActiveOutfitModalLook } = useApp();

  const [mode, setMode] = useState<'photo' | 'links'>(defaultMode);
  const [occasion, setOccasion] = useState<string>(OCCASIONS[0]);
  const [budget, setBudget] = useState<string>('5000');
  const [customCurrency, setCustomCurrency] = useState<CurrencyCode>(currency);

  // Photo state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Link state
  const [linksText, setLinksText] = useState<string>('');

  // Status & error
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUsePreset = (type: 'sangeet' | 'gala' | 'streetwear') => {
    if (type === 'sangeet') {
      setOccasion('Celebrations & Weddings');
      setBudget('6000');
      setLinksText(
        'https://www.myntra.com/blazers/jacquard-brocade-evening-blazer-gold/1928472\nhttps://www.ajio.com/trousers/wide-leg-pleated-silk-blend-pant-ivory/847291\nhttps://www.myntra.com/heels/metallic-stiletto-sandals/748291'
      );
      setMode('links');
    } else if (type === 'gala') {
      setOccasion('Galas & Black Tie Soirées');
      setBudget('8000');
      setLinksText(
        'https://www.zara.com/us/en/velvet-tuxedo-blazer-dress-p0192849.html\nhttps://www.asos.com/us/asos-design/pointed-slingback-heels/prd/2049182\nhttps://www.amazon.in/dp/B08XYZ1234/hardcase-silver-evening-clutch'
      );
      setMode('links');
    } else {
      setOccasion('Streetwear & Urban Culture');
      setBudget('3500');
      setLinksText(
        'https://www.uniqlo.com/us/en/products/E458291/heavy-waffle-knit-shirt\nhttps://www.myntra.com/chinos/barrel-leg-pleated-trousers/849201\nhttps://www.amazon.in/s?k=retro-gumsole-leather-sneakers'
      );
      setMode('links');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (mode === 'photo') {
        if (!imagePreview) {
          throw new Error('Please select or upload an outfit photo first.');
        }

        setLoadingStep('Analyzing silhouette, garments & textiles with Gemini AI...');
        const response = await fetch('/api/stylist/deconstruct-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: imagePreview,
            occasion,
            budget,
            currency: customCurrency,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to analyze outfit photo.');
        }

        setLoadingStep('Searching Indian & global marketplaces for budget duplicates...');
        const data = await response.json();

        const createdLook: OutfitLook = {
          id: `ai-look-${Date.now()}`,
          title: data.title || `${occasion} Ensemble`,
          occasion: data.occasion || occasion,
          vibe: data.vibe || 'Curated Silhouette',
          imageVisualUrl: imagePreview,
          colorPalette: data.colorPalette || [{ name: 'Neutral', hex: '#64748B' }],
          styleBreakdown: data.styleBreakdown || 'Deconstructed with AI fashion intelligence.',
          items: data.items || [],
          expertStylingTips: data.expertStylingTips || [],
          budgetSummary: data.budgetSummary || {
            totalOriginalEstimate: 10000,
            budgetDupeTotal: 4000,
            potentialSavingsPercentage: 60,
            currency: customCurrency,
          },
          createdAt: new Date().toISOString(),
          likesCount: 1,
          hasLiked: true,
          authorName: 'AuraStyle AI',
          authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
          sourceType: 'photo',
        };

        saveLook(createdLook);
        setActiveOutfitModalLook(createdLook);
        onClose();
      } else {
        // Link mode
        const rawUrls = linksText
          .split('\n')
          .map((s) => s.trim())
          .filter((s) => /^https?:\/\//i.test(s));

        if (rawUrls.length === 0) {
          throw new Error('Please enter at least one valid product URL starting with http:// or https://');
        }

        setLoadingStep('Synthesizing product details and outfit synergy...');
        const response = await fetch('/api/stylist/analyze-links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            urls: rawUrls,
            occasion,
            budget,
            currency: customCurrency,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to evaluate product links.');
        }

        setLoadingStep('Locating identical and cheaper duplicates...');
        const data = await response.json();

        const firstItemImage = data.items?.[0]?.imageUrl || data.items?.[0]?.deals?.[0]?.imageUrl;

        const createdLook: OutfitLook = {
          id: `ai-link-look-${Date.now()}`,
          title: data.title || `Reconstructed ${occasion}`,
          occasion: data.occasion || occasion,
          vibe: data.vibe || 'Curated Ensemble',
          imageVisualUrl: firstItemImage,
          colorPalette: data.colorPalette || [{ name: 'Classic Tone', hex: '#1E293B' }],
          styleBreakdown: data.styleBreakdown || 'Recreated from your linked pieces.',
          items: data.items || [],
          expertStylingTips: data.expertStylingTips || [],
          budgetSummary: data.budgetSummary || {
            totalOriginalEstimate: 8500,
            budgetDupeTotal: 3200,
            potentialSavingsPercentage: 62,
            currency: customCurrency,
          },
          createdAt: new Date().toISOString(),
          likesCount: 1,
          hasLiked: true,
          authorName: 'AuraStyle AI',
          authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
          sourceType: 'links',
        };

        saveLook(createdLook);
        setActiveOutfitModalLook(createdLook);
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'An error occurred during outfit styling.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0E131F] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400 text-slate-950 font-bold shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-editorial text-slate-950 dark:text-white">
                AI Vision & Styling Studio
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Reconstruct looks and find budget deals across Indian & global stores
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="p-3 bg-slate-100 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800/80 shrink-0">
          <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => {
                setMode('photo');
                setErrorMessage(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-xl transition ${
                mode === 'photo'
                  ? 'bg-white dark:bg-[#151D2C] text-slate-950 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Outfit Photo Upload</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('links');
                setErrorMessage(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-xl transition ${
                mode === 'links'
                  ? 'bg-white dark:bg-[#151D2C] text-slate-950 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Paste Product URLs</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-5 flex-1">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Preset Buttons for Quick Demo Testing */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1.5 flex items-center gap-1">
              <HelpCircle className="w-3 h-3 text-amber-500" />
              Need inspiration? Try pre-configured sample ensembles:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleUsePreset('sangeet')}
                className="px-2.5 py-1 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:border-amber-500 transition"
              >
                Royal Sangeet Guest Look
              </button>
              <button
                type="button"
                onClick={() => handleUsePreset('gala')}
                className="px-2.5 py-1 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:border-amber-500 transition"
              >
                Black-Tie Gala Tuxedo
              </button>
              <button
                type="button"
                onClick={() => handleUsePreset('streetwear')}
                className="px-2.5 py-1 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:border-amber-500 transition"
              >
                Harajuku Minimal Casual
              </button>
            </div>
          </div>

          {/* Mode 1: Photo Input */}
          {mode === 'photo' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Upload Outfit Screenshot or Photo
              </label>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                  imagePreview
                    ? 'border-amber-400/60 bg-amber-500/5'
                    : 'border-slate-300 dark:border-slate-700 hover:border-amber-400/60 bg-slate-50 dark:bg-slate-900/40'
                }`}
                onClick={() => document.getElementById('outfit-photo-input')?.click()}
              >
                <input
                  id="outfit-photo-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {imagePreview ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={imagePreview}
                      alt="Outfit Preview"
                      className="max-h-48 rounded-xl object-contain shadow-md mb-2"
                    />
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                      Photo attached! Click or drop another image to replace.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-4">
                    <div className="p-3 rounded-full bg-amber-400/10 text-amber-600 dark:text-amber-400 mb-2">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Drag & drop outfit photo here, or browse files
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Works with Instagram screenshots, streetstyle shots, runway photos
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mode 2: Link Input */}
          {mode === 'links' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Product Links (one per line)
              </label>
              <textarea
                value={linksText}
                onChange={(e) => setLinksText(e.target.value)}
                rows={4}
                placeholder="https://www.myntra.com/...\nhttps://www.zara.com/...\nhttps://www.asos.com/..."
                className="w-full p-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none font-mono"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Paste links to shirts, blazers, trousers, or shoes from Myntra, Ajio, Amazon, Zara, ASOS, Uniqlo, or H&M.
              </p>
            </div>
          )}

          {/* Event Occasion Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Occasion / Code
              </label>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
              >
                {OCCASIONS.map((occ) => (
                  <option key={occ} value={occ}>
                    {occ}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Max Budget Ceiling ({customCurrency})
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="500"
                  max="100000"
                  step="100"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none tabular-nums"
                  placeholder="e.g. 5000"
                />
                <select
                  value={customCurrency}
                  onChange={(e) => setCustomCurrency(e.target.value as CurrencyCode)}
                  className="px-2.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none"
                >
                  {(Object.keys(CURRENCIES) as CurrencyCode[]).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Loading Animation Area */}
          {isLoading && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center animate-pulse">
              <Loader2 className="w-6 h-6 animate-spin text-amber-600 dark:text-amber-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-900 dark:text-white">
                {loadingStep || 'Processing fashion intelligence...'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Comparing Indian and international store catalogs for best deals
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || (mode === 'photo' && !imagePreview) || (mode === 'links' && !linksText.trim())}
              className="w-full py-3.5 px-4 text-xs sm:text-sm font-semibold rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Outfit & Scouring Deals...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Deconstruct & Find Best Deals</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
