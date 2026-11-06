import React, { useState } from 'react';
import {
  X,
  TrendingDown,
  ExternalLink,
  Bell,
  Check,
  Calendar,
  Sparkles,
  ArrowDownRight,
  ShieldCheck,
} from 'lucide-react';
import { ChecklistItem, EventCapsule } from '../types';
import { useApp } from '../context/AppContext';
import { formatPrice, convertAmount } from '../utils/currencies';
import { generateSamplePriceHistory } from '../utils/mockData';

interface PriceHistoryModalProps {
  payload: { capsule: EventCapsule; item: ChecklistItem } | null;
  onClose: () => void;
}

export const PriceHistoryModal: React.FC<PriceHistoryModalProps> = ({
  payload,
  onClose,
}) => {
  const { currency, setTargetPriceAlert } = useApp();

  if (!payload) return null;
  const { capsule, item } = payload;

  const currentPriceConverted = convertAmount(
    item.price,
    item.currency,
    currency
  );
  const origPriceConverted = item.originalPrice
    ? convertAmount(item.originalPrice, item.currency, currency)
    : Math.round(currentPriceConverted * 1.5);

  const [targetInput, setTargetInput] = useState<string>(
    item.targetPriceAlert
      ? convertAmount(item.targetPriceAlert, item.currency, currency).toString()
      : Math.round(currentPriceConverted * 0.9).toString()
  );
  const [alertSaved, setAlertSaved] = useState(false);

  const handleSaveAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(targetInput);
    if (!isNaN(val) && val > 0) {
      // Convert target back to item's native currency
      const inNative = convertAmount(val, currency, item.currency);
      setTargetPriceAlert(capsule.id, item.id, inNative);
      setAlertSaved(true);
      setTimeout(() => setAlertSaved(false), 2000);
    }
  };

  const history =
    Array.isArray(item.priceHistory) && item.priceHistory.length > 0
      ? item.priceHistory
      : generateSamplePriceHistory(item.price, item.currency, item.storeName);
  const prices = history.map((h) =>
    convertAmount(h.price, h.currency, currency)
  );
  const minPrice = Math.min(...(prices.length ? prices : [currentPriceConverted]));
  const maxPrice = Math.max(...(prices.length ? prices : [origPriceConverted]));
  const priceRange = Math.max(1, maxPrice - minPrice);

  // SVG Chart Dimensions
  const chartWidth = 500;
  const chartHeight = 160;
  const paddingX = 40;
  const paddingY = 30;

  const points = history.map((h, i) => {
    const x =
      history.length > 1
        ? paddingX +
          (i / (history.length - 1)) * (chartWidth - paddingX * 2)
        : chartWidth / 2;
    const converted = convertAmount(h.price, h.currency, currency);
    const normalizedY = (converted - minPrice) / priceRange;
    // Invert Y for SVG coordinates
    const y = chartHeight - paddingY - normalizedY * (chartHeight - paddingY * 2);
    return { x, y, converted, label: h.date, store: h.storeName, isLowest: h.isLowest };
  });

  const pathD =
    points.length > 1
      ? points.reduce(
          (acc, p, idx) =>
            idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`,
          ''
        )
      : '';

  const areaD =
    points.length > 1
      ? `${pathD} L ${points[points.length - 1].x} ${
          chartHeight - paddingY + 10
        } L ${points[0].x} ${chartHeight - paddingY + 10} Z`
      : '';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#0E131F] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wider">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Price History & Deal Tracker</span>
            </div>
            <h3 className="text-xl font-bold font-editorial text-slate-950 dark:text-white mt-1">
              {item.itemName}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span>{item.storeName}</span>
              <span aria-hidden="true">·</span>
              <span>{capsule.eventName}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Price vs Lowest Recorded */}
        <div className="my-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
              Current Live Price
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold text-slate-950 dark:text-white tabular-nums">
                {formatPrice(currentPriceConverted, currency)}
              </span>
              {origPriceConverted > currentPriceConverted && (
                <span className="text-xs text-slate-400 line-through tabular-nums">
                  {formatPrice(origPriceConverted, currency)}
                </span>
              )}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-end gap-1">
              <Sparkles className="w-3 h-3" />
              All-Time Low Recorded
            </span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatPrice(minPrice, currency)}
            </span>
          </div>
        </div>

        {/* 30-Day Historical Price Curve Chart */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            <span>30-Day Price Movement Trend</span>
            <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
              {history.length} price checks
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 relative overflow-hidden">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-40 overflow-visible"
            >
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Shaded Area */}
              {areaD && <path d={areaD} fill="url(#priceGradient)" />}

              {/* Trend Line */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Points */}
              {points.map((p, idx) => (
                <g key={idx}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={p.isLowest ? 5 : 3.5}
                    className={
                      p.isLowest
                        ? 'fill-emerald-500 stroke-white dark:stroke-slate-950 stroke-2'
                        : 'fill-amber-500 stroke-white dark:stroke-slate-950 stroke-2'
                    }
                  />
                  <text
                    x={p.x}
                    y={p.y - 10}
                    textAnchor="middle"
                    className="text-[10px] font-bold fill-slate-700 dark:fill-slate-300 tabular-nums"
                  >
                    {p.converted}
                  </text>
                  <text
                    x={p.x}
                    y={chartHeight - 8}
                    textAnchor="middle"
                    className="text-[9px] fill-slate-400 dark:fill-slate-500"
                  >
                    {p.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Set Proactive Price Drop Alert */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-500" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-900 dark:text-amber-300">
              Proactive Deal Notification
            </h4>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Get instantly notified when {item.itemName} drops below your target price threshold:
          </p>

          <form onSubmit={handleSaveAlert} className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                placeholder="Target Price"
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-amber-300 dark:border-amber-700/60 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-amber-500 tabular-nums"
              />
              <span className="absolute right-3 top-2 text-xs text-slate-400 font-medium">
                {currency}
              </span>
            </div>

            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-sm transition active:scale-95 flex items-center gap-1 shrink-0"
            >
              {alertSaved ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Alert Set!</span>
                </>
              ) : (
                <span>Set Alert</span>
              )}
            </button>
          </form>
        </div>

        {/* Direct Store Buy CTA */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Verified live on {item.storeName}
          </span>

          <a
            href={item.storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 transition shadow-sm"
          >
            <span>Open {item.storeName} Listing</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
