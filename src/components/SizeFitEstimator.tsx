import React, { useState } from 'react';
import {
  Ruler,
  Check,
  ChevronDown,
  Sparkles,
  Info,
  Save,
  HelpCircle,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';
import { ClothingItem } from '../types';
import { useApp } from '../context/AppContext';
import {
  BRAND_PROFILES,
  FitPreference,
  estimateSize,
} from '../utils/sizeCharts';

interface SizeFitEstimatorProps {
  item: ClothingItem;
  onClose?: () => void;
}

export const SizeFitEstimator: React.FC<SizeFitEstimatorProps> = ({ item, onClose }) => {
  const { user, updateUserBenchmarkSizes } = useApp();

  const isBottom = item.category === 'bottom';

  // Benchmark default states from user profile if saved, otherwise sensible standard
  const initialBrand = isBottom
    ? user?.benchmarkSizes?.bottomBrand || "Levi's"
    : user?.benchmarkSizes?.topBrand || 'Zara';

  const initialSize = isBottom
    ? user?.benchmarkSizes?.bottomSize || '32'
    : user?.benchmarkSizes?.topSize || 'M';

  const initialFit = user?.benchmarkSizes?.fitPreference || 'regular';

  const [benchmarkBrand, setBenchmarkBrand] = useState<string>(initialBrand);
  const [benchmarkSize, setBenchmarkSize] = useState<string>(initialSize);
  const [fitPreference, setFitPreference] = useState<FitPreference>(initialFit);

  // Target store based on the garment's top deal store, or fallback to Myntra
  const defaultTargetBrand = item.deals[0]?.storeName.includes('Ajio')
    ? 'Ajio'
    : item.deals[0]?.storeName.includes('Zara')
    ? 'Zara'
    : item.deals[0]?.storeName.includes('ASOS')
    ? 'ASOS'
    : item.deals[0]?.storeName.includes('Uniqlo')
    ? 'Uniqlo'
    : item.deals[0]?.storeName.includes('H&M')
    ? 'H_M'
    : 'Myntra';

  const [targetBrand, setTargetBrand] = useState<string>(defaultTargetBrand);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Available benchmark size choices based on selected benchmark brand
  const benchProfile = BRAND_PROFILES[benchmarkBrand] || BRAND_PROFILES.Zara;
  const availableSizes = isBottom
    ? benchProfile.bottomSizes.map((s) => s.size)
    : benchProfile.topSizes.map((s) => s.size);

  // Compute recommendation
  const result = estimateSize({
    benchmarkBrand,
    benchmarkSize,
    targetBrand,
    category: item.category,
    garmentSilhouette: item.silhouette,
    fitPreference,
  });

  const handleSaveDefault = () => {
    updateUserBenchmarkSizes({
      topBrand: !isBottom ? benchmarkBrand : user?.benchmarkSizes?.topBrand || 'Zara',
      topSize: !isBottom ? benchmarkSize : user?.benchmarkSizes?.topSize || 'M',
      bottomBrand: isBottom ? benchmarkBrand : user?.benchmarkSizes?.bottomBrand || "Levi's",
      bottomSize: isBottom ? benchmarkSize : user?.benchmarkSizes?.bottomSize || '32',
      fitPreference,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/5 dark:bg-amber-400/5 border border-amber-500/20 text-left space-y-4 animate-fadeIn">
      {/* Title & Badge */}
      <div className="flex items-center justify-between pb-3 border-b border-amber-500/15">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-400 text-slate-950 font-bold">
            <Ruler className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold font-editorial text-slate-900 dark:text-white">
              Size & Fit Estimator
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Calibrated for {item.name} ({item.silhouette} cut)
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white px-2 py-1 rounded"
          >
            Hide
          </button>
        )}
      </div>

      {/* Selectors Grid: 1. Reference Brand, 2. Reference Size, 3. Target Store */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        {/* Step 1: Benchmark Brand */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
            I usually wear:
          </label>
          <select
            value={benchmarkBrand}
            onChange={(e) => {
              const b = e.target.value;
              setBenchmarkBrand(b);
              // Pick safe default size for this brand
              const prof = BRAND_PROFILES[b] || BRAND_PROFILES.Zara;
              const sizes = isBottom ? prof.bottomSizes : prof.topSizes;
              setBenchmarkSize(sizes[1]?.size || sizes[0]?.size || 'M');
            }}
            className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-amber-500 font-medium"
          >
            {Object.keys(BRAND_PROFILES).map((bKey) => (
              <option key={bKey} value={bKey}>
                {BRAND_PROFILES[bKey].name}
              </option>
            ))}
          </select>
        </div>

        {/* Step 2: Benchmark Size */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
            My size in {BRAND_PROFILES[benchmarkBrand]?.name.split(' ')[0]}:
          </label>
          <select
            value={benchmarkSize}
            onChange={(e) => setBenchmarkSize(e.target.value)}
            className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-amber-500 font-semibold tabular-nums"
          >
            {availableSizes.map((s) => (
              <option key={s} value={s}>
                Size {s}
              </option>
            ))}
          </select>
        </div>

        {/* Step 3: Target Store for this outfit piece */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Estimate size for:
          </label>
          <select
            value={targetBrand}
            onChange={(e) => setTargetBrand(e.target.value)}
            className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-amber-500 font-medium"
          >
            {Object.keys(BRAND_PROFILES).map((bKey) => (
              <option key={bKey} value={bKey}>
                {BRAND_PROFILES[bKey].name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Fit Preference Buttons */}
      <div className="flex items-center gap-2 pt-1">
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          Drape Preference:
        </span>
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-200/60 dark:bg-slate-800 text-[11px]">
          {(['slim', 'regular', 'oversized'] as FitPreference[]).map((pref) => (
            <button
              key={pref}
              type="button"
              onClick={() => setFitPreference(pref)}
              className={`px-2.5 py-1 rounded-md capitalize font-medium transition ${
                fitPreference === pref
                  ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {pref}
            </button>
          ))}
        </div>
      </div>

      {/* Recommended Output Result Card */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#111726] border border-amber-500/30 shadow-sm space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Recommended on {BRAND_PROFILES[targetBrand]?.name.split(' ')[0]}:
            </span>
            <span className="px-3 py-1 rounded-lg bg-amber-400 text-slate-950 text-sm font-bold shadow-xs">
              Size {result.recommendedSize}
            </span>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Confidence: <strong>{result.confidence}</strong></span>
            {result.estimatedChestRange && (
              <span>(Chest ~{result.estimatedChestRange})</span>
            )}
            {result.estimatedWaistRange && (
              <span>(Waist ~{result.estimatedWaistRange})</span>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-amber-500/5 dark:bg-amber-400/5 p-2.5 rounded-lg border border-amber-500/10">
          {result.fitNotice}
        </p>

        {/* Brand Comparison Grid Table */}
        <div className="pt-2">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
            Cross-Brand Conversion for this Silhouette:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px]">
            {result.comparisonChart.map((c, i) => (
              <div
                key={i}
                className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between"
              >
                <span className="text-slate-600 dark:text-slate-400 truncate max-w-[80px]">
                  {c.brandName.split(' ')[0]}
                </span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                  Size {c.equivalentSize}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action to persist as user's standard benchmark */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Based on your benchmark: {benchmarkBrand} {benchmarkSize}
          </span>

          <button
            type="button"
            onClick={handleSaveDefault}
            className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:underline"
          >
            {savedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Saved to Profile</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save as Default Sizing</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
