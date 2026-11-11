import { smoothstep as ss, win } from "@/lib/math/ease";

/**
 * iPhone screen brightness at a scroll position, extracted as a pure
 * function (artifact lines 1189, mirroring `macbook/screenPower.ts`'s same
 * treatment of the Mac's own brightness curve). No lid to ramp against —
 * the phone's screen just ramps up early in the hero and dims through the
 * screen-dive transition, same `dive` window as the Mac.
 */
export function phoneScreenPower(p: number): number {
  const dive = win(p, 6.85, 6.85, 0.15);
  return ss(1.5, 2.3, p) * (1 - 0.6 * dive);
}
