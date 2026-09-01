"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Text that writes itself, then inks in.
 *
 * Three things make this behave like handwriting rather than like a fade:
 *
 * 1. The font is parsed from its raw TTF and the glyphs converted to paths. A web font
 *    renders as filled shapes with no outline, so there is nothing to stroke and nothing
 *    to animate — the conversion is what makes a pen stroke possible at all.
 *
 * 2. Every contour is its own <path>. An SVG dash pattern RESTARTS at each subpath, so a
 *    single path holding the whole word cannot be drawn progressively: one long dash just
 *    makes each letter fully present or fully absent. Splitting them and staggering the
 *    delays is what produces a pen crossing the word left to right.
 *
 * 3. The weight comes from one filled copy of the entire word underneath, faded in as the
 *    stroke finishes. The fill must be a single path: a counter — the hole in an `e` or
 *    an `a` — is a separate contour, and it only reads as a hole when the fill rule sees
 *    it together with the outer contour. Fill the split paths individually and every
 *    letter becomes a blob.
 *
 * The glyph parsing is done by opentype.js, loaded from jsDelivr as a plain <script> at
 * first use rather than imported as a package — that keeps the parser (and its untyped
 * surface) out of the main bundle, and a <script> tag sidesteps the ESM/CJS interop this
 * particular library tends to trip on. It's fetched once per page and browser-cached.
 *
 * The FONT ITSELF is self-hosted at public/fonts/shadows-into-light.ttf (OFL-licensed,
 * from Google Fonts), not pulled from a third party at request time. This is above-the-fold
 * hero content — an external font host adds a request that can rate-limit, go slow, or
 * disappear, for a asset that's 54KB and never changes. It's fetched once, in parallel with
 * opentype.js, and cached like any other same-origin static asset.
 *
 * If either the parser or the font fails to load, the component renders the text as an
 * ordinary <span> — it degrades to plain text rather than to nothing.
 *
 * Colour comes from `currentColor`, so `className="text-emerald-400"` styles it.
 */

const OPENTYPE_CDN = "https://cdn.jsdelivr.net/npm/opentype.js@1.3.4/dist/opentype.min.js";

const DEFAULT_FONT_URL = "/fonts/shadows-into-light.ttf";

export interface HandwritingTextProps {
  /** A single phrase to write. Ignored when `words` is given. */
  text?: string;
  /** Cycle through these, rewriting on each change. */
  words?: string[];
  /** Milliseconds each word is held before the next one starts. */
  interval?: number;
  /** URL of a .ttf or .otf. Must be same-origin or CORS-readable. */
  fontUrl?: string;
  /** Seconds for the pen to cross the whole word. */
  duration?: number;
  /** Seconds before the pen starts. */
  delay?: number;
  /** Stroke weight, in units of a 100px em. */
  strokeWidth?: number;
  /** Ink the letters in once drawn. Set false to leave them as outlines. */
  fill?: boolean;
  /** CSS height of the rendered word; width follows the glyphs. */
  height?: string;
  className?: string;
}

type Geometry = {
  full: string;
  contours: string[];
  x: number;
  y: number;
  w: number;
  h: number;
};

/* eslint-disable @typescript-eslint/no-explicit-any -- opentype.js is loaded as an
   untyped global via <script>, not imported, so there's no declaration file to lean on. */

// The library, loaded once per page.
let libPromise: Promise<any> | null = null;

function loadOpentype(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  const existing = (window as any).opentype;
  if (existing) return Promise.resolve(existing);
  if (!libPromise) {
    libPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = OPENTYPE_CDN;
      script.async = true;
      script.onload = () => {
        const lib = (window as any).opentype;
        if (lib) resolve(lib);
        else reject(new Error("opentype.js loaded but exposed nothing"));
      };
      script.onerror = () => reject(new Error("opentype.js failed to load"));
      document.head.appendChild(script);
    });
  }
  return libPromise;
}

// One fetch and one parse per font URL, shared by every instance on the page.
const fontCache = new Map<string, Promise<any>>();

function loadFont(url: string): Promise<any> {
  let pending = fontCache.get(url);
  if (!pending) {
    pending = Promise.all([
      loadOpentype(),
      fetch(url).then((res) => {
        if (!res.ok) throw new Error(`Font request failed: ${res.status}`);
        return res.arrayBuffer();
      }),
    ]).then(([lib, buffer]) => lib.parse(buffer));
    fontCache.set(url, pending);
  }
  return pending;
}

const EM = 100; // arbitrary: the viewBox normalises whatever we pick

function computeGeometry(font: any, word: string): Geometry | null {
  if (!font || !word) return null;
  const path = font.getPath(word, 0, EM, EM);
  const box = path.getBoundingBox();
  const pad = EM * 0.12; // room for the stroke and any descenders
  const full = path.toPathData(2);
  return {
    full,
    // Split on the moveto that opens each contour, keeping the M with its segment.
    contours: full.split(/(?=M)/).filter((d: string) => d.trim().length > 1),
    x: box.x1 - pad,
    y: box.y1 - pad,
    w: box.x2 - box.x1 + pad * 2,
    h: box.y2 - box.y1 + pad * 2,
  };
}

interface HandwritingWordProps {
  word: string;
  font: any;
  duration: number;
  delay: number;
  strokeWidth: number;
  fill: boolean;
  height: string;
  className?: string;
}

/**
 * Draws exactly one word, then holds it inked. Mounted fresh per word (the
 * parent gives it `key={word}`) rather than reacting to a `word` prop change
 * — that's what lets `drawn`/`lengths`/`pathRefs` start over for free on
 * every new word instead of needing a manual "reset" effect, and it's what
 * lets `geom` be a plain `useMemo` instead of `useEffect` + `setState`:
 * deriving state that's purely a function of other state, inside an effect,
 * is the exact anti-pattern React's own docs (and this repo's lint rule)
 * call out — it costs a whole extra commit for no reason.
 */
function HandwritingWord({ word, font, duration, delay, strokeWidth, fill, height, className }: HandwritingWordProps) {
  const geom = useMemo(() => computeGeometry(font, word), [font, word]);

  const [drawn, setDrawn] = useState(false);
  const [lengths, setLengths] = useState<number[]>([]);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);

  useEffect(() => {
    if (!geom) return undefined;
    // A real DOM measurement (each path's rendered length) — this can only
    // happen after paint, which is exactly what useEffect is for.
    setLengths(
      pathRefs.current
        .slice(0, geom.contours.length)
        .map((el) => (el ? el.getTotalLength() : 0)),
    );
    // Two frames: the first commits the full-length offsets with no transition, the
    // second enables it and moves to zero. Both in one commit leaves nothing to animate.
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setDrawn(true)),
    );
    return () => cancelAnimationFrame(id);
  }, [geom]);

  // Before the font resolves — and if it never does — the text is still readable.
  if (!geom) {
    return <span className={className}>{word}</span>;
  }

  const count = Math.max(1, geom.contours.length);

  return (
    <svg
      viewBox={`${geom.x} ${geom.y} ${geom.w} ${geom.h}`}
      role="img"
      aria-label={word}
      className={["inline-block", className].filter(Boolean).join(" ")}
      style={{
        height,
        width: `calc(${height} * ${(geom.w / geom.h).toFixed(4)})`,
        overflow: "visible",
      }}
    >
      {fill && (
        <path
          d={geom.full}
          fill="currentColor"
          stroke="none"
          style={{
            opacity: drawn ? 1 : 0,
            transition: drawn
              ? `opacity 0.45s ease-out ${(delay + duration * 0.72).toFixed(3)}s`
              : "none",
          }}
        />
      )}
      {geom.contours.map((d, i) => {
        // `lengths` is still [] for the render that mounts these paths — real
        // getTotalLength() values only exist one commit later, once the
        // measurement effect below has run. Until then there is no correct
        // dasharray to fall back to: the offset-hiding trick only works when
        // dasharray equals the path's *actual* length, so any placeholder
        // shorter than that (this used to fall back to 1) repeats as a dotted
        // outline instead of hiding — which is exactly the "word flashes
        // before it draws" bug. Gating on `measured` sidesteps needing a
        // correct placeholder at all: the path stays invisible until there's
        // a real length to hide it correctly with, and the two states hand
        // off at identical (fully-hidden) visuals, so there's nothing to see
        // either side of the swap.
        const measured = lengths.length > 0;
        const length = lengths[i] || 0;
        // Contours overlap slightly so the stroke reads as one continuous movement
        // rather than as letters switching on in turn.
        const each = (duration / count) * 2.4;
        const start = delay + (i / count) * duration;
        return (
          <path
            key={i}
            ref={(el) => { pathRefs.current[i] = el; }}
            d={d}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              visibility: measured ? "visible" : "hidden",
              strokeDasharray: length || 1,
              strokeDashoffset: drawn ? 0 : length || 1,
              transition: drawn
                ? `stroke-dashoffset ${each.toFixed(3)}s ease-out ${start.toFixed(3)}s`
                : "none",
            }}
          />
        );
      })}
    </svg>
  );
}

export function HandwritingText({
  text,
  words,
  interval = 3200,
  fontUrl = DEFAULT_FONT_URL,
  duration = 1.5,
  delay = 0.05,
  strokeWidth = 1.6,
  fill = true,
  height = "1.15em",
  className,
}: HandwritingTextProps) {
  const cycle = Boolean(words && words.length > 0);
  const [index, setIndex] = useState(0);
  const current = cycle ? words![index % words!.length] : text ?? "";

  const [font, setFont] = useState<any>(null);

  useEffect(() => {
    if (!cycle) return undefined;
    const id = setInterval(() => setIndex((i) => i + 1), interval);
    return () => clearInterval(id);
  }, [cycle, interval]);

  useEffect(() => {
    let cancelled = false;
    loadFont(fontUrl)
      .then((f) => { if (!cancelled) setFont(f); })
      .catch(() => { /* falls back to plain text below */ });
    return () => { cancelled = true; };
  }, [fontUrl]);

  if (!current) return null;

  return (
    <HandwritingWord
      key={current}
      className={className}
      delay={delay}
      duration={duration}
      fill={fill}
      font={font}
      height={height}
      strokeWidth={strokeWidth}
      word={current}
    />
  );
}

export default HandwritingText;
