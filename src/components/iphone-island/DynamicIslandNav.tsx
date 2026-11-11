"use client";

import { useRef } from "react";
import { useAnimationFrame } from "motion/react";
import { useLenis } from "lenis/react";
import { CH, CHAPTER_SHORT_LABEL, NAV_LINKS, PMAX } from "@/config/chapters";
import { chapterIndexAt } from "@/features/scroll/chapterMath";
import { scrollStore } from "@/features/scroll/scrollStore";
import { islandStore, islandIsOpen, syncIslandAutoState } from "@/features/navigation/islandStore";
import { scrollToScreens } from "@/features/navigation/scrollTo";
import { SPRING, createSpring, stepSpring } from "@/features/choreography/springs";
import { useI18n } from "@/i18n/LanguageProvider";
import { IslandLanguageSwitch } from "./IslandLanguageSwitch";

/**
 * The real DOM navigation for the whole site (plan M7) — ported from the
 * approved artifact's `<nav id="iz-island">` (HTML lines ~cited in M7
 * research) and its behaviour (`islToggle`/`islEnter`/`islLeave`/`_islOpen`/
 * `_islSync`/`_scrollDir`/the keyboard handlers), onto `lenis.scrollTo()`
 * instead of the artifact's own hand-rolled scroller (see `scrollTo.ts`).
 *
 * Every per-frame write (width/height from the spring, the chapter label,
 * `aria-current`, the progress ring) goes straight to a DOM ref inside
 * `useAnimationFrame` — never `setState` (plan §2.2's "prohibido useState
 * que cambie con el scroll" extends naturally to this: the island's size
 * tracks scroll state exactly like the 3D choreography does).
 *
 * `useAnimationFrame` (not a bare `requestAnimationFrame`) rides Motion's
 * own already-shared frame loop instead of opening a second native rAF
 * loop alongside `useLenisBridge`'s — confirmed as a real runtime export
 * of `motion/react` (`export * from 'framer-motion'`) before relying on
 * it, since the published type declarations don't list it by name.
 */
export function DynamicIslandNav() {
  const { locale } = useI18n();
  const lenis = useLenis();

  const navRef = useRef<HTMLElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const chapterLabelRef = useRef<HTMLSpanElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const widthSpring = useRef(createSpring(190));
  const heightSpring = useRef(createSpring(40));
  const lastChapterId = useRef<string | null>(null);
  const lastOpen = useRef<boolean | null>(null);

  useAnimationFrame((_timestamp, deltaMs) => {
    const reduced = scrollStore.reduced;
    syncIslandAutoState();
    const isNavigating = lenis?.isScrolling === "smooth";
    const open = islandIsOpen(isNavigating);

    const p = scrollStore.p;
    const chapter = CH[chapterIndexAt(p, CH)];
    if (chapter.id !== lastChapterId.current) {
      lastChapterId.current = chapter.id;
      if (chapterLabelRef.current) chapterLabelRef.current.textContent = CHAPTER_SHORT_LABEL[chapter.id][locale];
      NAV_LINKS.forEach((link, i) => {
        linkRefs.current[i]?.setAttribute("aria-current", link.chapterId === chapter.id ? "true" : "false");
      });
      if (!reduced && !open) {
        widthSpring.current.v += 700;
        heightSpring.current.v += 60;
      }
    }

    if (open !== lastOpen.current) {
      lastOpen.current = open;
      navRef.current?.classList.toggle("iz-open", open);
      btnRef.current?.setAttribute("aria-expanded", open ? "true" : "false");
      panelRef.current?.setAttribute("aria-hidden", open ? "false" : "true");
    }

    const targetWidth = open
      ? (panelRef.current?.offsetLeft ?? 38) + (panelRef.current?.scrollWidth ?? 420)
      : Math.max(150, btnRef.current?.scrollWidth ?? 80);
    const targetHeight = 40;

    const dt = Math.min(0.05, Math.max(0.0001, deltaMs / 1000));
    const width = stepSpring(widthSpring.current, targetWidth, SPRING.island.K, SPRING.island.C, dt, reduced);
    const height = stepSpring(heightSpring.current, targetHeight, SPRING.island.K, SPRING.island.C, dt, reduced);

    if (navRef.current) {
      navRef.current.style.width = `${width.toFixed(1)}px`;
      navRef.current.style.height = `${Math.max(30, height).toFixed(1)}px`;
    }

    ringRef.current?.setAttribute("stroke-dashoffset", (44 * (1 - p / PMAX)).toFixed(2));
  });

  function handleToggleClick() {
    const open = islandIsOpen(lenis?.isScrolling === "smooth");
    islandStore.forced = !open;
    if (!islandStore.forced) {
      islandStore.hov = false;
      islandStore.lockHov = true;
    }
  }

  function handlePointerEnter(e: React.PointerEvent) {
    if (e.pointerType && e.pointerType !== "mouse") return;
    if (!islandStore.lockHov) islandStore.hov = true;
  }

  function handlePointerLeave(e: React.PointerEvent) {
    if (e.pointerType && e.pointerType !== "mouse") return;
    islandStore.hov = false;
    islandStore.lockHov = false;
  }

  function handleLinkClick(targetP: number) {
    return (e: React.MouseEvent) => {
      e.preventDefault();
      islandStore.forced = null;
      islandStore.auto = false;
      islandStore.hov = false;
      islandStore.lockHov = true;
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      if (lenis) scrollToScreens(lenis, targetP, scrollStore.reduced);
    };
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      islandStore.forced = false;
      islandStore.hov = false;
      islandStore.lockHov = true;
    }
  }

  function handleFocus(e: React.FocusEvent) {
    let keyboard = true;
    try {
      keyboard = !(e.target instanceof Element) || e.target.matches(":focus-visible");
    } catch {
      keyboard = true;
    }
    if (keyboard) islandStore.focus = true;
  }

  function handleBlur(e: React.FocusEvent) {
    if (!navRef.current?.contains(e.relatedTarget as Node | null)) {
      islandStore.focus = false;
    }
  }

  return (
    <nav
      ref={navRef}
      className="iz-isl"
      aria-label={locale === "es" ? "Navegación del portafolio" : "Portfolio navigation"}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <button ref={btnRef} type="button" className="iz-isl-btn" aria-expanded="false" aria-controls="iz-isl-list" onClick={handleToggleClick}>
        <svg className="iz-isl-ring" width="20" height="20" viewBox="0 0 18 18" aria-hidden="true">
          <circle cx="9" cy="9" r="7" fill="none" stroke="var(--color-linea)" strokeWidth="2" />
          <circle
            ref={ringRef}
            cx="9"
            cy="9"
            r="7"
            fill="none"
            stroke="var(--color-limon)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="44"
            strokeDashoffset="44"
            transform="rotate(-90 9 9)"
          />
        </svg>
        <span ref={chapterLabelRef} className="iz-isl-ch">
          {CHAPTER_SHORT_LABEL.hero[locale]}
        </span>
        <span className="iz-isl-hint" aria-hidden="true">
          <i />
        </span>
        <IslandLanguageSwitch compact className="iz-isl-lang-folded" />
      </button>
      <div ref={panelRef} id="iz-isl-list" className="iz-isl-panel" aria-hidden="true">
        <ul className="iz-isl-row">
          {NAV_LINKS.map((link, i) => (
            <li key={link.chapterId} className={link.chapterId === "hero" ? "iz-isl-home" : link.chapterId === "prof" ? "iz-isl-profile" : undefined}>
              <a
                ref={(el) => {
                  linkRefs.current[i] = el;
                }}
                className="iz-isl-a"
                href={`#${link.chapterId}`}
                aria-current={link.chapterId === "hero" ? "true" : "false"}
                onClick={handleLinkClick(link.p)}
              >
                {CHAPTER_SHORT_LABEL[link.chapterId][locale]}
              </a>
            </li>
          ))}
        </ul>
        <span className="iz-isl-sep" aria-hidden="true" />
        <IslandLanguageSwitch className="iz-isl-lang-expanded" />
      </div>
    </nav>
  );
}

export default DynamicIslandNav;
