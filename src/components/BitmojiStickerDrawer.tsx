import React, { useState, useRef } from 'react';
import {
  X,
  Sparkles,
  Download,
  Copy,
  Check,
  Flame,
  Crown,
  Heart,
  Smile,
  Share2,
} from 'lucide-react';
import { OutfitLook } from '../types';

interface BitmojiStickerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  look: OutfitLook;
  avatarSnapshotUrl: string | null;
}

interface StickerTemplate {
  id: string;
  title: string;
  tagline: string;
  badgeText: string;
  accentColor: string;
  bgGradient: string;
  icon: string;
}

const STICKER_TEMPLATES: StickerTemplate[] = [
  {
    id: 'fit-check',
    title: 'Fit Check! ✨',
    tagline: 'Rate my look 1-10',
    badgeText: 'FIT CHECK',
    accentColor: '#FFFC00',
    bgGradient: 'from-amber-400/30 via-yellow-300/20 to-orange-400/30',
    icon: '✨',
  },
  {
    id: 'ootd-slay',
    title: 'OOTD 💅',
    tagline: 'Outfit of the Day',
    badgeText: 'OOTD',
    accentColor: '#EC4899',
    bgGradient: 'from-pink-500/30 via-rose-400/20 to-purple-500/30',
    icon: '💅',
  },
  {
    id: 'pure-vibe',
    title: '100% Vibe 🔥',
    tagline: 'Unmatched Energy',
    badgeText: '100% FIRE',
    accentColor: '#F97316',
    bgGradient: 'from-orange-500/30 via-amber-400/20 to-red-500/30',
    icon: '🔥',
  },
  {
    id: 'main-character',
    title: 'Main Character 👑',
    tagline: 'Spotlight on me',
    badgeText: 'ROYAL FIT',
    accentColor: '#EAB308',
    bgGradient: 'from-yellow-400/30 via-amber-300/20 to-yellow-600/30',
    icon: '👑',
  },
  {
    id: 'weekend-mood',
    title: 'Weekend Mood 🎉',
    tagline: 'Party Ready',
    badgeText: 'WEEKEND',
    accentColor: '#8B5CF6',
    bgGradient: 'from-purple-500/30 via-indigo-400/20 to-violet-500/30',
    icon: '🎉',
  },
  {
    id: 'slaying-today',
    title: 'Slaying Today 💫',
    tagline: 'Dressed to impress',
    badgeText: 'SLAYING',
    accentColor: '#06B6D4',
    bgGradient: 'from-cyan-500/30 via-teal-300/20 to-sky-500/30',
    icon: '💫',
  },
];

export const BitmojiStickerDrawer: React.FC<BitmojiStickerDrawerProps> = ({
  isOpen,
  onClose,
  look,
  avatarSnapshotUrl,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [customCaption, setCustomCaption] = useState<string>('');
  const [selectedStickerId, setSelectedStickerId] = useState<string>('fit-check');

  if (!isOpen) return null;

  // Generate downloadable transparent composite PNG for a given sticker template
  const handleDownloadSticker = (template: StickerTemplate) => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw stylized Snapchat sticker card with rounded corners
    ctx.save();
    ctx.fillStyle = 'rgba(16, 20, 28, 0.95)';
    ctx.roundRect(20, 20, 560, 660, 40);
    ctx.fill();

    // Outer Snap Yellow border
    ctx.lineWidth = 6;
    ctx.strokeStyle = template.accentColor;
    ctx.stroke();
    ctx.restore();

    // Draw avatar image in center
    const renderContent = (img?: HTMLImageElement) => {
      if (img) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(40, 90, 520, 460, 24);
        ctx.clip();
        ctx.drawImage(img, 40, 90, 520, 460);
        ctx.restore();
      }

      // Top Header Badge
      ctx.save();
      ctx.fillStyle = template.accentColor;
      ctx.roundRect(180, 45, 240, 40, 20);
      ctx.fill();
      ctx.fillStyle = '#0a0a0f';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(template.badgeText, 300, 72);
      ctx.restore();

      // Bottom Caption Banner
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.roundRect(40, 565, 520, 95, 24);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      const displayText = customCaption.trim() ? customCaption : template.title;
      ctx.fillText(displayText, 300, 610);

      ctx.fillStyle = '#64748b';
      ctx.font = '16px sans-serif';
      ctx.fillText(`${look.title} • AuraStyle Snapchat AR`, 300, 642);
      ctx.restore();

      // Trigger download
      const link = document.createElement('a');
      link.download = `bitmoji-sticker-${template.id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    if (avatarSnapshotUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => renderContent(img);
      img.src = avatarSnapshotUrl;
    } else {
      renderContent();
    }
  };

  // Copy sticker image or URL to clipboard
  const handleCopySticker = async (template: StickerTemplate) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 500;
      canvas.height = 500;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#11141c';
        ctx.roundRect(10, 10, 480, 480, 30);
        ctx.fill();
        ctx.fillStyle = template.accentColor;
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(template.title, 250, 60);

        if (avatarSnapshotUrl) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            ctx.drawImage(img, 50, 90, 400, 360);
            canvas.toBlob((blob) => {
              if (blob && navigator.clipboard && window.ClipboardItem) {
                navigator.clipboard.write([
                  new ClipboardItem({ 'image/png': blob }),
                ]);
              }
            });
          };
          img.src = avatarSnapshotUrl;
        }
      }
      setCopiedId(template.id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      setCopiedId(template.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800/80 bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFFC00] text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-yellow-500/20">
              <Sparkles className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-amber-400 font-bold uppercase tracking-wider">
                <span>Snapchat Bitmoji Studio</span>
                <span className="text-white/40">·</span>
                <span>Custom Stickers</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Export Your Look as Bitmoji Stickers
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Custom Caption Input */}
        <div className="px-5 py-3 bg-slate-900/40 border-b border-slate-800/60 flex items-center gap-3 shrink-0">
          <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">
            Sticker Text:
          </span>
          <input
            type="text"
            value={customCaption}
            onChange={(e) => setCustomCaption(e.target.value)}
            placeholder="Type custom caption (e.g. Slaying at the party! 🔥)"
            className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FFFC00]"
            maxLength={36}
          />
        </div>

        {/* Sticker Gallery Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {STICKER_TEMPLATES.map((tpl) => {
            const isCopied = copiedId === tpl.id;
            return (
              <div
                key={tpl.id}
                className={`relative rounded-2xl p-4 border bg-gradient-to-b ${tpl.bgGradient} border-slate-800 flex flex-col justify-between hover:border-amber-400/60 transition-all duration-200 group shadow-lg`}
              >
                {/* Sticker Header Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-slate-950 shadow-xs"
                    style={{ backgroundColor: tpl.accentColor }}
                  >
                    {tpl.badgeText}
                  </span>
                  <span className="text-xl">{tpl.icon}</span>
                </div>

                {/* Avatar Preview Area */}
                <div className="relative aspect-square w-full rounded-xl bg-slate-950/60 border border-white/10 overflow-hidden flex items-center justify-center p-2 mb-3">
                  {avatarSnapshotUrl ? (
                    <img
                      src={avatarSnapshotUrl}
                      alt={tpl.title}
                      className="w-full h-full object-contain filter drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-4">
                      <div className="w-12 h-12 rounded-full bg-[#FFFC00]/20 text-[#FFFC00] flex items-center justify-center mb-2">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <span className="text-xs text-slate-300 font-semibold">
                        {look.title}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-0.5">
                        Bitmoji Dressed Avatar
                      </span>
                    </div>
                  )}

                  {/* Caption stamp */}
                  <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-center">
                    <p className="text-xs font-bold text-white truncate">
                      {customCaption.trim() ? customCaption : tpl.title}
                    </p>
                  </div>
                </div>

                {/* Sticker Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleDownloadSticker(tpl)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#FFFC00] hover:bg-yellow-300 text-slate-950 font-bold text-xs shadow-md transition active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PNG</span>
                  </button>

                  <button
                    onClick={() => handleCopySticker(tpl)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                    title="Copy Sticker"
                  >
                    {isCopied ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info strip */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>High-res transparent PNGs ready for Snapchat Stories, Chats & Instagram.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
