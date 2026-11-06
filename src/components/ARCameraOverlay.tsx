import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Upload,
  RefreshCw,
  Sliders,
  Sparkles,
  Download,
  AlertCircle,
  Eye,
  Check,
  RotateCcw,
} from 'lucide-react';
import { OutfitLook, ClothingItem } from '../types';

interface ARCameraOverlayProps {
  look: OutfitLook;
  selectedLayerIds: string[];
  onSnapshot?: (dataUrl: string) => void;
}

export const ARCameraOverlay: React.FC<ARCameraOverlayProps> = ({
  look,
  selectedLayerIds,
  onSnapshot,
}) => {
  const [sourceMode, setSourceMode] = useState<'camera' | 'upload' | 'sample'>('sample');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  // Interactive Fit Controls
  const [garmentScale, setGarmentScale] = useState<number>(100); // 70 to 140
  const [verticalOffset, setVerticalOffset] = useState<number>(0); // -100 to 100
  const [horizontalOffset, setHorizontalOffset] = useState<number>(0); // -50 to 50
  const [overlayOpacity, setOverlayOpacity] = useState<number>(90); // 40 to 100
  const [blendMode, setBlendMode] = useState<'normal' | 'multiply' | 'soft-light'>('normal');
  const [showBodyGuide, setShowBodyGuide] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const compositeCanvasRef = useRef<HTMLCanvasElement>(null);

  // Stop camera helper
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  // Start camera helper
  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
      setSourceMode('camera');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unable to access camera';
      setCameraError(
        errorMsg.includes('Permission')
          ? 'Camera permission denied. You can upload a full-body selfie photo instead.'
          : `${errorMsg}. Please upload a photo or try the sample model.`
      );
      setSourceMode('sample');
    }
  }, [facingMode, stopCamera]);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Handle uploaded selfie
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    stopCamera();
    const reader = new FileReader();
    reader.onload = () => {
      setUserPhotoUrl(reader.result as string);
      setSourceMode('upload');
      setCameraError(null);
    };
    reader.readAsDataURL(file);
  };

  // Flip mobile camera
  const handleToggleCameraFacing = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    if (isCameraActive) {
      setTimeout(() => startCamera(), 100);
    }
  };

  // Reset fit sliders
  const handleResetFit = () => {
    setGarmentScale(100);
    setVerticalOffset(0);
    setHorizontalOffset(0);
    setOverlayOpacity(90);
    setBlendMode('normal');
  };

  // Render layered SVG garment silhouettes
  const renderGarmentSVGLayers = (items: ClothingItem[]) => {
    const activeItems = items.filter(
      (item) => selectedLayerIds.length === 0 || selectedLayerIds.includes(item.id)
    );

    const primaryColor = look.colorPalette[0]?.hex || '#d4af37';
    const secondaryColor = look.colorPalette[1]?.hex || '#1a1f2c';
    const accentColor = look.colorPalette[2]?.hex || '#e2e8f0';

    return (
      <svg
        viewBox="0 0 400 700"
        className="w-full h-full drop-shadow-2xl transition-transform duration-100 ease-out"
        style={{
          transform: `scale(${garmentScale / 100}) translate(${horizontalOffset}px, ${verticalOffset}px)`,
          opacity: overlayOpacity / 100,
          mixBlendMode: blendMode,
        }}
      >
        <defs>
          <linearGradient id="silkSheen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} stopOpacity="0.95" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.3" />
            <stop offset="100%" stopColor={primaryColor} stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="fabricShading" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={secondaryColor} stopOpacity="0.95" />
            <stop offset="100%" stopColor="#0a0a0f" stopOpacity="0.98" />
          </linearGradient>
          <linearGradient id="goldTrim" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#eab308" />
            <stop offset="50%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>
          <filter id="fabricTexture" x="0%" y="0%" width="100%" height="100%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* 1. Footwear Layer */}
        {activeItems.some((i) => i.category.toLowerCase().includes('shoe') || i.category.toLowerCase().includes('footwear')) && (
          <g id="footwear" filter="url(#fabricTexture)">
            {/* Left Shoe */}
            <path
              d="M145 610 L160 610 L165 645 L135 648 L130 635 Z"
              fill={secondaryColor}
              stroke="url(#goldTrim)"
              strokeWidth="1.5"
            />
            {/* Right Shoe */}
            <path
              d="M240 610 L255 610 L270 635 L265 648 L235 645 Z"
              fill={secondaryColor}
              stroke="url(#goldTrim)"
              strokeWidth="1.5"
            />
          </g>
        )}

        {/* 2. Bottom / Trousers / Skirt Layer */}
        {activeItems.some(
          (i) =>
            i.category.toLowerCase().includes('bottom') ||
            i.category.toLowerCase().includes('trouser') ||
            i.category.toLowerCase().includes('pant') ||
            i.category.toLowerCase().includes('skirt')
        ) && (
          <g id="bottoms" filter="url(#fabricTexture)">
            {/* High-waist tailored pants / skirt silhouette */}
            <path
              d="M142 270 Q200 280 258 270 L268 340 L262 610 L226 610 L204 380 L174 610 L138 610 L132 340 Z"
              fill="url(#fabricShading)"
              stroke={primaryColor}
              strokeWidth="1.2"
            />
            {/* Crease lines */}
            <line x1="156" y1="360" x2="156" y2="600" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <line x1="244" y1="360" x2="244" y2="600" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          </g>
        )}

        {/* 3. Dress / Gown Layer (if outfit features full-length dress) */}
        {activeItems.some(
          (i) => i.category.toLowerCase().includes('dress') || i.category.toLowerCase().includes('gown')
        ) && (
          <g id="dress" filter="url(#fabricTexture)">
            {/* Bodice and flowing draped gown */}
            <path
              d="M150 140 Q200 165 250 140 L265 220 Q200 235 135 220 Z"
              fill={primaryColor}
            />
            <path
              d="M135 220 Q200 235 265 220 L310 590 Q200 620 90 590 Z"
              fill="url(#silkSheen)"
              stroke="url(#goldTrim)"
              strokeWidth="2"
            />
            {/* Elegant drape folds */}
            <path
              d="M170 230 Q180 420 150 595"
              stroke="rgba(0,0,0,0.25)"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M230 230 Q220 420 250 595"
              stroke="rgba(0,0,0,0.25)"
              strokeWidth="2"
              fill="none"
            />
          </g>
        )}

        {/* 4. Top / Inner Blouse Layer */}
        {activeItems.some((i) => i.category.toLowerCase().includes('top') || i.category.toLowerCase().includes('shirt')) && (
          <g id="top" filter="url(#fabricTexture)">
            <path
              d="M152 135 Q200 160 248 135 L258 275 Q200 285 142 275 Z"
              fill={accentColor}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1"
            />
          </g>
        )}

        {/* 5. Outerwear / Structured Blazer Layer */}
        {activeItems.some(
          (i) =>
            i.category.toLowerCase().includes('blazer') ||
            i.category.toLowerCase().includes('jacket') ||
            i.category.toLowerCase().includes('outerwear') ||
            i.category.toLowerCase().includes('coat')
        ) && (
          <g id="outerwear" filter="url(#fabricTexture)">
            {/* Left structured shoulder & sleeve */}
            <path
              d="M110 140 L150 120 L150 190 L115 350 L85 340 L105 160 Z"
              fill={secondaryColor}
              stroke={primaryColor}
              strokeWidth="1"
            />
            {/* Right structured shoulder & sleeve */}
            <path
              d="M290 140 L250 120 L250 190 L285 350 L315 340 L295 160 Z"
              fill={secondaryColor}
              stroke={primaryColor}
              strokeWidth="1"
            />
            {/* Main torso body & sharp notch lapels */}
            <path
              d="M148 120 L252 120 L260 320 Q200 330 140 320 Z"
              fill={secondaryColor}
            />
            {/* Left Satin Lapel */}
            <path
              d="M150 120 L178 230 L152 230 L138 150 Z"
              fill="url(#goldTrim)"
            />
            {/* Right Satin Lapel */}
            <path
              d="M250 120 L222 230 L248 230 L262 150 Z"
              fill="url(#goldTrim)"
            />
            {/* Luxury Gold Blazer Button */}
            <circle cx="200" cy="245" r="4.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
            <circle cx="200" cy="275" r="4.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
          </g>
        )}

        {/* 6. Jewelry & Accessories Layer */}
        {activeItems.some((i) => i.category.toLowerCase().includes('accessor') || i.category.toLowerCase().includes('jewelry')) && (
          <g id="accessories" filter="url(#fabricTexture)">
            {/* Statement Gold Choker / Pendant */}
            <path
              d="M175 125 Q200 155 225 125"
              fill="none"
              stroke="url(#goldTrim)"
              strokeWidth="4"
            />
            <circle cx="200" cy="148" r="5" fill="#ffffff" stroke="url(#goldTrim)" strokeWidth="1.5" />
          </g>
        )}
      </svg>
    );
  };

  // High-Resolution Snapshot Compositor
  const handleCaptureSnapshot = () => {
    setIsExporting(true);
    const canvas = compositeCanvasRef.current;
    if (!canvas) {
      setIsExporting(false);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsExporting(false);
      return;
    }

    canvas.width = 720;
    canvas.height = 1080;

    // Draw background (Camera feed, photo, or sample silhouette)
    const renderBackgroundAndStamp = (bgImageElement?: HTMLImageElement | HTMLVideoElement) => {
      if (bgImageElement) {
        ctx.drawImage(bgImageElement, 0, 0, canvas.width, canvas.height);
      } else {
        // Gradient editorial backdrop
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, '#101622');
        grad.addColorStop(1, '#080c14');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Draw subtle dark vignette for focus
      const vignette = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        200,
        canvas.width / 2,
        canvas.height / 2,
        canvas.height / 1.3
      );
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(0,0,0,0.55)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Watermark & editorial card details
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, canvas.height - 130, canvas.width, 130);

      // Brand Title
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 22px serif';
      ctx.fillText('AuraStyle · Haute AR Virtual Try-On', 30, canvas.height - 85);

      // Look Title & Occasion
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px sans-serif';
      ctx.fillText(`${look.title} (${look.occasion})`, 30, canvas.height - 55);

      // Savings callout
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(
        `Curated Dupe Matrix · Potential Savings: ${look.budgetSummary.potentialSavingsPercentage}%`,
        30,
        canvas.height - 25
      );

      // Date Stamp
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(new Date().toLocaleDateString(), canvas.width - 30, canvas.height - 25);
      ctx.textAlign = 'left';

      // Export
      const dataUrl = canvas.toDataURL('image/png');
      setIsExporting(false);

      if (onSnapshot) {
        onSnapshot(dataUrl);
      } else {
        // Auto trigger download
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `AuraStyle-TryOn-${look.title.replace(/\s+/g, '_')}.png`;
        a.click();
      }
    };

    if (sourceMode === 'camera' && videoRef.current) {
      renderBackgroundAndStamp(videoRef.current);
    } else if (sourceMode === 'upload' && userPhotoUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => renderBackgroundAndStamp(img);
      img.src = userPhotoUrl;
    } else {
      renderBackgroundAndStamp();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-5 items-stretch">
      {/* Hidden composite canvas for snapshot generation */}
      <canvas ref={compositeCanvasRef} className="hidden" />

      {/* Main Viewport Container */}
      <div className="relative flex-1 min-h-[460px] sm:min-h-[540px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center select-none group">
        {/* Background Source: 1. Live Camera Feed */}
        {sourceMode === 'camera' && (
          <video
            ref={videoRef}
            playsInline
            muted
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              facingMode === 'user' ? 'scale-x-[-1]' : ''
            }`}
          />
        )}

        {/* Background Source: 2. Uploaded Selfie Photo */}
        {sourceMode === 'upload' && userPhotoUrl && (
          <img
            src={userPhotoUrl}
            alt="User Selfie"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Background Source: 3. Studio Sample Model Silhouette */}
        {sourceMode === 'sample' && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#131926] via-[#0d121c] to-[#070a10] flex flex-col items-center justify-center p-6 text-center">
            {/* Minimalist Model Silhouette SVG */}
            <svg viewBox="0 0 400 700" className="h-full max-h-[500px] opacity-35 stroke-amber-200/30">
              {/* Head */}
              <ellipse cx="200" cy="85" rx="36" ry="46" fill="rgba(255,255,255,0.06)" />
              {/* Neck */}
              <rect x="190" y="130" width="20" height="28" fill="rgba(255,255,255,0.06)" />
              {/* Shoulders & Torso Outline */}
              <path
                d="M120 160 Q200 170 280 160 L260 340 L240 620 L210 620 L200 370 L190 620 L160 620 L140 340 Z"
                fill="rgba(255,255,255,0.04)"
                strokeDasharray="4 4"
                strokeWidth="1.5"
              />
            </svg>
            <div className="absolute bottom-5 px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 text-xs text-slate-300">
              <span>Sample Runway Silhouette · Enable camera or upload selfie above</span>
            </div>
          </div>
        )}

        {/* Full-Body AR Alignment Guide Outline Overlay */}
        {showBodyGuide && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <svg viewBox="0 0 400 700" className="h-full max-h-[520px] stroke-amber-400/40 fill-none stroke-dasharray-[6,6]">
              {/* Head contour */}
              <ellipse cx="200" cy="85" rx="38" ry="48" strokeWidth="1.2" />
              {/* Shoulder line */}
              <line x1="110" y1="160" x2="290" y2="160" strokeWidth="1.5" />
              {/* Waist line */}
              <line x1="135" y1="280" x2="265" y2="280" strokeWidth="1.2" />
              {/* Center balance line */}
              <line x1="200" y1="50" x2="200" y2="650" strokeWidth="0.8" stroke="rgba(245,158,11,0.2)" />
              <text x="200" y="32" textAnchor="middle" fill="rgba(245,158,11,0.6)" fontSize="11" fontFamily="sans-serif">
                Position Face & Shoulders Here
              </text>
            </svg>
          </div>
        )}

        {/* Layered AR Garment Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full max-w-[390px] h-full max-h-[540px]">
            {renderGarmentSVGLayers(look.items)}
          </div>
        </div>

        {/* Camera Error Banner */}
        {cameraError && (
          <div className="absolute top-4 left-4 right-4 p-3 bg-rose-950/80 backdrop-blur-md border border-rose-500/40 rounded-xl text-rose-200 text-xs flex items-center gap-2 z-20">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span className="flex-1">{cameraError}</span>
            <button
              onClick={() => setCameraError(null)}
              className="text-rose-400 hover:text-white text-xs font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Top Floating Source Selector HUD */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none gap-2 z-10">
          <div className="flex items-center gap-1 p-1 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 pointer-events-auto">
            <button
              onClick={startCamera}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                sourceMode === 'camera' && isCameraActive
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{isCameraActive ? 'Live Mirror' : 'Enable Camera'}</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                sourceMode === 'upload'
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Selfie</span>
            </button>

            <button
              onClick={() => {
                stopCamera();
                setSourceMode('sample');
              }}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                sourceMode === 'sample'
                  ? 'bg-white/20 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sample Model
            </button>
          </div>

          <div className="flex items-center gap-1 pointer-events-auto">
            {sourceMode === 'camera' && isCameraActive && (
              <button
                onClick={handleToggleCameraFacing}
                className="p-2 bg-black/60 backdrop-blur-md text-slate-300 hover:text-white rounded-xl border border-white/10 transition"
                title="Flip Camera"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => setShowBodyGuide(!showBodyGuide)}
              className={`p-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 transition ${
                showBodyGuide ? 'text-amber-400' : 'text-slate-400 hover:text-white'
              }`}
              title={showBodyGuide ? 'Hide Body Alignment Guide' : 'Show Body Alignment Guide'}
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoUpload}
        />

        {/* Bottom Floating Snapshot Trigger */}
        <div className="absolute bottom-3 right-3 pointer-events-auto z-10">
          <button
            onClick={handleCaptureSnapshot}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition active:scale-95 disabled:opacity-50"
          >
            {isExporting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>Export AR Snapshot</span>
          </button>
        </div>
      </div>

      {/* Side HUD: Interactive Garment Adjustment Controls */}
      <div className="w-full lg:w-72 bg-slate-50 dark:bg-slate-900/80 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shrink-0">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-amber-500" />
            Garment Drape & Fit
          </span>
          <button
            onClick={handleResetFit}
            className="text-[11px] text-slate-400 hover:text-amber-500 flex items-center gap-1 transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        {/* Scale Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Garment Scale</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
              {garmentScale}%
            </span>
          </div>
          <input
            type="range"
            min="75"
            max="135"
            value={garmentScale}
            onChange={(e) => setGarmentScale(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg"
          />
        </div>

        {/* Vertical Shoulder/Neckline Offset */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Shoulder Alignment</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
              {verticalOffset > 0 ? `+${verticalOffset}` : verticalOffset}px
            </span>
          </div>
          <input
            type="range"
            min="-80"
            max="80"
            value={verticalOffset}
            onChange={(e) => setVerticalOffset(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg"
          />
        </div>

        {/* Horizontal Center Offset */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Center Position</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
              {horizontalOffset > 0 ? `+${horizontalOffset}` : horizontalOffset}px
            </span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={horizontalOffset}
            onChange={(e) => setHorizontalOffset(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg"
          />
        </div>

        {/* Fabric Opacity Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Drape Opacity</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
              {overlayOpacity}%
            </span>
          </div>
          <input
            type="range"
            min="40"
            max="100"
            value={overlayOpacity}
            onChange={(e) => setOverlayOpacity(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg"
          />
        </div>

        {/* Fabric Blend Mode */}
        <div className="space-y-1.5 pt-1 border-t border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400 block">Drape Blend Texture</span>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => setBlendMode('normal')}
              className={`py-1 text-[11px] font-semibold rounded-lg border transition ${
                blendMode === 'normal'
                  ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              Direct Fit
            </button>
            <button
              onClick={() => setBlendMode('multiply')}
              className={`py-1 text-[11px] font-semibold rounded-lg border transition ${
                blendMode === 'multiply'
                  ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              Shadowed
            </button>
            <button
              onClick={() => setBlendMode('soft-light')}
              className={`py-1 text-[11px] font-semibold rounded-lg border transition ${
                blendMode === 'soft-light'
                  ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              Soft Silk
            </button>
          </div>
        </div>

        {/* Pro styling tip */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300 space-y-1">
          <div className="flex items-center gap-1 font-semibold">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Fitting Tip</span>
          </div>
          <p className="leading-snug">
            Stand 5 to 7 feet back from your phone or laptop camera for optimal full-body alignment.
          </p>
        </div>
      </div>
    </div>
  );
};
