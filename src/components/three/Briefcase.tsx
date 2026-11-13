"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getMaterialRegistry } from "@/components/three/materials/materialRegistry";
import { roundedRectShape } from "@/components/three/geometry/roundedRectShape";
import { useCanvasTexture } from "@/components/three/textures/useCanvasTexture";
import { CH } from "@/config/chapters";
import { chapterIndexAt, chapterProgressAt } from "@/features/scroll/chapterMath";
import { scrollStore } from "@/features/scroll/scrollStore";
import { poseAt } from "@/features/choreography/keyframes";
import { SPRING, createSpring, stepSpring } from "@/features/choreography/springs";
import { clamp, clamp01, smoothstep } from "@/lib/math/ease";
import { viewportStore } from "@/hooks/useViewportProfile";

/**
 * The procedural briefcase — ported 1:1 from the artifact's `_buildCase`
 * (`docs/reference/artifact-a/Hero.dc.html`, lines 871-955) and the
 * briefcase-only portion of `_certs` (1383-1407; `CertPlates.tsx` owns
 * the certificate-flight portion of that same function).
 *
 * Real leather bump mapping (a procedural grain canvas as `bumpMap`, not
 * just color), stitching drawn into a dashed-line texture (not geometry),
 * and hasps/lid springs via this project's own `createSpring`/`stepSpring`
 * (the artifact inlines its own `_sp` for these — same integrator, just
 * not factored out there).
 */

const CASE_WIDTH = 1.3;
const CASE_DEPTH = 0.9;
const BODY_HEIGHT = 0.2;
const LID_HEIGHT = 0.085;
const WALL_THICKNESS = 0.045;
const CORNER_RADIUS = 0.075;

/** Base position (no entry/exit slide, no lean) — same X/Z the cameraFit weighted points already use for this object (M8's `wC`). */
const BASE_POSITION_DESKTOP: readonly [number, number] = [2.3, 1.45];
const BASE_POSITION_COMPACT_OFFSET: readonly [number, number] = [0.3, 2.8];

const LID_PIVOT: readonly [number, number, number] = [0, BODY_HEIGHT, -CASE_DEPTH / 2];
const HASP_X = 0.43;
const HASP_LOCAL_POSITION: readonly [number, number, number] = [HASP_X, 0.048, CASE_DEPTH + 0.009];

function ringShape(width: number, depth: number, radius: number, thickness: number): THREE.Shape {
  const shape = roundedRectShape(width, depth, radius);
  shape.holes.push(roundedRectShape(width - 2 * thickness, depth - 2 * thickness, Math.max(0.012, radius - thickness)));
  return shape;
}

/** Procedural leather grain (artifact `_grainTex`, deterministic LCG seed 7) — a real bump map, not just a color texture. */
function drawLeatherGrain(ctx: CanvasRenderingContext2D): void {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, w, h);
  let seed = 7;
  const next = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  for (let i = 0; i < 180; i++) {
    const x = next() * w;
    const y = next() * h;
    const radius = 1 + next() * 2.5;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = "rgba(0,0,0,0.06)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 40; i++) {
    ctx.beginPath();
    ctx.moveTo(next() * w, next() * h);
    ctx.bezierCurveTo(next() * w, next() * h, next() * w, next() * h, next() * w, next() * h);
    ctx.stroke();
  }
}

/** Dashed stitching, drawn into a texture (artifact `stitchH`) — not geometry. */
function drawStitching(ctx: CanvasRenderingContext2D, rows: number): void {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(200,180,106,0.85)";
  ctx.lineWidth = 2;
  ctx.setLineDash([12, 9]);
  for (let i = 0; i < rows; i++) {
    const y = (h / (rows + 1)) * (i + 1);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
}

function drawLiningTexture(ctx: CanvasRenderingContext2D): void {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.fillStyle = "#1b1914";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(238,233,223,0.08)";
  ctx.lineWidth = 1;
  for (let x = -h; x < w; x += 28) {
    ctx.beginPath();
    ctx.moveTo(x, h);
    ctx.lineTo(x + h, 0);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(230,216,74,0.6)";
  ctx.setLineDash([3, 6]);
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 24, w - 48, h - 48);
  ctx.setLineDash([]);
  ctx.font = '600 28px "Martian Mono", ui-monospace, monospace';
  ctx.fillStyle = "rgba(238,233,223,0.55)";
  ctx.textAlign = "center";
  ctx.fillText("CREDENCIALES · 05", w / 2, h / 2);
  ctx.textAlign = "left";
}

export interface BriefcaseHandle {
  group: THREE.Group;
  caseLidGroup: THREE.Group;
}

export const Briefcase = forwardRef<BriefcaseHandle>(function Briefcase(_props, ref) {
  const mat = getMaterialRegistry();
  const groupRef = useRef<THREE.Group>(null);
  const caseLidRef = useRef<THREE.Group>(null);
  const leftHaspRef = useRef<THREE.Group>(null);
  const rightHaspRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  const lidSpring = useRef(createSpring(0));
  const leftHaspSpring = useRef(createSpring(0));
  const rightHaspSpring = useRef(createSpring(0));

  const bodyGeometry = useMemo(() => {
    const geometry = new THREE.ExtrudeGeometry(roundedRectShape(CASE_WIDTH, CASE_DEPTH, CORNER_RADIUS), {
      depth: 0.03,
      bevelEnabled: true,
      bevelThickness: 0.008,
      bevelSize: 0.008,
      bevelSegments: 3,
      curveSegments: 10,
    });
    geometry.rotateX(-Math.PI / 2);
    return geometry;
  }, []);
  const wallsGeometry = useMemo(() => {
    const geometry = new THREE.ExtrudeGeometry(ringShape(CASE_WIDTH, CASE_DEPTH, CORNER_RADIUS, WALL_THICKNESS), { depth: BODY_HEIGHT, bevelEnabled: false, curveSegments: 10 });
    geometry.rotateX(-Math.PI / 2);
    return geometry;
  }, []);
  const lipGeometry = useMemo(() => {
    const geometry = new THREE.ExtrudeGeometry(ringShape(CASE_WIDTH + 0.01, CASE_DEPTH + 0.01, CORNER_RADIUS, WALL_THICKNESS * 0.6), { depth: 0.012, bevelEnabled: false, curveSegments: 10 });
    geometry.rotateX(-Math.PI / 2);
    return geometry;
  }, []);
  const liningGeometry = useMemo(() => new THREE.PlaneGeometry(CASE_WIDTH - 2 * WALL_THICKNESS, CASE_DEPTH - 2 * WALL_THICKNESS), []);
  const caseLidWallGeometry = useMemo(() => {
    const geometry = new THREE.ExtrudeGeometry(ringShape(CASE_WIDTH, CASE_DEPTH, CORNER_RADIUS, WALL_THICKNESS), { depth: LID_HEIGHT, bevelEnabled: false, curveSegments: 10 });
    geometry.rotateX(-Math.PI / 2);
    return geometry;
  }, []);
  const caseLidTopGeometry = useMemo(() => {
    const geometry = new THREE.ExtrudeGeometry(roundedRectShape(CASE_WIDTH, CASE_DEPTH, CORNER_RADIUS), { depth: 0.012, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 2, curveSegments: 10 });
    geometry.rotateX(-Math.PI / 2);
    geometry.translate(0, LID_HEIGHT, 0);
    return geometry;
  }, []);
  const handleCurve = useMemo(() => {
    const points = [
      new THREE.Vector3(-0.22, 0.17, 0),
      new THREE.Vector3(-0.2, 0.3, 0),
      new THREE.Vector3(-0.08, 0.38, 0),
      new THREE.Vector3(0.08, 0.38, 0),
      new THREE.Vector3(0.2, 0.3, 0),
      new THREE.Vector3(0.22, 0.17, 0),
    ];
    return new THREE.CatmullRomCurve3(points);
  }, []);
  const handleGeometry = useMemo(() => new THREE.TubeGeometry(handleCurve, 48, 0.021, 12, false), [handleCurve]);
  const haspPlateGeometry = useMemo(() => new THREE.BoxGeometry(0.07, 0.09, 0.012), []);
  const haspRidgeGeometry = useMemo(() => new THREE.BoxGeometry(0.07, 0.015, 0.016), []);

  useEffect(() => {
    return () => {
      bodyGeometry.dispose();
      wallsGeometry.dispose();
      lipGeometry.dispose();
      liningGeometry.dispose();
      caseLidWallGeometry.dispose();
      caseLidTopGeometry.dispose();
      handleGeometry.dispose();
      haspPlateGeometry.dispose();
      haspRidgeGeometry.dispose();
    };
  }, [bodyGeometry, wallsGeometry, lipGeometry, liningGeometry, caseLidWallGeometry, caseLidTopGeometry, handleGeometry, haspPlateGeometry, haspRidgeGeometry]);

  const grain = useCanvasTexture({ width: 256, height: 256 });
  useEffect(() => {
    grain.redrawIfKeyChanged("grain", drawLeatherGrain);
    grain.texture.wrapS = THREE.RepeatWrapping;
    grain.texture.wrapT = THREE.RepeatWrapping;
    grain.texture.repeat.set(2, 2);
  }, [grain]);
  const leatherWithGrain = useMemo(() => {
    const material = mat.leather.clone();
    material.bumpMap = grain.texture;
    material.bumpScale = 1.4;
    return material;
  }, [mat.leather, grain.texture]);
  useEffect(() => () => leatherWithGrain.dispose(), [leatherWithGrain]);

  const stitching = useCanvasTexture({ width: 512, height: 128 });
  useEffect(() => {
    stitching.redrawIfKeyChanged("stitch", (ctx) => drawStitching(ctx, 2));
  }, [stitching]);
  const stitchMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ map: stitching.texture, transparent: true, toneMapped: false, depthWrite: false }),
    [stitching.texture],
  );
  useEffect(() => () => stitchMaterial.dispose(), [stitchMaterial]);
  const stitchGeometry = useMemo(() => new THREE.PlaneGeometry(CASE_WIDTH - 0.08, BODY_HEIGHT - 0.03), []);
  const lidStitchGeometry = useMemo(() => new THREE.PlaneGeometry(CASE_WIDTH - 0.08, LID_HEIGHT - 0.02), []);
  useEffect(() => {
    return () => {
      stitchGeometry.dispose();
      lidStitchGeometry.dispose();
    };
  }, [stitchGeometry, lidStitchGeometry]);

  const lining = useCanvasTexture({ width: 1024, height: 686 });
  useEffect(() => {
    lining.redrawIfKeyChanged("lining", drawLiningTexture);
  }, [lining]);
  const liningMaterial = useMemo(() => new THREE.MeshStandardMaterial({ map: lining.texture, roughness: 0.95 }), [lining.texture]);
  useEffect(() => () => liningMaterial.dispose(), [liningMaterial]);

  useFrame((_state, delta) => {
    const group = groupRef.current;
    const caseLid = caseLidRef.current;
    const leftHasp = leftHaspRef.current;
    const rightHasp = rightHaspRef.current;
    const light = lightRef.current;
    if (!group || !caseLid || !leftHasp || !rightHasp || !light) return;

    const reduced = scrollStore.reduced;
    const p = scrollStore.p;
    const chapter = CH[chapterIndexAt(p, CH)];
    const visible = p > 3.1 && p < 6.85;
    group.visible = visible;
    if (!visible) {
      lidSpring.current.x = 0;
      lidSpring.current.v = 0;
      leftHaspSpring.current.x = 0;
      rightHaspSpring.current.x = 0;
      return;
    }

    const k = chapter.id === "cert" ? chapterProgressAt(p, chapter) : p < 3.4 ? 0 : 1;
    const compact = viewportStore.compact;
    const pose = poseAt(p);

    const inEase = smoothstep(3.12, 3.58, p);
    const outEase = smoothstep(6.5, 6.82, p);
    // Artifact: `ease = 1 - (1 - inE)³` applied to entry only — exit uses `outE` raw, no extra cubic easing.
    const entryOffset = (1 - inEase) ** 3 * 4.4;
    const exitOffset = outEase * 4.6;
    const baseX = compact ? pose.mac[0] + BASE_POSITION_COMPACT_OFFSET[0] : BASE_POSITION_DESKTOP[0];
    const baseZ = compact ? BASE_POSITION_COMPACT_OFFSET[1] : BASE_POSITION_DESKTOP[1];
    const lean = clamp(scrollStore.vel, -2.5, 2.5);

    group.position.set(baseX + entryOffset + exitOffset, 0, baseZ);
    group.rotation.set(0, lean * 0.02, 0);

    const openWindow = smoothstep(0.07, 0.15, k) * (1 - smoothstep(0.925, 0.955, k));
    const lidTargetAngle = (compact ? 1.45 : 1.82) * openWindow;
    const lidAngle = stepSpring(lidSpring.current, lidTargetAngle, SPRING.briefcase.K, SPRING.briefcase.C, delta, reduced);
    caseLid.rotation.x = -lidAngle;

    const haspOn = (index: number) => smoothstep(0.03 + index * 0.012, 0.05 + index * 0.012, k) * (1 - smoothstep(0.955, 0.97, k));
    const leftAngle = stepSpring(leftHaspSpring.current, 1.85 * haspOn(0), SPRING.latches.K, SPRING.latches.C, delta, reduced);
    const rightAngle = stepSpring(rightHaspSpring.current, 1.85 * haspOn(1), SPRING.latches.K, SPRING.latches.C, delta, reduced);
    leftHasp.rotation.x = leftAngle;
    rightHasp.rotation.x = rightAngle;

    light.intensity = 0.9 * clamp01(lidAngle / 1.5);
  });

  useImperativeHandle(ref, () => ({ group: groupRef.current as THREE.Group, caseLidGroup: caseLidRef.current as THREE.Group }), []);

  return (
    <group ref={groupRef} visible={false}>
      <mesh geometry={bodyGeometry} material={leatherWithGrain} />
      <mesh geometry={wallsGeometry} material={leatherWithGrain} />
      <mesh geometry={lipGeometry} material={mat.brass} />
      <mesh geometry={liningGeometry} material={liningMaterial} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]} />
      <mesh geometry={stitchGeometry} material={stitchMaterial} position={[0, BODY_HEIGHT / 2, CASE_DEPTH / 2 - 0.005]} />
      <mesh geometry={handleGeometry} material={leatherWithGrain} position={[0, BODY_HEIGHT, 0]} />
      <pointLight ref={lightRef} color={0xf2e6a0} intensity={0} distance={2.2} decay={2} position={[0, 0.45, 0.25]} />

      <group ref={caseLidRef} position={LID_PIVOT}>
        <mesh geometry={caseLidWallGeometry} material={leatherWithGrain} />
        <mesh geometry={caseLidTopGeometry} material={leatherWithGrain} />
        <mesh geometry={lidStitchGeometry} material={stitchMaterial} position={[0, LID_HEIGHT / 2, CASE_DEPTH / 2 - 0.005]} />

        <group ref={leftHaspRef} position={[-HASP_LOCAL_POSITION[0], HASP_LOCAL_POSITION[1], HASP_LOCAL_POSITION[2]]}>
          <mesh geometry={haspPlateGeometry} material={mat.brass} />
          <mesh geometry={haspRidgeGeometry} material={mat.aluD} position={[0, -0.03, 0.005]} />
        </group>
        <group ref={rightHaspRef} position={HASP_LOCAL_POSITION}>
          <mesh geometry={haspPlateGeometry} material={mat.brass} />
          <mesh geometry={haspRidgeGeometry} material={mat.aluD} position={[0, -0.03, 0.005]} />
        </group>
      </group>
    </group>
  );
});

export default Briefcase;
