import React, { useRef } from 'react';
import { Sparkles, Camera, Flame, Sun, Crown, Disc } from 'lucide-react';

export interface SnapLens {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  icon: string;
  color: string;
  themeHue: string;
  posePreset?: 'peace' | 'strut' | 'selfie' | 'chill';
}

export const SNAPCHAT_LENSES: SnapLens[] = [
  {
    id: 'original',
    name: 'Original Fit',
    tagline: 'Curated Palette',
    badge: 'OOTD',
    icon: '✨',
    color: '#FFFC00',
    themeHue: '#FFFC00',
    posePreset: 'peace',
  },
  {
    id: 'cyber-street',
    name: 'Cyber Street',
    tagline: 'Neon Glow',
    badge: 'VIBE',
    icon: '🕶️',
    color: '#06B6D4',
    themeHue: '#38BDF8',
    posePreset: 'selfie',
  },
  {
    id: 'gala-glam',
    name: 'Gala Soirée',
    tagline: '24K Golden Aura',
    badge: 'LUXE',
    icon: '👑',
    color: '#F59E0B',
    themeHue: '#FBBF24',
    posePreset: 'strut',
  },
  {
    id: 'summer-bloom',
    name: 'Summer Breeze',
    tagline: 'Sunset Pastel',
    badge: 'FRESH',
    icon: '🌸',
    color: '#EC4899',
    themeHue: '#F472B6',
    posePreset: 'chill',
  },
  {
    id: 'retro-pop',
    name: 'Y2K Retro',
    tagline: 'Analog Flash',
    badge: '100%',
    icon: '⚡',
    color: '#8B5CF6',
    themeHue: '#A78BFA',
    posePreset: 'peace',
  },
  {
    id: 'minimal-chic',
    name: 'Editorial Chic',
    tagline: 'Monochrome High Fashion',
    badge: 'RUNWAY',
    icon: '🖤',
    color: '#E2E8F0',
    themeHue: '#CBD5E1',
    posePreset: 'strut',
  },
];

interface SnapchatLensCarouselProps {
  activeLensId: string;
  onSelectLens: (lens: SnapLens) => void;
  onSnapCapture: () => void;
  isCapturing?: boolean;
}

// Web Audio API Synthesizer for instant tactile Snap feedback
function playSnapSound(type: 'shutter' | 'lens') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'shutter') {
      // Crisp mechanical shutter click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } else {
      // Pleasant lens transition blip
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    }
  } catch {
    // Ignore audio permission or playback restrictions
  }
}

export const SnapchatLensCarousel: React.FC<SnapchatLensCarouselProps> = ({
  activeLensId,
  onSelectLens,
  onSnapCapture,
  isCapturing = false,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleLensClick = (lens: SnapLens) => {
    playSnapSound('lens');
    onSelectLens(lens);
  };

  const handleSnapClick = () => {
    playSnapSound('shutter');
    onSnapCapture();
  };

  return (
    <div className="relative w-full max-w-lg mx-auto flex flex-col items-center select-none pt-2 pb-1">
      {/* Active Lens Title Indicator */}
      <div className="text-center mb-2 animate-fadeIn pointer-events-none">
        {(() => {
          const active = SNAPCHAT_LENSES.find((l) => l.id === activeLensId) || SNAPCHAT_LENSES[0];
          return (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-[11px] font-semibold tracking-wide shadow-lg">
              <span className="text-[#FFFC00]">{active.icon}</span>
              <span>{active.name}</span>
              <span className="text-white/40">·</span>
              <span className="text-xs text-amber-300 font-normal">{active.tagline}</span>
            </div>
          );
        })()}
      </div>

      {/* Circular Lens Ribbon & Center Shutter */}
      <div className="relative w-full flex items-center justify-center">
        {/* Horizontal lens tray */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-3.5 sm:gap-4 overflow-x-auto px-6 py-2 scrollbar-none scroll-smooth w-full justify-center"
        >
          {SNAPCHAT_LENSES.map((lens) => {
            const isActive = lens.id === activeLensId;
            return (
              <button
                key={lens.id}
                onClick={() => handleLensClick(lens)}
                className={`group relative flex flex-col items-center shrink-0 transition-all duration-200 outline-none focus:outline-none ${
                  isActive ? 'scale-110 z-10' : 'scale-90 opacity-70 hover:opacity-100 hover:scale-95'
                }`}
                title={lens.name}
              >
                {/* Circular Lens Ring */}
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all ${
                    isActive
                      ? 'p-0.5 bg-gradient-to-tr from-[#FFFC00] via-white to-[#FFFC00] shadow-[0_0_20px_rgba(255,252,0,0.45)]'
                      : 'p-0.5 bg-white/20 hover:bg-white/40'
                  }`}
                >
                  <div className="w-full h-full rounded-full bg-slate-950/90 flex flex-col items-center justify-center text-xl sm:text-2xl border border-black/40 relative overflow-hidden">
                    <span>{lens.icon}</span>
                    {/* Active pulse dot */}
                    {isActive && (
                      <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-[#FFFC00] animate-ping" />
                    )}
                  </div>
                </div>

                <span
                  className={`text-[10px] mt-1 font-semibold truncate max-w-[70px] ${
                    isActive ? 'text-[#FFFC00]' : 'text-slate-300'
                  }`}
                >
                  {lens.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Signature Snapchat Shutter Button */}
      <div className="mt-2 flex items-center gap-4">
        <button
          onClick={handleSnapClick}
          disabled={isCapturing}
          className="relative group p-1.5 rounded-full outline-none focus:outline-none transition active:scale-95"
          title="Take Snap (Shutter)"
        >
          {/* Outer thick yellow/white ring */}
          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full border-4 border-[#FFFC00] group-hover:border-white shadow-[0_0_25px_rgba(255,252,0,0.5)] flex items-center justify-center bg-black/30 backdrop-blur-md transition-all">
            {/* Inner solid white capture circle */}
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white transition-all duration-150 flex items-center justify-center shadow-inner ${
                isCapturing ? 'scale-75 bg-amber-400' : 'group-hover:scale-95'
              }`}
            >
              <Camera className="w-6 h-6 text-slate-950" />
            </div>
          </div>
        </button>
      </div>

      <span className="text-[10px] text-white/60 font-medium tracking-wider uppercase mt-1">
        Tap to Snap & Save Look
      </span>
    </div>
  );
};
