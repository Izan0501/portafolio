/**
 * Locale configuration for the client-side language toggle.
 *
 * There is deliberately NO locale routing here: URLs stay exactly as they were
 * (`/`, `/projects/[id]`). The active locale lives in React context + localStorage,
 * which keeps the App Router structure, `generateStaticParams`, the Lenis scroll
 * provider and `ConditionalFooter`'s `startsWith("/projects/")` check all untouched.
 */

export const LOCALES = ["en", "es"] as const;

export type Locale = (typeof LOCALES)[number];

/**
 * The server always renders this locale. The client swaps to the stored/detected
 * one after mount — keeping the first client render identical to the SSR output,
 * which is what avoids a hydration mismatch.
 */
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_STORAGE_KEY = "ivodev.locale";

/** Two-letter codes shown inside the navbar toggle. */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: "EN",
  es: "ES",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** The other locale — the one a toggle click switches to. */
export function otherLocale(locale: Locale): Locale {
  return locale === "en" ? "es" : "en";
}

/**
 * Best-effort first-visit detection. Any `es-*` tag (es-AR, es-ES, es-419…)
 * resolves to Spanish; everything else falls back to English.
 * Never called during render — only from a mount effect.
 */
export function detectBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return DEFAULT_LOCALE;

  const candidates = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];

  for (const tag of candidates) {
    const base = tag?.toLowerCase().split("-")[0];
    if (isLocale(base)) return base;
  }

  return DEFAULT_LOCALE;
}
