"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getMaterialRegistry } from "@/components/three/materials/materialRegistry";
import { roundedRectShape } from "@/components/three/geometry/roundedRectShape";
import { useCanvasTexture } from "@/components/three/textures/useCanvasTexture";
import { PHONE_SCREEN_RESOLUTION, type ScreenTier } from "@/components/three/textures/screenTiers";
import type { Locale } from "@/i18n/config";
import { CH } from "@/config/chapters";
import { chapterIndexAt, chapterProgressAt } from "@/features/scroll/chapterMath";
import { scrollStore } from "@/features/scroll/scrollStore";
import { poseAt } from "@/features/choreography/keyframes";
import { SPRING, createSpring, stepSpring } from "@/features/choreography/springs";
import { clamp } from "@/lib/math/ease";
import { drawPhoneScreen, phoneScreenKey } from "./PhoneScreen";
import { drawProfile as drawPhoneProfile, profileScreenKey as phoneProfileScreenKey } from "./screens/profile";
import { drawCase, drawCaseCredential, caseScreenKey, caseCredentialScreenKey } from "./screens/case";
import { drawProjectScreen, projectScreenKey } from "./screens/projectScreens";
import { drawIslandTexture } from "./IslandTexture";
import { formationProgress } from "@/features/chapters/certFlight";
import { shotWindowAt } from "@/features/chapters/projectShots";
import { getCredentialTexture } from "@/components/three/textures/credentialImages";
import { CREDENTIALS } from "@/content/credentials";
import { CHAPTERS } from "@/content/chapters";
import { getProjectContent } from "@/content/projects";
import { phoneScreenPower } from "./screenPower";
import { islandTargetSize } from "./islandTargetSize";
import {
  BUTTON_POSITIONS,
  CAMERA_PLATE_POSITION,
  CAMERA_PLATE_RADIUS,
  CAMERA_PLATE_SIZE,
  FRONT_GLASS_Z,
  LENS_DEPTH,
  LENS_POSITIONS_XY,
  LENS_RADIUS_BOTTOM,
  LENS_RADIUS_TOP,
  LENS_Z,
  PHONE_BEVEL,
  PHONE_DEPTH,
  PHONE_HEIGHT,
  PHONE_WIDTH,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  SCREEN_Z,
} from "./dimensions";

/**
 * The iPhone, assembled and posed — ported 1:1 from the artifact
 * (`_buildPhone` for geometry, lines 725-745; the per-frame pose/power
 * application at lines 1187-1190/1192; the on-screen island's spring and
 * target sizing in `_screens`, lines 1505-1512 and 2026 (the "only impulse
 * while the *real* `_drawMac`-style content changed" check — the velocity
 * kick is unconditional here, independent of `DynamicIslandNav`'s own open
 * state, because the artifact's `this.pisl` and `this.isl` are two
 * entirely separate spring objects, not one shared between the 3D screen
 * and the DOM nav)).
 *
 * Same single-`useFrame`, mutate-only-inside-effects-and-frame-callbacks
 * pattern as `MacBook.tsx` — confirmed in M6 that this alone keeps
 * `react-hooks/immutability`/`react-hooks/refs` quiet without needing the
 * `eslint.config.mjs` override `Bench.tsx` needed.
 */

export interface IPhoneProProps {
  locale: Locale;
}

/** The group `CameraDirector` (M8) reads the world matrix from for its weighted-point fit — the iPhone's 4 corners (artifact `_fitCam`, line 1255). */
export interface IPhoneProHandle {
  group: THREE.Group;
}

export const IPhonePro = forwardRef<IPhoneProHandle, IPhoneProProps>(function IPhonePro({ locale }, ref) {
  const mat = getMaterialRegistry();
  const groupRef = useRef<THREE.Group>(null);

  const screenTier: ScreenTier = "M";
  const screen = useCanvasTexture(PHONE_SCREEN_RESOLUTION[screenTier]);
  const screenMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ map: screen.texture, toneMapped: false, color: 0x000000 }),
    [screen.texture],
  );
  useEffect(() => () => screenMaterial.dispose(), [screenMaterial]);

  const islandSpringW = useRef(createSpring(100));
  const islandSpringH = useRef(createSpring(30));
  const lastChapterId = useRef<string | null>(null);

  const bodyGeometry = useMemo(() => {
    const geometry = new THREE.ExtrudeGeometry(roundedRectShape(PHONE_WIDTH, PHONE_HEIGHT, 0.115), {
      depth: PHONE_DEPTH,
      bevelEnabled: true,
      bevelThickness: PHONE_BEVEL,
      bevelSize: PHONE_BEVEL,
      bevelSegments: 4,
      curveSegments: 14,
    });
    geometry.translate(0, 0, -PHONE_DEPTH / 2);
    return geometry;
  }, []);
  const frontGlassGeometry = useMemo(() => new THREE.ShapeGeometry(roundedRectShape(PHONE_WIDTH + 0.02, PHONE_HEIGHT + 0.02, 0.122), 14), []);
  const screenGeometry = useMemo(() => {
    const geometry = new THREE.ShapeGeometry(roundedRectShape(SCREEN_WIDTH, SCREEN_HEIGHT, 0.095), 14);
    // Artifact lines 733-736: ShapeGeometry's default UVs don't necessarily
    // cover [0,1] cleanly against this shape's own bounding box, so they're
    // remapped by hand from each vertex's position instead of relied on.
    const position = geometry.attributes.position;
    const uv = geometry.attributes.uv;
    for (let i = 0; i < position.count; i++) {
      uv.setXY(i, (position.getX(i) + SCREEN_WIDTH / 2) / SCREEN_WIDTH, (position.getY(i) + SCREEN_HEIGHT / 2) / SCREEN_HEIGHT);
    }
    uv.needsUpdate = true;
    return geometry;
  }, []);
  const plateGeometry = useMemo(() => new THREE.ShapeGeometry(roundedRectShape(CAMERA_PLATE_SIZE, CAMERA_PLATE_SIZE, CAMERA_PLATE_RADIUS), 10), []);
  const lensGeometry = useMemo(() => {
    const geometry = new THREE.CylinderGeometry(LENS_RADIUS_TOP, LENS_RADIUS_BOTTOM, LENS_DEPTH, 28);
    geometry.rotateX(Math.PI / 2);
    return geometry;
  }, []);
  const buttonGeometry = useMemo(() => new THREE.BoxGeometry(0.012, 1, 0.022), []);

  useEffect(() => {
    return () => {
      bodyGeometry.dispose();
      frontGlassGeometry.dispose();
      screenGeometry.dispose();
      plateGeometry.dispose();
      lensGeometry.dispose();
      buttonGeometry.dispose();
    };
  }, [bodyGeometry, frontGlassGeometry, screenGeometry, plateGeometry, lensGeometry, buttonGeometry]);

  useFrame((_state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const p = scrollStore.p;
    const pose = poseAt(p);
    const reduced = scrollStore.reduced;

    const lean = clamp(scrollStore.vel, -2.5, 2.5);
    const breathe = reduced ? 0 : Math.sin(scrollStore.t * 0.9) * 0.008;
    group.position.set(pose.ph[0], pose.ph[1] + breathe, pose.ph[2]);
    group.rotation.set(pose.ph[4] + lean * 0.02, pose.ph[3] + lean * 0.05, pose.ph[5] - lean * 0.045);
    group.scale.setScalar(pose.ph[6]);

    const pow = phoneScreenPower(p);
    screenMaterial.color.setScalar(pow);

    const chapter = CH[chapterIndexAt(p, CH)];
    const chapterId = chapter.id;
    if (chapterId !== lastChapterId.current) {
      lastChapterId.current = chapterId;
      if (!reduced) {
        islandSpringW.current.v += 520;
        islandSpringH.current.v += 90;
      }
    }
    const [targetW, targetH] = islandTargetSize(chapterId);
    const islandWidth = stepSpring(islandSpringW.current, targetW, SPRING.island.K, SPRING.island.C, delta, reduced);
    const islandHeight = stepSpring(islandSpringH.current, targetH, SPRING.island.K, SPRING.island.C, delta, reduced);

    if (pow > 0.002) {
      const chapterProgress = chapterProgressAt(p, chapter);
      if (chapterId === "prof") {
        const key = `${phoneProfileScreenKey(chapterProgress, locale)}|${Math.round(islandWidth)}|${Math.round(islandHeight)}`;
        screen.redrawIfKeyChanged(key, (ctx) => {
          drawPhoneProfile(ctx, { chapterProgress, locale });
          drawIslandTexture(ctx, { islandWidth, islandHeight });
        });
      } else if (chapterId === "cert") {
        const cf = formationProgress(chapterProgress);
        const activeIndex = Math.floor(cf - 0.8);
        if (activeIndex >= 0 && activeIndex < CREDENTIALS.length && chapterProgress < 0.94) {
          const credential = CREDENTIALS[activeIndex];
          const localProgress = cf - activeIndex;
          const texEntry = getCredentialTexture(credential);
          const key = `${caseCredentialScreenKey(activeIndex, localProgress, texEntry !== null, locale)}|${Math.round(islandWidth)}|${Math.round(islandHeight)}`;
          screen.redrawIfKeyChanged(key, (ctx) => {
            drawCaseCredential(ctx, { credential, localProgress, activeIndex, image: texEntry?.image ?? null, locale });
            drawIslandTexture(ctx, { islandWidth, islandHeight });
          });
        } else {
          const key = `${caseScreenKey(chapterProgress, locale)}|${Math.round(islandWidth)}|${Math.round(islandHeight)}`;
          screen.redrawIfKeyChanged(key, (ctx) => {
            drawCase(ctx, chapterProgress, locale);
            drawIslandTexture(ctx, { islandWidth, islandHeight });
          });
        }
      } else if (["nave", "vee", "est", "mel", "con"].includes(chapterId)) {
        const copy = CHAPTERS[chapter.id];
        const project = copy.kind === "project" ? getProjectContent(copy.projectId) : undefined;
        if (project) {
          const { index: shotIndex } = shotWindowAt(chapterProgress, project.showcase.length);
          const key = `${projectScreenKey(project.id, shotIndex, scrollStore.t, locale)}|${Math.round(islandWidth)}|${Math.round(islandHeight)}`;
          screen.redrawIfKeyChanged(key, (ctx) => {
            drawProjectScreen(ctx, { project, shotIndex, t: scrollStore.t, locale });
            drawIslandTexture(ctx, { islandWidth, islandHeight });
          });
        }
      } else {
        // Every chapter without a screen of its own yet (dive/pipe/cta,
        // M12) falls back to the contact terminal — the pre-existing M7
        // behavior (there was no dispatch at all before M9), kept as-is
        // rather than switched to the Mac's "freeze the last frame"
        // strategy, which M9's scope didn't ask for.
        const key = `${phoneScreenKey(chapterProgress, locale)}|${Math.round(islandWidth)}|${Math.round(islandHeight)}`;
        screen.redrawIfKeyChanged(key, (ctx) => {
          drawPhoneScreen(ctx, { chapterProgress, locale });
          drawIslandTexture(ctx, { islandWidth, islandHeight });
        });
      }
    }
  });

  useImperativeHandle(ref, () => ({ group: groupRef.current as THREE.Group }), []);

  return (
    <group ref={groupRef}>
      <mesh geometry={bodyGeometry} material={mat.ti} />
      <mesh geometry={frontGlassGeometry} material={mat.glass} position={[0, 0, FRONT_GLASS_Z]} />
      <mesh geometry={screenGeometry} material={screenMaterial} position={[0, 0, SCREEN_Z]} />
      <mesh geometry={plateGeometry} material={mat.ti} position={CAMERA_PLATE_POSITION} rotation={[0, Math.PI, 0]} />
      {LENS_POSITIONS_XY.map(([x, y]) => (
        <mesh key={`${x},${y}`} geometry={lensGeometry} material={mat.lens} position={[x, y, LENS_Z]} />
      ))}
      {BUTTON_POSITIONS.map(([x, y, lengthScale]) => (
        <mesh key={`${x},${y}`} geometry={buttonGeometry} material={mat.ti} position={[x, y, 0]} scale={[1, lengthScale, 1]} />
      ))}
    </group>
  );
});

export default IPhonePro;
