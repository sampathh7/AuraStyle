export type FitSilhouette = 'slim' | 'regular' | 'relaxed';
export type TuckStyle = 'tucked' | 'untucked';
export type SleeveStyle = 'full' | 'rolled';
export type TrouserBreak = 'classic' | 'cropped';

export type TryOnStage = 'all' | 'bare' | 'inner' | 'bottoms' | 'outerwear' | 'cinch';
export type OcclusionMode = 'occlude' | 'xray' | 'allSkin';

export interface GarmentTailoringOptions {
  silhouette: FitSilhouette;
  tuckStyle: TuckStyle;
  sleeveStyle: SleeveStyle;
  trouserBreak: TrouserBreak;
  showSeams: boolean;
  showHardware: boolean;
  tryOnProgress?: number; // 0.0 to 1.0 animation timeline
  occlusionMode?: OcclusionMode; // 'occlude' (true clothing fit without skin poking), 'xray', 'allSkin'
  showFitTension?: boolean; // Heatmap fit tension mode
}

export const DEFAULT_TAILORING_OPTIONS: GarmentTailoringOptions = {
  silhouette: 'regular',
  tuckStyle: 'untucked',
  sleeveStyle: 'full',
  trouserBreak: 'classic',
  showSeams: true,
  showHardware: true,
  tryOnProgress: 1.0,
  occlusionMode: 'occlude',
  showFitTension: false,
};

export interface SilhouetteParameters {
  torsoEase: number;       // additional clearance over body mesh (m)
  shoulderDrop: number;    // shoulder width extension
  sleeveWidthMul: number;  // sleeve taper multiplier
  waistGather: number;     // waist cinch or boxiness
  trouserWidthMul: number; // trouser leg taper multiplier
  hemLengthOffset: number; // hemline drop
}

export const SILHOUETTE_PROFILES: Record<FitSilhouette, SilhouetteParameters> = {
  slim: {
    torsoEase: 0.022,
    shoulderDrop: 0.0,
    sleeveWidthMul: 0.92,
    waistGather: 0.95,
    trouserWidthMul: 0.90,
    hemLengthOffset: -0.04,
  },
  regular: {
    torsoEase: 0.040,
    shoulderDrop: 0.015,
    sleeveWidthMul: 1.0,
    waistGather: 1.0,
    trouserWidthMul: 1.0,
    hemLengthOffset: 0.0,
  },
  relaxed: {
    torsoEase: 0.075,
    shoulderDrop: 0.05,
    sleeveWidthMul: 1.18,
    waistGather: 1.10,
    trouserWidthMul: 1.16,
    hemLengthOffset: 0.06,
  },
};
