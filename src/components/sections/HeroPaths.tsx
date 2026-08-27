"use client";

import React, { useEffect, useState } from "react";
import { m, AnimatePresence, MotionValue, useScroll, useTransform } from "motion/react";
import { useLenis } from "lenis/react";
import { FiArrowDownCircle, FiPlayCircle } from "react-icons/fi";
import { useI18n } from "@/i18n/LanguageProvider";

// ─── Sub-component: RoleRotator ────────────────────────────────────────────
// Whole-word transitions only (never per-character), solid neon color (never
// bg-clip-text), no 3D transform — avoids every ingredient of the earlier bug.
interface RoleRotatorProps {
  roles: string[];
}

const RoleRotator: React.FC<RoleRotatorProps> = ({ roles }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % roles.length);
    }, 2200);
    return () => clearInterval(timer);
  }, [roles.length]);

  // A locale switch can leave the index pointing past the new array's end only
  // if the arrays differ in length; clamping keeps this safe either way.
  const role = roles[index % roles.length];

  return (
    <span className="relative block h-[1.15em] overflow-hidden">
      <AnimatePresence mode="wait">
        <m.span
          animate={{ y: 0, opacity: 1 }}
          className="block text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.6)] will-change-transform transform-gpu"
          exit={{ y: -32, opacity: 0 }}
          initial={{ y: 32, opacity: 0 }}
          key={role}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          {role}
        </m.span>
      </AnimatePresence>
    </span>
  );
};

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
    className="relative w-[min(78vw,320px)] aspect-[9/10] sm:w-[450px] sm:aspect-auto sm:h-[500px] mx-auto flex items-center justify-center will-change-transform transform-gpu"
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
      className="relative min-h-screen w-full flex items-center justify-center overflow-visible bg-neutral-950 pt-20 pb-32 px-6 select-none border-b border-white/10"
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

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto px-6 items-center w-full">

        {/* LEFT COLUMN — text, rotator, CTAs */}
        <m.div style={{ y: leftY }} className="relative z-10 will-change-transform transform-gpu text-center lg:text-left">
          <m.div
            animate={{ opacity: 1, y: 0 }}
            className="font-mono text-cyan-400 text-sm mb-4 tracking-widest uppercase flex items-center justify-center lg:justify-start gap-2 will-change-transform transform-gpu"
            initial={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            {t.hero.eyebrow}
          </m.div>

          <m.h1
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-6xl lg:text-8xl font-black tracking-tighter leading-[1.02] text-white drop-shadow-2xl mb-6 will-change-transform transform-gpu"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          >
            <span className="block">{t.hero.titleLine}</span>
            <RoleRotator roles={t.hero.roles} />
          </m.h1>

          <m.p
            animate={{ opacity: 1, y: 0 }}
            className="text-neutral-400 text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8 will-change-transform transform-gpu"
            initial={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            {t.hero.description}
          </m.p>

          <m.div
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 will-change-transform transform-gpu"
            initial={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          >
            {/* Routed to the interactive CLI's "resume" command until a real file exists — never a dead download link */}
            <a
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 text-black font-bold text-sm tracking-tight shadow-[0_0_20px_rgba(52,211,153,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)] hover:from-emerald-300 hover:to-emerald-400 transition-colors duration-300 cursor-pointer flex items-center justify-center gap-2"
              href="#terminal-card"
              onClick={(e) => handleSmoothScroll(e, "terminal-card")}
            >
              <span>{t.hero.ctaResume}</span>
              <FiArrowDownCircle className="text-lg" />
            </a>

            <a
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-lg hover:bg-white/10 transition-all shadow-xl text-white font-bold text-sm tracking-tight cursor-pointer flex items-center justify-center gap-2 group"
              href="#stack"
              onClick={(e) => handleSmoothScroll(e, "stack")}
            >
              <FiPlayCircle className="text-emerald-400 text-lg group-hover:scale-110 transition-transform" />
              <span>{t.hero.ctaInspect}</span>
            </a>
          </m.div>
        </m.div>

        {/* RIGHT COLUMN — hexagon avatar */}
        <HexagonAvatar alt={t.hero.avatarAlt} y={rightY} />

      </div>

      {/* Fade-out seam into the next section — fixes the height/bleed complaint */}
      <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent z-10 pointer-events-none" />
    </section>
  );
};
