import { OutfitLook, ClothingItem, CommunityPost } from '../types';

export interface WardrobeMatchResult {
  score: number; // 0 to 100
  matchLevel: 'Flawless Match' | 'High Compatibility' | 'Versatile Accent' | 'Eclectic Contrast';
  colorHarmonyScore: number;
  versatilityScore: number;
  aestheticScore: number;
  matchingSavedItems: {
    savedLookTitle: string;
    item: ClothingItem;
    pairingReason: string;
  }[];
  mixMatchCombos: {
    formulaName: string;
    communityPieceName: string;
    savedPieceName: string;
    stylingAdvice: string;
  }[];
  paletteHarmonyDescription: string;
}

// Color families for color harmony analysis
const COLOR_FAMILIES: Record<string, { family: string; complements: string[]; neutrals: boolean }> = {
  black: { family: 'neutral_dark', complements: ['white', 'gold', 'silver', 'emerald', 'burgundy', 'cream', 'navy'], neutrals: true },
  noir: { family: 'neutral_dark', complements: ['white', 'gold', 'silver', 'emerald', 'burgundy', 'cream'], neutrals: true },
  charcoal: { family: 'neutral_dark', complements: ['white', 'champagne', 'powder blue', 'rose', 'camel'], neutrals: true },
  white: { family: 'neutral_light', complements: ['black', 'navy', 'gold', 'olive', 'burgundy', 'terracotta'], neutrals: true },
  ivory: { family: 'neutral_light', complements: ['gold', 'emerald', 'navy', 'champagne', 'brown'], neutrals: true },
  cream: { family: 'neutral_light', complements: ['navy', 'gold', 'forest', 'burgundy', 'charcoal'], neutrals: true },
  champagne: { family: 'warm_metallic', complements: ['navy', 'black', 'emerald', 'burgundy', 'ivory'], neutrals: false },
  gold: { family: 'warm_metallic', complements: ['black', 'navy', 'emerald', 'burgundy', 'white'], neutrals: false },
  silver: { family: 'cool_metallic', complements: ['black', 'charcoal', 'navy', 'royal blue', 'white'], neutrals: false },
  navy: { family: 'cool_deep', complements: ['champagne', 'gold', 'white', 'silver', 'cognac', 'burgundy'], neutrals: false },
  blue: { family: 'cool_tone', complements: ['white', 'camel', 'grey', 'gold'], neutrals: false },
  emerald: { family: 'jewel_deep', complements: ['champagne', 'gold', 'black', 'ivory', 'blush'], neutrals: false },
  burgundy: { family: 'jewel_deep', complements: ['gold', 'champagne', 'navy', 'black', 'grey'], neutrals: false },
  rose: { family: 'soft_pastel', complements: ['charcoal', 'grey', 'champagne', 'burgundy', 'white'], neutrals: false },
  pink: { family: 'soft_pastel', complements: ['grey', 'white', 'navy', 'black'], neutrals: false },
  camel: { family: 'warm_earth', complements: ['black', 'white', 'navy', 'cream', 'forest'], neutrals: true },
};

function normalizeColor(colorStr: string): string {
  const lower = (colorStr || '').toLowerCase();
  for (const key of Object.keys(COLOR_FAMILIES)) {
    if (lower.includes(key)) return key;
  }
  return 'neutral_light';
}

/**
 * Calculates Style Compatibility between a target OutfitLook (or Community piece)
 * and the user's saved wardrobe looks.
 */
export function calculateStyleCompatibility(
  targetLook: OutfitLook,
  savedWardrobe: OutfitLook[]
): WardrobeMatchResult {
  // If user has no saved items, return a baseline introductory score
  if (!savedWardrobe || savedWardrobe.length === 0) {
    return {
      score: 75,
      matchLevel: 'Versatile Accent',
      colorHarmonyScore: 75,
      versatilityScore: 75,
      aestheticScore: 75,
      matchingSavedItems: [],
      mixMatchCombos: [
        {
          formulaName: 'Curated Foundation Pair',
          communityPieceName: targetLook.items[0]?.name || 'Community Key Piece',
          savedPieceName: 'Your Wardrobe Essentials',
          stylingAdvice: 'Save this lookbook to start generating cross-closet mix & match formulas.',
        },
      ],
      paletteHarmonyDescription: 'Universal palette with high mix-and-match versatility across classic aesthetics.',
    };
  }

  // 1. Gather all individual saved items from wardrobe
  const allSavedItems: { look: OutfitLook; item: ClothingItem }[] = [];
  savedWardrobe.forEach((l) => {
    l.items.forEach((item) => {
      allSavedItems.push({ look: l, item });
    });
  });

  // 2. Color Harmony Analysis
  const targetColors = targetLook.colorPalette.map((c) => normalizeColor(c.name));
  let colorMatchHits = 0;
  let colorComparisons = 0;

  savedWardrobe.forEach((savedLook) => {
    savedLook.colorPalette.forEach((savedCol) => {
      const normSaved = normalizeColor(savedCol.name);
      colorComparisons++;

      targetColors.forEach((normTarget) => {
        if (normSaved === normTarget) {
          // Monochromatic / tone-on-tone match
          colorMatchHits += 1.0;
        } else {
          const familyInfo = COLOR_FAMILIES[normSaved];
          if (familyInfo && familyInfo.complements.includes(normTarget)) {
            // Complementary harmonic pair
            colorMatchHits += 0.85;
          } else if (familyInfo && familyInfo.neutrals) {
            // Neutral universal pair
            colorMatchHits += 0.7;
          }
        }
      });
    });
  });

  const rawColorScore = colorComparisons > 0
    ? Math.min(100, Math.round((colorMatchHits / Math.max(1, colorComparisons * 0.7)) * 100))
    : 80;
  const colorHarmonyScore = Math.max(68, Math.min(99, rawColorScore));

  // 3. Category Complementarity & Mix-and-Match Versatility
  // Find which pieces from saved items naturally pair with pieces in targetLook
  const matchingSavedItems: WardrobeMatchResult['matchingSavedItems'] = [];
  const mixMatchCombos: WardrobeMatchResult['mixMatchCombos'] = [];

  targetLook.items.forEach((targetItem) => {
    const targetCat = targetItem.category.toLowerCase();

    allSavedItems.forEach(({ look: savedLook, item: savedItem }) => {
      const savedCat = savedItem.category.toLowerCase();

      // Pair rules: Top + Bottom, Outerwear + Dress, Blazer + Trousers, Shoes + Outfit, Accessories + Gown
      const isComplementaryCategory =
        (targetCat === 'top' && (savedCat === 'bottom' || savedCat === 'outerwear')) ||
        (targetCat === 'bottom' && (savedCat === 'top' || savedCat === 'outerwear')) ||
        (targetCat === 'outerwear' && (savedCat === 'top' || savedCat === 'bottom' || savedCat === 'dress')) ||
        (targetCat === 'dress' && (savedCat === 'outerwear' || savedCat === 'accessory' || savedCat === 'footwear')) ||
        (targetCat === 'accessory' && (savedCat === 'top' || savedCat === 'dress' || savedCat === 'outerwear')) ||
        (targetCat === 'footwear' && (savedCat === 'bottom' || savedCat === 'dress'));

      if (isComplementaryCategory) {
        const itemPairReason = `Complements the silhouette of your "${savedItem.name}" (${savedItem.color || 'coordinated tone'}) from ${savedLook.title}`;

        if (matchingSavedItems.length < 5 && !matchingSavedItems.some((m) => m.item.id === savedItem.id)) {
          matchingSavedItems.push({
            savedLookTitle: savedLook.title,
            item: savedItem,
            pairingReason: itemPairReason,
          });
        }

        if (mixMatchCombos.length < 3) {
          mixMatchCombos.push({
            formulaName: `${targetItem.category.toUpperCase()} + ${savedItem.category.toUpperCase()} PERMUTATION`,
            communityPieceName: targetItem.name,
            savedPieceName: savedItem.name,
            stylingAdvice: `Wear this community piece with your saved ${savedItem.name} for an effortless ${targetLook.occasion} refresh.`,
          });
        }
      }
    });
  });

  const versatilityScore = Math.min(
    98,
    Math.max(72, 70 + matchingSavedItems.length * 6 + mixMatchCombos.length * 4)
  );

  // 4. Aesthetic / Occasion Cohesion
  let aestheticHits = 0;
  savedWardrobe.forEach((s) => {
    if (s.occasion.toLowerCase() === targetLook.occasion.toLowerCase()) aestheticHits += 1.5;
    if (s.vibe.toLowerCase().includes(targetLook.vibe.toLowerCase()) || targetLook.vibe.toLowerCase().includes(s.vibe.toLowerCase())) {
      aestheticHits += 1.2;
    }
  });

  const aestheticScore = Math.min(
    96,
    Math.max(70, Math.round(75 + (aestheticHits / Math.max(1, savedWardrobe.length)) * 20))
  );

  // Weighted total score
  const totalScore = Math.round(
    colorHarmonyScore * 0.35 + versatilityScore * 0.35 + aestheticScore * 0.3
  );

  let matchLevel: WardrobeMatchResult['matchLevel'] = 'Flawless Match';
  if (totalScore >= 90) matchLevel = 'Flawless Match';
  else if (totalScore >= 82) matchLevel = 'High Compatibility';
  else if (totalScore >= 74) matchLevel = 'Versatile Accent';
  else matchLevel = 'Eclectic Contrast';

  const primaryTargetCol = targetLook.colorPalette[0]?.name || 'neutral';
  const primarySavedCol = savedWardrobe[0]?.colorPalette[0]?.name || 'classic';
  const paletteHarmonyDescription = `${primaryTargetCol} harmonizes with your wardrobe's dominant ${primarySavedCol} accents with high cross-season mix potential.`;

  return {
    score: totalScore,
    matchLevel,
    colorHarmonyScore,
    versatilityScore,
    aestheticScore,
    matchingSavedItems,
    mixMatchCombos,
    paletteHarmonyDescription,
  };
}

/**
 * Ranks an array of community posts by their style compatibility score with the user's saved wardrobe.
 */
export function rankCommunityPostsByCompatibility(
  posts: CommunityPost[],
  savedWardrobe: OutfitLook[]
): { post: CommunityPost; compatibility: WardrobeMatchResult }[] {
  return posts
    .map((post) => ({
      post,
      compatibility: calculateStyleCompatibility(post.look, savedWardrobe),
    }))
    .sort((a, b) => b.compatibility.score - a.compatibility.score);
}
