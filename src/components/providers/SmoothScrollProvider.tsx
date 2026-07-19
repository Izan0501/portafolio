"use client";

import React from "react";
import { ReactLenis } from "lenis/react";
import { LazyMotion, domAnimation, MotionConfig } from "motion/react";

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

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
