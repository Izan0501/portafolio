import { mix, smoothstep } from "@/lib/math/ease";

/**
 * A single stack tile's transform at a given in-chapter progress `k` —
 * extracted from `StackTiles.tsx`'s `useFrame` as a pure function so the
 * 3-phase choreography (artifact `_profile`, lines 1466-1480) has a unit
 * test independent of a mounted Canvas.
 */
export interface StackTileTransform {
  visible: boolean;
  position: readonly [number, number, number];
  rotation: readonly [number, number, number];
  scale: number;
}

/** `index` is 0-3. `compact` swaps the docking target from a floating row above the lid to the screen's own position. */
export function stackTileTransform(index: number, k: number, compact: boolean): StackTileTransform {
  const s0 = 0.14 + index * 0.13;
  const emerge = smoothstep(s0, s0 + 0.04, k);
  const dock = smoothstep(s0 + 0.085, s0 + 0.13, k);
  const back = smoothstep(0.82 + (3 - index) * 0.025, 0.87 + (3 - index) * 0.025, k);

  if (emerge <= 0.002 || back >= 0.998) {
    return { visible: false, position: [0, 1.06, 0.02], rotation: [0, 0, 0], scale: 0.2 };
  }

  const dockX = compact ? 0 : -1.17 + index * 0.78;
  const dockY = compact ? 1.06 : 2.5;
  const dockZ = compact ? 0.02 : 0.32;
  const focusX = compact ? 0 : 0.42;
  const focusY = compact ? 0.7 : 0.78;
  const focusZ = compact ? 0.85 : 0.8;
  const focusScale = compact ? 1.7 : 2.0;

  const ee = 1 - (1 - emerge) ** 3;
  const dd = dock * dock * (3 - 2 * dock);
  let x = mix(0, focusX, ee);
  let y = mix(1.06, focusY, ee);
  let z = mix(0.02, focusZ, ee);
  let scale = mix(0.25, focusScale, ee);

  x = mix(x, dockX, dd);
  y = mix(y, dockY, dd) + Math.sin(Math.PI * dd) * 0.35;
  z = mix(z, dockZ, dd);
  scale = mix(scale, compact ? 0.15 : 1, dd);

  if (compact && dd > 0.98) {
    return { visible: false, position: [x, y, z], rotation: [0, 0, 0], scale };
  }

  const bb = back * back * (3 - 2 * back);
  x = mix(x, 0, bb);
  y = mix(y, 1.06, bb);
  z = mix(z, 0.02, bb);
  scale = mix(scale, 0.2, bb);

  return {
    visible: true,
    position: [x, y, z],
    rotation: [0.24 + (1 - ee) * -0.9 + Math.sin(Math.PI * dd) * 0.25, Math.sin(Math.PI * dd) * (dockX < 0 ? -0.35 : 0.35), 0],
    scale,
  };
}
