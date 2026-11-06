export type GarmentType = 'top' | 'bottom' | 'outerwear' | 'footwear' | 'accessory' | 'full-body';
export type FitPreference = 'slim' | 'regular' | 'oversized';

export interface BrandSizeMetrics {
  size: string; // e.g. "S", "M", "L", "30", "32"
  chestInches?: [number, number];
  waistInches?: [number, number];
  hipsInches?: [number, number];
  euSize?: number;
  ukSize?: number;
  usSize?: number;
  notes?: string;
}

export interface BrandProfile {
  name: string;
  region: 'india' | 'global';
  cutTendency: 'runs_small' | 'true_to_size' | 'runs_large';
  description: string;
  topSizes: BrandSizeMetrics[];
  bottomSizes: BrandSizeMetrics[];
}

export const BRAND_PROFILES: Record<string, BrandProfile> = {
  Zara: {
    name: 'Zara',
    region: 'global',
    cutTendency: 'runs_small',
    description: 'European tailored cut; shoulders and chest taper slimmer than standard US sizing.',
    topSizes: [
      { size: 'S', chestInches: [36, 38], notes: 'Fitted European 38' },
      { size: 'M', chestInches: [38, 40], notes: 'Fitted European 40' },
      { size: 'L', chestInches: [41, 43], notes: 'Fitted European 42' },
      { size: 'XL', chestInches: [44, 46], notes: 'Fitted European 44' },
      { size: 'XXL', chestInches: [47, 49], notes: 'Fitted European 46' },
    ],
    bottomSizes: [
      { size: '30', waistInches: [29, 30] },
      { size: '31', waistInches: [30, 31] },
      { size: '32', waistInches: [31, 32] },
      { size: '34', waistInches: [33, 34] },
      { size: '36', waistInches: [35, 36] },
    ],
  },
  "Levi's": {
    name: "Levi's",
    region: 'global',
    cutTendency: 'true_to_size',
    description: 'American standard heritage sizing; denim expands ~0.5" after initial wear.',
    topSizes: [
      { size: 'S', chestInches: [35, 37] },
      { size: 'M', chestInches: [38, 40] },
      { size: 'L', chestInches: [41, 44] },
      { size: 'XL', chestInches: [45, 48] },
    ],
    bottomSizes: [
      { size: '28', waistInches: [28, 29] },
      { size: '30', waistInches: [30, 31] },
      { size: '32', waistInches: [32, 33] },
      { size: '34', waistInches: [34, 35] },
      { size: '36', waistInches: [36, 37] },
    ],
  },
  H_M: {
    name: 'H&M',
    region: 'global',
    cutTendency: 'true_to_size',
    description: 'Swedish standard proportions; slightly longer sleeve lengths on tops.',
    topSizes: [
      { size: 'XS', chestInches: [33, 35] },
      { size: 'S', chestInches: [36, 38] },
      { size: 'M', chestInches: [39, 41] },
      { size: 'L', chestInches: [42, 44] },
      { size: 'XL', chestInches: [45, 47] },
    ],
    bottomSizes: [
      { size: '30', waistInches: [29.5, 31] },
      { size: '32', waistInches: [31.5, 33] },
      { size: '34', waistInches: [33.5, 35] },
      { size: '36', waistInches: [35.5, 37] },
    ],
  },
  Uniqlo: {
    name: 'Uniqlo',
    region: 'global',
    cutTendency: 'runs_large',
    description: 'Relaxed Japanese comfort fit; boxier chest drape with comfortable armholes.',
    topSizes: [
      { size: 'S', chestInches: [35, 38] },
      { size: 'M', chestInches: [38, 41] },
      { size: 'L', chestInches: [41, 44] },
      { size: 'XL', chestInches: [44, 47] },
    ],
    bottomSizes: [
      { size: 'S (28-30)', waistInches: [28, 30] },
      { size: 'M (31-33)', waistInches: [31, 33] },
      { size: 'L (34-36)', waistInches: [34, 36] },
      { size: 'XL (37-39)', waistInches: [37, 39] },
    ],
  },
  ASOS: {
    name: 'ASOS DESIGN',
    region: 'global',
    cutTendency: 'true_to_size',
    description: 'Contemporary British streetwear cuts; oversized items are explicitly styled loose.',
    topSizes: [
      { size: 'XS', chestInches: [34, 36] },
      { size: 'S', chestInches: [36, 38] },
      { size: 'M', chestInches: [38, 40] },
      { size: 'L', chestInches: [40, 42] },
      { size: 'XL', chestInches: [42, 44] },
      { size: '2XL', chestInches: [44, 46] },
    ],
    bottomSizes: [
      { size: '28', waistInches: [28, 29] },
      { size: '30', waistInches: [30, 31] },
      { size: '32', waistInches: [32, 33] },
      { size: '34', waistInches: [34, 35] },
      { size: '36', waistInches: [36, 37] },
    ],
  },
  Myntra: {
    name: 'Myntra Brands (Roadster / HRX / DressBerry)',
    region: 'india',
    cutTendency: 'runs_small',
    description: 'Indian marketplace sizing; chest cuts often run 1" to 1.5" slimmer than US/EU standard.',
    topSizes: [
      { size: 'S (38)', chestInches: [37, 38] },
      { size: 'M (40)', chestInches: [39, 40] },
      { size: 'L (42)', chestInches: [41, 42] },
      { size: 'XL (44)', chestInches: [43, 44] },
      { size: 'XXL (46)', chestInches: [45, 46] },
    ],
    bottomSizes: [
      { size: '28', waistInches: [28, 29] },
      { size: '30', waistInches: [30, 31] },
      { size: '32', waistInches: [32, 33] },
      { size: '34', waistInches: [34, 35] },
      { size: '36', waistInches: [36, 37] },
    ],
  },
  Ajio: {
    name: 'Ajio (Netplay / Trends)',
    region: 'india',
    cutTendency: 'true_to_size',
    description: 'Indian standard retail fitting with generous hem room.',
    topSizes: [
      { size: 'S', chestInches: [38, 39] },
      { size: 'M', chestInches: [40, 41] },
      { size: 'L', chestInches: [42, 43] },
      { size: 'XL', chestInches: [44, 45] },
      { size: 'XXL', chestInches: [46, 47] },
    ],
    bottomSizes: [
      { size: '30', waistInches: [30, 31] },
      { size: '32', waistInches: [32, 33] },
      { size: '34', waistInches: [34, 35] },
      { size: '36', waistInches: [36, 37] },
    ],
  },
};

export interface SizeRecommendationResult {
  recommendedSize: string;
  confidence: 'High' | 'Moderate';
  fitNotice: string;
  estimatedChestRange?: string;
  estimatedWaistRange?: string;
  comparisonChart: {
    brandName: string;
    equivalentSize: string;
    varianceText: string;
  }[];
}

export function estimateSize(params: {
  benchmarkBrand: string;
  benchmarkSize: string;
  targetBrand: string;
  category: GarmentType;
  garmentSilhouette?: string;
  fitPreference?: FitPreference;
}): SizeRecommendationResult {
  const {
    benchmarkBrand = 'Zara',
    benchmarkSize = 'M',
    targetBrand = 'Myntra',
    category = 'top',
    garmentSilhouette = 'regular',
    fitPreference = 'regular',
  } = params;

  const isBottom = category === 'bottom';
  const benchProfile = BRAND_PROFILES[benchmarkBrand] || BRAND_PROFILES.Zara;
  const targetProfile = BRAND_PROFILES[targetBrand] || BRAND_PROFILES.Myntra;

  // 1. Find estimated body range from benchmark brand
  const benchList = isBottom ? benchProfile.bottomSizes : benchProfile.topSizes;
  const matchedMetric = benchList.find(
    (s) => s.size.toLowerCase() === benchmarkSize.toLowerCase()
  ) || benchList[1] || benchList[0];

  let bodyInches = isBottom
    ? (matchedMetric.waistInches ? (matchedMetric.waistInches[0] + matchedMetric.waistInches[1]) / 2 : 32)
    : (matchedMetric.chestInches ? (matchedMetric.chestInches[0] + matchedMetric.chestInches[1]) / 2 : 40);

  // Apply user fit preference offset
  if (fitPreference === 'slim') {
    bodyInches -= 0.5;
  } else if (fitPreference === 'oversized') {
    bodyInches += 1.5;
  }

  // Check garment silhouette (e.g. if the outfit specifies "Boxy" or "Oversized" or "Slim Tailored")
  const sil = (garmentSilhouette || '').toLowerCase();
  if (sil.includes('oversized') || sil.includes('boxy') || sil.includes('relaxed')) {
    // If piece is naturally boxy, customer might want standard size without upsizing
  } else if (sil.includes('tailored') || sil.includes('sharp') || sil.includes('slim')) {
    bodyInches += 0.5;
  }

  // 2. Map to target brand sizes
  const targetList = isBottom ? targetProfile.bottomSizes : targetProfile.topSizes;

  let bestMatch = targetList[0];
  let minDiff = 999;

  targetList.forEach((t) => {
    const range = isBottom ? t.waistInches : t.chestInches;
    if (range) {
      const mid = (range[0] + range[1]) / 2;
      const diff = Math.abs(mid - bodyInches);
      if (diff < minDiff) {
        minDiff = diff;
        bestMatch = t;
      }
    }
  });

  // Calculate narrative fit notice
  let fitNotice = '';
  if (targetProfile.cutTendency === 'runs_small' && benchProfile.cutTendency !== 'runs_small') {
    fitNotice = `${targetProfile.name} cuts tend to run slightly trimmer (~1" narrower in chest). We recommend sizing up if you prefer a relaxed drape.`;
  } else if (targetProfile.cutTendency === 'runs_large' && benchProfile.cutTendency !== 'runs_large') {
    fitNotice = `${targetProfile.name} has a generous, boxy drape. Your normal size will offer plenty of breathing room.`;
  } else {
    fitNotice = `${targetProfile.name} aligns closely with your ${benchmarkBrand} size (${benchmarkSize}).`;
  }

  // Build comparison across all brands
  const comparisonChart = Object.keys(BRAND_PROFILES).map((bKey) => {
    const prof = BRAND_PROFILES[bKey];
    const list = isBottom ? prof.bottomSizes : prof.topSizes;
    let bBest = list[0];
    let bMin = 999;
    list.forEach((entry) => {
      const r = isBottom ? entry.waistInches : entry.chestInches;
      if (r) {
        const mid = (r[0] + r[1]) / 2;
        const d = Math.abs(mid - bodyInches);
        if (d < bMin) {
          bMin = d;
          bBest = entry;
        }
      }
    });

    let variance = 'True to standard';
    if (prof.cutTendency === 'runs_small') variance = 'Slim European/Indian taper';
    else if (prof.cutTendency === 'runs_large') variance = 'Relaxed boxy cut';

    return {
      brandName: prof.name,
      equivalentSize: bBest.size,
      varianceText: variance,
    };
  });

  return {
    recommendedSize: bestMatch.size,
    confidence: minDiff < 1.2 ? 'High' : 'Moderate',
    fitNotice,
    estimatedChestRange: !isBottom ? `${Math.round(bodyInches - 1)}" - ${Math.round(bodyInches + 1)}"` : undefined,
    estimatedWaistRange: isBottom ? `${Math.round(bodyInches - 0.5)}" - ${Math.round(bodyInches + 0.5)}"` : undefined,
    comparisonChart,
  };
}
