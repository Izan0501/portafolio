import { smoothstep as ss, win } from "@/lib/math/ease";

/**
 * Screen brightness at a given lid angle/scroll position, extracted as a
 * pure function from `MacBook.tsx`'s `useFrame` (artifact lines 1182-1186)
 * so the dive/flick/power curve has a unit test independent of a mounted
 * Canvas. `compact`'s `Math.max(pose.pow, 0.9)` floor isn't applied here —
 * no compact-layout signal exists until M13.
 */
export function screenPower(posePow: number, lidAngle: number, p: number): number {
  const dive = win(p, 6.85, 6.85, 0.15);
  const flick = 1 - 0.45 * win(lidAngle, 62, 70, 6) * (0.5 + 0.5 * Math.sin(lidAngle * 3.1));
  return posePow * ss(45, 100, lidAngle) * (1 - 0.8 * dive) * flick;
}
