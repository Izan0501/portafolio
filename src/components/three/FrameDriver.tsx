"use client";

import { useFrame } from "@react-three/fiber";
import { useLenis } from "lenis/react";
import { advanceScrollStore, scrollStore } from "@/features/scroll/scrollStore";
import { scrollPMotionValue } from "@/features/scroll/scrollMotionValue";
import { frameDriverRegistry } from "@/features/scroll/frameDriverRegistry";
import { updateFpsStore } from "@/features/scroll/fpsStore";

/**
 * The in-Canvas half of the single scroll loop (plan §2.2). Mounted inside
 * `<Stage>`'s `<Canvas>`; render priority `-1` runs it before every other
 * `useFrame` in the scene (default priority `0`), so `scrollStore`/the pose
 * it will drive (M6+) are already current for the frame by the time
 * anything else reads them — no one-frame lag between "the camera/Mac pose"
 * and "what the scroll says right now".
 *
 * `useLenis()` resolves here exactly as it does outside the Canvas: R3F
 * preserves the surrounding React context tree across the Canvas boundary,
 * and `<Stage>` only ever mounts inside `SmoothScrollProvider`'s
 * `<ReactLenis>`.
 *
 * Renders nothing — this component exists only for its `useFrame` side effect.
 */
export function FrameDriver(): null {
  const lenis = useLenis();

  useFrame((_state, delta) => {
    if (!lenis) return;
    frameDriverRegistry.lastTickAt = performance.now();
    lenis.raf(performance.now());
    advanceScrollStore(delta);
    scrollPMotionValue.set(scrollStore.p);
    updateFpsStore(delta);
  }, -1);

  return null;
}
