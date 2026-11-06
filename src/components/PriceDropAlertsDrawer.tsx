import React, { useState } from 'react';
import {
  X,
  Bell,
  Sparkles,
  ExternalLink,
  CheckCheck,
  Trash2,
  TrendingDown,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatPrice, convertAmount } from '../utils/currencies';

export const PriceDropAlertsDrawer: React.FC = () => {
  const {
    alertsDrawerOpen,
    setAlertsDrawerOpen,
    priceAlerts,
    unreadAlertsCount,
    markAlertAsRead,
    markAllAlertsAsRead,
    dismissAlert,
    checkLivePriceDrops,
    currency,
  } = useApp();

  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  if (!alertsDrawerOpen) return null;

  const handleScanDeals = () => {
    setIsScanning(true);
    setScanMessage('Scanning Indian & foreign store catalogs for flash price drops...');

    setTimeout(() => {
      const result = checkLivePriceDrops();
      setIsScanning(false);
      if (result.newAlertsCount > 0) {
        setScanMessage(
          `🎉 Found ${result.newAlertsCount} new price drop${
            result.newAlertsCount > 1 ? 's' : ''
          }! Saved items updated.`
        );
      } else {
        setScanMessage('All saved items already checked at their lowest current prices.');
      }
      setTimeout(() => setScanMessage(null), 4000);
    }, 1200);
  };

  const handleRequestPush = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        new Notification('AuraStyle Price Alerts Active', {
          body: 'You will receive immediate alerts whenever your saved event items drop in price!',
          icon: '/icon.svg',
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-[#0E131F] border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-400 text-slate-950 font-bold">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold font-editorial text-slate-950 dark:text-white flex items-center gap-1.5">
                  <span>Price Drop Alerts</span>
                  {unreadAlertsCount > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-500 text-white">
                      {unreadAlertsCount} new
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Proactive notifications for your shopping list items
                </p>
              </div>
            </div>

            <button
              onClick={() => setAlertsDrawerOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Bar: Scan Stores + Mark Read */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-900/20 flex items-center justify-between gap-2">
            <button
              onClick={handleScanDeals}
              disabled={isScanning}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-sm transition active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Checking Stores...' : 'Scan Live Deals Now'}</span>
            </button>

            {priceAlerts.length > 0 && (
              <button
                onClick={markAllAlertsAsRead}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Scan result toast message */}
          {scanMessage && (
            <div className="mx-4 mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-amber-900 dark:text-amber-300 animate-fadeIn">
              {scanMessage}
            </div>
          )}

          {/* Alerts List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {priceAlerts.length === 0 ? (
              <div className="py-20 text-center text-slate-500 dark:text-slate-400 space-y-2">
                <ShoppingBag className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  No Price Drops Yet
                </p>
                <p className="text-xs max-w-xs mx-auto">
                  When any item on your event shopping lists goes on sale or hits your target price, you'll see it here!
                </p>
              </div>
            ) : (
              priceAlerts.map((alert) => {
                const prevConverted = convertAmount(
                  alert.previousPrice,
                  alert.currency,
                  currency
                );
                const currentConverted = convertAmount(
                  alert.currentSalePrice,
                  alert.currency,
                  currency
                );
                const savingsConverted = prevConverted - currentConverted;

                return (
                  <div
                    key={alert.id}
                    onClick={() => markAlertAsRead(alert.id)}
                    className={`p-4 rounded-2xl border transition-all ${
                      alert.read
                        ? 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-800/60'
                        : 'bg-white dark:bg-[#131A28] border-amber-500/50 shadow-md ring-1 ring-amber-500/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          {alert.discountPercent}% PRICE DROP
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {alert.timestamp}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissAlert(alert.id);
                        }}
                        className="text-slate-400 hover:text-rose-500 transition p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">
                      {alert.itemName}
                    </h4>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>{alert.storeName}</span>
                      <span aria-hidden="true"> · </span>
                      <span className="text-amber-600 dark:text-amber-400 font-medium">
                        {alert.capsuleName}
                      </span>
                    </div>

                    {/* Price Comparison */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-400 line-through tabular-nums mr-1.5">
                          {formatPrice(prevConverted, currency)}
                        </span>
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                          {formatPrice(currentConverted, currency)}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          Save {formatPrice(savingsConverted, currency)}
                        </span>
                      </div>

                      <a
                        href={alert.storeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-semibold shadow-sm transition active:scale-95"
                      >
                        <span>Grab Deal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer with Push Permission Option */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-center">
            {typeof window !== 'undefined' &&
              'Notification' in window &&
              Notification.permission !== 'granted' && (
                <button
                  onClick={handleRequestPush}
                  className="w-full py-2 px-3 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:border-amber-500 text-slate-700 dark:text-slate-300 transition mb-2"
                >
                  Enable Browser Push Notifications
                </button>
              )}
            <p className="text-[11px] text-slate-400">
              AuraStyle checks deals continuously across Myntra, Ajio, Amazon, Zara & ASOS.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
