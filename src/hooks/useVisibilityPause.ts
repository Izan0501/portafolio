"use client";

import { useRef, useSyncExternalStore, type RefObject } from "react";

/**
 * Whether a 3D stage should actually be rendering — `IntersectionObserver`
 * on `ref` (plan §2.3: "IntersectionObserver sobre el stage") combined with
 * `document.visibilitychange` (a backgrounded tab shouldn't burn GPU either,
 * even while its canvas stays technically in viewport). `true` only when
 * both the element is on screen *and* the tab is active.
 *
 * `useSyncExternalStore` rather than `useState` + `useEffect(() => setX(...))`
 * — same reasoning as `usePrefersReducedMotion`: setting state synchronously
 * inside an effect body trips `react-hooks/set-state-in-effect`, and this is
 * exactly what the hook exists for (subscribing to two external sources).
 */
export function useVisibilityPause(ref: RefObject<Element | null>): boolean {
  // Mutable, not state: the two raw booleans the snapshot below combines.
  // Changing either calls the one `notify` useSyncExternalStore gave us —
  // there's nothing to re-render until that fires.
  const flags = useRef({ intersecting: true, documentVisible: true });

  const subscribe = (notify: () => void) => {
    const el = ref.current;
    flags.current.documentVisible = !document.hidden;

    const onVisibility = () => {
      flags.current.documentVisible = !document.hidden;
      notify();
    };
    document.addEventListener("visibilitychange", onVisibility);

    if (!el) {
      // No element yet (first mount before the ref attaches) — stay
      // optimistically "intersecting" so the stage isn't pre-emptively
      // paused; a real IntersectionObserver attaches once this hook is
      // called again from the component that now has its ref populated.
      return () => document.removeEventListener("visibilitychange", onVisibility);
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        flags.current.intersecting = entry.isIntersecting;
        notify();
      },
      { threshold: 0 },
    );
    io.observe(el);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      io.disconnect();
    };
  };

  const getSnapshot = () => flags.current.intersecting && flags.current.documentVisible;
  const getServerSnapshot = () => true; // no IO/visibility API on the server; corrected on mount

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
