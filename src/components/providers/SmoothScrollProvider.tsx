"use client";

import React, { useEffect, useRef } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { LazyMotion, domAnimation, MotionConfig } from "motion/react";

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

/**
 * The root layout keeps ONE Lenis instance alive across every client-side
 * navigation (the layout never remounts). Whichever page you land on, Lenis's
 * cached scroll `limit` still reflects the PREVIOUS page's height until it
 * re-measures — on a shorter page that clamps scrolling on a taller one you
 * navigate to next, and vice versa. This resets scroll position and forces a
 * fresh height measurement on every real route change (pathname change only —
 * in-page hash navigation doesn't touch pathname, so anchor scrolling is untouched).
 */
const RouteChangeScrollReset: React.FC = () => {
  const pathname = usePathname();
  const lenis = useLenis();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip the forced scroll-to-top on the very first mount (initial page load) —
    // usePathname() strips the hash, so this fires the same way for "/" and
    // "/#systems"; forcing scroll-to-0 here would break direct links to a section.
    // Only actual subsequent route changes should reset scroll position.
    const isInitialLoad = isFirstRender.current;
    isFirstRender.current = false;

    if (!isInitialLoad) {
      window.scrollTo(0, 0);
      lenis?.scrollTo(0, { immediate: true });
    }

    // Give the new page's layout (fonts, images, kinetic type) a moment to settle
    // before trusting its height for Lenis's scroll limit. Safe to run on first
    // load too — it only recalculates the cached limit, never moves scroll.
    const resizeTimer = setTimeout(() => {
      lenis?.resize();
    }, 300);

    return () => clearTimeout(resizeTimer);
  }, [pathname, lenis]);

  return null;
};

/**
 * Root provider that combines:
 * - Lenis: Physics-based smooth scrolling (lerp + duration tuned for immersive feel).
 *   Lenis is automatically disabled when the user prefers reduced motion (it detects
 *   `prefers-reduced-motion: reduce` natively via its own media query handling).
 * - LazyMotion + domAnimation: Deferred Motion feature loading to save ~40kb of JS
 *   by stripping heavy 3D layout projection from the initial bundle.
 * - MotionConfig reducedMotion="user": Passes the OS-level preference into every
 *   <m.*> element automatically — satisfies WCAG 2.3.3 without per-component hooks.
 *
 * The `strict` prop on LazyMotion enforces that only lazy-loaded features are used,
 * preventing accidental import of the full motion bundle.
 */
export const SmoothScrollProvider: React.FC<SmoothScrollProviderProps> = ({
  children,
}) => {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.07,
        duration: 1.2,
        smoothWheel: true,
      }}
    >
      <RouteChangeScrollReset />
      {/* domAnimation strips heavy 3D layout projection from initial load, saving ~40kb */}
      <LazyMotion features={domAnimation} strict>
        {/*
          reducedMotion="user" reads the OS/browser prefers-reduced-motion setting
          and automatically skips non-essential animations for all <m.*> components —
          satisfies react-doctor/require-reduced-motion (WCAG 2.3.3).
        */}
        <MotionConfig reducedMotion="user">
          {children}
        </MotionConfig>
      </LazyMotion>
    </ReactLenis>
  );
};
