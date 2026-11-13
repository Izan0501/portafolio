import * as THREE from "three";
import { smoothstep, win } from "@/lib/math/ease";
import { MAC_SCREEN_RESOLUTION } from "@/components/three/textures/screenTiers";
import { SCREEN_POSITION, SCREEN_SIZE } from "@/components/macbook/Lid";

/**
 * The 5 certificates' flight — ported 1:1 from the artifact's `_certs`
 * (`docs/reference/artifact-a/Hero.dc.html`, lines 1383-1451) and
 * `_certRect` (1375-1379). Pure where it can be (the pixel-rect math, the
 * per-phase pose given already-resolved world points); `CertPlates.tsx`
 * supplies the real `THREE.Object3D` points (`lidGroup.localToWorld`,
 * etc.) this file never touches directly.
 */

const PANEL = { x: 72, y: 128, width: 780, height: 560 };

export interface CertScreenRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** The pixel rect `certv` draws a certificate's image in on the Mac screen — contained within `PANEL`, centered, at the image's own aspect ratio. */
export function certScreenRect(imageAspect: number): CertScreenRect {
  let width = PANEL.width;
  let height = width / imageAspect;
  if (height > PANEL.height) {
    height = PANEL.height;
    width = height * imageAspect;
  }
  return { x: PANEL.x + (PANEL.width - width) / 2, y: PANEL.y + (PANEL.height - height) / 2, width, height };
}

/**
 * Converts a screen-space pixel rect to the Mac lid's own *local* space
 * (artifact: `cx = ((x+w/2)/1280-0.5)*2.76`, `cy = 1.06+(0.5-(y+h/2)/800)*1.725`
 * — this is the formula that makes the absorption land pixel-exact on
 * `certv`'s own drawing rect). `z` isn't part of the artifact's formula —
 * callers set it per phase (0.62 floating, 0.03 absorbed).
 */
export function certRectToLidLocal(rect: CertScreenRect, z: number): THREE.Vector3 {
  const { width: logicalW, height: logicalH } = MAC_SCREEN_RESOLUTION.S;
  const [screenW, screenH] = SCREEN_SIZE;
  const x = ((rect.x + rect.width / 2) / logicalW - 0.5) * screenW;
  const y = SCREEN_POSITION[1] + (0.5 - (rect.y + rect.height / 2) / logicalH) * screenH;
  return new THREE.Vector3(x, y, z);
}

/** The rect's world-space width, for the certificate's final (absorbed) scale. */
export function certRectWorldWidth(rect: CertScreenRect): number {
  return (rect.width / MAC_SCREEN_RESOLUTION.S.width) * SCREEN_SIZE[0];
}

/** `cf`, Formación's own global progress (Anexo A): `(k - 0.17) / 0.15`. */
export function formationProgress(chapterLocalK: number): number {
  return (chapterLocalK - 0.17) / 0.15;
}

/** Certificate `index`'s own local progress — negative before its turn, ≥0.95 once fully absorbed. */
export function certLocalProgress(cf: number, index: number): number {
  return cf - index;
}

export interface CertFlightPoints {
  /** Resting position in the stack, inside the closed/open briefcase — already in world space. */
  stack: THREE.Vector3;
  /** The raised point past "subida" — world space. */
  up: THREE.Vector3;
  /** The floating point in front of the screen (z=0.62 in lid-local, converted to world) — world space. */
  show: THREE.Vector3;
  /** The absorbed point, flush with the screen (z=0.03 in lid-local) — world space. */
  screen: THREE.Vector3;
  /** World-space width of the screen's own rect at this certificate's aspect — the final absorbed scale target. */
  screenWorldWidth: number;
}

export interface CertFlightState {
  visible: boolean;
  position: THREE.Vector3;
  scale: number;
  /** 0 = flat (stack orientation), 1 = parallel to the screen (artifact `ro`). Callers slerp between their own flat/screen-parallel quaternions by this. */
  orientationBlend: number;
  /** Extra spin, radians — peaks mid-arc, settles elsewhere. */
  spin: number;
  /** 0..1 brief flash partway through the arc phase. */
  frameFlash: number;
  /** 0..1 scan-line sweep progress, only meaningful while the scan line should be visible at all (check via a non-zero value — 0 also means "not scanning"). */
  scanProgress: number;
}

function quadraticBezier(p0: THREE.Vector3, control: THREE.Vector3, p1: THREE.Vector3, t: number): THREE.Vector3 {
  const oneMinusT = 1 - t;
  const a = oneMinusT * oneMinusT;
  const b = 2 * oneMinusT * t;
  const c = t * t;
  return new THREE.Vector3(p0.x * a + control.x * b + p1.x * c, p0.y * a + control.y * b + p1.y * c, p0.z * a + control.z * b + p1.z * c);
}

/**
 * A single certificate's full pose at local progress `u` (artifact lines
 * 1420-1446). `index` only matters for the resting stack jitter the
 * artifact applies before `u` goes positive — once in flight, every
 * certificate follows the same 4-phase curve.
 */
export function certFlightState(u: number, points: CertFlightPoints, t: number, reduced: boolean): CertFlightState {
  if (u <= 0) {
    return { visible: true, position: points.stack.clone(), scale: 0.72, orientationBlend: 0, spin: 0, frameFlash: 0, scanProgress: 0 };
  }
  if (u >= 0.95) {
    return { visible: false, position: points.screen.clone(), scale: 1, orientationBlend: 1, spin: 0, frameFlash: 0, scanProgress: 0 };
  }

  const rise = smoothstep(0, 0.28, u);
  const arc = smoothstep(0.28, 0.55, u);
  const absorb = smoothstep(0.78, 0.95, u);

  let position: THREE.Vector3;
  let scale: number;

  if (u < 0.28) {
    position = points.stack.clone().lerp(points.up, rise * rise);
    scale = 0.72 + (0.86 - 0.72) * rise;
  } else if (u < 0.78) {
    const control = points.up.clone().add(points.show).multiplyScalar(0.5).add(new THREE.Vector3(0, 0.55, 0.35));
    position = quadraticBezier(points.up, control, points.show, arc);
    const floatBob = u >= 0.55 && !reduced ? Math.sin(t * 1.6 + u * 10) * 0.012 : 0;
    position.y += floatBob;
    scale = 0.86 + (1 - 0.86) * arc;
  } else {
    const absorbEase = absorb * absorb;
    position = points.show.clone().lerp(points.screen, absorbEase);
    scale = 1 + (points.screenWorldWidth / 1.5 - 1) * absorbEase;
  }

  const orientationBlend = smoothstep(0.04, 0.5, u);
  const spin = u < 0.55 ? Math.sin(arc * Math.PI) * 0.45 : 0;
  const frameFlash = smoothstep(0.5, 0.6, u) * (1 - smoothstep(0.8, 0.9, u));
  const scanWindow = win(u, 0.58, 0.76, 0.02);
  const scanProgress = scanWindow > 0.002 ? smoothstep(0.58, 0.76, u) : 0;

  return { visible: true, position, scale, orientationBlend, spin, frameFlash, scanProgress };
}
