import * as THREE from 'three';
import { OutfitLook, ClothingItem } from '../types';
import { BodyGender, BodyMetrics } from './outfitGenderDetector';
import {
  detectFabricType,
  createPBRFabricMaterial,
  createFitTensionMaterial,
  getStitchSeamTexture,
  getZipperTrackTexture,
} from './fabricShaderGenerator';
import {
  GarmentTailoringOptions,
  DEFAULT_TAILORING_OPTIONS,
  SILHOUETTE_PROFILES,
  OcclusionMode,
} from './garmentTailoringConfig';

export type MannequinFinish = 'skin' | 'obsidian' | 'alabaster' | 'bronze';

export interface HumanModelConfig {
  gender: BodyGender;
  metrics: BodyMetrics;
  skinColorHex?: string;
  hairColorHex?: string;
  finish?: MannequinFinish;
}

// Procedural skin micro-texture canvas for authentic epidermal pores & light scatter
let cachedSkinTexture: THREE.CanvasTexture | null = null;
function getProceduralSkinTexture(): THREE.CanvasTexture {
  if (cachedSkinTexture) return cachedSkinTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 256, 256);

    // Generate fine pore grain
    const imgData = ctx.getImageData(0, 0, 256, 256);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 18;
      const base = 128 + noise;
      data[i] = Math.min(255, Math.max(0, base + 2)); // Red channel slightly warmer
      data[i + 1] = Math.min(255, Math.max(0, base));
      data[i + 2] = Math.min(255, Math.max(0, base - 2));
      data[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  cachedSkinTexture = texture;
  return texture;
}

/**
 * Creates realistic human skin PBR material with subtle epidermal specular sheen.
 */
export function createSkinMaterial(colorHex: string = '#f0c7a8'): THREE.MeshStandardMaterial {
  const skinColor = new THREE.Color(colorHex);
  const bumpMap = getProceduralSkinTexture();

  return new THREE.MeshStandardMaterial({
    color: skinColor,
    roughness: 0.56,
    metalness: 0.02,
    bumpMap: bumpMap,
    bumpScale: 0.003,
  });
}

/**
 * Creates realistic lip material with subtle gloss and rosier undertone.
 */
export function createLipMaterial(skinColorHex: string = '#f0c7a8'): THREE.MeshStandardMaterial {
  const baseColor = new THREE.Color(skinColorHex);
  // Blend towards warm natural rose
  const lipColor = baseColor.clone().lerp(new THREE.Color(0xb84b5c), 0.38);

  return new THREE.MeshStandardMaterial({
    color: lipColor,
    roughness: 0.38,
    metalness: 0.05,
  });
}

/**
 * Creates realistic hair material with natural fiber sheen.
 */
export function createHairMaterial(hairColorHex: string = '#2c1e17'): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(hairColorHex),
    roughness: 0.42,
    metalness: 0.12,
  });
}

/**
 * Creates high-fashion runway stage pedestal.
 */
export function createPedestal(): THREE.Group {
  const group = new THREE.Group();

  // Circular beveled stage pedestal
  const stageGeo = new THREE.CylinderGeometry(1.45, 1.52, 0.14, 48);
  const stageMat = new THREE.MeshStandardMaterial({
    color: 0x11141c,
    roughness: 0.22,
    metalness: 0.65,
  });
  const stage = new THREE.Mesh(stageGeo, stageMat);
  stage.position.y = -0.07;
  stage.receiveShadow = true;
  group.add(stage);

  // Brushed gold rim accent ring
  const ringGeo = new THREE.TorusGeometry(1.46, 0.015, 16, 48);
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    roughness: 0.2,
    metalness: 0.9,
  });
  const ring = new THREE.Mesh(ringGeo, goldMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.0;
  group.add(ring);

  // Subtle runway underglow disc
  const underglowGeo = new THREE.CircleGeometry(1.35, 36);
  const underglowMat = new THREE.MeshBasicMaterial({
    color: 0xd4af37,
    transparent: true,
    opacity: 0.12,
  });
  const underglow = new THREE.Mesh(underglowGeo, underglowMat);
  underglow.rotation.x = -Math.PI / 2;
  underglow.position.y = 0.002;
  group.add(underglow);

  // Elegant brass rear support pillar
  const rodGeo = new THREE.CylinderGeometry(0.024, 0.024, 4.1, 24);
  const rod = new THREE.Mesh(rodGeo, goldMat);
  rod.position.set(0, 2.05, -0.22);
  group.add(rod);

  return group;
}

/**
 * Builds realistic sculpted eyes with cornea, iris, and pupil.
 */
function createRealisticEye(eyeRadius: number = 0.024, irisHex: number = 0x3d281a): THREE.Group {
  const eye = new THREE.Group();

  // Sclera (eyeball white)
  const scleraGeo = new THREE.SphereGeometry(eyeRadius, 18, 14);
  const scleraMat = new THREE.MeshStandardMaterial({
    color: 0xf5f3ee,
    roughness: 0.15,
    metalness: 0.05,
  });
  const sclera = new THREE.Mesh(scleraGeo, scleraMat);
  eye.add(sclera);

  // Iris
  const irisGeo = new THREE.CircleGeometry(eyeRadius * 0.58, 20);
  const irisMat = new THREE.MeshStandardMaterial({
    color: irisHex,
    roughness: 0.2,
    metalness: 0.1,
  });
  const iris = new THREE.Mesh(irisGeo, irisMat);
  iris.position.set(0, 0, eyeRadius * 0.94);
  eye.add(iris);

  // Pupil
  const pupilGeo = new THREE.CircleGeometry(eyeRadius * 0.26, 16);
  const pupilMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
  const pupil = new THREE.Mesh(pupilGeo, pupilMat);
  pupil.position.set(0, 0, eyeRadius * 0.96);
  eye.add(pupil);

  // Corneal specular reflection highlight
  const corneaGlintGeo = new THREE.CircleGeometry(eyeRadius * 0.09, 12);
  const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const glint = new THREE.Mesh(corneaGlintGeo, glintMat);
  glint.position.set(eyeRadius * 0.18, eyeRadius * 0.18, eyeRadius * 0.97);
  eye.add(glint);

  return eye;
}

/**
 * Builds realistic ears with anatomical concha, helix, and lobe contours.
 */
function createRealisticEar(skinMat: THREE.Material, isMale: boolean): THREE.Group {
  const ear = new THREE.Group();
  const scale = isMale ? 1.05 : 0.92;

  // Outer Helix rim
  const helixGeo = new THREE.TorusGeometry(0.04 * scale, 0.012 * scale, 12, 24, Math.PI * 1.3);
  const helix = new THREE.Mesh(helixGeo, skinMat);
  helix.rotation.z = Math.PI / 4;
  ear.add(helix);

  // Concha bowl
  const conchaGeo = new THREE.SphereGeometry(0.026 * scale, 12, 10);
  conchaGeo.scale(0.8, 1.2, 0.4);
  const concha = new THREE.Mesh(conchaGeo, skinMat);
  concha.position.set(-0.005, 0, 0.008);
  ear.add(concha);

  // Ear lobe
  const lobeGeo = new THREE.SphereGeometry(0.018 * scale, 12, 10);
  lobeGeo.scale(0.9, 1.3, 0.7);
  const lobe = new THREE.Mesh(lobeGeo, skinMat);
  lobe.position.set(0.01, -0.045 * scale, 0.005);
  ear.add(lobe);

  return ear;
}

/**
 * Builds styled hair for Male and Female models.
 */
function createStyledHair(isMale: boolean, hairMat: THREE.Material): THREE.Group {
  const hair = new THREE.Group();

  if (isMale) {
    // ── Masculine Modern Textured Crop / Undercut ──
    // Crown volume
    const crownGeo = new THREE.SphereGeometry(0.245, 24, 20);
    crownGeo.scale(0.96, 0.94, 1.04);
    const crown = new THREE.Mesh(crownGeo, hairMat);
    crown.position.set(0, 0.06, -0.01);
    hair.add(crown);

    // Front textured fringe / quiff
    const fringeGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.12, 20);
    fringeGeo.scale(1.0, 0.8, 0.7);
    const fringe = new THREE.Mesh(fringeGeo, hairMat);
    fringe.position.set(0, 0.15, 0.09);
    fringe.rotation.x = 0.28;
    hair.add(fringe);

    // Tapered temple hair patches
    [-1, 1].forEach((side) => {
      const templeGeo = new THREE.BoxGeometry(0.03, 0.14, 0.15);
      const temple = new THREE.Mesh(templeGeo, hairMat);
      temple.position.set(side * 0.20, 0.02, 0.02);
      temple.rotation.y = side * 0.15;
      hair.add(temple);
    });

    // Back neck taper
    const napeGeo = new THREE.BoxGeometry(0.26, 0.12, 0.08);
    const nape = new THREE.Mesh(napeGeo, hairMat);
    nape.position.set(0, -0.08, -0.19);
    hair.add(nape);
  } else {
    // ── Feminine Chic Runway Lob / Sleek Bob ──
    // Voluminous crown
    const crownGeo = new THREE.SphereGeometry(0.25, 26, 22);
    crownGeo.scale(0.95, 1.05, 1.02);
    const crown = new THREE.Mesh(crownGeo, hairMat);
    crown.position.set(0, 0.05, -0.02);
    hair.add(crown);

    // Parted front bangs / side sweep
    const bangGeo = new THREE.CylinderGeometry(0.21, 0.24, 0.18, 20);
    bangGeo.scale(0.98, 0.9, 0.8);
    const bang = new THREE.Mesh(bangGeo, hairMat);
    bang.position.set(0, 0.13, 0.06);
    bang.rotation.x = 0.2;
    hair.add(bang);

    // Flowing hair strands framing the face and jawline down to shoulders
    [-1, 1].forEach((side) => {
      const strandGeo = new THREE.CylinderGeometry(0.05, 0.07, 0.42, 16);
      strandGeo.scale(0.8, 1.0, 1.2);
      const strand = new THREE.Mesh(strandGeo, hairMat);
      strand.position.set(side * 0.205, -0.10, 0.02);
      strand.rotation.z = side * -0.06;
      strand.rotation.x = 0.08;
      hair.add(strand);
    });

    // Cascading back hair curtain
    const backGeo = new THREE.CylinderGeometry(0.19, 0.24, 0.46, 24);
    backGeo.scale(1.15, 1.0, 0.6);
    const backHair = new THREE.Mesh(backGeo, hairMat);
    backHair.position.set(0, -0.12, -0.15);
    hair.add(backHair);
  }

  return hair;
}

/**
 * Builds realistic head with natural facial contours (forehead, brows, eyes,
 * eyelids, nose bridge/tip/nostrils, philtrum, upper/lower lips, chiseled/graceful jaw,
 * chin, ears, and styled hair).
 */
export function buildRealisticHumanHead(
  isMale: boolean,
  skinMat: THREE.Material,
  lipMat: THREE.Material,
  hairMat: THREE.Material
): THREE.Group {
  const headGroup = new THREE.Group();

  // 1. Cranium & Skull base
  const craniumGeo = new THREE.SphereGeometry(0.225, 32, 28);
  if (isMale) {
    craniumGeo.scale(0.88, 1.15, 0.98); // Stronger male skull
  } else {
    craniumGeo.scale(0.82, 1.16, 0.92); // Slender feminine oval
  }
  const cranium = new THREE.Mesh(craniumGeo, skinMat);
  cranium.position.set(0, 0, 0);
  headGroup.add(cranium);

  // 2. Forehead & Brow Ridge
  const browRidgeGeo = new THREE.BoxGeometry(isMale ? 0.26 : 0.22, 0.065, 0.09);
  const browRidge = new THREE.Mesh(browRidgeGeo, skinMat);
  browRidge.position.set(0, 0.07, 0.165);
  headGroup.add(browRidge);

  // Natural Eyebrows
  [-1, 1].forEach((side) => {
    const browGeo = new THREE.BoxGeometry(0.085, 0.016, 0.02);
    const brow = new THREE.Mesh(browGeo, hairMat);
    brow.position.set(side * 0.085, 0.08, 0.215);
    brow.rotation.z = side * (isMale ? -0.06 : -0.12);
    headGroup.add(brow);
  });

  // 3. Eyes & Orbital Sockets
  [-1, 1].forEach((side) => {
    const eye = createRealisticEye(0.023);
    eye.position.set(side * 0.075, 0.025, 0.185);
    eye.rotation.y = side * 0.08;
    headGroup.add(eye);

    // Upper eyelid contour
    const upperLidGeo = new THREE.TorusGeometry(0.024, 0.007, 10, 18, Math.PI);
    const upperLid = new THREE.Mesh(upperLidGeo, skinMat);
    upperLid.position.set(side * 0.075, 0.038, 0.198);
    upperLid.rotation.z = Math.PI;
    upperLid.rotation.x = -0.3;
    headGroup.add(upperLid);

    // Lower eyelid
    const lowerLidGeo = new THREE.TorusGeometry(0.022, 0.005, 8, 16, Math.PI);
    const lowerLid = new THREE.Mesh(lowerLidGeo, skinMat);
    lowerLid.position.set(side * 0.075, 0.012, 0.198);
    lowerLid.rotation.x = 0.25;
    headGroup.add(lowerLid);
  });

  // 4. Cheekbones
  [-1, 1].forEach((side) => {
    const cheekGeo = new THREE.SphereGeometry(isMale ? 0.075 : 0.07, 16, 14);
    cheekGeo.scale(0.9, 0.8, 0.6);
    const cheek = new THREE.Mesh(cheekGeo, skinMat);
    cheek.position.set(side * (isMale ? 0.125 : 0.11), -0.025, 0.145);
    headGroup.add(cheek);
  });

  // 5. Sculpted Nose: Bridge, Nasal Tip Bulb, and Nostril Wings
  const noseBridgeGeo = new THREE.CylinderGeometry(0.02, 0.025, 0.11, 14);
  noseBridgeGeo.scale(0.8, 1.0, 1.2);
  const noseBridge = new THREE.Mesh(noseBridgeGeo, skinMat);
  noseBridge.position.set(0, 0.01, 0.215);
  noseBridge.rotation.x = 0.24;
  headGroup.add(noseBridge);

  // Nose tip bulb
  const noseTipGeo = new THREE.SphereGeometry(isMale ? 0.026 : 0.022, 16, 14);
  const noseTip = new THREE.Mesh(noseTipGeo, skinMat);
  noseTip.position.set(0, -0.045, 0.238);
  headGroup.add(noseTip);

  // Nostril wings (alar crease)
  [-1, 1].forEach((side) => {
    const nostrilGeo = new THREE.SphereGeometry(0.015, 12, 10);
    const nostril = new THREE.Mesh(nostrilGeo, skinMat);
    nostril.position.set(side * 0.025, -0.048, 0.222);
    headGroup.add(nostril);
  });

  // 6. Philtrum & Mouth / Sculpted Lips
  // Upper Lip with subtle Cupid's bow contour
  const upperLipGeo = new THREE.CylinderGeometry(0.012, 0.015, isMale ? 0.072 : 0.068, 16);
  upperLipGeo.scale(1.0, 0.8, 1.4);
  const upperLip = new THREE.Mesh(upperLipGeo, lipMat);
  upperLip.rotation.z = Math.PI / 2;
  upperLip.position.set(0, -0.092, 0.212);
  headGroup.add(upperLip);

  // Lower Lip (fuller, curved)
  const lowerLipGeo = new THREE.CylinderGeometry(0.016, 0.014, isMale ? 0.068 : 0.064, 16);
  lowerLipGeo.scale(1.0, 0.9, 1.5);
  const lowerLip = new THREE.Mesh(lowerLipGeo, lipMat);
  lowerLip.rotation.z = Math.PI / 2;
  lowerLip.position.set(0, -0.118, 0.208);
  headGroup.add(lowerLip);

  // 7. Chin & Mandible / Jawline
  const chinGeo = new THREE.SphereGeometry(isMale ? 0.048 : 0.038, 18, 14);
  chinGeo.scale(isMale ? 1.25 : 1.0, 1.0, 1.1);
  const chin = new THREE.Mesh(chinGeo, skinMat);
  chin.position.set(0, -0.175, 0.178);
  headGroup.add(chin);

  // Chiseled / graceful jaw ramus
  [-1, 1].forEach((side) => {
    const jawGeo = new THREE.CylinderGeometry(0.03, 0.04, 0.14, 14);
    jawGeo.scale(0.8, 1.0, 1.4);
    const jaw = new THREE.Mesh(jawGeo, skinMat);
    jaw.position.set(side * (isMale ? 0.11 : 0.095), -0.13, 0.08);
    jaw.rotation.z = side * -0.55;
    jaw.rotation.x = -0.3;
    headGroup.add(jaw);
  });

  // 8. Anatomical Ears
  [-1, 1].forEach((side) => {
    const ear = createRealisticEar(skinMat, isMale);
    ear.position.set(side * (isMale ? 0.185 : 0.17), 0.01, -0.01);
    ear.rotation.y = side * (Math.PI / 2);
    headGroup.add(ear);
  });

  // 9. Styled Hair
  const styledHair = createStyledHair(isMale, hairMat);
  headGroup.add(styledHair);

  return headGroup;
}

/**
 * Builds realistic hand with natural 5-finger curl posture.
 */
function createRealisticHand(skinMat: THREE.Material, isMale: boolean, side: 1 | -1): THREE.Group {
  const hand = new THREE.Group();
  const scale = isMale ? 1.0 : 0.88;

  // Palm
  const palmGeo = new THREE.BoxGeometry(0.075 * scale, 0.09 * scale, 0.028 * scale);
  const palm = new THREE.Mesh(palmGeo, skinMat);
  palm.position.set(0, -0.045 * scale, 0);
  hand.add(palm);

  // Thumb
  const thumbGeo = new THREE.CylinderGeometry(0.012 * scale, 0.010 * scale, 0.05 * scale, 10);
  const thumb = new THREE.Mesh(thumbGeo, skinMat);
  thumb.position.set(side * -0.035 * scale, -0.03 * scale, 0.018 * scale);
  thumb.rotation.z = side * 0.45;
  thumb.rotation.x = 0.35;
  hand.add(thumb);

  // 4 Fingers (Index, Middle, Ring, Pinky) with gentle natural curl
  const fingerLengths = [0.065, 0.072, 0.068, 0.054];
  const fingerOffsets = [-0.024, -0.008, 0.008, 0.024];

  fingerLengths.forEach((len, idx) => {
    const xOff = fingerOffsets[idx] * scale;
    const fingerGeo = new THREE.CylinderGeometry(0.009 * scale, 0.007 * scale, len * scale, 10);
    const finger = new THREE.Mesh(fingerGeo, skinMat);
    // Curl slightly inward and forward
    finger.position.set(xOff, -0.115 * scale, 0.008 * scale);
    finger.rotation.x = 0.22 + idx * 0.04;
    hand.add(finger);
  });

  return hand;
}

/**
 * Builds realistic foot with natural ankle malleolus and toe contours.
 */
function createRealisticFoot(skinMat: THREE.Material, isMale: boolean): THREE.Group {
  const foot = new THREE.Group();
  const length = isMale ? 0.30 : 0.26;
  const width = isMale ? 0.12 : 0.10;

  // Heel and Arch
  const footBaseGeo = new THREE.BoxGeometry(width, 0.07, length);
  const footBase = new THREE.Mesh(footBaseGeo, skinMat);
  footBase.position.set(0, -0.035, 0.05);
  foot.add(footBase);

  // Ankle Malleolus (inner & outer ankle bone bumps)
  [-1, 1].forEach((side) => {
    const malleolusGeo = new THREE.SphereGeometry(0.022, 12, 10);
    const malleolus = new THREE.Mesh(malleolusGeo, skinMat);
    malleolus.position.set(side * (width * 0.52), 0.01, -0.02);
    foot.add(malleolus);
  });

  // Toe box
  const toeGeo = new THREE.CylinderGeometry(width * 0.48, width * 0.42, 0.05, 16);
  toeGeo.scale(1.0, 0.6, 1.3);
  const toe = new THREE.Mesh(toeGeo, skinMat);
  toe.position.set(0, -0.04, length * 0.45);
  foot.add(toe);

  return foot;
}

export interface BodyOcclusionConfig {
  hasTopOrOuterwear?: boolean;
  hasBottoms?: boolean;
  hasFootwear?: boolean;
  hasFullBodyOrDress?: boolean;
  occlusionMode?: OcclusionMode; // 'occlude' | 'xray' | 'allSkin'
}

/**
 * Builds the complete Realistic Human 3D Body Replica with natural anatomy,
 * authentic skin tone PBR shader, natural facial contours, styled hair,
 * relaxed contrapposto posture, and form-fitting skin occlusion architecture.
 */
export function buildRealisticHumanBody(
  gender: BodyGender,
  metrics: BodyMetrics,
  skinColorHex: string = '#f0c7a8',
  hairColorHex: string = '#2c1e17',
  occlusionConfig: BodyOcclusionConfig = { occlusionMode: 'occlude' }
): THREE.Group {
  const body = new THREE.Group();
  const isMale = gender === 'male';
  const { shoulderScale, chestScale, waistScale, hipScale } = metrics;
  const {
    hasTopOrOuterwear = false,
    hasBottoms = false,
    hasFootwear = false,
    hasFullBodyOrDress = false,
    occlusionMode = 'occlude',
  } = occlusionConfig;

  // Determine material based on occlusion mode
  let skinMat: THREE.Material;
  const isXRay = occlusionMode === 'xray';

  if (isXRay) {
    skinMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8, // Holographic cyan underlayer
      transparent: true,
      opacity: 0.38,
      roughness: 0.2,
      metalness: 0.1,
      wireframe: false,
    });
  } else {
    skinMat = createSkinMaterial(skinColorHex);
  }

  const lipMat = isXRay ? skinMat : createLipMaterial(skinColorHex);
  const hairMat = isXRay ? skinMat : createHairMaterial(hairColorHex);

  // Helper: check if a body segment should be hidden due to tight form-fitting costume occlusion
  const shouldOccludeTorso = occlusionMode === 'occlude' && (hasTopOrOuterwear || hasFullBodyOrDress);
  const shouldOccludePelvis = occlusionMode === 'occlude' && (hasBottoms || hasFullBodyOrDress);
  const shouldOccludeThighs = occlusionMode === 'occlude' && (hasBottoms || hasFullBodyOrDress);
  const shouldOccludeFeet = occlusionMode === 'occlude' && hasFootwear;

  // ─────────────────────────────────────────────────────────────
  // 1. HEAD & FACE WITH FACIAL CONTOURS & HAIR
  // ─────────────────────────────────────────────────────────────
  const head = buildRealisticHumanHead(isMale, skinMat, lipMat, hairMat);
  // Natural slight runway head tilt (~2° tilt, subtle fashion presence)
  head.position.set(0.015, 4.02, 0.01);
  head.rotation.y = 0.05;
  head.rotation.z = -0.025;
  body.add(head);

  // ─────────────────────────────────────────────────────────────
  // 2. NECK & CLAVICLES
  // ─────────────────────────────────────────────────────────────
  const neckRadiusTop = isMale ? 0.11 : 0.092;
  const neckRadiusBottom = isMale ? 0.13 : 0.108;
  const neckGeo = new THREE.CylinderGeometry(neckRadiusTop, neckRadiusBottom, 0.36, 24);
  const neck = new THREE.Mesh(neckGeo, skinMat);
  neck.position.set(0.008, 3.66, 0.005);
  neck.rotation.z = -0.015;
  body.add(neck);

  // Realistic Clavicles / Collarbone ridge
  const collarSpan = (isMale ? 0.44 : 0.38) * shoulderScale;
  [-1, 1].forEach((side) => {
    const clavicleGeo = new THREE.CylinderGeometry(0.014, 0.012, collarSpan * 0.48, 12);
    const clavicle = new THREE.Mesh(clavicleGeo, skinMat);
    clavicle.position.set(side * (collarSpan * 0.28), 3.49, 0.11);
    clavicle.rotation.z = side * 0.18;
    clavicle.rotation.x = 0.1;
    body.add(clavicle);
  });

  // ─────────────────────────────────────────────────────────────
  // 3. TORSO: CHEST, RIBCAGE, WAIST, AND PELVIS (CONTRAPPOSTO CURVE)
  // ─────────────────────────────────────────────────────────────
  const chestWidth = (isMale ? 0.46 : 0.38) * chestScale;
  const chestDepth = (isMale ? 0.28 : 0.29) * chestScale;
  const waistWidth = (isMale ? 0.36 : 0.27) * waistScale;
  const waistDepth = (isMale ? 0.23 : 0.20) * waistScale;
  const hipWidth = (isMale ? 0.37 : 0.43) * hipScale;
  const hipDepth = (isMale ? 0.25 : 0.28) * hipScale;

  // Upper Chest / Pectorals
  if (!shouldOccludeTorso) {
    const upperChestGeo = new THREE.CylinderGeometry(chestWidth * 1.04, chestWidth, 0.45, 32);
    upperChestGeo.scale(1.0, 1.0, chestDepth / chestWidth);
    const upperChest = new THREE.Mesh(upperChestGeo, skinMat);
    upperChest.position.set(0, 3.32, 0);
    // Counter-tilt for shoulders to balance the hip contrapposto
    upperChest.rotation.z = 0.02;
    body.add(upperChest);

    if (!isMale) {
      // Feminine natural bust contours with soft teardrop volume
      [-1, 1].forEach((side) => {
        const bustGeo = new THREE.SphereGeometry(0.132 * chestScale, 26, 22);
        bustGeo.scale(1.0, 1.1, 1.16);
        const bust = new THREE.Mesh(bustGeo, skinMat);
        bust.position.set(side * (0.12 * chestScale), 3.28, 0.125 * chestScale);
        bust.rotation.z = side * -0.06;
        body.add(bust);
      });
    } else {
      // Masculine defined pectoral plates with realistic muscular curve
      [-1, 1].forEach((side) => {
        const pecGeo = new THREE.BoxGeometry(0.185 * chestScale, 0.22 * chestScale, 0.065);
        pecGeo.scale(1.0, 1.0, 1.0);
        const pec = new THREE.Mesh(pecGeo, skinMat);
        pec.position.set(side * (0.11 * chestScale), 3.30, 0.135 * chestScale);
        pec.rotation.z = side * -0.08;
        body.add(pec);
      });
    }

    // Mid Torso / Ribcage
    const midTorsoGeo = new THREE.CylinderGeometry(chestWidth, waistWidth, 0.42, 32);
    midTorsoGeo.scale(1.0, 1.0, (chestDepth + waistDepth) / (2 * (chestWidth + waistWidth)));
    const midTorso = new THREE.Mesh(midTorsoGeo, skinMat);
    midTorso.position.set(0.005, 2.90, 0);
    body.add(midTorso);

    // Waist & Natural Abdominal Line
    const waistGeo = new THREE.CylinderGeometry(waistWidth, waistWidth * 1.05, 0.36, 32);
    waistGeo.scale(1.0, 1.0, waistDepth / waistWidth);
    const waist = new THREE.Mesh(waistGeo, skinMat);
    waist.position.set(0.01, 2.53, 0);
    body.add(waist);
  }

  // Pelvis & Hips (Contrapposto hip tilt: left hip slightly lower)
  if (!shouldOccludePelvis) {
    const pelvisGeo = new THREE.CylinderGeometry(waistWidth * 1.05, hipWidth, 0.45, 32);
    pelvisGeo.scale(1.0, 1.0, hipDepth / hipWidth);
    const pelvis = new THREE.Mesh(pelvisGeo, skinMat);
    pelvis.position.set(0.015, 2.15, 0);
    pelvis.rotation.z = -0.035; // Hip tilt
    body.add(pelvis);
  }

  // ─────────────────────────────────────────────────────────────
  // 4. ARMS: NATURAL RELAXED CARRIAGE WITH 5-FINGER HANDS
  // ─────────────────────────────────────────────────────────────
  const shoulderSpan = (isMale ? 0.62 : 0.50) * shoulderScale;
  const armThickness = isMale ? 0.086 : 0.066;

  // Right Arm (Resting along straight supporting side)
  const rightArmGroup = new THREE.Group();
  {
    // Deltoid
    const deltoidGeo = new THREE.SphereGeometry(armThickness * 1.25, 20, 16);
    deltoidGeo.scale(1.0, 1.2, 0.95);
    const deltoid = new THREE.Mesh(deltoidGeo, skinMat);
    rightArmGroup.add(deltoid);

    // Bicep / Upper arm
    const bicepGeo = new THREE.CylinderGeometry(armThickness * 1.04, armThickness * 0.90, 0.68, 20);
    const bicep = new THREE.Mesh(bicepGeo, skinMat);
    bicep.position.set(0, -0.34, 0);
    rightArmGroup.add(bicep);

    // Elbow
    const elbowGeo = new THREE.SphereGeometry(armThickness * 0.88, 16, 14);
    const elbow = new THREE.Mesh(elbowGeo, skinMat);
    elbow.position.set(0, -0.68, 0.01);
    rightArmGroup.add(elbow);

    // Forearm
    const forearmGeo = new THREE.CylinderGeometry(armThickness * 0.88, armThickness * 0.72, 0.62, 20);
    const forearm = new THREE.Mesh(forearmGeo, skinMat);
    forearm.position.set(0, -1.0, 0.03);
    forearm.rotation.x = 0.08;
    rightArmGroup.add(forearm);

    // 5-digit hand
    const hand = createRealisticHand(skinMat, isMale, 1);
    hand.position.set(0, -1.34, 0.06);
    rightArmGroup.add(hand);

    rightArmGroup.position.set(shoulderSpan, 3.44, 0);
    rightArmGroup.rotation.z = -0.12;
    rightArmGroup.rotation.x = 0.05;
    body.add(rightArmGroup);
  }

  // Left Arm (Relaxed bent fashion pose, hovering naturally near hip)
  const leftArmGroup = new THREE.Group();
  {
    const deltoidGeo = new THREE.SphereGeometry(armThickness * 1.25, 20, 16);
    deltoidGeo.scale(1.0, 1.2, 0.95);
    const deltoid = new THREE.Mesh(deltoidGeo, skinMat);
    leftArmGroup.add(deltoid);

    const bicepGeo = new THREE.CylinderGeometry(armThickness * 1.04, armThickness * 0.90, 0.68, 20);
    const bicep = new THREE.Mesh(bicepGeo, skinMat);
    bicep.position.set(0, -0.34, 0);
    leftArmGroup.add(bicep);

    const elbowGeo = new THREE.SphereGeometry(armThickness * 0.88, 16, 14);
    const elbow = new THREE.Mesh(elbowGeo, skinMat);
    elbow.position.set(0, -0.68, 0.01);
    leftArmGroup.add(elbow);

    const forearmGeo = new THREE.CylinderGeometry(armThickness * 0.88, armThickness * 0.72, 0.62, 20);
    const forearm = new THREE.Mesh(forearmGeo, skinMat);
    forearm.position.set(0, -1.0, 0.04);
    forearm.rotation.x = 0.16;
    forearm.rotation.z = 0.06;
    leftArmGroup.add(forearm);

    const hand = createRealisticHand(skinMat, isMale, -1);
    hand.position.set(0, -1.34, 0.08);
    leftArmGroup.add(hand);

    leftArmGroup.position.set(-shoulderSpan, 3.42, 0);
    leftArmGroup.rotation.z = 0.16;
    leftArmGroup.rotation.x = 0.08;
    body.add(leftArmGroup);
  }

  // ─────────────────────────────────────────────────────────────
  // 5. LEGS: CONTRAPPOSTO STANCE (RIGHT SUPPORT, LEFT RELAXED FLEX)
  // ─────────────────────────────────────────────────────────────
  const legSpacing = (isMale ? 0.22 : 0.19) * hipScale;
  const thighThickness = isMale ? 0.155 : 0.135;
  const calfThickness = isMale ? 0.115 : 0.095;

  // Right Leg (Planted supporting leg, carries main weight)
  const rightLegGroup = new THREE.Group();
  {
    // Thigh
    if (!shouldOccludeThighs) {
      const thighGeo = new THREE.CylinderGeometry(thighThickness * 1.08, thighThickness * 0.88, 0.95, 24);
      const thigh = new THREE.Mesh(thighGeo, skinMat);
      thigh.position.set(0, -0.47, 0);
      rightLegGroup.add(thigh);
    }

    // Knee
    if (!shouldOccludeThighs) {
      const kneeGeo = new THREE.SphereGeometry(thighThickness * 0.82, 18, 16);
      const knee = new THREE.Mesh(kneeGeo, skinMat);
      knee.position.set(0, -0.96, 0.02);
      rightLegGroup.add(knee);
    }

    // Calf
    if (!shouldOccludeThighs) {
      const calfGeo = new THREE.CylinderGeometry(thighThickness * 0.82, calfThickness * 0.78, 0.96, 24);
      const calf = new THREE.Mesh(calfGeo, skinMat);
      calf.position.set(0, -1.45, 0);
      rightLegGroup.add(calf);
    }

    // Foot
    if (!shouldOccludeFeet) {
      const foot = createRealisticFoot(skinMat, isMale);
      foot.position.set(0, -1.94, 0.02);
      foot.rotation.y = 0.08;
      rightLegGroup.add(foot);
    }

    rightLegGroup.position.set(legSpacing * 0.95, 1.95, 0);
    rightLegGroup.rotation.z = -0.02;
    body.add(rightLegGroup);
  }

  // Left Leg (Free relaxed leg, slight knee bend forward)
  const leftLegGroup = new THREE.Group();
  {
    // Thigh
    if (!shouldOccludeThighs) {
      const thighGeo = new THREE.CylinderGeometry(thighThickness * 1.08, thighThickness * 0.88, 0.95, 24);
      const thigh = new THREE.Mesh(thighGeo, skinMat);
      thigh.position.set(0, -0.47, 0);
      leftLegGroup.add(thigh);
    }

    // Knee flexed forward
    if (!shouldOccludeThighs) {
      const kneeGeo = new THREE.SphereGeometry(thighThickness * 0.82, 18, 16);
      const knee = new THREE.Mesh(kneeGeo, skinMat);
      knee.position.set(0, -0.96, 0.04);
      leftLegGroup.add(knee);
    }

    // Calf
    if (!shouldOccludeThighs) {
      const calfGeo = new THREE.CylinderGeometry(thighThickness * 0.82, calfThickness * 0.78, 0.96, 24);
      const calf = new THREE.Mesh(calfGeo, skinMat);
      calf.position.set(0, -1.45, 0.02);
      calf.rotation.x = -0.06;
      leftLegGroup.add(calf);
    }

    // Foot turned out slightly
    if (!shouldOccludeFeet) {
      const foot = createRealisticFoot(skinMat, isMale);
      foot.position.set(0, -1.94, 0.06);
      foot.rotation.y = -0.14;
      foot.rotation.x = -0.04;
      leftLegGroup.add(foot);
    }

    leftLegGroup.position.set(-legSpacing * 1.08, 1.95, 0);
    leftLegGroup.rotation.x = 0.08;
    leftLegGroup.rotation.z = 0.04;
    body.add(leftLegGroup);
  }

  return body;
}

/**
 * Backward compatibility alias for existing code calling buildAnatomicalBodyReplica.
 */
export function buildAnatomicalBodyReplica(
  gender: BodyGender,
  metrics: BodyMetrics,
  finish: MannequinFinish = 'skin',
  skinColorHex?: string,
  hairColorHex?: string
): THREE.Group {
  let effectiveSkinHex = skinColorHex || '#f0c7a8';
  let effectiveHairHex = hairColorHex || '#2c1e17';

  if (finish === 'obsidian') {
    effectiveSkinHex = '#1c1f26';
    effectiveHairHex = '#12141a';
  } else if (finish === 'alabaster') {
    effectiveSkinHex = '#f5ede4';
    effectiveHairHex = '#eae0d5';
  } else if (finish === 'bronze') {
    effectiveSkinHex = '#6e4933';
    effectiveHairHex = '#422818';
  }

  return buildRealisticHumanBody(gender, metrics, effectiveSkinHex, effectiveHairHex);
}

/**
 * Helper: Creates realistic buttons down the garment center placket.
 */
function createPlacketButtons(
  count: number,
  startY: number,
  endY: number,
  zPos: number,
  isMetallic: boolean
): THREE.Group {
  const group = new THREE.Group();
  const step = (startY - endY) / (count - 1);

  const buttonMat = new THREE.MeshStandardMaterial({
    color: isMetallic ? 0xd4af37 : 0x221a14, // Gold or horn/tortoiseshell
    roughness: isMetallic ? 0.18 : 0.42,
    metalness: isMetallic ? 0.92 : 0.12,
  });

  for (let i = 0; i < count; i++) {
    const y = startY - i * step;
    // Outer button rim
    const buttonGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.007, 18);
    buttonGeo.rotateX(Math.PI / 2);
    const button = new THREE.Mesh(buttonGeo, buttonMat);
    button.position.set(0, y, zPos);
    group.add(button);

    // Inner thread accent
    const threadGeo = new THREE.BoxGeometry(0.008, 0.004, 0.002);
    const threadMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const thread = new THREE.Mesh(threadGeo, threadMat);
    thread.position.set(0, y, zPos + 0.004);
    group.add(thread);
  }

  return group;
}

/**
 * Helper: Creates dimensional metallic zipper track with slider pull-tab.
 */
function createZipperHardware(
  startY: number,
  endY: number,
  zPos: number
): THREE.Group {
  const group = new THREE.Group();
  const length = startY - endY;
  const centerY = (startY + endY) / 2;

  // Zipper track tape
  const trackGeo = new THREE.PlaneGeometry(0.026, length);
  const trackMat = new THREE.MeshStandardMaterial({
    map: getZipperTrackTexture(),
    roughness: 0.35,
    metalness: 0.75,
    side: THREE.DoubleSide,
  });
  const track = new THREE.Mesh(trackGeo, trackMat);
  track.position.set(0, centerY, zPos);
  group.add(track);

  // Metallic slider pull-tab
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    roughness: 0.18,
    metalness: 0.95,
  });

  const sliderBodyGeo = new THREE.BoxGeometry(0.024, 0.034, 0.016);
  const sliderBody = new THREE.Mesh(sliderBodyGeo, metalMat);
  const sliderY = startY - length * 0.35;
  sliderBody.position.set(0, sliderY, zPos + 0.008);
  group.add(sliderBody);

  const pullTabGeo = new THREE.BoxGeometry(0.014, 0.048, 0.004);
  const pullTab = new THREE.Mesh(pullTabGeo, metalMat);
  pullTab.position.set(0, sliderY - 0.032, zPos + 0.012);
  pullTab.rotation.x = 0.15;
  group.add(pullTab);

  return group;
}

/**
 * Helper: Creates tailored belt with 5 loops and metallic buckle.
 */
function createTailoredBeltAndBuckle(
  waistWidth: number,
  waistDepth: number,
  waistY: number,
  isMale: boolean
): THREE.Group {
  const group = new THREE.Group();

  // Leather belt strap
  const beltGeo = new THREE.CylinderGeometry(waistWidth + 0.018, waistWidth + 0.018, 0.065, 32);
  beltGeo.scale(1.0, 1.0, waistDepth / waistWidth);
  const beltMat = new THREE.MeshStandardMaterial({
    color: isMale ? 0x221811 : 0xd4af37, // Espresso leather for men, metallic gold for women
    roughness: isMale ? 0.38 : 0.22,
    metalness: isMale ? 0.08 : 0.85,
  });
  const beltMesh = new THREE.Mesh(beltGeo, beltMat);
  beltMesh.position.set(0.01, waistY, 0);
  group.add(beltMesh);

  // Metallic Prong Buckle at front center
  const buckleGroup = new THREE.Group();
  const buckleFrameGeo = new THREE.BoxGeometry(0.075, 0.075, 0.012);
  const buckleFrameMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37, // Polished brass / gold
    roughness: 0.15,
    metalness: 0.95,
  });
  const buckleFrame = new THREE.Mesh(buckleFrameGeo, buckleFrameMat);
  buckleGroup.add(buckleFrame);

  // Inner cutout backplate
  const buckleHoleGeo = new THREE.BoxGeometry(0.052, 0.052, 0.014);
  const buckleHoleMat = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.4,
  });
  const buckleHole = new THREE.Mesh(buckleHoleGeo, buckleHoleMat);
  buckleGroup.add(buckleHole);

  // Center prong pin
  const prongGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.058, 8);
  const prong = new THREE.Mesh(prongGeo, buckleFrameMat);
  buckleGroup.add(prong);

  buckleGroup.position.set(0.01, waistY, (waistDepth + 0.022));
  group.add(buckleGroup);

  // 5 Belt loops
  const loopMat = new THREE.MeshStandardMaterial({
    color: isMale ? 0x1b2838 : 0x242428,
    roughness: 0.65,
  });
  const loopAngles = [-0.65, -0.3, 0.3, 0.65, Math.PI]; // front-left, mid-left, mid-right, front-right, center-back
  loopAngles.forEach((angle) => {
    const loopGeo = new THREE.BoxGeometry(0.012, 0.072, 0.008);
    const loop = new THREE.Mesh(loopGeo, loopMat);
    const lx = Math.sin(angle) * (waistWidth + 0.02);
    const lz = Math.cos(angle) * (waistDepth + 0.02);
    loop.position.set(lx + 0.01, waistY, lz);
    loop.rotation.y = angle;
    group.add(loop);
  });

  return group;
}

/**
 * Builds all selected outfit garments tailored with millimeter precision,
 * authentic PBR textile textures (denim, cotton, silk, wool, leather, knit),
 * structural collars, lapels, zippers, buttons, seams, and fit drape modes.
 */
export function buildTailoredGarments(
  look: OutfitLook,
  gender: BodyGender,
  metrics: BodyMetrics,
  selectedLayerIds: string[],
  tailoringOptions: GarmentTailoringOptions = DEFAULT_TAILORING_OPTIONS
): THREE.Group {
  const garmentsGroup = new THREE.Group();
  const isMale = gender === 'male';
  const { shoulderScale, chestScale, waistScale, hipScale } = metrics;

  // Retrieve fit silhouette profile
  const profile = SILHOUETTE_PROFILES[tailoringOptions.silhouette] || SILHOUETTE_PROFILES.regular;
  const { torsoEase, shoulderDrop, sleeveWidthMul, waistGather, trouserWidthMul, hemLengthOffset } = profile;

  // Extract color palette helper
  const palette = look.colorPalette || [];
  const getLayerColor = (item: ClothingItem, defaultHex: number): number => {
    const itemDesc = `${item.name} ${item.color} ${item.description}`.toLowerCase();
    const match = palette.find((p) => itemDesc.includes(p.name.toLowerCase()));
    if (match) {
      return parseInt(match.hex.replace('#', '0x'), 16);
    }
    if (item.color) {
      const c = item.color.toLowerCase();
      if (c.includes('black') || c.includes('noir') || c.includes('charcoal')) return 0x15171d;
      if (c.includes('white') || c.includes('ivory') || c.includes('cream')) return 0xf8f6f0;
      if (c.includes('gold') || c.includes('champagne')) return 0xd4af37;
      if (c.includes('navy') || c.includes('blue')) return 0x1a2f4c;
      if (c.includes('emerald') || c.includes('green') || c.includes('olive')) return 0x184234;
      if (c.includes('burgundy') || c.includes('wine') || c.includes('red') || c.includes('crimson')) return 0x6e1d2c;
      if (c.includes('rose') || c.includes('pink') || c.includes('blush')) return 0xdb8d87;
      if (c.includes('grey') || c.includes('silver')) return 0x868e98;
      if (c.includes('brown') || c.includes('cognac') || c.includes('camel') || c.includes('tan')) return 0x6e472a;
    }
    return defaultHex;
  };

  const chestRadius = (isMale ? 0.46 : 0.38) * chestScale;
  const chestDepth = (isMale ? 0.28 : 0.29) * chestScale;
  const waistRadius = (isMale ? 0.36 : 0.28) * waistScale;
  const waistDepth = (isMale ? 0.23 : 0.20) * waistScale;
  const hipRadius = (isMale ? 0.37 : 0.42) * hipScale;
  const hipDepth = (isMale ? 0.25 : 0.28) * hipScale;
  const shoulderSpan = ((isMale ? 0.62 : 0.50) + shoulderDrop) * shoulderScale;
  const legSpacing = (isMale ? 0.22 : 0.19) * hipScale;

  const tryOnProgress = tailoringOptions.tryOnProgress !== undefined ? tailoringOptions.tryOnProgress : 1.0;
  const showFitTension = tailoringOptions.showFitTension || false;

  // Cubic easing function for smooth organic slide and settle
  const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  // Compute try-on sequence phases:
  // Phase 1 (0.00 - 0.40): Inner tops slide down over head & neck
  // Phase 2 (0.25 - 0.65): Bottoms slide up legs and snap into waist
  // Phase 3 (0.50 - 0.85): Outerwear / Jackets / Sleeves extend & form-fit
  // Phase 4 (0.75 - 1.00): Shoes lock onto feet, waistband cinches tight
  const topAnimT = easeInOutCubic(Math.min(1.0, Math.max(0.0, (tryOnProgress - 0.05) / 0.45)));
  const bottomAnimT = easeInOutCubic(Math.min(1.0, Math.max(0.0, (tryOnProgress - 0.20) / 0.45)));
  const outerAnimT = easeInOutCubic(Math.min(1.0, Math.max(0.0, (tryOnProgress - 0.45) / 0.45)));
  const shoeAnimT = easeInOutCubic(Math.min(1.0, Math.max(0.0, (tryOnProgress - 0.65) / 0.35)));

  look.items.forEach((item) => {
    if (selectedLayerIds.length > 0 && !selectedLayerIds.includes(item.id)) {
      return;
    }

    const cat = item.category.toLowerCase();
    const colorHex = getLayerColor(item, 0xc5a059);
    const fabricType = detectFabricType(item.name, item.description, item.silhouette);

    // Choose material: Fit Tension Heatmap OR Authentic PBR Fabric
    const garmentMat = showFitTension
      ? createFitTensionMaterial(tailoringOptions.silhouette === 'slim' ? 'snug' : tailoringOptions.silhouette === 'relaxed' ? 'relaxed' : 'perfect')
      : createPBRFabricMaterial(colorHex, fabricType);

    // ─────────────────────────────────────────────────────────────
    // 1. OUTERWEAR / BLAZER / SHIRT / JACKET / TOP
    // ─────────────────────────────────────────────────────────────
    if (
      cat === 'outerwear' ||
      cat === 'top' ||
      cat === 'jacket' ||
      cat === 'blazer' ||
      cat === 'full-body'
    ) {
      const isBlazer =
        item.silhouette.toLowerCase().includes('blazer') ||
        item.name.toLowerCase().includes('blazer') ||
        item.name.toLowerCase().includes('suit') ||
        item.description.toLowerCase().includes('suit') ||
        cat === 'outerwear';

      const isShirt =
        item.name.toLowerCase().includes('shirt') ||
        item.name.toLowerCase().includes('button') ||
        item.description.toLowerCase().includes('collar');

      const isZipperJacket =
        item.name.toLowerCase().includes('bomber') ||
        item.name.toLowerCase().includes('leather') ||
        item.name.toLowerCase().includes('zip') ||
        item.name.toLowerCase().includes('jacket') && !isBlazer;

      // Precision anatomical clearance over torso
      const ease = torsoEase + (isBlazer ? 0.035 : 0.015);
      const topTopRadius = (chestRadius + ease) * 1.05;
      const topBottomRadius = (waistRadius + ease) * waistGather * 1.03;

      const isTucked = tailoringOptions.tuckStyle === 'tucked' && !isBlazer;
      const jacketLength = (isBlazer ? (isMale ? 1.08 : 0.98) : isTucked ? 0.72 : 0.88) + hemLengthOffset;
      const jacketCenterY = isTucked ? 3.18 : (isBlazer ? 3.03 : 3.10);

      // Choose animation factor (blazers use outerAnimT, shirts/inner tops use topAnimT)
      const currentAnimT = isBlazer ? outerAnimT : topAnimT;
      // Garment animation group: slides down from y + 0.35, expands radially then snaps snug
      const topGroup = new THREE.Group();
      topGroup.position.y = (1.0 - currentAnimT) * 0.45;
      const initialRadialScale = 1.0 + (1.0 - currentAnimT) * 0.22;
      topGroup.scale.set(initialRadialScale, 1.0, initialRadialScale);
      garmentsGroup.add(topGroup);

      // Main Torso Cylinder
      const topGeo = new THREE.CylinderGeometry(topTopRadius, topBottomRadius, jacketLength, 40);
      topGeo.scale(1.16, 1.0, (chestDepth + ease) / chestRadius);
      const topMesh = new THREE.Mesh(topGeo, garmentMat);
      topMesh.position.set(0.005, jacketCenterY, 0);
      topMesh.rotation.z = 0.015;
      topGroup.add(topMesh);

      // ─────────────────────────────────────────────────────────
      // A. TAILORED NOTCHED LAPELS (BLAZERS & SUIT JACKETS)
      // ─────────────────────────────────────────────────────────
      if (isBlazer) {
        // High-sheen silk lapel facing or rich wool lapel
        const lapelMat = createPBRFabricMaterial(colorHex, fabricType === 'wool' ? 'wool' : 'silk');
        const lapelWidth = isMale ? 0.17 : 0.14;
        const lapelHeight = isMale ? 0.68 : 0.60;

        [-1, 1].forEach((side) => {
          // Upper Collar Stand
          const collarStandGeo = new THREE.CylinderGeometry(0.18, 0.19, 0.14, 18, 1, false, 0, Math.PI);
          const collarStand = new THREE.Mesh(collarStandGeo, lapelMat);
          collarStand.position.set(0.008, 3.65, -0.01);
          topGroup.add(collarStand);

          // Folded Lapel Blade
          const lapelGeo = new THREE.BoxGeometry(lapelWidth, lapelHeight, 0.028);
          const lapel = new THREE.Mesh(lapelGeo, lapelMat);
          lapel.position.set(
            side * (0.17 * chestScale),
            3.28,
            chestDepth + ease + 0.02
          );
          lapel.rotation.z = side * -0.22;
          lapel.rotation.y = side * 0.12;
          topGroup.add(lapel);

          // Notched Lapel Corner Accent (Gorge cut)
          const notchGeo = new THREE.ConeGeometry(0.035, 0.06, 4);
          notchGeo.rotateZ(side * 0.8);
          const notch = new THREE.Mesh(notchGeo, lapelMat);
          notch.position.set(side * (0.24 * chestScale), 3.46, chestDepth + ease + 0.03);
          topGroup.add(notch);

          // Structured Shoulder Caps
          const padGeo = new THREE.CylinderGeometry(0.14, 0.15, 0.20, 20);
          padGeo.scale(1.22, 0.55, 1.0);
          const pad = new THREE.Mesh(padGeo, garmentMat);
          pad.position.set(side * (shoulderSpan + 0.02), 3.50, 0);
          pad.rotation.z = side * -0.2;
          topGroup.add(pad);

          // Twin Lower Flap Pockets
          if (tailoringOptions.showHardware) {
            const pocketFlapGeo = new THREE.BoxGeometry(0.16, 0.042, 0.022);
            const pocketFlap = new THREE.Mesh(pocketFlapGeo, garmentMat);
            pocketFlap.position.set(side * (0.26 * chestScale), 2.72, chestDepth + ease + 0.01);
            pocketFlap.rotation.z = side * -0.06;
            topGroup.add(pocketFlap);
          }
        });

        // Left Breast Welt Pocket with Pocket Square
        if (tailoringOptions.showHardware) {
          const weltGeo = new THREE.BoxGeometry(0.12, 0.026, 0.016);
          const welt = new THREE.Mesh(weltGeo, garmentMat);
          welt.position.set(0.17 * chestScale, 3.32, chestDepth + ease + 0.024);
          welt.rotation.z = -0.08;
          topGroup.add(welt);

          // Silk White Pocket Square peek
          const squareGeo = new THREE.ConeGeometry(0.032, 0.045, 3);
          const squareMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.18,
            metalness: 0.1,
          });
          const pocketSquare = new THREE.Mesh(squareGeo, squareMat);
          pocketSquare.position.set(0.17 * chestScale, 3.36, chestDepth + ease + 0.026);
          pocketSquare.rotation.z = 0.2;
          topGroup.add(pocketSquare);
        }

        // Blazer Front Buttons (2-button single breasted closure)
        if (tailoringOptions.showHardware) {
          const buttons = createPlacketButtons(2, 3.02, 2.82, chestDepth + ease + 0.028, isMale);
          topGroup.add(buttons);
        }
      }

      // ─────────────────────────────────────────────────────────
      // B. CRISP SHIRT COLLAR & PLACKET WITH BUTTONS
      // ─────────────────────────────────────────────────────────
      else if (isShirt) {
        // Stand Collar Ring
        const standMat = createPBRFabricMaterial(colorHex, fabricType);
        const standGeo = new THREE.CylinderGeometry(0.13, 0.14, 0.075, 24);
        const stand = new THREE.Mesh(standGeo, standMat);
        stand.position.set(0.008, 3.68, 0.005);
        stand.rotation.z = -0.015;
        topGroup.add(stand);

        // Folded Spread Collar Wings
        [-1, 1].forEach((side) => {
          const collarPointGeo = new THREE.BoxGeometry(0.10, 0.065, 0.016);
          const collarPoint = new THREE.Mesh(collarPointGeo, standMat);
          collarPoint.position.set(side * 0.09, 3.63, 0.12);
          collarPoint.rotation.z = side * -0.45;
          collarPoint.rotation.y = side * 0.35;
          collarPoint.rotation.x = 0.25;
          topGroup.add(collarPoint);
        });

        // Center Placket Strip
        const placketGeo = new THREE.BoxGeometry(0.042, jacketLength, 0.014);
        const placket = new THREE.Mesh(placketGeo, standMat);
        placket.position.set(0.005, jacketCenterY, chestDepth + ease + 0.01);
        topGroup.add(placket);

        // Vertical 5-button row
        if (tailoringOptions.showHardware) {
          const buttons = createPlacketButtons(5, 3.52, 2.76, chestDepth + ease + 0.02, false);
          topGroup.add(buttons);
        }
      }

      // ─────────────────────────────────────────────────────────
      // C. CASUAL ZIPPER JACKET / BOMBER HARDWARE
      // ─────────────────────────────────────────────────────────
      else if (isZipperJacket && tailoringOptions.showHardware) {
        const zipper = createZipperHardware(3.50, 2.70, chestDepth + ease + 0.018);
        topGroup.add(zipper);
      }

      // ─────────────────────────────────────────────────────────
      // D. CREWNECK / ROLLNECK KNIT COLLAR BAND
      // ─────────────────────────────────────────────────────────
      else {
        const neckBandGeo = new THREE.TorusGeometry(0.138, 0.022, 16, 32);
        neckBandGeo.scale(1.0, 0.7, 1.15);
        const neckBandMat = createPBRFabricMaterial(colorHex, 'knit');
        const neckBand = new THREE.Mesh(neckBandGeo, neckBandMat);
        neckBand.position.set(0.008, 3.62, 0.01);
        neckBand.rotation.x = Math.PI / 2.3;
        topGroup.add(neckBand);
      }

      // ─────────────────────────────────────────────────────────
      // E. TAILORED SLEEVES WITH FIT SILHOUETTE & CUFFS
      // ─────────────────────────────────────────────────────────
      const isRolled = tailoringOptions.sleeveStyle === 'rolled' && !isBlazer;
      const sleeveRadiusTop = (isMale ? 0.13 : 0.10) * sleeveWidthMul;
      const sleeveRadiusBottom = (isMale ? 0.10 : 0.08) * sleeveWidthMul;
      const sleeveLength = (isRolled ? (isMale ? 0.52 : 0.46) : (isMale ? 0.92 : 0.84));
      const sleeveCenterY = isRolled ? 3.22 : 3.08;

      // Right Sleeve (Straight natural drape)
      {
        const rightSleeveGeo = new THREE.CylinderGeometry(
          sleeveRadiusTop,
          isRolled ? sleeveRadiusTop * 1.05 : sleeveRadiusBottom,
          sleeveLength,
          24
        );
        const rightSleeve = new THREE.Mesh(rightSleeveGeo, garmentMat);
        rightSleeve.position.set(shoulderSpan + 0.02, sleeveCenterY, 0);
        rightSleeve.rotation.z = -0.12;
        topGroup.add(rightSleeve);

        // Folded Cuff or Tailored Sleeve Cuff
        const cuffGeo = new THREE.CylinderGeometry(
          (isRolled ? sleeveRadiusTop * 1.12 : sleeveRadiusBottom * 1.08),
          (isRolled ? sleeveRadiusTop * 1.08 : sleeveRadiusBottom * 1.04),
          isRolled ? 0.09 : 0.065,
          24
        );
        const rightCuff = new THREE.Mesh(cuffGeo, garmentMat);
        rightCuff.position.set(
          shoulderSpan + 0.02 + (sleeveLength * 0.48 * Math.sin(0.12)),
          sleeveCenterY - (sleeveLength * 0.48 * Math.cos(0.12)),
          0
        );
        rightCuff.rotation.z = -0.12;
        topGroup.add(rightCuff);
      }

      // Left Sleeve (Relaxed fashion bend drape)
      {
        const leftSleeveGeo = new THREE.CylinderGeometry(
          sleeveRadiusTop,
          isRolled ? sleeveRadiusTop * 1.05 : sleeveRadiusBottom,
          sleeveLength,
          24
        );
        const leftSleeve = new THREE.Mesh(leftSleeveGeo, garmentMat);
        leftSleeve.position.set(-shoulderSpan - 0.02, sleeveCenterY, 0);
        leftSleeve.rotation.z = 0.15;
        topGroup.add(leftSleeve);

        const cuffGeo = new THREE.CylinderGeometry(
          (isRolled ? sleeveRadiusTop * 1.12 : sleeveRadiusBottom * 1.08),
          (isRolled ? sleeveRadiusTop * 1.08 : sleeveRadiusBottom * 1.04),
          isRolled ? 0.09 : 0.065,
          24
        );
        const leftCuff = new THREE.Mesh(cuffGeo, garmentMat);
        leftCuff.position.set(
          -shoulderSpan - 0.02 - (sleeveLength * 0.48 * Math.sin(0.15)),
          sleeveCenterY - (sleeveLength * 0.48 * Math.cos(0.15)),
          0
        );
        leftCuff.rotation.z = 0.15;
        topGroup.add(leftCuff);
      }

      // ─────────────────────────────────────────────────────────
      // F. VISIBLE DOUBLE-NEEDLE SEAMS & TOPSTITCHING
      // ─────────────────────────────────────────────────────────
      if (tailoringOptions.showSeams) {
        // Shoulder Yoke Topstitch Seams
        [-1, 1].forEach((side) => {
          const yokeGeo = new THREE.CylinderGeometry(0.005, 0.005, shoulderSpan * 0.46, 12);
          const yokeMat = new THREE.MeshStandardMaterial({
            color: fabricType === 'denim' ? 0xd4af37 : colorHex,
            roughness: 0.3,
          });
          const yoke = new THREE.Mesh(yokeGeo, yokeMat);
          yoke.position.set(side * (shoulderSpan * 0.52), 3.52, 0.02);
          yoke.rotation.z = side * 0.35;
          yoke.rotation.y = 0.1;
          topGroup.add(yoke);
        });

        // Bottom Hem Topstitch Ring
        const hemRingGeo = new THREE.TorusGeometry(topBottomRadius * 1.01, 0.006, 12, 36);
        hemRingGeo.scale(1.16, 1.0, waistDepth / waistRadius);
        const hemRingMat = new THREE.MeshStandardMaterial({
          color: fabricType === 'denim' ? 0xd4af37 : 0x111111,
          roughness: 0.35,
        });
        const hemRing = new THREE.Mesh(hemRingGeo, hemRingMat);
        hemRing.position.set(0.005, jacketCenterY - jacketLength / 2 + 0.015, 0);
        hemRing.rotation.x = Math.PI / 2;
        topGroup.add(hemRing);
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 2. DRESS / GOWN / BODICE
    // ─────────────────────────────────────────────────────────────
    if (cat === 'dress' || cat === 'gown') {
      const bodiceGeo = new THREE.CylinderGeometry(
        chestRadius + 0.04,
        waistRadius + 0.03,
        0.88,
        36
      );
      bodiceGeo.scale(1.16, 1.0, 0.76);
      const bodice = new THREE.Mesh(bodiceGeo, garmentMat);
      bodice.position.set(0.005, 3.12, 0);
      bodice.rotation.z = -0.01;
      garmentsGroup.add(bodice);

      // Princess Seam Lines down bodice
      if (tailoringOptions.showSeams) {
        [-1, 1].forEach((side) => {
          const seamGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.85, 12);
          const seamMat = new THREE.MeshStandardMaterial({
            color: 0x222222,
            roughness: 0.3,
          });
          const seam = new THREE.Mesh(seamGeo, seamMat);
          seam.position.set(side * (0.13 * chestScale), 3.12, (chestDepth + 0.038));
          seam.rotation.z = side * 0.04;
          garmentsGroup.add(seam);
        });
      }

      const isMaxi =
        item.silhouette.toLowerCase().includes('maxi') ||
        item.silhouette.toLowerCase().includes('floor') ||
        item.description.toLowerCase().includes('gown');
      const skirtGeo = new THREE.CylinderGeometry(
        waistRadius + 0.04,
        (isMaxi ? 0.98 : 0.75) * hipScale,
        isMaxi ? 2.5 : 1.6,
        42
      );
      const skirt = new THREE.Mesh(skirtGeo, garmentMat);
      skirt.position.set(0.01, isMaxi ? 1.40 : 1.85, 0.02);
      skirt.rotation.z = -0.025;
      garmentsGroup.add(skirt);
    }

    // ─────────────────────────────────────────────────────────────
    // 3. BOTTOMS: TROUSERS / JEANS / CHINOS / SKIRTS
    // ─────────────────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────────
    // 3. BOTTOMS: TROUSERS / JEANS / CHINOS / SKIRTS
    // ─────────────────────────────────────────────────────────────
    if (cat === 'bottom' || cat === 'pants' || cat === 'trousers' || cat === 'skirt') {
      const isSkirt = cat === 'skirt' || item.silhouette.toLowerCase().includes('skirt');

      // Bottom animation group: pulls up legs from bottom (-0.4m), cinching snug into waist
      const bottomGroup = new THREE.Group();
      bottomGroup.position.y = (bottomAnimT - 1.0) * 0.38;
      const initialBottomSpread = 1.0 + (1.0 - bottomAnimT) * 0.14;
      bottomGroup.scale.set(initialBottomSpread, 1.0, initialBottomSpread);
      garmentsGroup.add(bottomGroup);

      if (isSkirt) {
        const skirtGeo = new THREE.CylinderGeometry(
          waistRadius + 0.04,
          0.72 * hipScale,
          1.45,
          36
        );
        const skirt = new THREE.Mesh(skirtGeo, garmentMat);
        skirt.position.set(0.01, 1.95, 0.01);
        skirt.rotation.z = -0.025;
        bottomGroup.add(skirt);
      } else {
        // Waistband Mesh
        const waistEase = torsoEase + 0.018;
        const waistGeo = new THREE.CylinderGeometry(
          (waistRadius + waistEase),
          (hipRadius + waistEase),
          0.48,
          36
        );
        waistGeo.scale(1.15, 1.0, (waistDepth + waistEase) / waistRadius);
        const waistMesh = new THREE.Mesh(waistGeo, garmentMat);
        waistMesh.position.set(0.012, 2.22, 0);
        waistMesh.rotation.z = -0.03;
        bottomGroup.add(waistMesh);

        // Tailored Leather Belt & Buckle Hardware
        if (tailoringOptions.showHardware) {
          const beltGroup = createTailoredBeltAndBuckle(
            waistRadius + waistEase,
            waistDepth + waistEase,
            2.38,
            isMale
          );
          bottomGroup.add(beltGroup);
        }

        // Curved J-Stitch Fly Outline on Pants Front
        if (tailoringOptions.showSeams) {
          const flySeamGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.22, 10);
          const flySeamMat = new THREE.MeshStandardMaterial({
            color: fabricType === 'denim' ? 0xd4af37 : 0x111111,
            roughness: 0.35,
          });
          const flySeam = new THREE.Mesh(flySeamGeo, flySeamMat);
          flySeam.position.set(0.032, 2.24, waistDepth + waistEase + 0.015);
          flySeam.rotation.z = 0.08;
          bottomGroup.add(flySeam);
        }

        // Leg Sizing based on Fit Silhouette & Trouser Break
        const isCropped = tailoringOptions.trouserBreak === 'cropped';
        const pantLength = isCropped ? 1.78 : 1.94;
        const pantCenterY = isCropped ? 1.22 : 1.15;
        const legRadiusTop = (isMale ? 0.185 : 0.16) * trouserWidthMul;
        const legRadiusBottom = (isMale ? 0.145 : 0.125) * trouserWidthMul;

        // ── Right Pant Leg (Planted supporting leg) ──
        {
          const pantLegGeo = new THREE.CylinderGeometry(legRadiusTop, legRadiusBottom, pantLength, 28);
          const rightPant = new THREE.Mesh(pantLegGeo, garmentMat);
          rightPant.position.set(legSpacing * 0.95, pantCenterY, 0);
          rightPant.rotation.z = -0.02;
          bottomGroup.add(rightPant);

          // Crisp Vertical Trouser Crease
          const creaseGeo = new THREE.CylinderGeometry(0.003, 0.003, pantLength * 0.92, 8);
          const creaseMat = new THREE.MeshStandardMaterial({
            color: colorHex,
            roughness: 0.15,
          });
          const rightCrease = new THREE.Mesh(creaseGeo, creaseMat);
          rightCrease.position.set(legSpacing * 0.95, pantCenterY, legRadiusTop * 0.88);
          bottomGroup.add(rightCrease);

          // Double-Needle Outseam Stitching
          if (tailoringOptions.showSeams) {
            const outseamGeo = new THREE.CylinderGeometry(0.004, 0.004, pantLength * 0.96, 8);
            const outseamMat = new THREE.MeshStandardMaterial({
              color: fabricType === 'denim' ? 0xd4af37 : 0x111111,
              roughness: 0.3,
            });
            const rightOutseam = new THREE.Mesh(outseamGeo, outseamMat);
            rightOutseam.position.set(legSpacing * 0.95 + legRadiusTop * 0.98, pantCenterY, 0);
            bottomGroup.add(rightOutseam);
          }

          // Tailored Ankle Cuff Hem
          const cuffGeo = new THREE.CylinderGeometry(legRadiusBottom + 0.015, legRadiusBottom + 0.01, 0.10, 24);
          const cuff = new THREE.Mesh(cuffGeo, garmentMat);
          cuff.position.set(legSpacing * 0.95, isCropped ? 0.35 : 0.24, 0);
          bottomGroup.add(cuff);
        }

        // ── Left Pant Leg (Follows relaxed contrapposto flex) ──
        {
          const pantLegGeo = new THREE.CylinderGeometry(legRadiusTop, legRadiusBottom, pantLength, 28);
          const leftPant = new THREE.Mesh(pantLegGeo, garmentMat);
          leftPant.position.set(-legSpacing * 1.08, pantCenterY, 0.03);
          leftPant.rotation.x = 0.06;
          leftPant.rotation.z = 0.03;
          bottomGroup.add(leftPant);

          // Left Crease
          const creaseGeo = new THREE.CylinderGeometry(0.003, 0.003, pantLength * 0.92, 8);
          const creaseMat = new THREE.MeshStandardMaterial({
            color: colorHex,
            roughness: 0.15,
          });
          const leftCrease = new THREE.Mesh(creaseGeo, creaseMat);
          leftCrease.position.set(-legSpacing * 1.08, pantCenterY, legRadiusTop * 0.88 + 0.03);
          leftCrease.rotation.x = 0.06;
          leftCrease.rotation.z = 0.03;
          bottomGroup.add(leftCrease);

          // Left Outseam Stitching
          if (tailoringOptions.showSeams) {
            const outseamGeo = new THREE.CylinderGeometry(0.004, 0.004, pantLength * 0.96, 8);
            const outseamMat = new THREE.MeshStandardMaterial({
              color: fabricType === 'denim' ? 0xd4af37 : 0x111111,
              roughness: 0.3,
            });
            const leftOutseam = new THREE.Mesh(outseamGeo, outseamMat);
            leftOutseam.position.set(-legSpacing * 1.08 - legRadiusTop * 0.98, pantCenterY, 0.03);
            leftOutseam.rotation.x = 0.06;
            leftOutseam.rotation.z = 0.03;
            bottomGroup.add(leftOutseam);
          }

          // Left Ankle Cuff Hem
          const cuffGeo = new THREE.CylinderGeometry(legRadiusBottom + 0.015, legRadiusBottom + 0.01, 0.10, 24);
          const cuff = new THREE.Mesh(cuffGeo, garmentMat);
          cuff.position.set(-legSpacing * 1.08, isCropped ? 0.35 : 0.24, 0.05);
          cuff.rotation.x = 0.06;
          cuff.rotation.z = 0.03;
          bottomGroup.add(cuff);
        }
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 4. FOOTWEAR: SHOES / SNEAKERS / HEELS
    // ─────────────────────────────────────────────────────────────
    if (cat === 'footwear' || cat === 'shoes') {
      const isHeel =
        !isMale ||
        item.name.toLowerCase().includes('heel') ||
        item.name.toLowerCase().includes('pump') ||
        item.name.toLowerCase().includes('stiletto') ||
        item.silhouette.toLowerCase().includes('heel');

      const shoeMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness: isHeel ? 0.18 : 0.32,
        metalness: isHeel ? 0.35 : 0.08,
      });

      // Shoe animation group: slips forward and snaps onto feet
      const shoeGroup = new THREE.Group();
      shoeGroup.position.z = (1.0 - shoeAnimT) * 0.35;
      shoeGroup.position.y = (1.0 - shoeAnimT) * 0.15;
      garmentsGroup.add(shoeGroup);

      // Right Shoe
      {
        if (isHeel) {
          const pumpGeo = new THREE.BoxGeometry(0.12, 0.10, 0.32);
          const pump = new THREE.Mesh(pumpGeo, shoeMat);
          pump.position.set(legSpacing * 0.95, 0.09, 0.08);
          pump.rotation.y = 0.08;

          const heelGeo = new THREE.CylinderGeometry(0.018, 0.014, 0.18, 16);
          const heel = new THREE.Mesh(heelGeo, shoeMat);
          heel.position.set(legSpacing * 0.95, 0.09, -0.07);

          shoeGroup.add(pump, heel);
        } else {
          // Sneaker Upper
          const sneakerGeo = new THREE.BoxGeometry(0.16, 0.13, 0.38);
          const sneaker = new THREE.Mesh(sneakerGeo, shoeMat);
          sneaker.position.set(legSpacing * 0.95, 0.07, 0.06);
          sneaker.rotation.y = 0.08;

          // Sneaker Sole Tread
          const soleGeo = new THREE.BoxGeometry(0.17, 0.045, 0.40);
          const soleMat = new THREE.MeshStandardMaterial({
            color: 0x222630,
            roughness: 0.5,
            metalness: 0.05,
          });
          const sole = new THREE.Mesh(soleGeo, soleMat);
          sole.position.set(legSpacing * 0.95, 0.02, 0.06);
          sole.rotation.y = 0.08;

          // Sneaker Laces Bridge
          if (tailoringOptions.showHardware) {
            const lacesGeo = new THREE.BoxGeometry(0.07, 0.02, 0.14);
            const lacesMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.8 });
            const laces = new THREE.Mesh(lacesGeo, lacesMat);
            laces.position.set(legSpacing * 0.95, 0.14, 0.08);
            laces.rotation.y = 0.08;
            shoeGroup.add(laces);
          }

          shoeGroup.add(sneaker, sole);
        }
      }

      // Left Shoe
      {
        if (isHeel) {
          const pumpGeo = new THREE.BoxGeometry(0.12, 0.10, 0.32);
          const pump = new THREE.Mesh(pumpGeo, shoeMat);
          pump.position.set(-legSpacing * 1.08, 0.09, 0.10);
          pump.rotation.y = -0.14;
          pump.rotation.x = -0.04;

          const heelGeo = new THREE.CylinderGeometry(0.018, 0.014, 0.18, 16);
          const heel = new THREE.Mesh(heelGeo, shoeMat);
          heel.position.set(-legSpacing * 1.08, 0.09, -0.05);

          shoeGroup.add(pump, heel);
        } else {
          const sneakerGeo = new THREE.BoxGeometry(0.16, 0.13, 0.38);
          const sneaker = new THREE.Mesh(sneakerGeo, shoeMat);
          sneaker.position.set(-legSpacing * 1.08, 0.07, 0.08);
          sneaker.rotation.y = -0.14;
          sneaker.rotation.x = -0.04;

          const soleGeo = new THREE.BoxGeometry(0.17, 0.045, 0.40);
          const soleMat = new THREE.MeshStandardMaterial({
            color: 0x222630,
            roughness: 0.5,
            metalness: 0.05,
          });
          const sole = new THREE.Mesh(soleGeo, soleMat);
          sole.position.set(-legSpacing * 1.08, 0.02, 0.08);
          sole.rotation.y = -0.14;
          sole.rotation.x = -0.04;

          if (tailoringOptions.showHardware) {
            const lacesGeo = new THREE.BoxGeometry(0.07, 0.02, 0.14);
            const lacesMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.8 });
            const laces = new THREE.Mesh(lacesGeo, lacesMat);
            laces.position.set(-legSpacing * 1.08, 0.14, 0.10);
            laces.rotation.y = -0.14;
            laces.rotation.x = -0.04;
            shoeGroup.add(laces);
          }

          shoeGroup.add(sneaker, sole);
        }
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 5. ACCESSORIES: HANDBAGS, CHOKERS, SUNGLASSES
    // ─────────────────────────────────────────────────────────────
    if (cat === 'accessory' || cat === 'accessories' || cat === 'jewelry') {
      const isBag =
        item.name.toLowerCase().includes('bag') ||
        item.name.toLowerCase().includes('clutch') ||
        item.name.toLowerCase().includes('minaudière');

      if (isBag) {
        const bagGeo = new THREE.BoxGeometry(0.28, 0.18, 0.10);
        const bag = new THREE.Mesh(bagGeo, garmentMat);
        bag.position.set(shoulderSpan * 0.82, 2.12, 0.16);
        bag.rotation.y = 0.25;
        bag.rotation.z = -0.12;
        garmentsGroup.add(bag);

        // Metallic lock / clasp hardware
        if (tailoringOptions.showHardware) {
          const claspGeo = new THREE.BoxGeometry(0.04, 0.035, 0.02);
          const claspMat = new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            roughness: 0.15,
            metalness: 0.95,
          });
          const clasp = new THREE.Mesh(claspGeo, claspMat);
          clasp.position.set(shoulderSpan * 0.82, 2.12, 0.215);
          clasp.rotation.y = 0.25;
          clasp.rotation.z = -0.12;
          garmentsGroup.add(clasp);
        }
      } else {
        const chokerGeo = new THREE.TorusGeometry(0.175 * chestScale, 0.022, 16, 36);
        const jewel = new THREE.Mesh(chokerGeo, garmentMat);
        jewel.position.set(0.005, 3.52, 0.08);
        jewel.rotation.x = Math.PI / 2.6;
        garmentsGroup.add(jewel);
      }
    }
  });

  return garmentsGroup;
}

