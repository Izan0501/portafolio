"use client";

import React from "react";
import { FiGlobe } from "react-icons/fi";
import { cn } from "@/lib/utils";
import { LOCALE_LABELS, otherLocale } from "@/i18n/config";
import { useI18n } from "@/i18n/LanguageProvider";

interface LanguageToggleProps {
  /** Lets the navbar dismiss the architecture dropdown when the pointer lands here. */
  onMouseEnter?: () => void;
}

/**
 * Compact EN/ES switch for the navbar pill.
 *
 * Deliberately borrows the "// ARCHITECTURE" trigger's exact geometry — same
 * `py-1.5`, same rounded-full, same always-present transparent border so the box
 * model never shifts on hover.
 *
 * Below 740px this renders the active code only, using the same `hidden min-[740px]:inline`
 * idiom the rest of the navbar uses (the pill needs that much room before the full
 * desktop layout stops clipping). From 740px up it expands to `EN / ES` with the
 * active locale highlighted, which removes any ambiguity about what a click does.
 */
export const LanguageToggle: React.FC<LanguageToggleProps> = ({ onMouseEnter }) => {
  const { locale, toggleLocale, t } = useI18n();
  const target = otherLocale(locale);

  return (
    <button
      aria-label={t.nav.languageAria}
      className={cn(
        "relative px-2 min-[740px]:px-3 py-1.5 rounded-full font-mono text-xs transition-all duration-300 cursor-pointer flex items-center gap-1.5 border shrink-0",
        "text-neutral-400 hover:text-white bg-transparent border-transparent hover:bg-white/5 hover:border-white/10"
      )}
      onClick={toggleLocale}
      onMouseEnter={onMouseEnter}
      title={t.nav.languageTitle}
      type="button"
    >
      <FiGlobe className="hidden min-[740px]:inline text-cyan-400 shrink-0" />
      <span className="text-white font-bold">{LOCALE_LABELS[locale]}</span>
      <span aria-hidden="true" className="hidden min-[740px]:inline text-neutral-600">
        /
      </span>
      <span aria-hidden="true" className="hidden min-[740px]:inline">
        {LOCALE_LABELS[target]}
      </span>
    </button>
  );
};
