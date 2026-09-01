"use client";

import { useEffect, useState } from "react";
import { m, AnimatePresence } from "motion/react";

/**
 * Whole-word rotation — the same technique HeroPaths.tsx's own RoleRotator
 * uses for the hero title, extracted into a standalone, reusable component.
 *
 * This replaces an earlier draft of this component that "wrote" each word by
 * hand: glyphs parsed from a font file via opentype.js (loaded from a CDN at
 * runtime), converted to SVG paths, and drawn with an animated stroke-dasharray.
 * That technique is gone entirely — no CDN script, no font fetch, no glyph
 * parsing, no SVG. What's left is plain text and a transform/opacity transition,
 * which is both the more immersive match for this site's motion language and
 * radically simpler: one dependency (motion/react, already a project
 * dependency) instead of a runtime-loaded third-party parser.
 *
 * The animation is deliberately narrow in what it does, mirroring constraints
 * already proven out on the hero itself:
 * - Whole-word transitions only, never per-character — a per-character
 *   stagger reads as busy at this scale and costs far more per swap.
 * - A solid `currentColor`/className-driven color, never `bg-clip-text` — a
 *   gradient clipped to text repaints the whole fill every frame it moves.
 * - A 2D transform (`y` + opacity) only, no 3D — nothing here needs a
 *   perspective-transformed layer, and requesting one is pure GPU cost.
 * Each of those was a real, previously-fixed bug on the hero's own rotator;
 * carrying the same constraints forward here avoids reintroducing any of them.
 *
 * Reduced motion: this renders through `motion/react`'s `<m>` components,
 * which pick up `MotionConfig reducedMotion="user"` from the nearest
 * ancestor. This app wraps its entire tree in that config once, in
 * SmoothScrollProvider — so within this app, prefers-reduced-motion is
 * already handled with no extra work here. Used outside that tree, wrap it
 * in `MotionConfig` (or `LazyMotion`) yourself.
 *
 * Colour comes from `currentColor` by default, so `className="text-emerald-400"`
 * (or a full drop-shadow glow treatment) styles it directly — same styling
 * contract the original had.
 */
export interface RotatingTextProps {
  /** A single, static phrase. Ignored once `words` holds more than one entry. */
  text?: string;
  /** Cycle through these — the accompanying text for the rotation. */
  words?: string[];
  /** Milliseconds each word holds before the next one slides in. */
  interval?: number;
  /** Seconds for the slide/fade transition itself. */
  duration?: number;
  /** Vertical travel distance (px) for the enter/exit slide. */
  travelDistance?: number;
  /** CSS height of the clipping mask. `em`-relative by default, so it tracks whatever font-size className sets. */
  height?: string;
  /** Applied to the animated word itself — drive color, weight, glow, etc. from here. */
  className?: string;
}

export function RotatingText({
  text,
  words,
  interval = 2200,
  duration = 0.4,
  travelDistance = 32,
  height = "1.15em",
  className,
}: RotatingTextProps) {
  const list = words && words.length > 0 ? words : text ? [text] : [];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (list.length < 2) return undefined;
    const timer = setInterval(() => setIndex((i) => i + 1), interval);
    return () => clearInterval(timer);
  }, [list.length, interval]);

  if (list.length === 0) return null;

  // A prop change (e.g. a locale switch handing this a differently-sized
  // words array) can leave `index` pointing past the new array's end — the
  // same clamp the hero's own rotator uses keeps this safe either way.
  const current = list[index % list.length];

  return (
    <span className="relative block overflow-hidden" style={{ height }}>
      <AnimatePresence mode="wait">
        <m.span
          key={current}
          initial={{ y: travelDistance, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -travelDistance, opacity: 0 }}
          transition={{ duration, ease: "easeInOut" }}
          className={["block will-change-transform transform-gpu", className].filter(Boolean).join(" ")}
        >
          {current}
        </m.span>
      </AnimatePresence>
    </span>
  );
}

export default RotatingText;
