"use client";

import { useRef, useState, type ReactNode } from "react";
import { m, useAnimationFrame, type MotionStyle } from "motion/react";
import type { ChapterRange } from "@/types/content";
import type { Locale } from "@/i18n/config";
import { scrollStore } from "@/features/scroll/scrollStore";
import { viewportStore } from "@/hooks/useViewportProfile";
import { setSheetTop, setExpandedSheetTop } from "./sheetStore";

/**
 * Every chapter's text column (plan M13) — ported from the artifact's
 * `.iz-copy` (`docs/reference/artifact-a/Hero.dc.html` lines 92-140,
 * 168-316, 484-487). Desktop/wide keeps the exact pre-M13 positioning
 * (absolute left column, vertically centered) — `globals.css`'s `narrow`
 * variant (`@media (max-aspect-ratio: 19/20)`, M13) overrides it into a
 * fixed bottom sheet, `max-height:52%` collapsed, scrollable, with a
 * "Ver detalle"/"Cerrar detalle" toggle (`.iz-morebtn`) once `moreContent`
 * is given — exactly the artifact's own split (9 of its 12 chapters have
 * one; `hero`/`dive`/`cta` don't, their content is short enough already).
 *
 * Replaces each chapter component's own `<m.div>` wrapper — same
 * `style` prop (the scroll-driven opacity/y/willChange/pointerEvents
 * every chapter already computed before M13), now applied here instead.
 */

export interface SheetHandle {
  isExpanded: boolean;
}

export interface SheetProps {
  chapter: ChapterRange;
  style: MotionStyle;
  locale: Locale;
  /** Always-visible content — eyebrow/heading/lead and any already-compact summary (facts, certs, steps' titles, ctas). */
  children: ReactNode;
  /** Only reachable via "Ver detalle" in narrow mode — longer prose (challenge/solution, extra detail) that would otherwise force the collapsed sheet too tall. `undefined` for chapters short enough not to need one (artifact: `hero`/`dive`/`cta`). */
  moreContent?: ReactNode;
}

const MORE_LABEL = {
  es: { show: "Ver detalle", hide: "Cerrar detalle" },
  en: { show: "View details", hide: "Hide details" },
} as const;

export function Sheet({ chapter, style, locale, children, moreContent }: SheetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const wasActive = useRef(false);

  useAnimationFrame(() => {
    const p = scrollStore.p;
    const isActive = p >= chapter.a && p < chapter.b;
    // Artifact lines 2014-2015: leaving the chapter collapses its own
    // expanded sheet and clears the camera's `_xTop` override — never
    // left open for the next visitor to stumble into mid-chapter.
    if (wasActive.current && !isActive) {
      setIsExpanded(false);
      setExpandedSheetTop(null, 0);
    }
    wasActive.current = isActive;

    // Only `narrow` (aspect < 0.95) actually turns this sheet into the
    // fixed bottom sheet `globals.css`'s own `(max-aspect-ratio:19/20)`
    // rule targets — `compact` alone (e.g. 1024×768) keeps the desktop
    // side-column position, where `.top` would be meaningless for
    // `sheetTop`'s purpose. Conflating the two was a real M8 bug in
    // `CameraDirector`, fixed alongside this file in M13.
    const el = sectionRef.current;
    if (el && viewportStore.narrow) {
      setSheetTop(chapter.id, el.getBoundingClientRect().top);
    }
  });

  function toggle() {
    const next = !isExpanded;
    setIsExpanded(next);
    // Artifact lines 486-487: measured one frame later, after the newly
    // toggled `.iz-x` class has already changed the sheet's real layout
    // height — measuring synchronously here would read the *old* rect.
    requestAnimationFrame(() => {
      const el = sectionRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      setSheetTop(chapter.id, top);
      setExpandedSheetTop(next ? chapter.id : null, top);
    });
  }

  const label = MORE_LABEL[locale];

  return (
    <m.section
      ref={sectionRef}
      data-chapter-id={chapter.id}
      data-expanded={isExpanded}
      aria-labelledby={`heading-${chapter.id}`}
      style={style}
      className="iz-copy absolute left-[clamp(20px,6vw,96px)] top-1/2 w-[min(440px,36vw)] max-w-[calc(100vw-40px)] -translate-y-1/2 transform-gpu"
    >
      {children}
      {moreContent && (
        <>
          <button type="button" className="iz-morebtn" aria-expanded={isExpanded} onClick={toggle}>
            {isExpanded ? label.hide : label.show}
          </button>
          <div className="iz-more">{moreContent}</div>
        </>
      )}
    </m.section>
  );
}

export default Sheet;
