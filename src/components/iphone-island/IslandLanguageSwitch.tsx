"use client";

import { useI18n } from "@/i18n/LanguageProvider";
import { otherLocale, LOCALE_LABELS } from "@/i18n/config";
import { cn } from "@/lib/utils";

/**
 * The island's ES|EN switch (plan M7) — new functionality with no artifact
 * precedent (confirmed: no "ES"/"EN"/language text or class anywhere in
 * the artifact's HTML/CSS/JS). A single `<button>`, as the plan specifies,
 * not two separate locale buttons: one click toggles to the other locale.
 *
 * `compact` (≤440px, plan M7) swaps the "ES|EN" dual label for just the
 * *target* locale — same button, same handler, less text.
 */
export interface IslandLanguageSwitchProps {
  compact?: boolean;
  className?: string;
}

export function IslandLanguageSwitch({ compact = false, className }: IslandLanguageSwitchProps) {
  const { locale, toggleLocale } = useI18n();
  const next = otherLocale(locale);
  const ariaLabel = locale === "es" ? "Cambiar idioma a English" : "Switch language to Español";

  return (
    <button
      type="button"
      className={cn("iz-isl-lang", className)}
      aria-pressed={locale === "en"}
      aria-label={ariaLabel}
      onClick={toggleLocale}
    >
      {compact ? (
        LOCALE_LABELS[next]
      ) : (
        <>
          <span className={locale === "es" ? "iz-isl-lang-on" : undefined}>{LOCALE_LABELS.es}</span>
          <span aria-hidden="true" className="iz-isl-lang-sep">
            |
          </span>
          <span className={locale === "en" ? "iz-isl-lang-on" : undefined}>{LOCALE_LABELS.en}</span>
        </>
      )}
    </button>
  );
}
