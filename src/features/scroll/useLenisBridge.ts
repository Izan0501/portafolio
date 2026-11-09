"use client";

import { useEffect, useRef } from "react";
import { useLenis } from "lenis/react";
import type Lenis from "lenis";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { scrollStore, advanceScrollStore, setScrollTarget } from "./scrollStore";
import { scrollPMotionValue } from "./scrollMotionValue";
import { isFrameDriverActive } from "./frameDriverRegistry";

type LenisInstance = Lenis;

/**
 * Bridges the app's one Lenis instance (provided by `<ReactLenis>` in
 * `SmoothScrollProvider`, which every legacy component's `useLenis()` call
 * also reads from — this hook changes nothing about that contract) to the
 * mutable `scrollStore`, and owns the single rAF loop driving both.
 *
 * Plan §2.2: "Un solo bucle: Lenis con autoRaf: false, avanzado desde un
 * FrameDriver (useFrame(..., -1)) mientras el canvas está activo. Si el
 * canvas está pausado, un rAF de respaldo mantiene vivo a Lenis."
 *
 * M4 has no canvas yet (that's M5) — so the rAF loop below *is* the backup
 * driver, unconditionally, for now. When M5 builds `FrameDriver`, it takes
 * over calling `lenis.raf()` + `advanceScrollStore()` while the canvas is
 * mounted and active; this hook's own rAF is the fallback for whenever the
 * canvas is paused or not mounted (a project route, a hidden tab) — same
 * `advanceScrollStore` function either way, so the two can never drift into
 * two different easing curves for the same scroll.
 */
export function useLenisBridge(): void {
  const lenis = useLenis();
  const reduced = usePrefersReducedMotion();

  // scrollStore.reduced read every frame below, not via a dep — it's a
  // mutable field precisely so updating it never triggers a re-render chain.
  useEffect(() => {
    scrollStore.reduced = reduced;
  }, [reduced]);

  // Lenis -> scrollStore.pt, on every real scroll event. The callback
  // receives the whole Lenis *instance*, not a `{scroll, limit}` event
  // object (verified in node_modules/lenis/dist/lenis.d.ts: `type
  // ScrollCallback = (lenis: Lenis) => void`, `scroll` a getter on the
  // class) — named `instance` here instead of `lenis` only to avoid
  // shadowing the outer `lenis` from `useLenis()`.
  useEffect(() => {
    if (!lenis) return;
    const onScroll = (instance: LenisInstance) => {
      const h = window.innerHeight || 1;
      setScrollTarget(instance.scroll / h);
    };
    lenis.on("scroll", onScroll);
    return () => {
      lenis.off("scroll", onScroll);
    };
  }, [lenis]);

  // The single rAF loop: advances Lenis itself (autoRaf: false in the
  // provider) and damps scrollStore.p toward .pt from the same tick, so the
  // two are never one frame apart. Skips its own advance whenever
  // `FrameDriver` (inside the Canvas, M5) is already doing it that tick —
  // see frameDriverRegistry's own comment for why exactly one must run.
  const lastRef = useRef<number | null>(null);
  useEffect(() => {
    if (!lenis) return undefined;

    let raf = 0;
    let paused = document.hidden;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (paused || isFrameDriverActive(now)) {
        lastRef.current = null; // next time this loop resumes driving, dt starts fresh
        return;
      }

      const last = lastRef.current ?? now;
      const dt = Math.min(0.05, Math.max(0.0001, (now - last) / 1000));
      lastRef.current = now;

      lenis.raf(now);
      advanceScrollStore(dt);
      scrollPMotionValue.set(scrollStore.p);
    };

    const onVisibility = () => {
      paused = document.hidden;
      if (!paused) lastRef.current = null; // next tick's dt starts fresh, not a huge backgrounded gap
    };
    document.addEventListener("visibilitychange", onVisibility);

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [lenis]);
}
