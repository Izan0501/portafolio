import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  detectBrowserLocale,
  isLocale,
  type Locale,
} from "./config";

/**
 * The active locale lives in a tiny external store rather than component state,
 * so it can be consumed with `useSyncExternalStore`.
 *
 * That matters for two reasons:
 *  - React calls `getServerSnapshot` during SSR *and* during hydration, then
 *    switches to `getSnapshot`. The stored/detected locale therefore applies
 *    without a hydration mismatch and without a setState-inside-an-effect.
 *  - `storage` events keep every open tab on the same language.
 */

let cached: Locale | null = null;
const listeners = new Set<() => void>();

function readStored(): Locale | null {
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return isLocale(stored) ? stored : null;
  } catch {
    // Private mode / storage disabled.
    return null;
  }
}

function handleStorage(event: StorageEvent) {
  if (event.key !== LOCALE_STORAGE_KEY) return;
  const next = isLocale(event.newValue) ? event.newValue : null;
  if (!next || next === cached) return;
  cached = next;
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void): () => void {
  if (listeners.size === 0) {
    window.addEventListener("storage", handleStorage);
  }
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener("storage", handleStorage);
    }
  };
}

/** Client snapshot: an explicit stored choice wins, otherwise browser detection. */
export function getSnapshot(): Locale {
  if (cached === null) {
    cached = readStored() ?? detectBrowserLocale();
  }
  return cached;
}

/** Server + hydration snapshot — must be stable and match the SSR'd markup. */
export function getServerSnapshot(): Locale {
  return DEFAULT_LOCALE;
}

export function setStoredLocale(next: Locale): void {
  if (cached === next) return;
  cached = next;
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
  } catch {
    // Preference just won't survive a reload.
  }
  listeners.forEach((listener) => listener());
}
