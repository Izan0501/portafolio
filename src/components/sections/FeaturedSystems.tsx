"use client";

import React, { useRef } from "react";
import { m, useScroll, useTransform, useMotionTemplate, MotionValue } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { FiArrowRight, FiCheckCircle, FiClock } from "react-icons/fi";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { PROJECTS_DATA, STATUS_STYLES, resolveProject, type ResolvedProject } from "@/data/projects";
import { useI18n } from "@/i18n/LanguageProvider";

const SECTION_HEIGHT = 1500;

// ==========================================
// 1. MASTER SHOWCASE WRAPPER
// ==========================================
export const FeaturedSystems: React.FC = () => {
  const { t } = useI18n();

  return (
    <section id="systems" className="bg-neutral-950 text-white select-none border-t border-white/10 pt-20 relative z-10 overflow-visible">
      
      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-6 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 z-30 relative">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-white/10 text-cyan-400 font-mono text-xs mb-4 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,1)]" />
            <span>{t.systems.eyebrow}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black font-sans tracking-tight text-white uppercase !leading-[1.1]">
            <VerticalCutReveal splitBy="words" staggerDuration={0.05} staggerFrom="first">
              {t.systems.heading}
            </VerticalCutReveal>
          </h2>
        </div>
        <button
          type="button"
          onClick={() => {
            document.getElementById("deployment-matrix")?.scrollIntoView({
              behavior: "smooth",
            });
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 font-mono text-xs text-neutral-300 hover:text-cyan-300 transition-all cursor-pointer self-start md:self-auto group"
        >
          <span>{t.systems.inspectMatrix}</span>
          <FiArrowRight className="group-hover:translate-x-1 transition-transform text-cyan-400"/>
        </button>
      </div>

      {/* Main Sticky Track (CRITICAL: ZERO OVERFLOW HIDDEN OR CLIPPED ON THIS WRAPPER!) */}
      <HeroTrack />

      {/* Ultra-Professional Deployment Matrix */}
      <DeploymentMatrix />
    </section>
  );
};

// ==========================================
// 2. HERO TRACK (Exact 1500px + 100vh Geometry)
// ==========================================
const HeroTrack: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Track progress strictly across the exact height of this section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <div
      ref={containerRef}
      style={{ height: `calc(${SECTION_HEIGHT}px + 100vh)` }}
      className="relative w-full overflow-visible"
    >
      {/* Center Image locks sticky at top-0 while expanding */}
      <CenterImage progress={scrollYProgress} />
      
      {/* Floating images pass directly OVER the frozen background */}
      <ParallaxImages />
      
      {/* Sleek bottom gradient easing into the text matrix */}
      <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-b from-neutral-950/0 via-neutral-950/80 to-neutral-950 pointer-events-none z-30" />
    </div>
  );
};

// ==========================================
// 3. CENTER STICKY IMAGE (THE STICKY ISOLATION PATTERN)
// ==========================================
interface CenterImageProps {
  progress: MotionValue<number>;
}

const CenterImage: React.FC<CenterImageProps> = ({ progress }) => {
  const { t } = useI18n();

  // Over the first 70% of scroll (the 1500px sticky zone), clipPath opens from 25% down to 0%
  const clip1 = useTransform(progress, [0, 0.7], [25, 0]);
  const clip2 = useTransform(progress, [0, 0.7], [75, 100]);
  const clipPath = useMotionTemplate`polygon(${clip1}% ${clip1}%, ${clip2}% ${clip1}%, ${clip2}% ${clip2}%, ${clip1}% ${clip2}%)`;

  const backgroundSize = useTransform(progress, [0, 0.85], ["170%", "100%"]);
  
  // Only at the very end of the track (when floating images finish), it fades out
  const opacity = useTransform(progress, [0.85, 1], [1, 0]);

  return (
    /* CRITICAL STICKY ISOLATION: 
       This outer tag is a PURE HTML DIV. NO Framer Motion transforms, NO transform-gpu, NO y translation!
       This forces the browser render engine to execute native 100% frozen sticky viewport locking. */
    <div className="sticky top-0 h-screen w-full overflow-hidden z-10 flex items-center justify-center">
      
      {/* The animated kinetic engine lives safely INSIDE as an absolute child */}
      <m.div
        style={{
          clipPath,
          backgroundSize,
          opacity,
          backgroundImage:
            "linear-gradient(to bottom, rgba(10,10,10,0.4), rgba(10,10,10,0.85)), url('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2670&auto=format&fit=crop')",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
        className="absolute inset-0 w-full h-full will-change-transform transform-gpu flex items-center justify-center"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00ffff08_1px,transparent_1px),linear-gradient(to_bottom,#00ffff08_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />
        
        {/* Sleek center typography inside the frozen cinematic window */}
        <div className="text-center p-8 max-w-xl mx-6 select-none pointer-events-none z-10">
          <span className="font-mono text-xs text-cyan-400 tracking-widest block mb-3 bg-black/60 border border-cyan-500/30 py-1 px-3 rounded-full w-fit mx-auto shadow-md">
            {t.systems.core.eyebrow}
          </span>
          <h3 className="text-3xl sm:text-6xl font-black uppercase tracking-tight text-white drop-shadow-2xl">
            {t.systems.core.title}
          </h3>
          <p className="text-neutral-300 text-sm sm:text-base font-sans mt-3 drop-shadow-md max-w-md mx-auto">
            {t.systems.core.description}
          </p>
        </div>
      </m.div>

    </div>
  );
};

// ==========================================
// 4. PARALLAX FLOATING IMAGES (Passes over the frozen sticky core!)
// ==========================================
// Real screenshots of Ivo's own shipped sites — /projects/<folder>/<name>-back.png —
// each project's own status (PROD/DEV) drives the badge instead of a fabricated one.
const statusOf = (id: string) => PROJECTS_DATA.find((project) => project.id === id)?.status ?? "DEV";

const ParallaxImages: React.FC = () => {
  const { t } = useI18n();
  const copy = t.systems.parallax;

  return (
    <div className="relative z-20 mx-auto max-w-5xl px-4 pt-24 sm:pt-[200px] pointer-events-none flex flex-col gap-8 sm:gap-12">

      {/* 1: w-1/3 | [-200, 200] — sized down + kept off-center on mobile so the staggered
          composition (the whole point of the effect) survives instead of collapsing into a
          stack of full-width blocks */}
      <ParallaxImg alt={copy.nave24.alt} badge={statusOf("nave24-stock")} caption={copy.nave24.caption} className="w-[72%] sm:w-1/3" end={200} imagePosition="75% center" src="/projects/nave24stock/stock-dash.png" start={-200} />

      {/* 2: mx-auto w-2/3 | [200, -250] */}
      <ParallaxImg alt={copy.veebot.alt} badge={statusOf("veebot-saas")} caption={copy.veebot.caption} className="mx-auto w-[86%] sm:w-2/3 mt-6 sm:mt-0" end={-250} src="/projects/veeBot/bot-back1.png" start={200} />

      {/* 3: ml-auto w-1/3 | [-200, 200] */}
      <ParallaxImg alt={copy.estudio.alt} badge={statusOf("estudio-zanacchi")} caption={copy.estudio.caption} className="ml-auto w-[72%] sm:w-1/3 mt-6 sm:mt-0" end={200} src="/projects/estudio/estudio-back.png" start={-200} />

      {/* 4: ml-24 w-5/12 | [0, -500] */}
      <ParallaxImg alt={copy.portafolioMel.alt} badge={statusOf("portafolio-mel")} caption={copy.portafolioMel.caption} className="w-[64%] sm:ml-24 sm:w-5/12 mt-6 sm:mt-0" end={-500} src="/projects/portafolio-mel/portafolio-back.png" start={0} />

    </div>
  );
};

interface ParallaxImgProps {
  className?: string;
  alt: string;
  src: string;
  start: number;
  end: number;
  caption?: string;
  badge: string;
  /** CSS object-position — lets a screenshot with an off-center focal point
      (e.g. a split login/photo layout) avoid cropping straight into its dead space. */
  imagePosition?: string;
}

const ParallaxImg: React.FC<ParallaxImgProps> = ({ className, alt, src, start, end, caption, badge, imagePosition = "center" }) => {
  const ref = useRef<HTMLDivElement>(null);

  // Exact 1:1 offset mapping from original reference code
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: [`${start}px end`, `end ${end * -1}px`],
  });

  const opacity = useTransform(scrollYProgress, [0.75, 1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0.75, 1], [1, 0.85]);
  const y = useTransform(scrollYProgress, [0, 1], [start, end]);
  const transform = useMotionTemplate`translateY(${y}px) scale(${scale})`;

  return (
    <m.div
      ref={ref}
      style={{ transform, opacity }}
      className={`${className} pointer-events-auto will-change-transform transform-gpu`}
    >
      <div className="group relative w-full rounded-2xl overflow-hidden bg-neutral-900 shadow-[0_30px_80px_rgba(0,0,0,0.95)] border border-white/15 hover:border-cyan-500/60 transition-all duration-300">
        <Image alt={alt} className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100" decoding="async" height={750} loading="lazy" sizes="(max-width: 640px) 90vw, 600px" src={src} style={{ objectPosition: imagePosition }} width={1200} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
        
        {caption && (
          <div className="absolute bottom-0 inset-x-0 p-5 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-between">
            <p className="font-mono text-xs text-cyan-300 font-bold tracking-tight drop-shadow-md">
              {caption}
            </p>
            <span className="font-mono text-[10px] bg-white/10 px-2 py-0.5 rounded text-white border border-white/10">{badge}</span>
          </div>
        )}
      </div>
    </m.div>
  );
};

// ==========================================
// 5. DEPLOYMENT MATRIX (Surgically Pulled Up via Negative Margin)
// ==========================================
const DeploymentMatrix: React.FC = () => {
  const { locale, t } = useI18n();
  const prodCount = PROJECTS_DATA.filter((project) => project.status === "PROD").length;
  const devCount = PROJECTS_DATA.length - prodCount;

  return (
    <section
      id="deployment-matrix"
      /* CRITICAL GAP FIX: 
         -mt-32 sm:-mt-48 lg:-mt-[22vh] pulls the entire text console directly up into the exiting parallax wake of CenterImage.
         pt-4 sm:pt-8 reduces empty headroom. 
         relative z-30 ensures it layers cleanly above the bottom gradient fade. */
      className="mx-auto max-w-7xl px-6 pt-4 sm:pt-8 pb-36 text-white relative z-30 -mt-32 sm:-mt-48 lg:-mt-[22vh] transition-all"
    >
      {/* Section Dashboard Header */}
      <m.div
        initial={{ y: 40, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ ease: "easeOut", duration: 0.7 }}
        className="mb-12 sm:mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-white/15 pb-8 sm:pb-10"
      >
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-cyan-400 mb-3">
            <FiCheckCircle className="text-emerald-400 text-sm"/>
            <span>{t.systems.matrix.eyebrow}</span>
          </div>
          <h3 className="text-3xl sm:text-5xl md:text-6xl font-black font-sans tracking-tight text-white uppercase">
            {t.systems.matrix.heading}
          </h3>
        </div>

        {/* Live Cluster Health Console Card */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-6 bg-neutral-900/90 backdrop-blur-xl p-3 sm:p-4 rounded-2xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)] self-start lg:self-auto font-mono text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 border border-white/5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,1)]" />
            <span className="text-neutral-300">{t.systems.matrix.systemsLabel} <strong className="text-white">{t.systems.matrix.tracked(PROJECTS_DATA.length)}</strong></span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 border border-white/5">
            <FiClock className="text-cyan-400"/>
            <span className="text-neutral-300">
              <strong className="text-emerald-300">{t.systems.matrix.prod(prodCount)}</strong> {"//"} <strong className="text-amber-300">{t.systems.matrix.dev(devCount)}</strong>
            </span>
          </div>
        </div>
      </m.div>

      {/* Kinetic Architectural Data Grid */}
      <div className="flex flex-col gap-4">
        {PROJECTS_DATA.map((project) => (
          <DeploymentRow key={project.id} project={resolveProject(project, locale)} />
        ))}
      </div>
    </section>
  );
};

interface DeploymentRowProps {
  project: ResolvedProject;
}

const DeploymentRow: React.FC<DeploymentRowProps> = ({ project }) => {
  const { id, index, title, stack, status, statusLabel, location, latency, icon: Icon } = project;
  const accent = STATUS_STYLES[status];
  const { t } = useI18n();

  return (
    <Link href={`/projects/${id}`}>
      <m.div
        initial={{ y: 25, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ ease: "easeOut", duration: 0.5 }}
        className="group relative rounded-2xl sm:rounded-3xl bg-neutral-900/60 backdrop-blur-xl border border-white/10 p-5 sm:p-7 hover:-translate-y-1 hover:bg-neutral-900/90 hover:border-cyan-500/50 transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] flex flex-col lg:flex-row lg:items-center justify-between gap-6 cursor-pointer overflow-hidden will-change-transform transform-gpu"
      >
        {/* Subtle background glow on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Left Column: Icon Gateway, Index & System Title */}
        <div className="flex items-start sm:items-center gap-4 sm:gap-6 relative z-10">
          {/* Obsidian Glass Icon Badge */}
          <div className={`p-3.5 sm:p-4 rounded-2xl bg-black/80 border border-white/10 shadow-inner group-hover:scale-110 group-hover:border-cyan-500/40 transition-all duration-300 shrink-0 text-xl sm:text-2xl ${accent.accent}`}>
            <Icon />
          </div>

          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="font-mono text-xs sm:text-sm text-cyan-400 font-bold">
                {"//"}{index}
              </span>
              <span className="h-3 w-[1px] bg-white/20" />
              <span className="font-mono text-[10px] sm:text-xs text-neutral-400 tracking-wider uppercase">
                {location}
              </span>
            </div>
            <h4 className="text-xl sm:text-3xl font-extrabold font-sans text-white group-hover:text-cyan-300 transition-colors tracking-tight">
              {title}
            </h4>
          </div>
        </div>

        {/* Center/Right Column: Tech Stack Array Badges */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 relative z-10 lg:max-w-md">
          {stack.map((tech) => (
            <span
              key={tech}
              className="font-mono text-[11px] sm:text-xs px-3 py-1 rounded-lg bg-white/5 text-neutral-300 border border-white/10 group-hover:border-white/20 group-hover:text-white transition-all shadow-sm"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Right Column: Live Telemetry Status & Latency */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-x-4 gap-y-2 sm:gap-x-6 border-t lg:border-t-0 border-white/10 pt-4 lg:pt-0 relative z-10 shrink-0">
          <div className="flex items-center gap-1.5 font-mono text-xs text-neutral-400 bg-black/50 px-3 py-1.5 rounded-xl border border-white/5">
            <FiClock className="text-cyan-400 text-xs"/>
            <span>{latency}</span>
          </div>

          <div className={`flex items-center gap-2 ${accent.accent} ${accent.badgeBg} border ${accent.badgeBorder} px-4 py-1.5 rounded-full shadow-inner`}>
            <span className={`w-2 h-2 rounded-full bg-current ${accent.dotGlow} ${accent.pulse ? "animate-pulse" : ""}`} />
            <span className="font-mono text-xs font-bold tracking-wide">{statusLabel}</span>
          </div>

          {/* Persistent launch affordance — painted at rest (not hover-gated) so the
              card reads as clickable before the pointer arrives; existing hover
              lift/glow/border-brighten on the row still layer on top untouched. */}
          <div className="hidden lg:flex items-center justify-center w-11 h-11 rounded-full bg-black/60 border border-cyan-500/35 text-cyan-400 shadow-[0_4px_12px_rgba(0,0,0,0.4)] group-hover:bg-cyan-400 group-hover:text-neutral-950 group-hover:border-cyan-400 group-hover:shadow-[0_0_24px_rgba(34,211,238,0.6)] transition-all duration-300 shrink-0">
            <FiArrowRight className="text-lg group-hover:translate-x-0.5 transition-transform duration-300" />
          </div>
        </div>

        {/* Mobile-only equivalent: below lg the row stacks into a column, where a
            floating icon has no room to read as a button — a full-width bar does. */}
        <div className="flex lg:hidden items-center justify-center gap-2 w-full py-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/35 text-cyan-400 font-mono text-xs font-bold tracking-wide group-hover:bg-cyan-400 group-hover:text-neutral-950 group-hover:border-cyan-400 transition-all duration-300 relative z-10">
          <span>{t.systems.matrix.openSystem}</span>
          <FiArrowRight className="group-hover:translate-x-0.5 transition-transform duration-300" />
        </div>
      </m.div>
    </Link>
  );
};
