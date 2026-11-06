import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  RotateCcw,
  RotateCw,
  Sun,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Play,
  Pause,
  Camera,
  Sliders,
  User,
  Users,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Palette,
  Sparkle,
  Scissors,
  Eye,
  Check,
  Layers,
  Activity,
  Shirt,
  Smile,
  Flame,
  Crown,
  Download,
  Share2,
} from 'lucide-react';
import { OutfitLook } from '../types';
import {
  detectOutfitGender,
  BodyGender,
  BodyBuild,
  BodyMetrics,
  BUILD_PRESETS,
  SKIN_TONE_PRESETS,
  HAIR_COLOR_PRESETS,
} from '../utils/outfitGenderDetector';
import {
  createPedestal,
  buildRealisticHumanBody,
  buildTailoredGarments,
  BodyOcclusionConfig,
} from '../utils/mannequin3DBuilder';
import {
  GarmentTailoringOptions,
  DEFAULT_TAILORING_OPTIONS,
  FitSilhouette,
  TuckStyle,
  SleeveStyle,
  TrouserBreak,
  OcclusionMode,
} from '../utils/garmentTailoringConfig';
import { detectFabricType } from '../utils/fabricShaderGenerator';
import {
  buildBitmoji3DCharacter,
  BitmojiPose,
  BitmojiHairstyle,
  BitmojiExpression,
  BITMOJI_SKIN_PALETTE,
  BITMOJI_HAIR_PALETTE,
  BITMOJI_EYE_PALETTE,
} from '../utils/bitmoji3DBuilder';
import {
  SnapchatLensCarousel,
  SNAPCHAT_LENSES,
  SnapLens,
} from './SnapchatLensCarousel';
import { SnapchatCameraAR } from './SnapchatCameraAR';
import { BitmojiStickerDrawer } from './BitmojiStickerDrawer';

export type DressingModelType = 'bitmoji' | 'ar_cam' | 'realistic';

interface MannequinCanvas3DProps {
  look: OutfitLook;
  selectedLayerIds: string[];
  activeLighting: 'studio' | 'golden' | 'runway';
  onLightingChange: (lighting: 'studio' | 'golden' | 'runway') => void;
  onSnapshot?: (dataUrl: string) => void;
  initialDressingMode?: DressingModelType;
}

export const MannequinCanvas3D: React.FC<MannequinCanvas3DProps> = ({
  look,
  selectedLayerIds,
  activeLighting,
  onLightingChange,
  onSnapshot,
  initialDressingMode = 'bitmoji',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Model Mode Selection: Snapchat 3D Bitmoji vs Live AR Camera vs Realistic Replica
  const [dressingModelMode, setDressingModelMode] = useState<DressingModelType>(initialDressingMode);

  // Model & Anatomy State
  const initialGender = detectOutfitGender(look);
  const [gender, setGender] = useState<BodyGender>(initialGender);
  const [build, setBuild] = useState<BodyBuild>(initialGender === 'male' ? 'athletic' : 'slim');
  const [metrics, setMetrics] = useState<BodyMetrics>(
    BUILD_PRESETS[initialGender === 'male' ? 'athletic' : 'slim']
  );

  // Snapchat Bitmoji Avatar State
  const [bitmojiPose, setBitmojiPose] = useState<BitmojiPose>('peace');
  const [bitmojiHairstyle, setBitmojiHairstyle] = useState<BitmojiHairstyle>('pompadour');
  const [bitmojiExpression, setBitmojiExpression] = useState<BitmojiExpression>('happy');
  const [bitmojiSkinColor, setBitmojiSkinColor] = useState<string>('#F9D5B8');
  const [bitmojiHairColor, setBitmojiHairColor] = useState<string>('#1E1B18');
  const [bitmojiEyeColor, setBitmojiEyeColor] = useState<string>('#4A3525');
  const [showBitmojiDrawer, setShowBitmojiDrawer] = useState<boolean>(false);
  const [showStickerDrawer, setShowStickerDrawer] = useState<boolean>(false);
  const [avatarSnapshotUrl, setAvatarSnapshotUrl] = useState<string | null>(null);
  const [activeLensId, setActiveLensId] = useState<string>('original');
  const [snapFlashActive, setSnapFlashActive] = useState<boolean>(false);
  const [isCapturingSnap, setIsCapturingSnap] = useState<boolean>(false);
  const [showSnapToast, setShowSnapToast] = useState<boolean>(false);

  // Realistic Human Appearance State
  const [skinColor, setSkinColor] = useState<string>('#f0c7a8');
  const [hairColor, setHairColor] = useState<string>('#2c1e17');
  const [showAppearanceDrawer, setShowAppearanceDrawer] = useState(false);
  const [showSliders, setShowSliders] = useState(false);

  // High-Precision Garment Tailoring & PBR Fabrics State
  const [tailoring, setTailoring] = useState<GarmentTailoringOptions>(DEFAULT_TAILORING_OPTIONS);
  const [showTailoringDrawer, setShowTailoringDrawer] = useState(false);

  // Interactive Try-On Animation & Form-Fitting State
  const [tryOnProgress, setTryOnProgress] = useState<number>(1.0);
  const [isTryOnPlaying, setIsTryOnPlaying] = useState<boolean>(false);
  const [tryOnSpeed, setTryOnSpeed] = useState<number>(1.0);
  const [occlusionMode, setOcclusionMode] = useState<OcclusionMode>('occlude');
  const [showFitTension, setShowFitTension] = useState<boolean>(false);
  const tryOnStartTimeRef = useRef<number | null>(null);

  // Viewport & Camera State
  const [isAutoSpinning, setIsAutoSpinning] = useState(false);
  const [activeAnglePreset, setActiveAnglePreset] = useState<
    'front' | 'threeQuarter' | 'side' | 'detail' | 'macro'
  >('threeQuarter');

  // Three.js instances ref
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const mannequinGroupRef = useRef<THREE.Group | null>(null);
  const bodyMeshGroupRef = useRef<THREE.Group | null>(null);
  const garmentsGroupRef = useRef<THREE.Group | null>(null);
  const lightsGroupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());

  // Drag interaction state
  const isDraggingRef = useRef(false);
  const previousPointerPositionRef = useRef({ x: 0, y: 0 });
  const rotationVelocityRef = useRef({ x: 0, y: 0 });

  // Trigger try-on animation whenever look changes
  useEffect(() => {
    const detected = detectOutfitGender(look);
    setGender(detected);
    const defaultBuild = detected === 'male' ? 'athletic' : 'slim';
    setBuild(defaultBuild);
    setMetrics(BUILD_PRESETS[defaultBuild]);

    setTryOnProgress(0.0);
    setIsTryOnPlaying(true);
    tryOnStartTimeRef.current = performance.now();
  }, [look]);

  // Try-on timeline player loop
  useEffect(() => {
    if (!isTryOnPlaying) return;

    let animId: number;
    const duration = 2400 / tryOnSpeed;

    const tick = (now: number) => {
      if (!tryOnStartTimeRef.current) {
        tryOnStartTimeRef.current = now;
      }
      const elapsed = now - tryOnStartTimeRef.current;
      const t = Math.min(1.0, elapsed / duration);
      const easeT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

      setTryOnProgress(easeT);

      if (t < 1.0) {
        animId = requestAnimationFrame(tick);
      } else {
        setIsTryOnPlaying(false);
        setTryOnProgress(1.0);
        tryOnStartTimeRef.current = null;
      }
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isTryOnPlaying, tryOnSpeed]);

  const handleReplayTryOn = () => {
    setTryOnProgress(0.0);
    setIsTryOnPlaying(true);
    tryOnStartTimeRef.current = performance.now();
  };

  const applyLighting = useCallback((lightingMode: 'studio' | 'golden' | 'runway') => {
    const lightsGroup = lightsGroupRef.current;
    if (!lightsGroup) return;

    while (lightsGroup.children.length > 0) {
      lightsGroup.remove(lightsGroup.children[0]);
    }

    if (lightingMode === 'studio') {
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
      const keyLight = new THREE.DirectionalLight(0xfffaf0, 2.4);
      keyLight.position.set(5, 7, 5);

      const fillLight = new THREE.DirectionalLight(0xf0f4ff, 1.2);
      fillLight.position.set(-5, 4, 3);

      const rimLight = new THREE.DirectionalLight(0xffffff, 1.6);
      rimLight.position.set(0, 6, -6);

      lightsGroup.add(ambientLight, keyLight, fillLight, rimLight);
    } else if (lightingMode === 'golden') {
      const ambientLight = new THREE.AmbientLight(0xffe8d6, 1.0);
      const keyLight = new THREE.DirectionalLight(0xffaa44, 3.2);
      keyLight.position.set(6, 6, 4);

      const rimLight = new THREE.DirectionalLight(0xff8833, 2.0);
      rimLight.position.set(-4, 5, -5);

      const softFill = new THREE.DirectionalLight(0xfff0dd, 0.8);
      softFill.position.set(-3, 1, 4);

      lightsGroup.add(ambientLight, keyLight, rimLight, softFill);
    } else {
      const ambientLight = new THREE.AmbientLight(0x222233, 0.8);
      const spotLight = new THREE.SpotLight(0xffffff, 4.0, 25, Math.PI / 6, 0.4);
      spotLight.position.set(0, 10, 4);
      spotLight.target.position.set(0, 2, 0);

      const neonRim1 = new THREE.DirectionalLight(0xa855f7, 2.2);
      neonRim1.position.set(-5, 4, -4);

      const neonRim2 = new THREE.DirectionalLight(0x38bdf8, 2.0);
      neonRim2.position.set(5, 4, -4);

      lightsGroup.add(ambientLight, spotLight, spotLight.target, neonRim1, neonRim2);
    }
  }, []);

  useEffect(() => {
    applyLighting(activeLighting);
  }, [activeLighting, applyLighting]);

  // Construct or reconstruct 3D scene objects
  const rebuildScene = useCallback(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (mannequinGroupRef.current) {
      scene.remove(mannequinGroupRef.current);
    }

    const mannequinGroup = new THREE.Group();
    mannequinGroupRef.current = mannequinGroup;

    // 1. Pedestal
    const pedestal = createPedestal();
    mannequinGroup.add(pedestal);

    // Detect which garment layers are active
    const activeItems = look.items.filter(
      (item) => selectedLayerIds.length === 0 || selectedLayerIds.includes(item.id)
    );
    const hasTopOrOuterwear = activeItems.some((item) => {
      const c = item.category.toLowerCase();
      return c === 'top' || c === 'outerwear' || c === 'jacket' || c === 'blazer';
    });
    const hasBottoms = activeItems.some((item) => {
      const c = item.category.toLowerCase();
      return c === 'bottom' || c === 'pants' || c === 'trousers' || c === 'skirt';
    });
    const hasFootwear = activeItems.some((item) => {
      const c = item.category.toLowerCase();
      return c === 'footwear' || c === 'shoes';
    });
    const hasFullBodyOrDress = activeItems.some((item) => {
      const c = item.category.toLowerCase();
      return c === 'dress' || c === 'gown' || c === 'full-body';
    });

    const occlusionConfig: BodyOcclusionConfig = {
      hasTopOrOuterwear,
      hasBottoms,
      hasFootwear,
      hasFullBodyOrDress,
      occlusionMode,
    };

    // 2. Character Model (Snapchat 3D Bitmoji or Realistic Anatomical Human)
    if (dressingModelMode === 'bitmoji') {
      const bitmojiModel = buildBitmoji3DCharacter({
        gender,
        skinColorHex: bitmojiSkinColor,
        hairColorHex: bitmojiHairColor,
        hairstyle: bitmojiHairstyle,
        pose: bitmojiPose,
        expression: bitmojiExpression,
        eyeColorHex: bitmojiEyeColor,
        occlusionConfig,
      });
      bodyMeshGroupRef.current = bitmojiModel;
      mannequinGroup.add(bitmojiModel);
    } else {
      const bodyReplica = buildRealisticHumanBody(
        gender,
        metrics,
        skinColor,
        hairColor,
        occlusionConfig
      );
      bodyMeshGroupRef.current = bodyReplica;
      mannequinGroup.add(bodyReplica);
    }

    // 3. Precision Tailored Garments Fitted with Drape & Animated Try-On
    const currentTailoring: GarmentTailoringOptions = {
      ...tailoring,
      tryOnProgress,
      occlusionMode,
      showFitTension,
    };
    const tailoredGarments = buildTailoredGarments(
      look,
      gender,
      metrics,
      selectedLayerIds,
      currentTailoring
    );

    // Apply subtle pose alignment to garments in Bitmoji mode
    if (dressingModelMode === 'bitmoji') {
      if (bitmojiPose === 'strut') {
        tailoredGarments.rotation.y = 0.08;
      } else if (bitmojiPose === 'selfie') {
        tailoredGarments.rotation.y = -0.06;
      }
    }

    garmentsGroupRef.current = tailoredGarments;
    mannequinGroup.add(tailoredGarments);

    scene.add(mannequinGroup);
  }, [
    dressingModelMode,
    gender,
    metrics,
    skinColor,
    hairColor,
    bitmojiPose,
    bitmojiHairstyle,
    bitmojiExpression,
    bitmojiSkinColor,
    bitmojiHairColor,
    bitmojiEyeColor,
    look,
    selectedLayerIds,
    tailoring,
    tryOnProgress,
    occlusionMode,
    showFitTension,
  ]);

  // Initialize Three.js WebGL Scene
  useEffect(() => {
    if (dressingModelMode === 'ar_cam') return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 640;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0d14);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(38, Math.max(0.1, width / height), 0.1, 50);
    camera.position.set(0, 1.95, 4.8);
    camera.lookAt(0, 1.85, 0);
    cameraRef.current = camera;

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: false,
        preserveDrawingBuffer: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      rendererRef.current = renderer;
    } catch (e) {
      console.warn('WebGLRenderer initialization warning:', e);
    }

    const lightsGroup = new THREE.Group();
    lightsGroupRef.current = lightsGroup;
    scene.add(lightsGroup);
    applyLighting(activeLighting);

    rebuildScene();

    // Auto-capture initial snapshot for stickers
    setTimeout(() => {
      try {
        if (canvasRef.current) {
          setAvatarSnapshotUrl(canvasRef.current.toDataURL('image/png'));
        }
      } catch (e) {
        // Safe fallback if drawing buffer not ready
      }
    }, 400);

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      if (isAutoSpinning && mannequinGroupRef.current) {
        mannequinGroupRef.current.rotation.y += 0.008;
      }

      if (!isDraggingRef.current && mannequinGroupRef.current) {
        mannequinGroupRef.current.rotation.y += rotationVelocityRef.current.x;
        rotationVelocityRef.current.x *= 0.92;
        rotationVelocityRef.current.y *= 0.92;
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      renderer?.dispose();
    };
  }, [applyLighting, activeLighting, rebuildScene, isAutoSpinning, dressingModelMode]);

  // Handle Drag / Orbit
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    previousPointerPositionRef.current = { x: e.clientX, y: e.clientY };
    rotationVelocityRef.current = { x: 0, y: 0 };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !mannequinGroupRef.current) return;
    const deltaX = e.clientX - previousPointerPositionRef.current.x;
    const deltaY = e.clientY - previousPointerPositionRef.current.y;

    mannequinGroupRef.current.rotation.y += deltaX * 0.009;
    rotationVelocityRef.current = { x: deltaX * 0.005, y: deltaY * 0.005 };

    previousPointerPositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!cameraRef.current) return;
    const zoomFactor = e.deltaY * 0.0018;
    cameraRef.current.position.z = Math.min(
      6.8,
      Math.max(2.1, cameraRef.current.position.z + zoomFactor)
    );
  };

  const setCameraPreset = (angle: 'front' | 'threeQuarter' | 'side' | 'detail' | 'macro') => {
    if (!cameraRef.current || !mannequinGroupRef.current) return;
    setActiveAnglePreset(angle);

    if (angle === 'front') {
      mannequinGroupRef.current.rotation.y = 0;
      cameraRef.current.position.set(0, 1.95, 4.6);
      cameraRef.current.lookAt(0, 1.85, 0);
    } else if (angle === 'threeQuarter') {
      mannequinGroupRef.current.rotation.y = Math.PI / 4.5;
      cameraRef.current.position.set(0, 1.95, 4.6);
      cameraRef.current.lookAt(0, 1.85, 0);
    } else if (angle === 'side') {
      mannequinGroupRef.current.rotation.y = Math.PI / 2;
      cameraRef.current.position.set(0, 1.95, 4.6);
      cameraRef.current.lookAt(0, 1.85, 0);
    } else if (angle === 'detail') {
      mannequinGroupRef.current.rotation.y = Math.PI / 6;
      cameraRef.current.position.set(0, 2.35, 2.9);
      cameraRef.current.lookAt(0, 2.25, 0);
    } else if (angle === 'macro') {
      mannequinGroupRef.current.rotation.y = 0.15;
      cameraRef.current.position.set(0, 2.45, 1.7);
      cameraRef.current.lookAt(0, 2.4, 0);
    }
  };

  const handleResetView = () => {
    if (!mannequinGroupRef.current || !cameraRef.current) return;
    mannequinGroupRef.current.rotation.y = Math.PI / 4.5;
    cameraRef.current.position.set(0, 1.95, 4.6);
    cameraRef.current.lookAt(0, 1.85, 0);
    setActiveAnglePreset('threeQuarter');
  };

  // Snapchat Shutter Snap Capture with Watermark
  const handleSnapCapture = () => {
    if (!canvasRef.current) return;
    setIsCapturingSnap(true);
    setSnapFlashActive(true);
    setTimeout(() => setSnapFlashActive(false), 200);

    // Composite snapshot with classic Snapchat timestamp and geotag banner
    const offscreen = document.createElement('canvas');
    offscreen.width = canvasRef.current.width;
    offscreen.height = canvasRef.current.height;
    const ctx = offscreen.getContext('2d');
    if (ctx) {
      // Draw 3D scene
      ctx.drawImage(canvasRef.current, 0, 0);

      // Draw bottom Snapchat geotag caption
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const w = offscreen.width;
      const h = offscreen.height;

      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.roundRect(40, h - 130, w - 80, 90, 24);
      ctx.fill();

      ctx.fillStyle = '#FFFC00'; // Snapchat yellow
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText(look.title, 65, h - 85);

      ctx.fillStyle = '#ffffff';
      ctx.font = '18px sans-serif';
      ctx.fillText(`Snapchat 3D Bitmoji Studio • ${timeStr} • ${look.occasion}`, 65, h - 55);
      ctx.restore();

      const dataUrl = offscreen.toDataURL('image/png');
      setAvatarSnapshotUrl(dataUrl);
      if (onSnapshot) {
        onSnapshot(dataUrl);
      }
      setShowSnapToast(true);
      setTimeout(() => setShowSnapToast(false), 4500);
    }
    setIsCapturingSnap(false);
  };

  // Handle switching Snapchat Lens
  const handleSelectLens = (lens: SnapLens) => {
    setActiveLensId(lens.id);
    if (lens.posePreset) {
      setBitmojiPose(lens.posePreset);
    }
    // Subtle flash
    setSnapFlashActive(true);
    setTimeout(() => setSnapFlashActive(false), 150);
  };

  // Render Live AR Camera if selected
  if (dressingModelMode === 'ar_cam') {
    return (
      <div className="space-y-3">
        {/* Top Model Switcher Bar */}
        <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setDressingModelMode('bitmoji')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:text-white transition"
            >
              <Smile className="w-3.5 h-3.5 text-[#FFFC00]" />
              <span>3D Bitmoji Model</span>
            </button>
            <button
              onClick={() => setDressingModelMode('ar_cam')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-[#FFFC00] text-slate-950 shadow-md transition"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Live Snap AR Cam</span>
            </button>
            <button
              onClick={() => setDressingModelMode('realistic')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:text-white transition"
            >
              <User className="w-3.5 h-3.5" />
              <span>Realistic Model</span>
            </button>
          </div>

          <button
            onClick={() => setShowStickerDrawer(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 shadow-md transition active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sticker Studio</span>
          </button>
        </div>

        <SnapchatCameraAR
          look={look}
          selectedLayerIds={selectedLayerIds}
          onSnapshot={(url) => {
            setAvatarSnapshotUrl(url);
            if (onSnapshot) onSnapshot(url);
          }}
          onSwitchTo3DMannequin={() => setDressingModelMode('bitmoji')}
        />

        <BitmojiStickerDrawer
          isOpen={showStickerDrawer}
          onClose={() => setShowStickerDrawer(false)}
          look={look}
          avatarSnapshotUrl={avatarSnapshotUrl}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[620px] sm:h-[720px] rounded-3xl overflow-hidden bg-[#0a0d14] border border-white/10 select-none shadow-2xl flex flex-col justify-between"
      onWheel={handleWheel}
    >
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-none block"
      />

      {/* Camera Snap Flash Overlay */}
      {snapFlashActive && (
        <div className="absolute inset-0 bg-white/70 pointer-events-none z-30 animate-pulse transition-opacity" />
      )}

      {/* ------------------------------------------------------------- */}
      {/* TOP FLOATING SNAPCHAT HUD TOOLBAR */}
      {/* ------------------------------------------------------------- */}
      <div className="relative top-3 left-3 right-3 flex flex-wrap items-center justify-between pointer-events-none gap-2 z-20">
        {/* Left: Mode Switcher (Snapchat 3D Bitmoji vs Live AR vs Realistic Mannequin) */}
        <div className="flex items-center gap-1.5 p-1 bg-black/85 backdrop-blur-xl rounded-2xl border border-white/15 pointer-events-auto shadow-2xl">
          <button
            onClick={() => setDressingModelMode('bitmoji')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 ${
              dressingModelMode === 'bitmoji'
                ? 'bg-[#FFFC00] text-slate-950 font-bold shadow-md shadow-yellow-500/20'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Smile className="w-3.5 h-3.5" />
            <span>3D Bitmoji Model</span>
          </button>

          <button
            onClick={() => setDressingModelMode('ar_cam')}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition flex items-center gap-1.5"
            title="Switch to Live Webcam AR Try-On"
          >
            <Camera className="w-3.5 h-3.5 text-[#FFFC00]" />
            <span>Live AR Cam</span>
          </button>

          <button
            onClick={() => setDressingModelMode('realistic')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 ${
              dressingModelMode === 'realistic'
                ? 'bg-[#FFFC00] text-slate-950 font-bold shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Realistic Human</span>
          </button>
        </div>

        {/* Center / Right: Poses & Bitmoji Customizer & Stickers Button */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {dressingModelMode === 'bitmoji' && (
            <>
              {/* Snapchat Poses Selector */}
              <div className="hidden sm:flex items-center gap-1 p-1 bg-black/85 backdrop-blur-xl rounded-2xl border border-white/15 shadow-xl">
                <button
                  onClick={() => setBitmojiPose('peace')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-xl transition ${
                    bitmojiPose === 'peace'
                      ? 'bg-[#FFFC00] text-slate-950 font-bold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="Peace Sign Selfie Pose"
                >
                  ✌️ Peace
                </button>
                <button
                  onClick={() => setBitmojiPose('strut')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-xl transition ${
                    bitmojiPose === 'strut'
                      ? 'bg-[#FFFC00] text-slate-950 font-bold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="Runway Strut Pose"
                >
                  💃 Strut
                </button>
                <button
                  onClick={() => setBitmojiPose('selfie')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-xl transition ${
                    bitmojiPose === 'selfie'
                      ? 'bg-[#FFFC00] text-slate-950 font-bold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="Mirror Selfie Pose"
                >
                  🤳 Selfie
                </button>
                <button
                  onClick={() => setBitmojiPose('chill')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-xl transition ${
                    bitmojiPose === 'chill'
                      ? 'bg-[#FFFC00] text-slate-950 font-bold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="Chill Lean Pose"
                >
                  😎 Chill
                </button>
              </div>

              {/* Bitmoji Customizer Drawer Toggle */}
              <button
                onClick={() => setShowBitmojiDrawer((v) => !v)}
                className={`p-2 rounded-2xl backdrop-blur-xl border transition flex items-center gap-1 text-xs font-semibold ${
                  showBitmojiDrawer
                    ? 'bg-[#FFFC00] text-slate-950 border-[#FFFC00] font-bold'
                    : 'bg-black/85 text-white border-white/15 hover:bg-black'
                }`}
                title="Customize Avatar Hair, Face & Skin"
              >
                <Palette className="w-4 h-4" />
                <span className="hidden md:inline">Avatar</span>
              </button>
            </>
          )}

          {/* Garment Tailoring Drawer Toggle */}
          <button
            onClick={() => setShowTailoringDrawer((v) => !v)}
            className={`p-2 rounded-2xl backdrop-blur-xl border transition flex items-center gap-1 text-xs font-semibold ${
              showTailoringDrawer
                ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold'
                : 'bg-black/85 text-white border-white/15 hover:bg-black'
            }`}
            title="Tailoring, Silhouettes & PBR Fabrics"
          >
            <Scissors className="w-4 h-4" />
            <span className="hidden md:inline">Tailoring</span>
          </button>

          {/* Stickers Studio Drawer Trigger */}
          <button
            onClick={() => {
              if (canvasRef.current) {
                setAvatarSnapshotUrl(canvasRef.current.toDataURL('image/png'));
              }
              setShowStickerDrawer(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#FFFC00] hover:bg-yellow-300 text-slate-950 font-black text-xs shadow-lg shadow-yellow-500/25 transition active:scale-95"
            title="Generate Snapchat Bitmoji Stickers"
          >
            <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
            <span>Stickers ✨</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* FLOATING DRAWERS & MODALS */}
      {/* ------------------------------------------------------------- */}
      <div className="absolute top-18 right-3 flex flex-col gap-2 z-20 pointer-events-auto max-h-[75%] overflow-y-auto scrollbar-none">
        {/* Bitmoji Avatar Customizer Drawer */}
        {showBitmojiDrawer && dressingModelMode === 'bitmoji' && (
          <div className="w-80 p-4 bg-black/90 backdrop-blur-2xl rounded-3xl border border-white/15 shadow-2xl text-xs text-white space-y-3.5 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="font-bold text-[#FFFC00] text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Smile className="w-4 h-4" />
                <span>Snapchat Avatar Studio</span>
              </span>
              <button
                onClick={() => setShowBitmojiDrawer(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Hairstyles */}
            <div>
              <span className="text-[10px] text-slate-400 block mb-1.5 font-medium uppercase tracking-wider">
                Hairstyles:
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'pompadour', label: 'Pompadour Fade' },
                  { id: 'bob', label: 'Wavy Bob' },
                  { id: 'ponytail', label: 'High Ponytail' },
                  { id: 'undercut', label: 'Textured Cut' },
                  { id: 'curly', label: 'Afro Curls' },
                ].map((hs) => (
                  <button
                    key={hs.id}
                    onClick={() => setBitmojiHairstyle(hs.id as BitmojiHairstyle)}
                    className={`py-1.5 px-2 rounded-xl text-[10px] font-semibold border transition ${
                      bitmojiHairstyle === hs.id
                        ? 'bg-[#FFFC00] text-slate-950 border-[#FFFC00] font-bold'
                        : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {hs.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Hair Color Palette */}
            <div>
              <span className="text-[10px] text-slate-400 block mb-1.5 font-medium uppercase tracking-wider">
                Hair Colors:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {BITMOJI_HAIR_PALETTE.map((hc) => (
                  <button
                    key={hc.hex}
                    onClick={() => setBitmojiHairColor(hc.hex)}
                    className={`w-6 h-6 rounded-full border shrink-0 transition ${
                      bitmojiHairColor === hc.hex
                        ? 'border-[#FFFC00] ring-2 ring-yellow-400/50 scale-110'
                        : 'border-white/20'
                    }`}
                    style={{ backgroundColor: hc.hex }}
                    title={hc.name}
                  />
                ))}
              </div>
            </div>

            {/* Skin Tone Palette */}
            <div>
              <span className="text-[10px] text-slate-400 block mb-1.5 font-medium uppercase tracking-wider">
                Skin Tone:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {BITMOJI_SKIN_PALETTE.map((sk) => (
                  <button
                    key={sk.hex}
                    onClick={() => setBitmojiSkinColor(sk.hex)}
                    className={`w-6 h-6 rounded-full border shrink-0 transition ${
                      bitmojiSkinColor === sk.hex
                        ? 'border-[#FFFC00] ring-2 ring-yellow-400/50 scale-110'
                        : 'border-white/20'
                    }`}
                    style={{ backgroundColor: sk.hex }}
                    title={sk.name}
                  />
                ))}
              </div>
            </div>

            {/* Expressions */}
            <div>
              <span className="text-[10px] text-slate-400 block mb-1.5 font-medium uppercase tracking-wider">
                Facial Expression:
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'happy', label: '😊 Happy' },
                  { id: 'wink', label: '😉 Wink' },
                  { id: 'cool', label: '😎 Shades' },
                  { id: 'glam', label: '✨ Glam' },
                ].map((exp) => (
                  <button
                    key={exp.id}
                    onClick={() => setBitmojiExpression(exp.id as BitmojiExpression)}
                    className={`py-1.5 px-1 rounded-xl text-[10px] font-semibold border transition text-center ${
                      bitmojiExpression === exp.id
                        ? 'bg-[#FFFC00] text-slate-950 border-[#FFFC00] font-bold'
                        : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {exp.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Garment Tailoring Drawer */}
        {showTailoringDrawer && (
          <div className="w-80 p-4 bg-black/90 backdrop-blur-2xl rounded-3xl border border-white/15 shadow-2xl text-xs text-white space-y-3.5 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="font-bold text-amber-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Scissors className="w-4 h-4" />
                <span>Garment Tailoring & PBR</span>
              </span>
              <button
                onClick={() => setShowTailoringDrawer(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Silhouette Drape */}
            <div>
              <span className="text-[10px] text-slate-400 block mb-1.5 font-medium uppercase tracking-wider">
                Fit Silhouette:
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {(['slim', 'regular', 'relaxed'] as FitSilhouette[]).map((sil) => (
                  <button
                    key={sil}
                    onClick={() => setTailoring((prev) => ({ ...prev, silhouette: sil }))}
                    className={`py-1.5 px-2 rounded-xl text-[10px] font-semibold capitalize border transition ${
                      tailoring.silhouette === sil
                        ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold'
                        : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {sil}
                  </button>
                ))}
              </div>
            </div>

            {/* Seams & Hardware Toggles */}
            <div className="space-y-2 pt-1 border-t border-white/10">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-[11px] text-slate-300">Stitched Seams & Hemlines</span>
                <input
                  type="checkbox"
                  checked={tailoring.showSeams}
                  onChange={(e) => setTailoring((prev) => ({ ...prev, showSeams: e.target.checked }))}
                  className="accent-amber-400"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-[11px] text-slate-300">Zippers, Hardware & Collars</span>
                <input
                  type="checkbox"
                  checked={tailoring.showHardware}
                  onChange={(e) => setTailoring((prev) => ({ ...prev, showHardware: e.target.checked }))}
                  className="accent-amber-400"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-[11px] text-slate-300">Fit Tension Stress Map</span>
                <input
                  type="checkbox"
                  checked={showFitTension}
                  onChange={(e) => setShowFitTension(e.target.checked)}
                  className="accent-amber-400"
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Snap Captured Toast Banner */}
      {showSnapToast && avatarSnapshotUrl && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 p-3 bg-black/90 backdrop-blur-xl border border-[#FFFC00]/60 rounded-2xl shadow-2xl flex items-center gap-3 animate-fadeIn pointer-events-auto">
          <img
            src={avatarSnapshotUrl}
            alt="Snap preview"
            className="w-10 h-12 object-cover rounded-xl border border-white/20"
          />
          <div>
            <p className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Snap Saved! ✨</span>
              <span className="text-[10px] bg-[#FFFC00] text-slate-950 font-black px-1.5 py-0.2 rounded">
                BITMOJI
              </span>
            </p>
            <p className="text-[10px] text-slate-300">Ready to share or export stickers</p>
          </div>
          <div className="flex items-center gap-1.5">
            <a
              href={avatarSnapshotUrl}
              download="snapchat-bitmoji-fit.png"
              className="p-1.5 rounded-xl bg-[#FFFC00] text-slate-950 hover:bg-yellow-300 transition"
              title="Download Snap"
            >
              <Download className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={() => setShowStickerDrawer(true)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-white font-semibold text-[10px] hover:bg-slate-700 transition"
            >
              Stickers
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* BOTTOM CONTROLS & SIGNATURE SNAPCHAT LENS CAROUSEL */}
      {/* ------------------------------------------------------------- */}
      <div className="relative bottom-2 w-full z-20 pointer-events-auto px-4 flex flex-col items-center">
        {/* Angle Presets & Reset Camera Strip */}
        <div className="flex items-center gap-1.5 mb-2 pointer-events-auto">
          <div className="flex items-center gap-1 p-1 bg-black/70 backdrop-blur-md rounded-xl border border-white/10 text-white">
            <button
              onClick={() => setCameraPreset('front')}
              className={`px-2 py-0.5 text-[10px] font-semibold rounded-lg transition ${
                activeAnglePreset === 'front' ? 'bg-[#FFFC00] text-slate-950' : 'hover:bg-white/10'
              }`}
            >
              Front
            </button>
            <button
              onClick={() => setCameraPreset('threeQuarter')}
              className={`px-2 py-0.5 text-[10px] font-semibold rounded-lg transition ${
                activeAnglePreset === 'threeQuarter' ? 'bg-[#FFFC00] text-slate-950' : 'hover:bg-white/10'
              }`}
            >
              3/4 Walk
            </button>
            <button
              onClick={() => setCameraPreset('side')}
              className={`px-2 py-0.5 text-[10px] font-semibold rounded-lg transition ${
                activeAnglePreset === 'side' ? 'bg-[#FFFC00] text-slate-950' : 'hover:bg-white/10'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setCameraPreset('detail')}
              className={`px-2 py-0.5 text-[10px] font-semibold rounded-lg transition ${
                activeAnglePreset === 'detail' ? 'bg-[#FFFC00] text-slate-950' : 'hover:bg-white/10'
              }`}
            >
              Detail
            </button>
          </div>

          <button
            onClick={handleReplayTryOn}
            className="p-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white transition"
            title="Replay Try-On Fitting Animation"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTryOnPlaying ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsAutoSpinning((v) => !v)}
            className={`p-1.5 rounded-xl backdrop-blur-md border transition ${
              isAutoSpinning
                ? 'bg-[#FFFC00] text-slate-950 border-[#FFFC00]'
                : 'bg-black/70 text-slate-300 border-white/10'
            }`}
            title="Auto 360 Spin"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Snapchat Lens Carousel with Center Shutter Button */}
        <SnapchatLensCarousel
          activeLensId={activeLensId}
          onSelectLens={handleSelectLens}
          onSnapCapture={handleSnapCapture}
          isCapturing={isCapturingSnap}
        />
      </div>

      {/* Bitmoji Sticker Creator Drawer */}
      <BitmojiStickerDrawer
        isOpen={showStickerDrawer}
        onClose={() => setShowStickerDrawer(false)}
        look={look}
        avatarSnapshotUrl={avatarSnapshotUrl}
      />
    </div>
  );
};
