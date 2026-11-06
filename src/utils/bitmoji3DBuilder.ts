import * as THREE from 'three';
import { BodyGender } from './outfitGenderDetector';
import { BodyOcclusionConfig } from './mannequin3DBuilder';

export type BitmojiPose = 'peace' | 'strut' | 'selfie' | 'chill';
export type BitmojiHairstyle = 'pompadour' | 'bob' | 'ponytail' | 'undercut' | 'curly';
export type BitmojiExpression = 'happy' | 'wink' | 'cool' | 'glam';

export interface BitmojiConfig {
  gender: BodyGender;
  skinColorHex: string;
  hairColorHex: string;
  hairstyle: BitmojiHairstyle;
  pose: BitmojiPose;
  expression: BitmojiExpression;
  eyeColorHex?: string;
  occlusionConfig?: BodyOcclusionConfig;
}

export const BITMOJI_SKIN_PALETTE = [
  { name: 'Warm Ivory', hex: '#F9D5B8' },
  { name: 'Golden Honey', hex: '#EBB582' },
  { name: 'Rich Caramel', hex: '#C68B59' },
  { name: 'Espresso Bronze', hex: '#8D5638' },
  { name: 'Deep Cocoa', hex: '#583624' },
  { name: 'Porcelain Peach', hex: '#FEE3D2' },
];

export const BITMOJI_HAIR_PALETTE = [
  { name: 'Espresso Black', hex: '#1E1B18' },
  { name: 'Chestnut Brown', hex: '#4A2E1B' },
  { name: 'Golden Honey Blonde', hex: '#D4A359' },
  { name: 'Copper Auburn', hex: '#8B3A1C' },
  { name: 'Platinum Silver', hex: '#E5E4E2' },
  { name: 'Bubblegum Pink', hex: '#E95D94' },
  { name: 'Electric Cobalt', hex: '#2563EB' },
];

export const BITMOJI_EYE_PALETTE = [
  { name: 'Deep Hazel', hex: '#4A3525' },
  { name: 'Emerald Green', hex: '#1B5E20' },
  { name: 'Ocean Sapphire', hex: '#1565C0' },
  { name: 'Warm Amber', hex: '#8D6E63' },
];

/**
 * Procedural Stylized Eye for Bitmoji Character
 */
function createBitmojiEye(
  isWink: boolean = false,
  eyeColorHex: string = '#4A3525',
  radius: number = 0.052
): THREE.Group {
  const eyeGroup = new THREE.Group();

  if (isWink) {
    // Sculpted playful curved winking line
    const winkCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-radius * 0.9, -0.01, 0),
      new THREE.Vector3(-radius * 0.4, 0.02, 0.01),
      new THREE.Vector3(0, 0.025, 0.012),
      new THREE.Vector3(radius * 0.4, 0.02, 0.01),
      new THREE.Vector3(radius * 0.9, -0.01, 0),
    ]);
    const winkGeo = new THREE.TubeGeometry(winkCurve, 16, 0.008, 8, false);
    const winkMat = new THREE.MeshStandardMaterial({
      color: 0x221814,
      roughness: 0.3,
    });
    const winkMesh = new THREE.Mesh(winkGeo, winkMat);
    eyeGroup.add(winkMesh);

    // Eyelash tick
    const lashGeo = new THREE.CylinderGeometry(0.004, 0.001, 0.02, 8);
    const lash = new THREE.Mesh(lashGeo, winkMat);
    lash.rotation.z = -Math.PI / 3;
    lash.position.set(radius * 0.85, 0.01, 0);
    eyeGroup.add(lash);

    return eyeGroup;
  }

  // Large expressive rounded Bitmoji sclera (eyeball white)
  const scleraGeo = new THREE.SphereGeometry(radius, 24, 20);
  scleraGeo.scale(1.0, 1.15, 0.65);
  const scleraMat = new THREE.MeshStandardMaterial({
    color: 0xfbfcfe,
    roughness: 0.15,
    metalness: 0.05,
  });
  const sclera = new THREE.Mesh(scleraGeo, scleraMat);
  eyeGroup.add(sclera);

  // Stylized vibrant iris
  const irisGeo = new THREE.CircleGeometry(radius * 0.62, 24);
  const irisMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(eyeColorHex),
    roughness: 0.2,
    metalness: 0.1,
  });
  const iris = new THREE.Mesh(irisGeo, irisMat);
  iris.position.z = radius * 0.65 + 0.002;
  eyeGroup.add(iris);

  // Deep dark pupil
  const pupilGeo = new THREE.CircleGeometry(radius * 0.34, 20);
  const pupilMat = new THREE.MeshBasicMaterial({ color: 0x111116 });
  const pupil = new THREE.Mesh(pupilGeo, pupilMat);
  pupil.position.z = radius * 0.65 + 0.003;
  eyeGroup.add(pupil);

  // Signature Bitmoji catchlight shine (top right specular dot)
  const glint1Geo = new THREE.CircleGeometry(radius * 0.14, 12);
  const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const glint1 = new THREE.Mesh(glint1Geo, glintMat);
  glint1.position.set(radius * 0.18, radius * 0.2, radius * 0.65 + 0.004);
  eyeGroup.add(glint1);

  // Secondary tiny reflection sparkle
  const glint2Geo = new THREE.CircleGeometry(radius * 0.07, 10);
  const glint2 = new THREE.Mesh(glint2Geo, glintMat);
  glint2.position.set(-radius * 0.16, -radius * 0.16, radius * 0.65 + 0.004);
  eyeGroup.add(glint2);

  // Sleek upper eyelid crease
  const eyelidCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-radius * 1.05, radius * 0.1, radius * 0.55),
    new THREE.Vector3(0, radius * 1.15, radius * 0.58),
    new THREE.Vector3(radius * 1.05, radius * 0.1, radius * 0.55),
  ]);
  const eyelidGeo = new THREE.TubeGeometry(eyelidCurve, 16, 0.005, 8, false);
  const eyelidMat = new THREE.MeshStandardMaterial({
    color: 0x3d271d,
    roughness: 0.3,
  });
  const eyelidMesh = new THREE.Mesh(eyelidGeo, eyelidMat);
  eyeGroup.add(eyelidMesh);

  return eyeGroup;
}

/**
 * Builds stylized Bitmoji eyebrows with expressive arch
 */
function createBitmojiEyebrow(
  isRight: boolean,
  expression: BitmojiExpression,
  hairColorHex: string
): THREE.Mesh {
  const points: THREE.Vector3[] = [];
  const dir = isRight ? 1 : -1;

  let archHeight = 0.025;
  let outerDrop = -0.015;

  if (expression === 'wink') {
    archHeight = isRight ? 0.038 : 0.02; // Raised quizzical eyebrow on wink
    outerDrop = isRight ? -0.008 : -0.022;
  } else if (expression === 'glam' || expression === 'cool') {
    archHeight = 0.032;
    outerDrop = -0.012;
  }

  points.push(new THREE.Vector3(0, 0, 0));
  points.push(new THREE.Vector3(dir * 0.04, archHeight, 0.01));
  points.push(new THREE.Vector3(dir * 0.08, outerDrop, -0.005));

  const browCurve = new THREE.CatmullRomCurve3(points);
  const browGeo = new THREE.TubeGeometry(browCurve, 16, 0.009, 8, false);
  const browMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(hairColorHex),
    roughness: 0.5,
  });
  return new THREE.Mesh(browGeo, browMat);
}

/**
 * Builds stylized Bitmoji hair geometries
 */
function createBitmojiHair(
  style: BitmojiHairstyle,
  hairColorHex: string,
  gender: BodyGender
): THREE.Group {
  const hairGroup = new THREE.Group();
  const hairMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(hairColorHex),
    roughness: 0.38,
    metalness: 0.12,
  });

  const hairCapGeo = new THREE.SphereGeometry(0.24, 28, 24);
  hairCapGeo.scale(1.02, 1.05, 1.02);
  const hairCap = new THREE.Mesh(hairCapGeo, hairMat);
  hairCap.position.set(0, 0.04, -0.02);
  hairGroup.add(hairCap);

  if (style === 'pompadour') {
    // Stylized swept high-volume pompadour
    const pompadourGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.24, 24);
    pompadourGeo.rotateX(Math.PI / 4);
    pompadourGeo.scale(1.0, 1.2, 1.3);
    const pompadour = new THREE.Mesh(pompadourGeo, hairMat);
    pompadour.position.set(0, 0.22, 0.05);
    pompadour.rotation.x = -0.2;
    hairGroup.add(pompadour);

    // Front dynamic swept crest
    const crestGeo = new THREE.TorusGeometry(0.15, 0.065, 12, 24, Math.PI);
    const crest = new THREE.Mesh(crestGeo, hairMat);
    crest.rotation.y = Math.PI / 2;
    crest.rotation.z = Math.PI * 0.85;
    crest.position.set(0, 0.24, 0.12);
    hairGroup.add(crest);
  } else if (style === 'bob') {
    // Chic smooth curved side bangs framing cheekbones
    const leftSideGeo = new THREE.CylinderGeometry(0.09, 0.13, 0.38, 20);
    leftSideGeo.scale(0.8, 1.0, 1.2);
    const leftSide = new THREE.Mesh(leftSideGeo, hairMat);
    leftSide.position.set(-0.21, -0.05, 0.04);
    leftSide.rotation.z = -0.12;
    hairGroup.add(leftSide);

    const rightSide = leftSide.clone();
    rightSide.position.x = 0.21;
    rightSide.rotation.z = 0.12;
    hairGroup.add(rightSide);

    // Back length
    const backLengthGeo = new THREE.CylinderGeometry(0.22, 0.25, 0.34, 24);
    const backLength = new THREE.Mesh(backLengthGeo, hairMat);
    backLength.position.set(0, -0.06, -0.1);
    hairGroup.add(backLength);
  } else if (style === 'ponytail') {
    // High bouncy ponytail with gold elastic scrunchie
    const scrunchieGeo = new THREE.TorusGeometry(0.045, 0.016, 12, 24);
    const scrunchieMat = new THREE.MeshStandardMaterial({
      color: 0xfffc00, // Snapchat Yellow scrunchie!
      roughness: 0.3,
      metalness: 0.6,
    });
    const scrunchie = new THREE.Mesh(scrunchieGeo, scrunchieMat);
    scrunchie.position.set(0, 0.22, -0.22);
    scrunchie.rotation.x = 0.6;
    hairGroup.add(scrunchie);

    // Sweeping ponytail body
    const tailCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.22, -0.22),
      new THREE.Vector3(0.02, 0.16, -0.38),
      new THREE.Vector3(-0.01, -0.05, -0.42),
      new THREE.Vector3(0, -0.25, -0.35),
    ]);
    const tailGeo = new THREE.TubeGeometry(tailCurve, 20, 0.07, 14, false);
    const tailMesh = new THREE.Mesh(tailGeo, hairMat);
    hairGroup.add(tailMesh);
  } else if (style === 'curly') {
    // Voluminous bouncy curls
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const curlRadius = 0.23 + (i % 3) * 0.02;
      const curlGeo = new THREE.SphereGeometry(0.075, 14, 12);
      const curl = new THREE.Mesh(curlGeo, hairMat);
      curl.position.set(
        Math.cos(angle) * curlRadius * 0.9,
        0.14 + Math.sin(i * 1.5) * 0.08,
        Math.sin(angle) * curlRadius * 0.9
      );
      hairGroup.add(curl);
    }
  } else {
    // Modern Textured Undercut
    const topGeo = new THREE.CylinderGeometry(0.19, 0.22, 0.16, 20);
    const topMesh = new THREE.Mesh(topGeo, hairMat);
    topMesh.position.set(0, 0.18, 0.02);
    hairGroup.add(topMesh);

    // Front flick
    const flickGeo = new THREE.ConeGeometry(0.08, 0.12, 12);
    flickGeo.rotateX(-Math.PI / 3);
    const flick = new THREE.Mesh(flickGeo, hairMat);
    flick.position.set(-0.05, 0.16, 0.19);
    hairGroup.add(flick);
  }

  return hairGroup;
}

/**
 * Builds the complete stylized 3D Bitmoji character with Snapchat aesthetics
 */
export function buildBitmoji3DCharacter(config: BitmojiConfig): THREE.Group {
  const root = new THREE.Group();
  root.name = 'snapchat_bitmoji_character';

  const skinMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.skinColorHex),
    roughness: 0.48,
    metalness: 0.04,
  });

  const lipMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.skinColorHex).lerp(new THREE.Color(0xd64d6a), 0.42),
    roughness: 0.32,
    metalness: 0.06,
  });

  // Base coordinate system: Bitmoji character stands at y = 0
  // Character height ~ 3.6 units to fit garments naturally

  // -------------------------------------------------------------
  // 1. HEAD & EXPRESSION GROUP (Iconic Bitmoji Stylized Head)
  // -------------------------------------------------------------
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 3.02, 0);

  // Apply playful head tilt based on pose
  if (config.pose === 'peace') {
    headGroup.rotation.z = -0.14;
    headGroup.rotation.y = 0.12;
  } else if (config.pose === 'selfie') {
    headGroup.rotation.z = 0.12;
    headGroup.rotation.x = -0.08;
    headGroup.rotation.y = -0.16;
  } else if (config.pose === 'strut') {
    headGroup.rotation.y = 0.18;
    headGroup.rotation.x = 0.06;
  }

  // Bitmoji Cranium & Cheek contour (smooth rounded stylized teardrop-sphere)
  const headGeo = new THREE.SphereGeometry(0.24, 32, 28);
  headGeo.scale(1.0, 1.08, 1.02);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  // Rounded cute chin
  const chinGeo = new THREE.SphereGeometry(0.12, 20, 18);
  chinGeo.scale(1.0, 0.85, 0.95);
  const chinMesh = new THREE.Mesh(chinGeo, skinMat);
  chinMesh.position.set(0, -0.14, 0.11);
  headGroup.add(chinMesh);

  // Cute stylized ears
  const earGeo = new THREE.SphereGeometry(0.062, 16, 14);
  earGeo.scale(0.5, 1.2, 0.9);
  const leftEar = new THREE.Mesh(earGeo, skinMat);
  leftEar.position.set(-0.24, -0.01, -0.01);
  leftEar.rotation.y = -0.25;
  headGroup.add(leftEar);

  const rightEar = leftEar.clone();
  rightEar.position.x = 0.24;
  rightEar.rotation.y = 0.25;
  headGroup.add(rightEar);

  // Eyes (Snapchat iconic large expressive eyes)
  const eyeRadius = 0.052;
  const isRightWink = config.expression === 'wink';
  const leftEye = createBitmojiEye(false, config.eyeColorHex || '#4A3525', eyeRadius);
  leftEye.position.set(-0.095, 0.02, 0.215);
  leftEye.rotation.y = -0.12;
  headGroup.add(leftEye);

  const rightEye = createBitmojiEye(isRightWink, config.eyeColorHex || '#4A3525', eyeRadius);
  rightEye.position.set(0.095, 0.02, 0.215);
  rightEye.rotation.y = 0.12;
  headGroup.add(rightEye);

  // Eyebrows
  const leftBrow = createBitmojiEyebrow(false, config.expression, config.hairColorHex);
  leftBrow.position.set(-0.095, 0.095, 0.22);
  headGroup.add(leftBrow);

  const rightBrow = createBitmojiEyebrow(true, config.expression, config.hairColorHex);
  rightBrow.position.set(0.095, 0.095, 0.22);
  headGroup.add(rightBrow);

  // Stylized Button Nose
  const noseGeo = new THREE.SphereGeometry(0.03, 16, 14);
  noseGeo.scale(0.9, 0.85, 1.2);
  const noseMesh = new THREE.Mesh(noseGeo, skinMat);
  noseMesh.position.set(0, -0.035, 0.24);
  headGroup.add(noseMesh);

  // Smiling Lips (Friendly Snapchat smile)
  const smileCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.058, -0.095, 0.2),
    new THREE.Vector3(-0.03, -0.115, 0.22),
    new THREE.Vector3(0, -0.118, 0.225),
    new THREE.Vector3(0.03, -0.115, 0.22),
    new THREE.Vector3(0.058, -0.095, 0.2),
  ]);
  const lipGeo = new THREE.TubeGeometry(smileCurve, 18, 0.009, 8, false);
  const lipMesh = new THREE.Mesh(lipGeo, lipMat);
  headGroup.add(lipMesh);

  // Stylized Hair
  const hairGroup = createBitmojiHair(config.hairstyle, config.hairColorHex, config.gender);
  hairGroup.position.set(0, 0.03, 0);
  headGroup.add(hairGroup);

  // Sunglasses / Shades for 'cool' expression
  if (config.expression === 'cool') {
    const shadesGroup = new THREE.Group();
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x111116,
      roughness: 0.2,
      metalness: 0.8,
    });
    const lensMat = new THREE.MeshStandardMaterial({
      color: 0x222233,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.85,
    });

    const lensGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.012, 20);
    lensGeo.rotateX(Math.PI / 2);

    const leftLens = new THREE.Mesh(lensGeo, lensMat);
    leftLens.position.set(-0.09, 0.02, 0.24);
    shadesGroup.add(leftLens);

    const rightLens = new THREE.Mesh(lensGeo, lensMat);
    rightLens.position.set(0.09, 0.02, 0.24);
    shadesGroup.add(rightLens);

    const bridgeGeo = new THREE.BoxGeometry(0.06, 0.01, 0.01);
    const bridge = new THREE.Mesh(bridgeGeo, frameMat);
    bridge.position.set(0, 0.03, 0.245);
    shadesGroup.add(bridge);

    headGroup.add(shadesGroup);
  }

  root.add(headGroup);

  // -------------------------------------------------------------
  // 2. NECK & UPPER BODY (Matches Garment Engine Alignment)
  // -------------------------------------------------------------
  const neckGeo = new THREE.CylinderGeometry(0.075, 0.092, 0.24, 20);
  const neckMesh = new THREE.Mesh(neckGeo, skinMat);
  neckMesh.position.set(0, 2.76, 0);
  root.add(neckMesh);

  // Upper Torso / Chest
  const chestGeo = new THREE.CylinderGeometry(0.24, 0.21, 0.45, 24);
  chestGeo.scale(1.2, 1.0, 0.85);
  const chestMesh = new THREE.Mesh(chestGeo, skinMat);
  chestMesh.position.set(0, 2.44, 0);
  root.add(chestMesh);

  // Midriff & Waist
  const waistGeo = new THREE.CylinderGeometry(0.205, 0.23, 0.42, 24);
  waistGeo.scale(1.15, 1.0, 0.8);
  const waistMesh = new THREE.Mesh(waistGeo, skinMat);
  waistMesh.position.set(0, 2.05, 0);
  root.add(waistMesh);

  // Pelvis / Hips
  const hipsGeo = new THREE.CylinderGeometry(0.23, 0.245, 0.32, 24);
  hipsGeo.scale(1.22, 1.0, 0.88);
  const hipsMesh = new THREE.Mesh(hipsGeo, skinMat);
  hipsMesh.position.set(0, 1.74, 0);
  root.add(hipsMesh);

  // -------------------------------------------------------------
  // 3. ARMS & HANDS (Dynamically configured by selected Pose)
  // -------------------------------------------------------------
  const armRadius = 0.062;
  const armMat = skinMat;

  if (config.pose === 'peace') {
    // Left arm raised near head forming peace / V sign!
    const upperArmLeftGeo = new THREE.CylinderGeometry(armRadius, armRadius * 0.9, 0.38, 16);
    const upperArmLeft = new THREE.Mesh(upperArmLeftGeo, armMat);
    upperArmLeft.position.set(-0.35, 2.45, 0.08);
    upperArmLeft.rotation.z = 1.35; // raised upward
    upperArmLeft.rotation.x = -0.3;
    root.add(upperArmLeft);

    const forearmLeftGeo = new THREE.CylinderGeometry(armRadius * 0.9, armRadius * 0.8, 0.38, 16);
    const forearmLeft = new THREE.Mesh(forearmLeftGeo, armMat);
    forearmLeft.position.set(-0.32, 2.82, 0.16);
    forearmLeft.rotation.z = 2.45; // bent toward cheek
    forearmLeft.rotation.x = -0.4;
    root.add(forearmLeft);

    // Peace Sign Hand with 2 extended V fingers
    const handLeftGroup = new THREE.Group();
    handLeftGroup.position.set(-0.25, 3.02, 0.24);

    const palmGeo = new THREE.SphereGeometry(0.045, 14, 12);
    palmGeo.scale(0.8, 1.0, 0.6);
    const palm = new THREE.Mesh(palmGeo, armMat);
    handLeftGroup.add(palm);

    // Index & Middle fingers extended in Peace sign (V)
    const fingerGeo = new THREE.CylinderGeometry(0.012, 0.01, 0.08, 10);
    const indexFinger = new THREE.Mesh(fingerGeo, armMat);
    indexFinger.position.set(-0.018, 0.065, 0);
    indexFinger.rotation.z = 0.2;
    handLeftGroup.add(indexFinger);

    const middleFinger = new THREE.Mesh(fingerGeo, armMat);
    middleFinger.position.set(0.018, 0.065, 0);
    middleFinger.rotation.z = -0.2;
    handLeftGroup.add(middleFinger);

    root.add(handLeftGroup);

    // Right arm resting casually on hip
    const upperArmRightGeo = new THREE.CylinderGeometry(armRadius, armRadius * 0.9, 0.42, 16);
    const upperArmRight = new THREE.Mesh(upperArmRightGeo, armMat);
    upperArmRight.position.set(0.35, 2.38, 0);
    upperArmRight.rotation.z = -0.45;
    root.add(upperArmRight);

    const forearmRightGeo = new THREE.CylinderGeometry(armRadius * 0.9, armRadius * 0.8, 0.4, 16);
    const forearmRight = new THREE.Mesh(forearmRightGeo, armMat);
    forearmRight.position.set(0.42, 1.98, 0.08);
    forearmRight.rotation.z = 0.6;
    root.add(forearmRight);
  } else if (config.pose === 'selfie') {
    // Right arm extended forward holding phone taking selfie
    const upperArmRightGeo = new THREE.CylinderGeometry(armRadius, armRadius * 0.9, 0.4, 16);
    const upperArmRight = new THREE.Mesh(upperArmRightGeo, armMat);
    upperArmRight.position.set(0.32, 2.42, 0.18);
    upperArmRight.rotation.x = -1.2;
    upperArmRight.rotation.z = -0.3;
    root.add(upperArmRight);

    const forearmRightGeo = new THREE.CylinderGeometry(armRadius * 0.9, armRadius * 0.8, 0.4, 16);
    const forearmRight = new THREE.Mesh(forearmRightGeo, armMat);
    forearmRight.position.set(0.24, 2.58, 0.52);
    forearmRight.rotation.x = -0.7;
    forearmRight.rotation.y = 0.4;
    root.add(forearmRight);

    // Smartphone model in hand with Snapchat Yellow back cover
    const phoneGroup = new THREE.Group();
    phoneGroup.position.set(0.22, 2.72, 0.68);
    phoneGroup.rotation.y = 0.35;
    phoneGroup.rotation.x = 0.15;

    const phoneBodyGeo = new THREE.BoxGeometry(0.12, 0.22, 0.016);
    const phoneBodyMat = new THREE.MeshStandardMaterial({
      color: 0xfffc00, // Snapchat Yellow phone case!
      roughness: 0.25,
      metalness: 0.5,
    });
    const phoneBody = new THREE.Mesh(phoneBodyGeo, phoneBodyMat);
    phoneGroup.add(phoneBody);

    // Camera bump
    const camBumpGeo = new THREE.BoxGeometry(0.045, 0.045, 0.008);
    const camBumpMat = new THREE.MeshStandardMaterial({ color: 0x111116, roughness: 0.2 });
    const camBump = new THREE.Mesh(camBumpGeo, camBumpMat);
    camBump.position.set(0.025, 0.065, 0.01);
    phoneGroup.add(camBump);

    root.add(phoneGroup);

    // Left arm relaxed at side
    const upperArmLeftGeo = new THREE.CylinderGeometry(armRadius, armRadius * 0.9, 0.42, 16);
    const upperArmLeft = new THREE.Mesh(upperArmLeftGeo, armMat);
    upperArmLeft.position.set(-0.35, 2.38, 0);
    upperArmLeft.rotation.z = 0.2;
    root.add(upperArmLeft);

    const forearmLeftGeo = new THREE.CylinderGeometry(armRadius * 0.9, armRadius * 0.8, 0.4, 16);
    const forearmLeft = new THREE.Mesh(forearmLeftGeo, armMat);
    forearmLeft.position.set(-0.38, 1.95, 0.02);
    root.add(forearmLeft);
  } else if (config.pose === 'strut') {
    // Dynamic fashion walk pose
    const upperArmLeft = new THREE.Mesh(new THREE.CylinderGeometry(armRadius, armRadius * 0.9, 0.42, 16), armMat);
    upperArmLeft.position.set(-0.34, 2.36, -0.1);
    upperArmLeft.rotation.x = 0.4;
    upperArmLeft.rotation.z = 0.25;
    root.add(upperArmLeft);

    const forearmLeft = new THREE.Mesh(new THREE.CylinderGeometry(armRadius * 0.9, armRadius * 0.8, 0.4, 16), armMat);
    forearmLeft.position.set(-0.36, 1.94, -0.22);
    forearmLeft.rotation.x = 0.5;
    root.add(forearmLeft);

    const upperArmRight = new THREE.Mesh(new THREE.CylinderGeometry(armRadius, armRadius * 0.9, 0.42, 16), armMat);
    upperArmRight.position.set(0.34, 2.36, 0.1);
    upperArmRight.rotation.x = -0.4;
    upperArmRight.rotation.z = -0.25;
    root.add(upperArmRight);

    const forearmRight = new THREE.Mesh(new THREE.CylinderGeometry(armRadius * 0.9, armRadius * 0.8, 0.4, 16), armMat);
    forearmRight.position.set(0.36, 1.94, 0.22);
    forearmRight.rotation.x = -0.4;
    root.add(forearmRight);
  } else {
    // Casual 'chill' pose - hands resting relaxed near hips
    const upperArmLeft = new THREE.Mesh(new THREE.CylinderGeometry(armRadius, armRadius * 0.9, 0.42, 16), armMat);
    upperArmLeft.position.set(-0.35, 2.38, 0);
    upperArmLeft.rotation.z = 0.22;
    upperArmLeft.rotation.x = 0.1;
    root.add(upperArmLeft);

    const forearmLeft = new THREE.Mesh(new THREE.CylinderGeometry(armRadius * 0.9, armRadius * 0.8, 0.4, 16), armMat);
    forearmLeft.position.set(-0.32, 1.95, 0.08);
    forearmLeft.rotation.z = -0.3;
    forearmLeft.rotation.x = -0.2;
    root.add(forearmLeft);

    const upperArmRight = new THREE.Mesh(new THREE.CylinderGeometry(armRadius, armRadius * 0.9, 0.42, 16), armMat);
    upperArmRight.position.set(0.35, 2.38, 0);
    upperArmRight.rotation.z = -0.22;
    upperArmRight.rotation.x = 0.1;
    root.add(upperArmRight);

    const forearmRight = new THREE.Mesh(new THREE.CylinderGeometry(armRadius * 0.9, armRadius * 0.8, 0.4, 16), armMat);
    forearmRight.position.set(0.32, 1.95, 0.08);
    forearmRight.rotation.z = 0.3;
    forearmRight.rotation.x = -0.2;
    root.add(forearmRight);
  }

  // -------------------------------------------------------------
  // 4. LEGS & FEET (Stylized proportions matching garments)
  // -------------------------------------------------------------
  const thighRadius = 0.11;
  const calfRadius = 0.085;

  if (config.pose === 'strut') {
    // Left leg forward in stride
    const thighLeft = new THREE.Mesh(new THREE.CylinderGeometry(thighRadius, thighRadius * 0.85, 0.65, 18), armMat);
    thighLeft.position.set(-0.16, 1.34, 0.12);
    thighLeft.rotation.x = -0.22;
    root.add(thighLeft);

    const calfLeft = new THREE.Mesh(new THREE.CylinderGeometry(calfRadius, calfRadius * 0.75, 0.68, 18), armMat);
    calfLeft.position.set(-0.16, 0.68, 0.24);
    calfLeft.rotation.x = 0.1;
    root.add(calfLeft);

    // Right leg back
    const thighRight = new THREE.Mesh(new THREE.CylinderGeometry(thighRadius, thighRadius * 0.85, 0.65, 18), armMat);
    thighRight.position.set(0.16, 1.34, -0.12);
    thighRight.rotation.x = 0.2;
    root.add(thighRight);

    const calfRight = new THREE.Mesh(new THREE.CylinderGeometry(calfRadius, calfRadius * 0.75, 0.68, 18), armMat);
    calfRight.position.set(0.16, 0.68, -0.22);
    calfRight.rotation.x = -0.15;
    root.add(calfRight);
  } else {
    // Symmetrical stylish standing posture
    const thighLeft = new THREE.Mesh(new THREE.CylinderGeometry(thighRadius, thighRadius * 0.85, 0.65, 18), armMat);
    thighLeft.position.set(-0.16, 1.34, 0);
    root.add(thighLeft);

    const calfLeft = new THREE.Mesh(new THREE.CylinderGeometry(calfRadius, calfRadius * 0.75, 0.68, 18), armMat);
    calfLeft.position.set(-0.16, 0.68, 0);
    root.add(calfLeft);

    const thighRight = new THREE.Mesh(new THREE.CylinderGeometry(thighRadius, thighRadius * 0.85, 0.65, 18), armMat);
    thighRight.position.set(0.16, 1.34, 0);
    root.add(thighRight);

    const calfRight = new THREE.Mesh(new THREE.CylinderGeometry(calfRadius, calfRadius * 0.75, 0.68, 18), armMat);
    calfRight.position.set(0.16, 0.68, 0);
    root.add(calfRight);
  }

  // Feet / Stylized Base Shoes
  const footGeo = new THREE.BoxGeometry(0.11, 0.08, 0.24);
  const footMat = new THREE.MeshStandardMaterial({
    color: 0x1f242d,
    roughness: 0.3,
  });

  const leftFoot = new THREE.Mesh(footGeo, footMat);
  leftFoot.position.set(-0.16, 0.04, config.pose === 'strut' ? 0.26 : 0.04);
  root.add(leftFoot);

  const rightFoot = new THREE.Mesh(footGeo, footMat);
  rightFoot.position.set(0.16, 0.04, config.pose === 'strut' ? -0.2 : 0.04);
  root.add(rightFoot);

  return root;
}
