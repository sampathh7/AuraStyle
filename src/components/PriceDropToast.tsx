import React from 'react';
import { Sparkles, X, ExternalLink, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatPrice, convertAmount } from '../utils/currencies';

export const PriceDropToast: React.FC = () => {
  const {
    latestPriceDropToast,
    setLatestPriceDropToast,
    setAlertsDrawerOpen,
    currency,
  } = useApp();

  if (!latestPriceDropToast) return null;

  const currentPriceConverted = convertAmount(
    latestPriceDropToast.currentSalePrice,
    latestPriceDropToast.currency,
    currency
  );
  const prevPriceConverted = convertAmount(
    latestPriceDropToast.previousPrice,
    latestPriceDropToast.currency,
    currency
  );

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 max-w-sm w-full bg-slate-900 text-white rounded-2xl border border-amber-400/40 p-4 shadow-2xl animate-bounce-short">
      <div className="flex items-start justify-between gap-3">
        <div className="p-2 rounded-xl bg-amber-400 text-slate-950 font-bold shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
            <span>🎉 Flash Price Drop Detected!</span>
          </div>

          <h4 className="text-sm font-bold text-white mt-0.5 line-clamp-1">
            {latestPriceDropToast.itemName}
          </h4>

          <p className="text-xs text-slate-300 mt-0.5">
            Dropped {latestPriceDropToast.discountPercent}% on {latestPriceDropToast.storeName}
          </p>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-base font-bold text-emerald-400 tabular-nums">
              {formatPrice(currentPriceConverted, currency)}
            </span>
            <span className="text-xs text-slate-400 line-through tabular-nums">
              {formatPrice(prevPriceConverted, currency)}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <a
              href={latestPriceDropToast.storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center py-1.5 px-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-semibold shadow-sm transition"
            >
              Grab Deal Now
            </a>
            <button
              onClick={() => {
                setLatestPriceDropToast(null);
                setAlertsDrawerOpen(true);
              }}
              className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
            >
              All Alerts
            </button>
          </div>
        </div>

        <button
          onClick={() => setLatestPriceDropToast(null)}
          className="text-slate-400 hover:text-white p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
