import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Share2,
  Sparkles,
  QrCode,
  ExternalLink,
} from 'lucide-react';
import { OutfitLook } from '../types';
import { useApp } from '../context/AppContext';
import { formatPrice, convertAmount } from '../utils/currencies';

interface SocialShareModalProps {
  look: OutfitLook | null;
  onClose: () => void;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({ look, onClose }) => {
  const { currency } = useApp();
  const [copied, setCopied] = useState(false);

  if (!look) return null;

  const shareUrl = `${window.location.origin}/#look-${look.id}`;
  const shareText = `Check out this ${look.occasion} outfit I recreated on AuraStyle! Found identical budget dupes across stores for only ${formatPrice(
    convertAmount(look.budgetSummary.budgetDupeTotal, look.budgetSummary.currency, currency),
    currency
  )}:`;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `AuraStyle · ${look.title}`,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or unsupported
      }
    } else {
      handleCopy();
    }
  };

  const handleWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      `${shareText} ${shareUrl}`
    )}`;
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
  };

  const handleTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText
    )}&url=${encodeURIComponent(shareUrl)}`;
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-[#0E131F] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-amber-500" />
            <h3 className="text-base font-bold font-editorial text-slate-950 dark:text-white">
              Share Event Lookbook
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Postcard Preview */}
        <div className="my-5 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-amber-500/5 dark:from-slate-900 dark:to-amber-500/5 border border-slate-200/80 dark:border-slate-800/80 shadow-inner text-left">
          <div className="flex items-center justify-between text-[11px] text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wider mb-2">
            <span>AuraStyle Haute Capsule</span>
            <span>{look.occasion}</span>
          </div>

          <h4 className="text-lg font-bold font-editorial text-slate-950 dark:text-white">
            {look.title}
          </h4>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
            <span>{look.items.length} pieces deconstructed</span>
            <span className="font-bold text-slate-900 dark:text-white tabular-nums">
              {formatPrice(
                convertAmount(
                  look.budgetSummary.budgetDupeTotal,
                  look.budgetSummary.currency,
                  currency
                ),
                currency
              )}
            </span>
          </div>

          {/* QR Code Graphic Simulation */}
          <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Scan or click link to view stores & deals</span>
            <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <QrCode className="w-6 h-6 text-slate-900 dark:text-white" />
            </div>
          </div>
        </div>

        {/* Quick Share Buttons Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
          <button
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition active:scale-95"
          >
            <span>WhatsApp</span>
          </button>

          <button
            onClick={handleTwitter}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 transition active:scale-95"
          >
            <span>X / Twitter</span>
          </button>
        </div>

        {/* Native Web Share Button */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            onClick={handleNativeShare}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs transition shadow-sm flex items-center justify-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share via Phone Apps</span>
          </button>
        )}

        {/* Copy Link Input Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-mono truncate outline-none"
          />
          <button
            onClick={handleCopy}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 transition shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
