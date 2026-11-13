"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { MacBookHandle } from "@/components/macbook/MacBook";
import type { IPhoneProHandle } from "@/components/iphone-island/IPhonePro";
import type { BenchHandle } from "./Bench";
import { MAC_DEPTH, MAC_WIDTH, LID_HEIGHT } from "@/components/macbook/dimensions";
import { scrollStore } from "@/features/scroll/scrollStore";
import { poseAt } from "@/features/choreography/keyframes";
import { damp } from "@/lib/math/damp";
import { clamp, smoothstep, win } from "@/lib/math/ease";
import { viewportStore } from "@/hooks/useViewportProfile";
import { assertExclusion, centroidOf, computeFreeArea, fitCamera, type FreeAreaRect } from "@/features/choreography/cameraFit";

/**
 * Drives the real `THREE.PerspectiveCamera` every frame — ported from the
 * artifact's `_fitCam` (`docs/reference/artifact-a/Hero.dc.html`, lines
 * 1241-1310) plus its Screen Dive mix and fog update (lines 1212-1228).
 * `poseAt(p)` (M4) still owns the authored *direction* (where the camera
 * looks from/at at each keyframe) — this component only decides how far
 * along that direction to stand, and how much to shift the view, so a
 * weighted cloud of real-world points (the Mac's base/lid corners, the
 * iPhone's corners once it's on screen) always fits inside the on-screen
 * free area next to the chapter text.
 *
 * Only the Mac's 8 base points (always on) and the iPhone's 4 corners
 * (artifact line 1255, weight ramping in 1.55-2.05 screens, desktop only)
 * are collected — Perfil's badge, the stack tiles, the briefcase, project
 * callouts, VeeBot's layers and Estudio's office point all exist in the
 * artifact's own `_fitCam` too, but belong to chapters M8 doesn't have
 * geometry for yet (M9-M12). Adding them is extending `collectPoints`
 * below with the same `win(...)`-weighted pattern already here, not a
 * redesign.
 *
 * Every smoothing stage the artifact does is reproduced with its own rate,
 * using the same lazily-initialized "seed with the raw value on the first
 * frame" pattern as `_fdS`/`_fs`:
 *  - direction: rate 3
 *  - free-area rect: rate 4
 *  - fitted distance: asymmetric — rate 9 growing, 3.5 shrinking (artifact
 *    line 1304) — snaps outward quickly when more room is needed, eases
 *    back in slowly
 *  - fitted center: rate 4 (artifact reuses the free-area rect's own rate,
 *    not a separate one — not a simplification, the source really does this)
 */

const MAC_HALF_WIDTH = MAC_WIDTH / 2;
const MAC_HALF_DEPTH = MAC_DEPTH / 2;
/** Artifact line 1255 — iPhone corner offsets used for the camera fit, not derived from the body's own half-width/height (the artifact picks slightly different numbers for framing purposes). */
const IPHONE_FIT_CORNERS: ReadonlyArray<readonly [number, number]> = [
  [-0.42, -0.8],
  [0.42, -0.8],
  [-0.42, 0.8],
  [0.42, 0.8],
];
/** Compact mode has no `Sheet.tsx` (M13) to measure yet — the artifact's own fallback when it has no per-chapter sheet measurement either. */
const COMPACT_SHEET_TOP_FALLBACK_FRACTION = 0.55;

const UP = new THREE.Vector3(0, 1, 0);

export interface CameraDirectorProps {
  macRef: React.RefObject<MacBookHandle | null>;
  phoneRef: React.RefObject<IPhoneProHandle | null>;
  benchRef: React.RefObject<BenchHandle | null>;
}

export function CameraDirector({ macRef, phoneRef, benchRef }: CameraDirectorProps) {
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera;
  const scene = useThree((state) => state.scene);

  const copyFraction = useRef(0.365);
  useEffect(() => {
    function measure() {
      const el = document.querySelector('[data-chapter-id="hero"]');
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0) return;
      // The Stage fills the whole viewport (ExperienceShell's `sticky
      // top-0 h-dvh w-full`), so the artifact's own `(cr.right - rb.left)
      // / rootWidth` collapses to `rect.right / window.innerWidth` here.
      copyFraction.current = clamp(rect.right / window.innerWidth, 0.2, 0.6);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const smoothedDirection = useRef<THREE.Vector3 | null>(null);
  const smoothedFreeArea = useRef<FreeAreaRect | null>(null);
  const smoothedDistance = useRef<number | null>(null);
  const smoothedCenter = useRef<THREE.Vector3 | null>(null);
  const pointPool = useRef<THREE.Vector3[]>([]);
  if (pointPool.current.length === 0) {
    // 8 Mac base/lid points + 4 iPhone corners + 3 badge + 2 stack-tile
    // anchors (M9) — extend this count as M10+ adds more optional points.
    pointPool.current = Array.from({ length: 17 }, () => new THREE.Vector3());
  }

  useFrame((state, delta) => {
    const mac = macRef.current;
    const phone = phoneRef.current;
    if (!mac) {
      state.gl.render(state.scene, state.camera);
      return;
    }

    const reduced = scrollStore.reduced;
    const p = scrollStore.p;
    const pose = poseAt(p);
    const { width: vw, height: vh, compact } = viewportStore;

    mac.macGroup.updateMatrixWorld(true);
    let n = 0;
    const pool = pointPool.current;
    const basePoints: THREE.Vector3[] = [];
    const addMacLocal = (x: number, y: number, z: number) => {
      const v = pool[n++];
      v.set(x, y, z);
      mac.macGroup.localToWorld(v);
      basePoints.push(v);
    };
    const addLidLocal = (x: number, y: number, z: number) => {
      const v = pool[n++];
      v.set(x, y, z);
      mac.lidGroup.localToWorld(v);
      basePoints.push(v);
    };
    addMacLocal(-MAC_HALF_WIDTH, 0, -MAC_HALF_DEPTH);
    addMacLocal(MAC_HALF_WIDTH, 0, -MAC_HALF_DEPTH);
    addMacLocal(-MAC_HALF_WIDTH, 0, MAC_HALF_DEPTH);
    addMacLocal(MAC_HALF_WIDTH, 0, MAC_HALF_DEPTH);
    for (const x of [-MAC_HALF_WIDTH, MAC_HALF_WIDTH]) {
      addLidLocal(x, LID_HEIGHT, 0);
      addLidLocal(x, 0, 0);
    }

    const allPoints = basePoints.slice();
    if (!compact && phone) {
      const phoneWeight = smoothstep(1.55, 2.05, p);
      if (phoneWeight > 0.001) {
        phone.group.updateMatrixWorld(true);
        const baseCentroid = centroidOf(basePoints);
        for (const [x, y] of IPHONE_FIT_CORNERS) {
          const v = pool[n++];
          v.set(x, y, 0);
          phone.group.localToWorld(v);
          v.lerp(baseCentroid, 1 - phoneWeight); // equivalent to blendTowardCentroid(v, baseCentroid, phoneWeight), in place
          allPoints.push(v);
        }
      }
    }

    // ID badge (M9): 3 points, artifact-style "parallel formula" rather
    // than reading `ProfileBadge`'s real transform (line 1241-1243 of the
    // research pass: the artifact itself computes these from the same
    // X/Z the badge is posed with, not via `localToWorld` on the real
    // object — confirmed, not a simplification here).
    const badgeWeight = win(p, 1.9, 3.25, 0.16);
    if (badgeWeight > 0.001) {
      const badgeX = compact ? pose.mac[0] + 1.95 : 2.05;
      const badgeZ = compact ? 1.0 : 1.65;
      const baseCentroid = centroidOf(basePoints);
      for (const [dx, by] of [
        [-0.38, 1.4],
        [0.38, 1.4],
        [0.38, 0.3],
      ] as const) {
        const v = pool[n++];
        v.set(badgeX + dx, by, badgeZ);
        v.lerp(baseCentroid, 1 - badgeWeight);
        allPoints.push(v);
      }
    }

    // Stack tiles (M9): 2 points, real `localToWorld` on the lid, desktop only.
    if (!compact) {
      const stackWeight = win(p, 2.04, 3.24, 0.08);
      if (stackWeight > 0.001) {
        const baseCentroid = centroidOf(basePoints);
        for (const x of [-1.6, 1.6]) {
          const v = pool[n++];
          v.set(x, 2.78, 0.32);
          mac.lidGroup.localToWorld(v);
          v.lerp(baseCentroid, 1 - stackWeight);
          allPoints.push(v);
        }
      }
    }

    // --- direction: authored cam/tgt from poseAt, smoothed ---
    const rawCam = new THREE.Vector3(...pose.cam);
    const rawTgt = new THREE.Vector3(...pose.tgt);
    const rawDirection = rawCam.clone().sub(rawTgt).normalize();
    if (!smoothedDirection.current) smoothedDirection.current = rawDirection.clone();
    else smoothedDirection.current.lerp(rawDirection, reduced ? 1 : 1 - Math.exp(-3 * delta)).normalize();
    const direction = smoothedDirection.current;

    // --- free area: measured from the real DOM, smoothed ---
    const rawFreeArea = computeFreeArea({
      compact,
      copyFraction: copyFraction.current,
      sheetTop: vh * COMPACT_SHEET_TOP_FALLBACK_FRACTION,
      viewportWidth: vw,
      viewportHeight: vh,
    });
    if (!smoothedFreeArea.current) smoothedFreeArea.current = { ...rawFreeArea };
    else if (reduced) Object.assign(smoothedFreeArea.current, rawFreeArea);
    else {
      const f = smoothedFreeArea.current;
      f.x0 = damp(f.x0, rawFreeArea.x0, 4, delta);
      f.x1 = damp(f.x1, rawFreeArea.x1, 4, delta);
      f.y0 = damp(f.y0, rawFreeArea.y0, 4, delta);
      f.y1 = damp(f.y1, rawFreeArea.y1, 4, delta);
    }
    const freeArea = smoothedFreeArea.current;

    // --- the fit itself (pure, stateless) ---
    const fit = fitCamera({
      points: allPoints,
      direction,
      up: UP,
      fovDegrees: camera.fov,
      aspect: camera.aspect,
      freeArea,
      viewportWidth: vw,
      viewportHeight: vh,
      marginFactor: compact ? 0.92 : 0.94,
    });
    assertExclusion(freeArea, fit, camera.near);

    if (!smoothedDistance.current) smoothedDistance.current = fit.distance;
    else if (reduced) smoothedDistance.current = fit.distance;
    else {
      // Asymmetric: snaps outward fast when more room is suddenly needed, eases back in slowly (artifact line 1304).
      const growing = fit.distance > smoothedDistance.current;
      smoothedDistance.current = damp(smoothedDistance.current, fit.distance, growing ? 9 : 3.5, delta);
    }
    if (!smoothedCenter.current) smoothedCenter.current = fit.center.clone();
    else if (reduced) smoothedCenter.current.copy(fit.center);
    // Reuses the free-area rect's own rate (4) — the artifact really does this, not a simplification.
    else smoothedCenter.current.lerp(fit.center, 1 - Math.exp(-4 * delta));

    // --- Screen Dive: fades the auto-fit back to the raw authored path ---
    const diveMix = win(p, 6.85, 6.85, 0.45);
    const fittedPosition = smoothedCenter.current.clone().addScaledVector(direction, smoothedDistance.current);
    const finalPosition = fittedPosition.lerp(rawCam, diveMix);
    const finalTarget = smoothedCenter.current.clone().lerp(rawTgt, diveMix);

    camera.position.copy(finalPosition);
    camera.lookAt(finalTarget);
    camera.setViewOffset(vw, vh, fit.offsetX * (1 - diveMix), fit.offsetY * (1 - diveMix), vw, vh);

    // --- distance-based fog, driven by the final camera-to-target distance ---
    const cameraDistance = finalPosition.distanceTo(finalTarget);
    if (!scene.fog) scene.fog = new THREE.Fog(0x0d0c0a, 11, 26);
    if (scene.fog instanceof THREE.Fog) {
      scene.fog.near = Math.max(11, cameraDistance + 3);
      scene.fog.far = scene.fog.near + 15;
    }
    benchRef.current?.setFogNear(Math.max(9, cameraDistance + 1));

    state.gl.render(state.scene, state.camera);
  }, 1 /* positive priority (R3F docs, `events-*.esm.js` line ~1411): guarantees this runs after MacBook/IPhonePro's default-priority useFrame in the same frame, but also hands R3F's automatic per-frame render off to whichever callback holds a positive priority — confirmed in the fiber source (`internal.priority` is a counter of positive-priority subscribers; `createLoop` only auto-renders when it's 0). Not rendering manually here would mean the scene stops repainting entirely the moment this component mounts. */);

  return null;
}

export default CameraDirector;
