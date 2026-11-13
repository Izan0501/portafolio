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
 * Estudio's "sedes" — ported from the artifact's `this.pins` (construction
 * lines 812-821, animation 1359-1364). 2 real office locations (Tucumán,
 * Catamarca), each a stem + head + a radar-style pulsing ground ring +
 * label, cascading in with Estudio's own camera weight window (`wE`,
 * already known from M8's cameraFit: `win(p, 11.1, 11.6, 0.22)`).
 */

const PIN_STEM_HEIGHT = 0.32;
const PIN_HEAD_RADIUS = 0.045;
const PIN_SPACING = 0.5;
const PINS_BASE_OFFSET: readonly [number, number] = [-0.4, 0.9];

interface PinContent {
  city: string;
  subtitle: string;
}

const PINS: readonly PinContent[] = [
  { city: "Tucumán", subtitle: "sede · derecho penal y consumidor" },
  { city: "Catamarca", subtitle: "sede · derecho penal y consumidor" },
];

function drawLabel(ctx: CanvasRenderingContext2D, pin: PinContent): void {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.font = '800 48px "Schibsted Grotesk", system-ui, sans-serif';
  ctx.fillStyle = "#EEE9DF";
  ctx.textAlign = "left";
  ctx.fillText(pin.city, 8, 56);
  ctx.font = '500 22px "Martian Mono", ui-monospace, monospace';
  ctx.fillStyle = "#A39C8F";
  ctx.fillText(pin.subtitle, 8, 88);
}

export interface OfficePinsHandle {
  group: THREE.Group;
}

export interface OfficePinsProps {
  macRef: React.RefObject<MacBookHandle | null>;
}

export const OfficePins = forwardRef<OfficePinsHandle, OfficePinsProps>(function OfficePins({ macRef }, ref) {
  const mat = getMaterialRegistry();
  const groupRef = useRef<THREE.Group>(null);
  const pinRefs = useRef<Array<THREE.Group | null>>(Array(PINS.length).fill(null));
  const ringRefs = useRef<Array<THREE.Mesh | null>>(Array(PINS.length).fill(null));

  const stemGeometry = useMemo(() => new THREE.CylinderGeometry(0.008, 0.008, PIN_STEM_HEIGHT, 8), []);
  const headGeometry = useMemo(() => new THREE.SphereGeometry(PIN_HEAD_RADIUS, 16, 16), []);
  const ringGeometry = useMemo(() => new THREE.RingGeometry(0.06, 0.08, 32), []);
  const labelGeometry = useMemo(() => new THREE.PlaneGeometry(0.6, 0.18), []);
  useEffect(() => {
    return () => {
      stemGeometry.dispose();
      headGeometry.dispose();
      ringGeometry.dispose();
      labelGeometry.dispose();
    };
  }, [stemGeometry, headGeometry, ringGeometry, labelGeometry]);

  const ringMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ color: 0xe6d84a, transparent: true, side: THREE.DoubleSide, toneMapped: false }),
    [],
  );
  useEffect(() => () => ringMaterial.dispose(), [ringMaterial]);

  const texture0 = useCanvasTexture({ width: 512, height: 128 });
  const texture1 = useCanvasTexture({ width: 512, height: 128 });
  const textures = useMemo(() => [texture0, texture1], [texture0, texture1]);
  useEffect(() => {
    textures.forEach((tex, i) => tex.redrawIfKeyChanged(`pin|${i}`, (ctx) => drawLabel(ctx, PINS[i])));
  }, [textures]);
  const labelMaterials = useMemo(
    () => textures.map((tex) => new THREE.MeshBasicMaterial({ map: tex.texture, transparent: true, toneMapped: false })),
    [textures],
  );
  useEffect(() => {
    return () => labelMaterials.forEach((material) => material.dispose());
  }, [labelMaterials]);

  useFrame(() => {
    const group = groupRef.current;
    const mac = macRef.current;
    if (!group || !mac) return;

    const p = scrollStore.p;
    const weight = win(p, 11.1, 11.6, 0.22);
    const live = p > 10.1 && p < 11.6;
    group.visible = live;
    if (!live) return;

    group.position.set(mac.macGroup.position.x + PINS_BASE_OFFSET[0], 0, mac.macGroup.position.z + PINS_BASE_OFFSET[1]);

    const t = scrollStore.t;
    for (let i = 0; i < PINS.length; i++) {
      const pin = pinRefs.current[i];
      const ring = ringRefs.current[i];
      if (!pin || !ring) continue;
      const reveal = smoothstep(0, 1, weight * 1.2 - i * 0.15);
      pin.visible = reveal > 0.01;
      pin.scale.setScalar(0.5 + 0.5 * reveal);
      pin.position.x = i * PIN_SPACING;

      const radarPhase = (t * 0.6 + i * 0.5) % 1;
      ring.scale.setScalar(0.3 + radarPhase * 1.4);
      (ring.material as THREE.MeshBasicMaterial).opacity = reveal * (1 - radarPhase) * 0.7;
    }
  });

  useImperativeHandle(ref, () => ({ group: groupRef.current as THREE.Group }), []);

  return (
    <group ref={groupRef} visible={false}>
      {PINS.map((_pin, i) => (
        <group key={i} ref={(el) => { pinRefs.current[i] = el; }}>
          <mesh geometry={stemGeometry} material={mat.aluD} position={[0, PIN_STEM_HEIGHT / 2, 0]} />
          <mesh geometry={headGeometry} material={mat.lemon} position={[0, PIN_STEM_HEIGHT, 0]} />
          <mesh ref={(el) => { ringRefs.current[i] = el; }} geometry={ringGeometry} material={ringMaterial} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]} />
          <mesh geometry={labelGeometry} material={labelMaterials[i]} position={[0.3, PIN_STEM_HEIGHT + 0.15, 0]} />
        </group>
      ))}
    </group>
  );
});

export default OfficePins;
