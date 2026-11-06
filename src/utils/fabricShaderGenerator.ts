import * as THREE from 'three';

export type FabricType =
  | 'denim'
  | 'cotton'
  | 'silk'
  | 'wool'
  | 'leather'
  | 'linen'
  | 'knit'
  | 'metallic';

export interface FabricPBRProperties {
  fabricType: FabricType;
  roughness: number;
  metalness: number;
  bumpScale: number;
  repeat: [number, number];
  sheenColor?: THREE.Color;
}

// Memory-efficient texture cache
const textureCache = new Map<string, THREE.CanvasTexture>();

/**
 * Creates high-precision procedural PBR canvas textures for textile micro-weaves,
 * seams, denim twill, knit ribs, and leather grain.
 */
export function getFabricMicroTexture(fabricType: FabricType): THREE.CanvasTexture {
  const cacheKey = `fabric_${fabricType}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  const size = 512;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    const dummy = new THREE.CanvasTexture(canvas);
    return dummy;
  }

  // Base neutral 50% grey for bump/normal height
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  if (fabricType === 'denim') {
    // 3/1 Right-Hand Diagonal Twill Weave with slub yarn variations
    ctx.strokeStyle = '#5a5a5a';
    ctx.lineWidth = 1.6;
    for (let x = -size; x < size * 2; x += 6) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + size, size);
      ctx.stroke();
    }
    // Cross warp subtle highlights
    ctx.strokeStyle = '#a8a8a8';
    ctx.lineWidth = 1.0;
    for (let y = 0; y < size; y += 12) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }
    // Micro yarn slub noise
    const imgData = ctx.getImageData(0, 0, size, size);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 22;
      const v = Math.min(255, Math.max(0, data[i] + noise));
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
    }
    ctx.putImageData(imgData, 0, 0);

  } else if (fabricType === 'cotton') {
    // Fine interlocking basket-weave jersey
    const step = 8;
    ctx.fillStyle = '#6a6a6a';
    for (let y = 0; y < size; y += step) {
      for (let x = 0; x < size; x += step) {
        if ((x / step + y / step) % 2 === 0) {
          ctx.fillRect(x + 1, y + 1, step - 2, step - 2);
        }
      }
    }
    // Diffuse soft fiber grain
    const imgData = ctx.getImageData(0, 0, size, size);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 16;
      const v = Math.min(255, Math.max(0, data[i] + noise));
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
    }
    ctx.putImageData(imgData, 0, 0);

  } else if (fabricType === 'silk') {
    // Ultra-fine micro-smooth directional weave with subtle iridescent grazing sheen
    ctx.strokeStyle = '#949494';
    ctx.lineWidth = 0.8;
    for (let y = 0; y < size; y += 4) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }
    // Gentle silky specular gradients
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, 'rgba(255,255,255,0.06)');
    grad.addColorStop(0.5, 'rgba(0,0,0,0.06)');
    grad.addColorStop(1, 'rgba(255,255,255,0.06)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

  } else if (fabricType === 'wool') {
    // Heavy fibrous wool / cashmere cross-hatch with flecks
    ctx.strokeStyle = '#606060';
    ctx.lineWidth = 2.4;
    for (let y = 0; y < size; y += 10) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }
    for (let x = 0; x < size; x += 10) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size);
      ctx.stroke();
    }
    // High-frequency wool fuzz noise
    const imgData = ctx.getImageData(0, 0, size, size);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 36;
      const v = Math.min(255, Math.max(0, data[i] + noise));
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
    }
    ctx.putImageData(imgData, 0, 0);

  } else if (fabricType === 'leather') {
    // Natural pebbled organic grain cells
    ctx.fillStyle = '#6e6e6e';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#9c9c9c';
    for (let i = 0; i < 900; i++) {
      const cx = Math.random() * size;
      const cy = Math.random() * size;
      const rad = 2 + Math.random() * 5;
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.fill();
    }
    // Subtle creased folds
    ctx.strokeStyle = '#4a4a4a';
    ctx.lineWidth = 1.2;
    for (let j = 0; j < 30; j++) {
      ctx.beginPath();
      const sx = Math.random() * size;
      const sy = Math.random() * size;
      ctx.moveTo(sx, sy);
      ctx.bezierCurveTo(
        sx + (Math.random() - 0.5) * 60,
        sy + (Math.random() - 0.5) * 60,
        sx + (Math.random() - 0.5) * 60,
        sy + (Math.random() - 0.5) * 60,
        sx + (Math.random() - 0.5) * 80,
        sy + (Math.random() - 0.5) * 80
      );
      ctx.stroke();
    }

  } else if (fabricType === 'knit' || fabricType === 'linen') {
    // Raised vertical cable/rib cord texture
    const ribWidth = 14;
    for (let x = 0; x < size; x += ribWidth) {
      const grad = ctx.createLinearGradient(x, 0, x + ribWidth, 0);
      grad.addColorStop(0, '#555555');
      grad.addColorStop(0.5, '#aaaaaa');
      grad.addColorStop(1, '#555555');
      ctx.fillStyle = grad;
      ctx.fillRect(x, 0, ribWidth, size);
    }
    // Horizontal yarn stitches
    ctx.strokeStyle = '#444444';
    ctx.lineWidth = 1.0;
    for (let y = 0; y < size; y += 6) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }

  } else {
    // Metallic / Satin hardware
    const imgData = ctx.getImageData(0, 0, size, size);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 8;
      const v = Math.min(255, Math.max(0, 128 + noise));
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
    }
    ctx.putImageData(imgData, 0, 0);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  const repeatVal = fabricType === 'leather' ? 6 : fabricType === 'denim' ? 12 : 16;
  texture.repeat.set(repeatVal, repeatVal);

  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Creates stitched seam line texture for tailored garment edges,
 * collar stands, pockets, and pant outseams.
 */
let cachedStitchTexture: THREE.CanvasTexture | null = null;
export function getStitchSeamTexture(contrastColorHex = '#d4af37'): THREE.CanvasTexture {
  if (cachedStitchTexture) return cachedStitchTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.clearRect(0, 0, 128, 32);
    // Double needle stitch marks
    ctx.strokeStyle = contrastColorHex;
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';

    for (let x = 6; x < 128; x += 18) {
      // Row 1
      ctx.beginPath();
      ctx.moveTo(x, 8);
      ctx.lineTo(x + 10, 8);
      ctx.stroke();
      // Row 2
      ctx.beginPath();
      ctx.moveTo(x, 24);
      ctx.lineTo(x + 10, 24);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 1);
  cachedStitchTexture = texture;
  return texture;
}

/**
 * Creates metallic zipper teeth texture for jacket front tracks.
 */
let cachedZipperTexture: THREE.CanvasTexture | null = null;
export function getZipperTrackTexture(): THREE.CanvasTexture {
  if (cachedZipperTexture) return cachedZipperTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#222630';
    ctx.fillRect(0, 0, 64, 256);

    // Center divider
    ctx.strokeStyle = '#11141a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(32, 0);
    ctx.lineTo(32, 256);
    ctx.stroke();

    // Metallic teeth interlocking
    ctx.fillStyle = '#dcd6cd';
    for (let y = 4; y < 256; y += 12) {
      // Left tooth
      ctx.fillRect(16, y, 14, 6);
      // Right tooth slightly offset
      ctx.fillRect(34, y + 6, 14, 6);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 4);
  cachedZipperTexture = texture;
  return texture;
}

/**
 * Detects the dominant fabric type from item descriptions and names.
 */
export function detectFabricType(name: string, description: string, silhouette: string): FabricType {
  const combined = `${name} ${description} ${silhouette}`.toLowerCase();
  if (combined.includes('denim') || combined.includes('jean') || combined.includes('twill')) {
    return 'denim';
  }
  if (
    combined.includes('silk') ||
    combined.includes('satin') ||
    combined.includes('organza') ||
    combined.includes('chiffon') ||
    combined.includes('velvet')
  ) {
    return 'silk';
  }
  if (combined.includes('leather') || combined.includes('suede') || combined.includes('shearling')) {
    return 'leather';
  }
  if (
    combined.includes('wool') ||
    combined.includes('cashmere') ||
    combined.includes('tweed') ||
    combined.includes('flannel') ||
    combined.includes('blazer') ||
    combined.includes('suit')
  ) {
    return 'wool';
  }
  if (combined.includes('linen') || combined.includes('chambray')) {
    return 'linen';
  }
  if (combined.includes('knit') || combined.includes('sweater') || combined.includes('cardigan') || combined.includes('rib')) {
    return 'knit';
  }
  if (combined.includes('gold') || combined.includes('silver') || combined.includes('metallic') || combined.includes('brass')) {
    return 'metallic';
  }
  return 'cotton';
}

/**
 * Creates high-fidelity PBR fabric material with weave bump, sheen, and realistic roughness.
 */
export function createPBRFabricMaterial(
  colorHex: number,
  fabricType: FabricType
): THREE.MeshStandardMaterial {
  const bumpTexture = getFabricMicroTexture(fabricType);

  let roughness = 0.68;
  let metalness = 0.04;
  let bumpScale = 0.005;

  if (fabricType === 'silk') {
    roughness = 0.24;
    metalness = 0.16;
    bumpScale = 0.002;
  } else if (fabricType === 'leather') {
    roughness = 0.35;
    metalness = 0.08;
    bumpScale = 0.007;
  } else if (fabricType === 'wool') {
    roughness = 0.82;
    metalness = 0.02;
    bumpScale = 0.009;
  } else if (fabricType === 'denim') {
    roughness = 0.74;
    metalness = 0.03;
    bumpScale = 0.008;
  } else if (fabricType === 'knit' || fabricType === 'linen') {
    roughness = 0.78;
    metalness = 0.02;
    bumpScale = 0.010;
  } else if (fabricType === 'metallic') {
    roughness = 0.18;
    metalness = 0.88;
    bumpScale = 0.002;
  }

  const mat = new THREE.MeshStandardMaterial({
    color: colorHex,
    roughness: roughness,
    metalness: metalness,
    bumpMap: bumpTexture,
    bumpScale: bumpScale,
    side: THREE.DoubleSide,
  });

  return mat;
}

/**
 * Creates visual fit-tension heatmap material (green = perfect drape, amber = snug tension, cyan = loose drape)
 */
export function createFitTensionMaterial(tensionType: 'perfect' | 'snug' | 'relaxed' = 'perfect'): THREE.MeshStandardMaterial {
  const colorMap = {
    perfect: 0x10b981, // Emerald green (ideal tailor tension)
    snug: 0xf59e0b,    // Amber (form-fitting tension zone)
    relaxed: 0x38bdf8, // Sky blue (fluid drape ease)
  };

  return new THREE.MeshStandardMaterial({
    color: colorMap[tensionType],
    roughness: 0.35,
    metalness: 0.1,
    transparent: true,
    opacity: 0.88,
    side: THREE.DoubleSide,
  });
}

