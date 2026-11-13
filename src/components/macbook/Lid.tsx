"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import * as THREE from "three";
import { getMaterialRegistry } from "@/components/three/materials/materialRegistry";
import { roundedRectShape } from "@/components/three/geometry/roundedRectShape";
import { useCanvasTexture } from "@/components/three/textures/useCanvasTexture";
import { MAC_SCREEN_RESOLUTION, type ScreenTier } from "@/components/three/textures/screenTiers";
import { LID_BEVEL, LID_HEIGHT, LID_PIVOT, MAC_WIDTH } from "./dimensions";

/**
 * The lid: pivots on the real hinge axis (`LID_PIVOT`), carries the glass,
 * the screen (a throttled `CanvasTexture`), the camera notch, and the
 * engraved "IZ" monogram on its back — ported 1:1 from the artifact
 * (`_buildMac`, lines 702-720).
 *
 * The screen draw itself is the caller's concern: `Lid` only owns the mesh
 * and the canvas plumbing. `MacBook.tsx` passes a draw key + callback to
 * `redrawScreen` every frame; `screens/boot.ts` (the only draw that exists
 * so far) never has to know this is even a Lid.
 */

const MONOGRAM_RESOLUTION = { width: 256, height: 256 };
const NOTCH_SIZE: readonly [number, number] = [0.3, 0.07];
/** World-space screen plane size/position — exported so `certFlight.ts` (M10) can convert the Mac canvas's own pixel rects to world coordinates without duplicating these numbers. */
export const SCREEN_SIZE: readonly [number, number] = [2.76, 1.725];
export const SCREEN_POSITION: readonly [number, number, number] = [0, 1.06, 0.0024];
const NOTCH_POSITION: readonly [number, number, number] = [0, 1.06 + 0.8625 - 0.025, 0.0032];
const GLASS_SIZE: readonly [number, number] = [2.95, 1.99];
const MONOGRAM_SIZE: readonly [number, number] = [0.5, 0.5];

export interface LidHandle {
  /** The pivoting group — `MacBook.tsx` writes `.rotation.x` every frame from the hinge spring. */
  group: THREE.Group;
  /** The screen's unlit material — `MacBook.tsx` writes `.color` (scalar brightness) every frame. */
  screenMaterial: THREE.MeshBasicMaterial;
  /** The point light that washes the keyboard when the screen is on — `MacBook.tsx` writes `.intensity` every frame. */
  screenLight: THREE.PointLight;
  /** Redraws the screen canvas iff `key` changed since the last call (artifact's own `_macKey` throttle, ported into `useCanvasTexture`). */
  redrawScreen: (key: string, draw: (ctx: CanvasRenderingContext2D) => void) => void;
}

export interface LidProps {
  screenTier?: ScreenTier;
}

export const Lid = forwardRef<LidHandle, LidProps>(function Lid({ screenTier = "M" }, ref) {
  const mat = getMaterialRegistry();
  const groupRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  const lidGeometry = useMemo(() => {
    const geometry = new THREE.ExtrudeGeometry(roundedRectShape(MAC_WIDTH, LID_HEIGHT, 0.13), {
      depth: 0.028,
      bevelEnabled: true,
      bevelThickness: LID_BEVEL,
      bevelSize: LID_BEVEL,
      bevelSegments: 3,
      curveSegments: 12,
    });
    geometry.translate(0, LID_HEIGHT / 2, -(0.028 + LID_BEVEL));
    return geometry;
  }, []);
  const glassGeometry = useMemo(() => new THREE.ShapeGeometry(roundedRectShape(...GLASS_SIZE, 0.11)), []);
  const notchGeometry = useMemo(() => new THREE.ShapeGeometry(roundedRectShape(...NOTCH_SIZE, 0.03)), []);
  const screenGeometry = useMemo(() => new THREE.PlaneGeometry(...SCREEN_SIZE), []);
  const monogramGeometry = useMemo(() => new THREE.PlaneGeometry(...MONOGRAM_SIZE), []);

  useEffect(() => {
    return () => {
      lidGeometry.dispose();
      glassGeometry.dispose();
      notchGeometry.dispose();
      screenGeometry.dispose();
      monogramGeometry.dispose();
    };
  }, [lidGeometry, glassGeometry, notchGeometry, screenGeometry, monogramGeometry]);

  const screen = useCanvasTexture(MAC_SCREEN_RESOLUTION[screenTier]);
  const screenMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ map: screen.texture, toneMapped: false, color: 0x000000 }),
    [screen.texture],
  );
  useEffect(() => () => screenMaterial.dispose(), [screenMaterial]);

  const monogram = useCanvasTexture(MONOGRAM_RESOLUTION);
  const monogramMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0x7d807f,
        metalness: 1,
        roughness: 0.12,
        alphaMap: monogram.texture,
        transparent: true,
      }),
    [monogram.texture],
  );
  useEffect(() => () => monogramMaterial.dispose(), [monogramMaterial]);
  useEffect(() => {
    // Drawn once — the monogram never changes, so a constant key means
    // `redrawIfKeyChanged` only actually draws on this first call.
    monogram.redrawIfKeyChanged("iz", (ctx) => {
      ctx.clearRect(0, 0, MONOGRAM_RESOLUTION.width, MONOGRAM_RESOLUTION.height);
      ctx.fillStyle = "#fff";
      ctx.font = '800 150px "Schibsted Grotesk", system-ui, sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("IZ", MONOGRAM_RESOLUTION.width / 2, 136);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- draws exactly once, deliberately not re-running when `monogram` identity changes mid-life (it doesn't).
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      group: groupRef.current as THREE.Group,
      screenMaterial,
      screenLight: lightRef.current as THREE.PointLight,
      redrawScreen: screen.redrawIfKeyChanged,
    }),
    [screenMaterial, screen.redrawIfKeyChanged],
  );

  return (
    <group ref={groupRef} position={LID_PIVOT}>
      <mesh geometry={lidGeometry} material={mat.alu} />
      <mesh geometry={glassGeometry} material={mat.glass} position={[0, LID_HEIGHT / 2, 0.0012]} />
      <mesh geometry={screenGeometry} material={screenMaterial} position={SCREEN_POSITION} />
      <mesh geometry={notchGeometry} material={mat.black} position={NOTCH_POSITION} />
      <mesh
        geometry={monogramGeometry}
        material={monogramMaterial}
        position={[0, LID_HEIGHT / 2, -(0.028 + LID_BEVEL * 2) - 0.0008]}
        rotation={[0, Math.PI, 0]}
      />
      <pointLight ref={lightRef} color={0xf2ecdf} intensity={0} distance={3.2} decay={2} position={[0, 0.95, 0.5]} />
    </group>
  );
});
