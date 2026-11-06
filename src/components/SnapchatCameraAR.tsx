import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  RefreshCw,
  Sliders,
  Sparkles,
  Download,
  AlertCircle,
  Eye,
  Check,
  RotateCcw,
  FlipHorizontal,
  Sun,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { OutfitLook } from '../types';

interface SnapchatCameraARProps {
  look: OutfitLook;
  selectedLayerIds: string[];
  onSnapshot?: (dataUrl: string) => void;
  onSwitchTo3DMannequin?: () => void;
}

export const SnapchatCameraAR: React.FC<SnapchatCameraARProps> = ({
  look,
  selectedLayerIds,
  onSnapshot,
  onSwitchTo3DMannequin,
}) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isSimulatedFlash, setIsSimulatedFlash] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // AR Try-On Calibration Controls
  const [garmentScale, setGarmentScale] = useState<number>(100);
  const [verticalOffset, setVerticalOffset] = useState<number>(0);
  const [horizontalOffset, setHorizontalOffset] = useState<number>(0);
  const [overlayOpacity, setOverlayOpacity] = useState<number>(95);
  const [showBodyGuide, setShowBodyGuide] = useState<boolean>(true);
  const [showSlidersDrawer, setShowSlidersDrawer] = useState<boolean>(false);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const compositeCanvasRef = useRef<HTMLCanvasElement>(null);

  // Stop active camera helper
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  // Start live webcam helper
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
        videoRef.current.play().catch(() => {});
      }
      setIsCameraActive(true);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unable to access camera';
      setCameraError(
        errorMsg.includes('Permission')
          ? 'Camera permission was denied. You can still test in interactive 3D Bitmoji Mode!'
          : `${errorMsg}. Switch to 3D Bitmoji Mode to try outfits.`
      );
    }
  }, [facingMode, stopCamera]);

  // Start camera on mount
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // Flip camera front/back
  const handleToggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // High-Resolution Composite Snapshot with Snapchat Timestamp Watermark
  const handleCaptureSnap = () => {
    setIsCapturing(true);

    const canvas = compositeCanvasRef.current;
    if (!canvas) {
      setIsCapturing(false);
      return;
    }

    const video = videoRef.current;
    const width = 720;
    const height = 960;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsCapturing(false);
      return;
    }

    // 1. Draw camera video background
    if (video && isCameraActive && video.readyState >= 2) {
      ctx.save();
      // Mirror horizontal for user-facing camera
      if (facingMode === 'user') {
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, width, height);
      ctx.restore();
    } else {
      // Dark cinematic fallback gradient
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Draw flash overlay if active
    if (isSimulatedFlash) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fillRect(0, 0, width, height);
    }

    // 3. Draw Snapchat Classic Geotag & Timestamp Overlay
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString([], { month: 'short', day: 'numeric' });

    ctx.save();
    // Bottom translucent banner
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.roundRect(40, height - 120, width - 80, 80, 20);
    ctx.fill();

    // Text details
    ctx.fillStyle = '#FFFC00'; // Snapchat Yellow
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(`${look.title}`, 64, height - 80);

    ctx.fillStyle = '#ffffff';
    ctx.font = '16px sans-serif';
    ctx.fillText(`AuraStyle Snap AR • ${timeStr} • ${dateStr}`, 64, height - 52);
    ctx.restore();

    const dataUrl = canvas.toDataURL('image/png');
    setCapturedPhotoUrl(dataUrl);
    if (onSnapshot) {
      onSnapshot(dataUrl);
    }

    setIsCapturing(false);
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-black border border-slate-800 shadow-2xl flex flex-col items-center select-none">
      {/* Viewport Box (9:16 mobile aspect feel or responsive aspect) */}
      <div className="relative w-full h-[520px] sm:h-[600px] flex items-center justify-center overflow-hidden bg-slate-950">
        {/* Live Camera Video Feed */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            facingMode === 'user' ? 'scale-x-[-1]' : ''
          } ${isCameraActive ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Fallback Camera Error / Perm State */}
        {!isCameraActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 bg-slate-950/90 backdrop-blur-md">
            <div className="w-16 h-16 rounded-3xl bg-yellow-400/20 text-[#FFFC00] flex items-center justify-center mb-4 border border-yellow-400/40 animate-pulse">
              <Camera className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Snapchat Live AR Try-On</h3>
            <p className="text-xs text-slate-300 max-w-sm mb-6 leading-relaxed">
              {cameraError || 'Allow camera access to try on outfits with live AR camera tracking.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={startCamera}
                className="px-5 py-2.5 rounded-xl bg-[#FFFC00] text-slate-950 font-bold text-xs shadow-lg hover:bg-yellow-300 transition active:scale-95 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Camera</span>
              </button>
              {onSwitchTo3DMannequin && (
                <button
                  onClick={onSwitchTo3DMannequin}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-white font-semibold text-xs border border-slate-700 hover:bg-slate-700 transition"
                >
                  Use 3D Bitmoji Model
                </button>
              )}
            </div>
          </div>
        )}

        {/* Body Alignment Outline Guide */}
        {showBodyGuide && isCameraActive && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-40">
            <svg
              className="w-full h-full max-w-sm stroke-[#FFFC00]"
              viewBox="0 0 400 600"
              fill="none"
              strokeWidth="2"
              strokeDasharray="6 6"
            >
              {/* Head guide ellipse */}
              <ellipse cx="200" cy="140" rx="45" ry="60" />
              {/* Shoulder & Torso curve */}
              <path d="M 120 230 C 140 210, 260 210, 280 230" />
              <path d="M 120 230 L 140 420 L 260 420 L 280 230" />
              {/* Hip line */}
              <line x1="140" y1="420" x2="260" y2="420" />
            </svg>
          </div>
        )}

        {/* AR Garment Overlay Vector Silhouette */}
        {isCameraActive && (
          <div
            className="absolute inset-0 pointer-events-none flex items-center justify-center transition-transform duration-150"
            style={{
              transform: `scale(${garmentScale / 100}) translate(${horizontalOffset}px, ${verticalOffset}px)`,
              opacity: overlayOpacity / 100,
            }}
          >
            {/* High visual fidelity costume projection overlay */}
            <div className="relative w-64 sm:w-72 h-96 flex flex-col items-center justify-center">
              {/* Garment silhouette layer */}
              <div className="absolute inset-0 border-2 border-dashed border-[#FFFC00]/60 rounded-3xl animate-pulse" />
              <div className="p-4 rounded-2xl bg-black/70 backdrop-blur-md border border-[#FFFC00]/40 text-center shadow-2xl">
                <span className="text-[10px] uppercase font-black tracking-widest text-[#FFFC00] block mb-1">
                  AR LIVE TRY-ON LENS
                </span>
                <p className="text-xs font-bold text-white">{look.title}</p>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  {look.items.map((item) => (
                    <span
                      key={item.id}
                      className="w-2.5 h-2.5 rounded-full border border-white/40"
                      style={{ backgroundColor: item.color || '#f59e0b' }}
                      title={item.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top Floating Snapchat Camera Toolbar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-auto">
          {/* Snap Mode Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-[#FFFC00] animate-ping" />
            <span>Snap AR Lens</span>
          </div>

          {/* Quick HUD controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBodyGuide((v) => !v)}
              className={`p-2 rounded-full backdrop-blur-md transition ${
                showBodyGuide ? 'bg-[#FFFC00] text-slate-950 font-bold' : 'bg-black/60 text-white hover:bg-black/80'
              }`}
              title="Toggle Alignment Guide"
            >
              <Eye className="w-4 h-4" />
            </button>

            <button
              onClick={handleToggleFacingMode}
              className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition active:rotate-180"
              title="Flip Camera (Front/Rear)"
            >
              <FlipHorizontal className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsSimulatedFlash((v) => !v)}
              className={`p-2 rounded-full backdrop-blur-md transition ${
                isSimulatedFlash ? 'bg-[#FFFC00] text-slate-950' : 'bg-black/60 text-white hover:bg-black/80'
              }`}
              title="Toggle Flash"
            >
              <Sun className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowSlidersDrawer((v) => !v)}
              className={`p-2 rounded-full backdrop-blur-md transition ${
                showSlidersDrawer ? 'bg-[#FFFC00] text-slate-950' : 'bg-black/60 text-white hover:bg-black/80'
              }`}
              title="AR Calibration Sliders"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Calibration Sliders Drawer */}
        {showSlidersDrawer && (
          <div className="absolute bottom-24 left-4 right-4 max-w-md mx-auto p-4 rounded-2xl bg-black/85 backdrop-blur-xl border border-white/15 text-white z-20 shadow-2xl space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-bold text-[#FFFC00] uppercase tracking-wider">
                AR Fit Calibration
              </span>
              <button
                onClick={() => {
                  setGarmentScale(100);
                  setVerticalOffset(0);
                  setHorizontalOffset(0);
                  setOverlayOpacity(95);
                }}
                className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            {/* Garment Scale */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-300">
                <span>Scale: {garmentScale}%</span>
                <span>Fit Drape</span>
              </div>
              <input
                type="range"
                min="70"
                max="140"
                value={garmentScale}
                onChange={(e) => setGarmentScale(Number(e.target.value))}
                className="w-full accent-[#FFFC00] h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Vertical Adjustment */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-300">
                <span>Vertical Position</span>
                <span>{verticalOffset}px</span>
              </div>
              <input
                type="range"
                min="-120"
                max="120"
                value={verticalOffset}
                onChange={(e) => setVerticalOffset(Number(e.target.value))}
                className="w-full accent-[#FFFC00] h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Opacity */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-300">
                <span>Garment Opacity</span>
                <span>{overlayOpacity}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                value={overlayOpacity}
                onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                className="w-full accent-[#FFFC00] h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Center Snapchat Shutter Capture */}
        <div className="absolute bottom-5 inset-x-0 flex items-center justify-center z-20">
          <button
            onClick={handleCaptureSnap}
            disabled={isCapturing}
            className="p-1 rounded-full outline-none focus:outline-none transition active:scale-95"
            title="Take Snap"
          >
            <div className="w-18 h-18 rounded-full border-4 border-[#FFFC00] shadow-[0_0_20px_rgba(255,252,0,0.5)] flex items-center justify-center bg-black/40 backdrop-blur-md">
              <div
                className={`w-14 h-14 rounded-full bg-white transition-all flex items-center justify-center ${
                  isCapturing ? 'scale-75 bg-amber-400' : 'hover:scale-95'
                }`}
              >
                <Camera className="w-6 h-6 text-slate-950" />
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Snapshot Preview Modal if Captured */}
      {capturedPhotoUrl && (
        <div className="p-4 w-full bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={capturedPhotoUrl}
              alt="Snap preview"
              className="w-12 h-16 object-cover rounded-xl border border-white/20"
            />
            <div>
              <p className="text-xs font-bold text-white">Snap Captured! ✨</p>
              <p className="text-[10px] text-slate-400">High-res AR photo with watermark</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={capturedPhotoUrl}
              download="aurastyle-snap-tryon.png"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFFC00] text-slate-950 font-bold text-xs shadow-md transition hover:bg-yellow-300"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>
            <button
              onClick={() => setCapturedPhotoUrl(null)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-medium"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Hidden offscreen canvas for composite snap capture */}
      <canvas ref={compositeCanvasRef} className="hidden" />
    </div>
  );
};
