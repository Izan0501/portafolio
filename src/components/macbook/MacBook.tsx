"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getMaterialRegistry } from "@/components/three/materials/materialRegistry";
import { roundedRectShape } from "@/components/three/geometry/roundedRectShape";
import type { Locale } from "@/i18n/config";
import { CH } from "@/config/chapters";
import { chapterIndexAt, chapterProgressAt } from "@/features/scroll/chapterMath";
import { scrollStore } from "@/features/scroll/scrollStore";
import { poseAt } from "@/features/choreography/keyframes";
import { SPRING, createSpring, stepSpring } from "@/features/choreography/springs";
import { clamp, smoothstep as ss } from "@/lib/math/ease";
import { Keyboard, type KeyboardHandle } from "./Keyboard";
import { Lid, type LidHandle } from "./Lid";
import { drawBoot, bootScreenKey } from "./screens/boot";
import { drawProfile, profileScreenKey } from "./screens/profile";
import { screenPower } from "./screenPower";
import {
  BASE_BEVEL,
  HINGE_LENGTH,
  HINGE_POSITION,
  HINGE_RADIUS,
  MAC_DEPTH,
  MAC_WIDTH,
  TRACKPAD_POSITION,
  TRACKPAD_SIZE,
  WELL_POSITION,
  WELL_SIZE,
} from "./dimensions";

/**
 * The MacBook, assembled and posed — ported 1:1 from the artifact
 * (`_buildMac` for geometry, lines 658-721; the per-frame pose/spring/glow
 * application at lines 1170-1204). One `useFrame` here owns every bit of
 * per-frame state (hinge spring, lean, screen brightness, keyboard glow,
 * screen redraw) and writes it straight into the refs `Keyboard`/`Lid`
 * expose — no React state anywhere on this path (plan §2.2).
 *
 * `hero`/`open`/`prof` have a real screen draw so far (the `switch` inside
 * the `useFrame` below) — `certv`/`form`/`pipe`/`cta` are real artifact
 * modes too, but belong to chapters M6-M9 don't build geometry for yet
 * (Formación/Proyectos/Garantías/Contacto, M10-M12). Outside those, the
 * screen simply keeps showing its last frame rather than drawing
 * something invented — a documented gap, not a guess. Each screen keeps
 * its own param shape (`boot`/`profile` take different progress units —
 * global `p` vs. in-chapter `k`), so this dispatches with an explicit
 * `switch` instead of returning "the function to call" generically.
 */

export interface MacBookProps {
  locale: Locale;
}

/** The two groups `CameraDirector` (M8) reads world matrices from for its weighted-point fit — the base's 4 corners and the lid's own edge (artifact `_fitCam`, lines 1247-1248). */
export interface MacBookHandle {
  macGroup: THREE.Group;
  lidGroup: THREE.Group;
}

export const MacBook = forwardRef<MacBookHandle, MacBookProps>(function MacBook({ locale }, ref) {
  const mat = getMaterialRegistry();
  const groupRef = useRef<THREE.Group>(null);
  const keyboardRef = useRef<KeyboardHandle>(null);
  const lidRef = useRef<LidHandle>(null);

  const hingeSpring = useRef(createSpring(0));
  const lastBacklightKey = useRef<string | null>(null);
  const backlightColor = useMemo(() => new THREE.Color(), []);

  const baseGeometry = useMemo(() => {
    const geometry = new THREE.ExtrudeGeometry(roundedRectShape(MAC_WIDTH, MAC_DEPTH, 0.13), {
      depth: 0.07,
      bevelEnabled: true,
      bevelThickness: BASE_BEVEL,
      bevelSize: BASE_BEVEL,
      bevelSegments: 3,
      curveSegments: 12,
    });
    // Artifact lines 661-662: extruded flat (XY), then stood up on edge and
    // lifted so its top face sits at y=0 locally — `BASE_THICKNESS` is
    // measured from that same top face.
    geometry.rotateX(-Math.PI / 2);
    geometry.translate(0, BASE_BEVEL, 0);
    return geometry;
  }, []);
  const wellGeometry = useMemo(() => new THREE.PlaneGeometry(...WELL_SIZE), []);
  const trackpadGeometry = useMemo(() => new THREE.ShapeGeometry(roundedRectShape(...TRACKPAD_SIZE, 0.05)), []);
  const hingeGeometry = useMemo(() => new THREE.CylinderGeometry(HINGE_RADIUS, HINGE_RADIUS, HINGE_LENGTH, 20), []);

  useEffect(() => {
    return () => {
      baseGeometry.dispose();
      wellGeometry.dispose();
      trackpadGeometry.dispose();
      hingeGeometry.dispose();
    };
  }, [baseGeometry, wellGeometry, trackpadGeometry, hingeGeometry]);

  useFrame((_state, delta) => {
    const group = groupRef.current;
    const lid = lidRef.current;
    const keyboard = keyboardRef.current;
    if (!group || !lid || !keyboard) return;

    const p = scrollStore.p;
    const pose = poseAt(p);

    // Hinge: sub-stepped spring chasing the pose's lid-angle target
    // (artifact line 1175), clamped to the same [0, 112] range.
    const rawAngle = stepSpring(hingeSpring.current, pose.lid, SPRING.hinge.K, SPRING.hinge.C, delta, scrollStore.reduced);
    const lidAngle = clamp(rawAngle, 0, 112);

    // Scroll-velocity lean (artifact line 1179-1180).
    const lean = clamp(scrollStore.vel, -2.5, 2.5);
    group.position.set(pose.mac[0], pose.mac[1], pose.mac[2]);
    group.rotation.set(pose.mac[4], pose.mac[3] + lean * 0.018, 0);
    group.scale.setScalar(pose.mac[5]);

    lid.group.rotation.x = ((90 - lidAngle) * Math.PI) / 180;

    const pow = screenPower(pose.pow, lidAngle, p);
    lid.screenMaterial.color.setScalar(pow);
    lid.screenLight.intensity = pow * 1.5;

    // Keyboard backlight: row-by-row sweep, thresholded like the artifact
    // (lines 1198-1204) so the per-instance color write only runs when the
    // quantized boot/pow pair actually changed.
    const boot = ss(50, 104, lidAngle);
    const backlightKey = `${Math.round(boot * 60)}|${Math.round(pow * 40)}`;
    if (backlightKey !== lastBacklightKey.current) {
      lastBacklightKey.current = backlightKey;
      const glow = keyboard.glow;
      const keyRow = keyboard.keyRow;
      for (let i = 0; i < keyRow.length; i++) {
        const row = keyRow[i];
        const lv = ss(row * 0.11, row * 0.11 + 0.32, boot) * pow * 0.22;
        backlightColor.setRGB(lv, lv * 0.78, lv * 0.48);
        glow.setColorAt(i, backlightColor);
      }
      if (glow.instanceColor) glow.instanceColor.needsUpdate = true;
    }

    // Screen content.
    const chapter = CH[chapterIndexAt(p, CH)];
    switch (chapter.id) {
      case "hero":
      case "open": {
        const key = bootScreenKey(p, scrollStore.t, locale);
        lid.redrawScreen(key, (ctx) => drawBoot(ctx, { p, t: scrollStore.t, locale }));
        break;
      }
      case "prof": {
        const chapterProgress = chapterProgressAt(p, chapter);
        const key = profileScreenKey(chapterProgress, scrollStore.t, locale);
        lid.redrawScreen(key, (ctx) => drawProfile(ctx, { chapterProgress, t: scrollStore.t, locale }));
        break;
      }
      default:
        break;
    }
  });

  useImperativeHandle(
    ref,
    () => ({
      macGroup: groupRef.current as THREE.Group,
      lidGroup: lidRef.current!.group,
    }),
    [],
  );

  return (
    <group ref={groupRef}>
      <mesh geometry={baseGeometry} material={mat.alu} />
      <mesh geometry={wellGeometry} material={mat.well} rotation={[-Math.PI / 2, 0, 0]} position={WELL_POSITION} />
      <Keyboard ref={keyboardRef} />
      <mesh geometry={trackpadGeometry} material={mat.aluD} rotation={[-Math.PI / 2, 0, 0]} position={TRACKPAD_POSITION} />
      <mesh geometry={hingeGeometry} material={mat.aluD} rotation={[0, 0, Math.PI / 2]} position={HINGE_POSITION} />
      <Lid ref={lidRef} />
    </group>
  );
});

export default MacBook;
