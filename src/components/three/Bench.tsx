"use client";

import { forwardRef, useImperativeHandle, useMemo } from "react";
import * as THREE from "three";

/**
 * The bench — DESIGN.md §4: "ShaderMaterial grafito liso con pozo de luz
 * que sigue a la Mac y niebla por distancia · sombras de contacto por blob,
 * sin shadow maps". A flat `grafito` (#0D0C0A) surface with a soft radial
 * "pool of light" (a touch of `carbon`/`carbon-2`) under whatever the scene
 * wants lit, fading toward the edges with distance, and no `THREE.Light`
 * shadow map anywhere — contact shadows are drawn, not cast.
 *
 * `poolCenter` defaults to the origin: nothing has a real position to
 * follow yet (no MacBook until M6). `<Bench poolCenter={macXZ}/>` is the
 * hook for whichever module poses the Mac to point this at it — the shader
 * itself doesn't know or care what's casting the pool, just where it is.
 *
 * Contact-shadow *blobs* specifically (per-object soft ellipses, plan
 * §2.3) aren't drawn here: with nothing yet occupying the bench, there's
 * nothing real to blob under. `uBlobs` is wired up and ready (an array
 * uniform, empty for now) for M6+ to populate as each procedural object
 * lands on the bench, instead of this file growing a second shader pass
 * later.
 *
 * Fog (M8): a single `uNear` uniform, with the far edge baked into the
 * shader as `uNear + 15.0` — ported from the artifact's real fog, not the
 * two independent fixed uniforms (`uFogNear`/`uFogFar` = 6/22) M5 shipped
 * before `CameraDirector` existed to drive it. `setFogNear` is exposed
 * through a ref (not a reactive prop) because `CameraDirector` writes it
 * every frame from the camera-to-target distance — a prop here would mean
 * either React state changing on scroll (forbidden, plan §2.2) or Bench
 * re-rendering every frame for no reason.
 */

const MAX_BLOBS = 8;

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  void main() {
    vUv = uv;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  // \`cameraPosition\` is a three.js built-in uniform (world-space, updated
  // every render from the real camera) — no need to pass/update our own.
  uniform vec3 uColor;
  uniform vec3 uPoolColor;
  uniform vec2 uPoolCenter;
  uniform float uPoolRadius;
  uniform float uNear;
  uniform int uBlobCount;
  uniform vec2 uBlobCenters[${MAX_BLOBS}];
  uniform float uBlobRadii[${MAX_BLOBS}];

  varying vec2 vUv;
  varying vec3 vWorldPosition;

  void main() {
    float poolDist = distance(vWorldPosition.xz, uPoolCenter);
    float pool = 1.0 - smoothstep(0.0, uPoolRadius, poolDist);
    vec3 color = mix(uColor, uPoolColor, pool * 0.55);

    // Contact-shadow blobs: a soft darkening ellipse per occupied spot.
    float shadow = 0.0;
    for (int i = 0; i < ${MAX_BLOBS}; i++) {
      if (i >= uBlobCount) break;
      float d = distance(vWorldPosition.xz, uBlobCenters[i]);
      shadow = max(shadow, 1.0 - smoothstep(0.0, uBlobRadii[i], d));
    }
    color = mix(color, color * 0.55, shadow * 0.8);

    float camDist = distance(vWorldPosition, cameraPosition);
    float fog = smoothstep(uNear, uNear + 15.0, camDist);
    color = mix(color, uColor * 0.7, fog);

    gl_FragColor = vec4(color, 1.0);
  }
`;

export interface BenchBlob {
  center: [number, number];
  radius: number;
}

export interface BenchProps {
  /** XZ position the pool of light centers on — the pose of whatever's meant to be "under the lamp" (plan default: the Mac). */
  poolCenter?: [number, number];
  poolRadius?: number;
  /** Contact-shadow ellipses, one per object actually occupying the bench. Empty until M6+ has real objects to place one under. */
  blobs?: readonly BenchBlob[];
  size?: number;
}

interface BenchUniforms {
  // Index signature so this satisfies drei/fiber's `ShaderMaterialProps.uniforms`
  // type (`{ [uniform: string]: IUniform }`) — the named fields below stay
  // their own specific types (THREE.Color, not unknown) wherever the code
  // here actually reads them; this is only load-bearing for the JSX prop.
  [uniform: string]: { value: unknown };
  uColor: { value: THREE.Color };
  uPoolColor: { value: THREE.Color };
  uPoolCenter: { value: THREE.Vector2 };
  uPoolRadius: { value: number };
  uNear: { value: number };
  uBlobCount: { value: number };
  uBlobCenters: { value: THREE.Vector2[] };
  uBlobRadii: { value: number[] };
}

/** `CameraDirector` writes fog distance through this every frame. */
export interface BenchHandle {
  setFogNear: (near: number) => void;
}

export const Bench = forwardRef<BenchHandle, BenchProps>(function Bench({ poolCenter = [0, 0], poolRadius = 2.2, blobs = [], size = 40 }, ref) {
  // Created once, mutated in place on every render after — the standard
  // R3F pattern for a uniforms object (three.js's own `ShaderMaterial`
  // uniforms are mutable by design: `uniform.value = x` *is* the public
  // API, there's no immutable alternative). This file is exempted from
  // `react-hooks/immutability`/`react-hooks/refs` in eslint.config.mjs for
  // exactly this reason — see that file's comment for the full rationale.
  const uniforms = useMemo<BenchUniforms>(
    () => ({
      uColor: { value: new THREE.Color("#0d0c0a") }, // --color-grafito
      uPoolColor: { value: new THREE.Color("#211e1a") }, // --color-carbon-2
      uPoolCenter: { value: new THREE.Vector2(...poolCenter) },
      uPoolRadius: { value: poolRadius },
      uNear: { value: 9 }, // artifact's own floor (Math.max(9, cd + 1)) — a reasonable default before the first frame sets a real one
      uBlobCount: { value: 0 },
      uBlobCenters: { value: Array.from({ length: MAX_BLOBS }, () => new THREE.Vector2()) },
      uBlobRadii: { value: new Array(MAX_BLOBS).fill(0) },
    }),
    [], // intentionally empty — every field is updated in place below, never replaced
  );

  uniforms.uPoolCenter.value.set(poolCenter[0], poolCenter[1]);
  uniforms.uPoolRadius.value = poolRadius;
  uniforms.uBlobCount.value = Math.min(blobs.length, MAX_BLOBS);
  for (let i = 0; i < MAX_BLOBS; i++) {
    const blob = blobs[i];
    if (blob) {
      uniforms.uBlobCenters.value[i].set(blob.center[0], blob.center[1]);
      uniforms.uBlobRadii.value[i] = blob.radius;
    } else {
      uniforms.uBlobRadii.value[i] = 0;
    }
  }

  useImperativeHandle(
    ref,
    () => ({
      setFogNear: (near: number) => {
        uniforms.uNear.value = near;
      },
    }),
    [uniforms],
  );

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow={false}>
      <planeGeometry args={[size, size]} />
      <shaderMaterial vertexShader={VERTEX_SHADER} fragmentShader={FRAGMENT_SHADER} uniforms={uniforms} />
    </mesh>
  );
});
