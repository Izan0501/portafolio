"use client";

import React from "react";
import { m, MotionValue, useScroll, useTransform } from "motion/react";
import { useLenis } from "lenis/react";
import { FiPlayCircle } from "react-icons/fi";
import { useI18n } from "@/i18n/LanguageProvider";
import { HandwritingText } from "@/components/ui/handwriting-text";
import { DotBorderButton } from "@/components/ui/dot-border-button";

// ─── Sub-component: HexagonAvatar ──────────────────────────────────────────
// Mathematically precise SVG brackets (no CSS-border hacks) + a CSS clip-path
// hexagon image. Outer div carries the scroll-linked parallax `y`; the inner
// div carries the separate continuous levitation `y` — two different motion
// values on two different elements, so they compose instead of fighting.
interface HexagonAvatarProps {
  y: MotionValue<number>;
  alt: string;
}

const HexagonAvatar: React.FC<HexagonAvatarProps> = ({ y, alt }) => (
  <m.div
    style={{ y }}
    // mx-auto centers this within its column below lg (1024px), where it's the
    // only thing in a single stacked column — correct there, left as-is. From
    // 1024px+ the text next to it is flush against the column's LEFT edge
    // (min-[1024px]:text-left etc.), but this stayed centered WITHIN its own
    // column rather than flush against the RIGHT edge — text pinned to one
    // true edge, avatar floating short of the other, reads as the whole
    // composition skewed left even though the grid itself is mx-auto centered
    // on the page. min-[1024px]:mr-0 (not ml-auto — mx-auto already sets
    // margin-left:auto, so ml-auto on top would be a no-op) zeroes just the
    // right margin, leaving the left one auto — pushes it flush to the
    // column's right edge, mirroring the text's left-edge anchor.
    className="relative w-[min(78vw,320px)] aspect-[9/10] sm:w-[450px] sm:aspect-auto sm:h-[500px] mx-auto min-[1024px]:mr-0 flex items-center justify-center will-change-transform transform-gpu"
  >
    {/* Inner Levitation Container — continuous idle float, independent of scroll */}
    <m.div
      animate={{ y: [-15, 15, -15] }}
      className="relative w-full h-full flex items-center justify-center will-change-transform transform-gpu"
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Mathematical SVG Tech Brackets */}
      <svg
        className="absolute inset-0 w-full h-full text-emerald-400 drop-shadow-[0_0_20px_currentColor] scale-[1.12]"
        fill="none"
        preserveAspectRatio="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 100 100"
      >
        {/* Left Bracket */}
        <path className="opacity-80" d="M 20 10 L 0 25 L 0 75 L 20 90" strokeLinecap="round" strokeLinejoin="round" />
        {/* Right Bracket */}
        <path className="opacity-80" d="M 80 10 L 100 25 L 100 75 L 80 90" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {/* The Clipped Image */}
      <div
        className="absolute inset-4 sm:inset-6 bg-neutral-800"
        style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
      >
        {/* mix-blend-mode swapped for a static grayscale filter — blend modes force the browser
            to re-flatten this element against its backdrop every frame it moves, and this sits
            inside a continuously-levitating parent. A filter can be cached as its own GPU layer
            and just transformed, so this keeps the moody desaturated look at a fraction of the cost. */}
        {/* eslint-disable-next-line @next/next/no-img-element -- intentional plain <img>, see conversation */}
        <img
          alt={alt}
          className="w-full h-full object-cover opacity-90 grayscale contrast-125 hover:grayscale-0 transition-all duration-700"
          src="https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=600&auto=format&fit=crop"
        />
        <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none" />
      </div>
    </m.div>
  </m.div>
);

export const HeroPaths: React.FC = () => {
  const lenis = useLenis();
  const { t } = useI18n();
  const { scrollY } = useScroll();

  // Left column parallaxes slower than the right column on the same scroll input.
  const leftY = useTransform(scrollY, [0, 600], [0, 30]);
  const rightY = useTransform(scrollY, [0, 600], [0, 80]);

  // The scroll indicator has done its job once the visitor actually scrolls —
  // fades out over the first ~180px rather than lingering.
  const scrollIndicatorOpacity = useTransform(scrollY, [0, 180], [1, 0]);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target && lenis) {
      lenis.scrollTo(target, {
        offset: -100,
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    }
  };

  return (
    <section
      id="hero"
      // Navbar.tsx's pill is `fixed top-6` (24px) plus its own ~32-44px height —
      // its bottom edge sits ~64-68px down regardless of mobile-compact or
      // tablet-full mode, and it carries a 60px-blur drop shadow that bleeds
      // well past that box edge. Three tiers, not two: below `lg` (1024px) the
      // hero content is still single-column/stacked (title + rotator +
      // description + CTA + avatar all in one flow), tall enough on most
      // phones AND tablets to exceed the viewport, so `items-center` has no
      // slack to push it down further — it effectively starts right at this
      // padding on both. Only at `lg`, once the two-column layout is shorter
      // overall, does the original 80px hold up. min-[740px] is the same
      // cutoff Navbar.tsx itself uses for mobile vs. full layout.
      className="relative min-h-screen w-full flex items-center justify-center overflow-visible bg-neutral-950 pt-36 min-[740px]:pt-28 min-[1024px]:pt-20 pb-32 px-6 select-none border-b border-white/10"
    >
      {/* ATMOSPHERIC DEPTH — volumetric light orbs. Blur radius cut from 150px to 90px: filter
          cost scales sharply with radius, and these move continuously forever, so this is the
          single biggest lever without losing the effect. Position animation is unchanged. */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
        <m.div
          animate={{ x: [-40, 40, -40], y: [-30, 30, -30] }}
          className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-cyan-900 blur-[90px] opacity-40 will-change-transform transform-gpu"
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        />
        <m.div
          animate={{ x: [40, -40, 40], y: [30, -30, 30] }}
          className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full bg-emerald-900/30 blur-[90px] opacity-40 will-change-transform transform-gpu"
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* max-w-7xl (1280px) caps this grid outright — past that viewport width the
          whole block just centers with growing empty margins instead of using the
          space, which is what reads as "cramped" on large screens. Past 1440px the
          container is allowed to grow to 1600px AND the gap widens, so the extra
          width actually separates the two columns instead of just padding them.
          This cap holds all the way up, including at 4K-class widths — it's
          purely about spacing between the two columns, independent of the
          text-size/alignment tuning below. */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 min-[1440px]:gap-24 max-w-7xl min-[1440px]:max-w-[1600px] mx-auto px-6 items-center w-full">

        {/* LEFT COLUMN — text, rotator, CTAs
            Centered only below the lg (1024px) two-column split, where the
            column collapses to the full row width and centering reads as
            "poster" framing. From 1024px up this stays left-aligned at every
            size, including 1440px+ — it does NOT re-center at any larger
            breakpoint. The paragraph gets true text-justify at that same
            point instead of plain left, since it's the one piece here long
            enough to wrap across multiple lines (the title is effectively a
            single word per line, and the CTA is one button — text-align has
            no visible effect without a second line to justify against). */}
        <m.div style={{ y: leftY }} className="relative z-10 will-change-transform transform-gpu text-center min-[1024px]:text-left">


          {/* text-8xl deliberately does NOT land on lg (1024px), where the grid
              splits into two columns: HandwritingText's rendered width scales
              with this font-size (height is em-relative), and at 96px the
              widest real word ("PROGRAMADOR", the widest glyph-aspect-ratio
              of the actual rotated words) draws ~649px wide — a 1024px
              column is only ~464px, so the word would overflow straight into
              the avatar next to it. Font stays at the sm tier's 60px (draws
              ~405px, comfortably inside a 464px column) all the way through
              the two-column range, and only grows once min-[1440px] has
              already widened the gap/container to match — the same
              breakpoint, so the column (648-728px across that tier) is
              verified wide enough for the 649px the bigger glyph draws. */}
          <m.h1
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl min-[640px]:text-6xl min-[1440px]:text-8xl font-black tracking-tighter leading-[1.02] text-white drop-shadow-2xl mb-6 will-change-transform transform-gpu"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          >
            <span className="block">{t.hero.titleLine}</span>
            {/* The preceding span is `block`, so this always starts its own
                line beneath it and inherits the parent's text-center/
                min-[1024px]:text-left alignment — no extra wrapper needed.
                height is em-relative, so it scales with the h1's own
                responsive text-4xl/6xl/8xl sizing automatically. */}
            <HandwritingText
              className="text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.6)]"
              words={t.hero.roles}
            />
          </m.h1>

          <m.p
            animate={{ opacity: 1, y: 0 }}
            className="text-neutral-400 text-base sm:text-lg leading-relaxed max-w-xl mx-auto min-[1024px]:mx-0 min-[1024px]:text-justify mb-8 will-change-transform transform-gpu"
            initial={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            {t.hero.description}
          </m.p>

          <m.div
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-center justify-center min-[1024px]:justify-start gap-4 will-change-transform transform-gpu"
            initial={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          >
            <DotBorderButton href="#stack" onClick={(e) => handleSmoothScroll(e, "stack")}>
              <FiPlayCircle className="text-emerald-400 text-lg transition-transform group-hover:scale-110" />
              <span>{t.hero.ctaInspect}</span>
            </DotBorderButton>
          </m.div>
        </m.div>

        {/* RIGHT COLUMN — hexagon avatar */}
        <HexagonAvatar alt={t.hero.avatarAlt} y={rightY} />

      </div>

      {/* Fade-out seam into the next section — fixes the height/bleed complaint */}
      <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent z-10 pointer-events-none" />

      {/* PREMIUM SCROLL INDICATOR — desktop only; mobile has no room to spare
          this low in the viewport and touch users don't need the affordance. */}
      <m.div
        style={{ opacity: scrollIndicatorOpacity }}
        className="hidden min-[740px]:flex absolute bottom-10 inset-x-0 z-20 justify-center pointer-events-none will-change-transform transform-gpu"
      >
        <a
          className="hero-scroll-indicator group flex flex-col items-center gap-3 pointer-events-auto cursor-pointer"
          href="#stack"
          onClick={(e) => handleSmoothScroll(e, "stack")}
        >
          <span className="font-mono text-[10px] tracking-[0.3em] text-neutral-500 group-hover:text-emerald-300 transition-colors uppercase">
            {t.hero.scrollHint}
          </span>
          <span className="hero-scroll-track">
            <span className="hero-scroll-trace" />
          </span>
        </a>
      </m.div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
.hero-scroll-track {
  position: relative;
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.12);
  overflow: hidden;
  border-radius: 9999px;
  transition: background 300ms ease;
}
.hero-scroll-indicator:hover .hero-scroll-track {
  background: rgba(255, 255, 255, 0.2);
}
.hero-scroll-trace {
  position: absolute;
  inset-inline: 0;
  top: 0;
  height: 14px;
  border-radius: 9999px;
  background: linear-gradient(to bottom, transparent, #34d399, transparent);
  box-shadow: 0 0 8px rgba(52, 211, 153, 0.8);
  animation: hero-scroll-trace 2.2s cubic-bezier(0.65, 0, 0.35, 1) infinite;
}
@keyframes hero-scroll-trace {
  0%   { transform: translateY(-14px); opacity: 0; }
  15%  { opacity: 1; }
  85%  { opacity: 1; }
  100% { transform: translateY(54px); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .hero-scroll-trace { animation: none; top: 40%; opacity: 0.7; }
}
`,
        }}
      />
    </section>
  );
};
