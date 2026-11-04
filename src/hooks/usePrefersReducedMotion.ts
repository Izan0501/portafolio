"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Tracks the OS/browser `prefers-reduced-motion` setting via
 * `useSyncExternalStore` — the same pattern `i18n/LanguageProvider` already
 * uses for `localeStore`, and the one React itself recommends for
 * subscribing to an external source: setting state synchronously inside an
 * effect (the naive `useState` + `useEffect(() => setReduced(mql.matches))`
 * version) trips `react-hooks/set-state-in-effect` because it causes a
 * cascading extra render.
 *
 * `getServerSnapshot` returns `false` — there's no media query on the
 * server, and this value only ever gates animation easing, never layout or
 * content, so a one-frame mismatch on first client render is never visible.
 */
function subscribe(onChange: () => void): () => void {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
