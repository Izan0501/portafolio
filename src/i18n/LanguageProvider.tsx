"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import { useLenis } from "lenis/react";
import { otherLocale, type Locale } from "./config";
import { getServerSnapshot, getSnapshot, setStoredLocale, subscribe } from "./localeStore";
import { en, type Dictionary } from "./dictionaries/en";
import { es } from "./dictionaries/es";

const DICTIONARIES: Record<Locale, Dictionary> = { en, es };

interface LanguageContextValue {
  locale: Locale;
  setLocale: (next: Locale) => void;
  toggleLocale: () => void;
  /** Active dictionary — accessed as `t.hero.titleLine`, fully type-checked. */
  t: Dictionary;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

/**
 * Client-side language state for the whole app.
 *
 * Reads from an external store (see localeStore) so SSR renders the default
 * locale and the client resolves the stored/detected one on hydration with no
 * mismatch — and with no setState inside an effect.
 *
 * Mounted inside <ReactLenis> so it can call `lenis.resize()`: swapping locales
 * changes copy length, which changes document height, and Lenis caches its scroll
 * limit. Without the re-measure the page can refuse to scroll to its true bottom —
 * the same class of bug already handled on route changes in SmoothScrollProvider.
 */
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const lenis = useLenis();

  // Keep the document language in sync for screen readers, hyphenation and
  // browser translation prompts. layout.tsx renders the default on the server.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    const timer = setTimeout(() => lenis?.resize(), 250);
    return () => clearTimeout(timer);
  }, [locale, lenis]);

  const setLocale = useCallback((next: Locale) => setStoredLocale(next), []);

  const toggleLocale = useCallback(
    () => setStoredLocale(otherLocale(locale)),
    [locale]
  );

  const value = useMemo<LanguageContextValue>(
    () => ({ locale, setLocale, toggleLocale, t: DICTIONARIES[locale] }),
    [locale, setLocale, toggleLocale]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useI18n(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useI18n must be used inside <LanguageProvider>");
  }
  return context;
}
