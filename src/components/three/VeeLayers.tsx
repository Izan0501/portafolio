"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getMaterialRegistry } from "@/components/three/materials/materialRegistry";
import { useCanvasTexture } from "@/components/three/textures/useCanvasTexture";
import type { MacBookHandle } from "@/components/macbook/MacBook";
import { scrollStore } from "@/features/scroll/scrollStore";
import { smoothstep, win } from "@/lib/math/ease";

/**
 * VeeBot's "capas" — ported from the artifact's `this.plates` (construction
 * lines 806-810, animation 1353-1357). 4 real architecture layers stacked
 * vertically above the Mac (index 0 on top, 3 on the bottom — the literal
 * stack the plan describes), cascading in one after another as VeeBot's
 * own weighted-camera window (`wV`, already known from M8's cameraFit:
 * `win(p, 9.62, 10.08, 0.18)`) ramps up.
 *
 * Not transparency/depth layering — plain spatial stacking with real
 * architecture text, confirmed against the artifact (its own "capas" are
 * 4 opaque plates, not a see-through effect).
 *
 * The plates' exact world position wasn't citable as literal numbers from
 * the research pass (only the stacking order and the `r` reveal formula
 * were) — positioned here at a reasonable spot above the lid, analogous
 * to Perfil's stack tiles (M9).
 */

const PLATE_WIDTH = 2.4;
const PLATE_HEIGHT = 0.394;
const PLATE_GAP = 0.45;
const STACK_BASE_OFFSET: readonly [number, number, number] = [0.9, 1.4, -0.3];

interface LayerContent {
  title: string;
  lines: readonly string[];
}

const LAYERS: readonly LayerContent[] = [
  { title: "Ingesta de CV", lines: ["React/Vite → FastAPI", "tenant A | B"] },
  { title: "Scoring IA", lines: ["Gemini 2.5 Flash"] },
  { title: "Vectores", lines: ["Pinecone"] },
  { title: "Persistencia", lines: ["MongoDB + SMTP"] },
];

function setFont(ctx: CanvasRenderingContext2D, size: number, weight = 400, mono = false): void {
  ctx.font = `${weight} ${size}px ${mono ? '"Martian Mono", ui-monospace, monospace' : '"Schibsted Grotesk", system-ui, sans-serif'}`;
}

function drawLayerFace(ctx: CanvasRenderingContext2D, layer: LayerContent, index: number): void {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#171512";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "#2E2A24";
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, w - 2, h - 2);

  setFont(ctx, 13, 700, true);
  ctx.fillStyle = "#E6D84A";
  ctx.fillText(`0${index + 1}`, 24, 34);

  setFont(ctx, 26, 800);
  ctx.fillStyle = "#EEE9DF";
  ctx.fillText(layer.title, 70, 38);

  setFont(ctx, 14, 500, true);
  ctx.fillStyle = "#A39C8F";
  layer.lines.forEach((line, i) => ctx.fillText(line, 70, 62 + i * 18));
}

export interface VeeLayersHandle {
  group: THREE.Group;
}

export interface VeeLayersProps {
  macRef: React.RefObject<MacBookHandle | null>;
}

export const VeeLayers = forwardRef<VeeLayersHandle, VeeLayersProps>(function VeeLayers({ macRef }, ref) {
  const mat = getMaterialRegistry();
  const groupRef = useRef<THREE.Group>(null);
  const plateRefs = useRef<Array<THREE.Group | null>>(Array(LAYERS.length).fill(null));
  const faceRefs = useRef<Array<THREE.Mesh | null>>(Array(LAYERS.length).fill(null));

  const slabGeometry = useMemo(() => new THREE.PlaneGeometry(PLATE_WIDTH, PLATE_HEIGHT), []);
  useEffect(() => () => slabGeometry.dispose(), [slabGeometry]);

  const texture0 = useCanvasTexture({ width: 1024, height: 168 });
  const texture1 = useCanvasTexture({ width: 1024, height: 168 });
  const texture2 = useCanvasTexture({ width: 1024, height: 168 });
  const texture3 = useCanvasTexture({ width: 1024, height: 168 });
  const textures = useMemo(() => [texture0, texture1, texture2, texture3], [texture0, texture1, texture2, texture3]);

  useEffect(() => {
    textures.forEach((tex, i) => tex.redrawIfKeyChanged(`layer|${i}`, (ctx) => drawLayerFace(ctx, LAYERS[i], i)));
  }, [textures]);

  const faceMaterials = useMemo(() => textures.map((tex) => new THREE.MeshBasicMaterial({ map: tex.texture, transparent: true, toneMapped: false })), [textures]);
  useEffect(() => {
    return () => faceMaterials.forEach((material) => material.dispose());
  }, [faceMaterials]);

  useFrame(() => {
    const group = groupRef.current;
    const mac = macRef.current;
    if (!group || !mac) return;

    const p = scrollStore.p;
    // VeeBot's own camera weight window (wV, M8's cameraFit: `win(p, 9.62, 10.08, 0.18)`).
    const weight = win(p, 9.62, 10.08, 0.18);
    const live = p > 8.6 && p < 10.1;
    group.visible = live;
    if (!live) return;

    for (let i = 0; i < LAYERS.length; i++) {
      const plate = plateRefs.current[i];
      const face = faceRefs.current[i];
      if (!plate || !face) continue;
      const reveal = smoothstep(0, 1, weight * 1.15 - i * 0.05);
      plate.visible = reveal > 0.01;
      plate.scale.setScalar(0.6 + 0.4 * reveal);
      plate.position.y = STACK_BASE_OFFSET[1] - i * PLATE_GAP + (1 - reveal) * 0.2;
      (face.material as THREE.MeshBasicMaterial).opacity = reveal;
    }

    group.position.set(mac.macGroup.position.x + STACK_BASE_OFFSET[0], 0, mac.macGroup.position.z + STACK_BASE_OFFSET[2]);
  });

  useImperativeHandle(ref, () => ({ group: groupRef.current as THREE.Group }), []);

  return (
    <group ref={groupRef} visible={false}>
      {LAYERS.map((_layer, i) => (
        <group key={i} ref={(el) => { plateRefs.current[i] = el; }}>
          <mesh ref={(el) => { faceRefs.current[i] = el; }} geometry={slabGeometry} material={faceMaterials[i]} />
          <mesh geometry={slabGeometry} material={mat.card} position={[0, 0, -0.004]} />
        </group>
      ))}
    </group>
  );
});

export default VeeLayers;
