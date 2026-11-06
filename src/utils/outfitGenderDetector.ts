import { OutfitLook } from '../types';

export type BodyGender = 'male' | 'female';
export type BodyBuild = 'slim' | 'athletic' | 'curvy';

export interface BodyMetrics {
  shoulderScale: number; // 0.85 to 1.25
  chestScale: number;    // 0.85 to 1.30
  waistScale: number;    // 0.80 to 1.25
  hipScale: number;      // 0.85 to 1.30
  fitTightness: number;  // 0.95 (slim fit) to 1.15 (relaxed fit)
}

export const BUILD_PRESETS: Record<BodyBuild, BodyMetrics> = {
  slim: {
    shoulderScale: 0.92,
    chestScale: 0.90,
    waistScale: 0.88,
    hipScale: 0.90,
    fitTightness: 1.0,
  },
  athletic: {
    shoulderScale: 1.15,
    chestScale: 1.12,
    waistScale: 0.94,
    hipScale: 1.02,
    fitTightness: 1.02,
  },
  curvy: {
    shoulderScale: 0.98,
    chestScale: 1.22,
    waistScale: 1.05,
    hipScale: 1.20,
    fitTightness: 1.05,
  },
};

export interface SkinToneOption {
  id: string;
  name: string;
  hex: string;
}

export const SKIN_TONE_PRESETS: SkinToneOption[] = [
  { id: 'porcelain', name: 'Fair Porcelain', hex: '#f7ded5' },
  { id: 'warm-ivory', name: 'Warm Ivory', hex: '#f0c7a8' },
  { id: 'honey-olive', name: 'Honey Olive', hex: '#d9a779' },
  { id: 'golden-bronze', name: 'Golden Bronze', hex: '#b57948' },
  { id: 'rich-chestnut', name: 'Rich Chestnut', hex: '#7a482b' },
  { id: 'deep-espresso', name: 'Deep Espresso', hex: '#3d2417' },
];

export interface HairColorOption {
  id: string;
  name: string;
  hex: string;
}

export const HAIR_COLOR_PRESETS: HairColorOption[] = [
  { id: 'black', name: 'Natural Black', hex: '#161413' },
  { id: 'dark-brown', name: 'Espresso Brown', hex: '#2c1e17' },
  { id: 'chestnut', name: 'Chestnut', hex: '#4f301d' },
  { id: 'caramel', name: 'Honey Caramel', hex: '#875b32' },
  { id: 'blonde', name: 'Golden Blonde', hex: '#c5a86d' },
  { id: 'platinum', name: 'Silver Platinum', hex: '#c8cbd0' },
];

/**
 * Intelligent gender detection heuristic based on outfit titles, categories,
 * fabrics, item names, and styling notes.
 */
export function detectOutfitGender(look: OutfitLook): BodyGender {
  const combinedText = [
    look.title,
    look.vibe,
    look.occasion,
    look.styleBreakdown,
    ...look.items.map((i) => `${i.name} ${i.category} ${i.silhouette} ${i.description} ${i.stylingNote}`),
  ]
    .join(' ')
    .toLowerCase();

  const femaleKeywords = [
    'gown',
    'dress',
    'skirt',
    'stiletto',
    'pumps',
    'heels',
    'blazer dress',
    'minaudière',
    'earrings',
    'necklace',
    'clutch',
    'sari',
    'lehenga',
    'chiffon',
    'corset',
    'bodice',
    'hourglass',
    'women',
    'female',
    'her',
    'lady',
  ];

  const maleKeywords = [
    'chinos',
    'overshirt',
    'trainers',
    'sneakers',
    'court trainers',
    'tuxedo suit',
    'suit jacket',
    'menswear',
    'loafers',
    'oxford',
    'derby',
    'derbies',
    'men',
    'male',
    'his',
    'gentleman',
    'boy',
    'boxer',
  ];

  let femaleScore = 0;
  let maleScore = 0;

  femaleKeywords.forEach((kw) => {
    if (combinedText.includes(kw)) femaleScore += 1;
  });

  maleKeywords.forEach((kw) => {
    if (combinedText.includes(kw)) maleScore += 1;
  });

  // Explicit item category checks
  look.items.forEach((item) => {
    const cat = item.category.toLowerCase();
    const name = item.name.toLowerCase();
    if (name.includes('dress') || name.includes('skirt') || name.includes('heel') || name.includes('pump')) {
      femaleScore += 3;
    }
    if (name.includes('overshirt') || name.includes('chinos') || name.includes('trainers') || name.includes('tuxedo')) {
      maleScore += 2;
    }
  });

  return maleScore > femaleScore ? 'male' : 'female';
}
