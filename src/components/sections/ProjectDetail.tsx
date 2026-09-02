"use client";

import React, { useEffect, useRef, useState } from "react";
import { m, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { useLenis } from "lenis/react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft, FiArrowUpRight, FiCpu, FiRadio, FiZap } from "react-icons/fi";
import { getResolvedProject, STATUS_STYLES } from "@/data/projects";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { Pagination } from "@/components/ui/pagination";
import { useI18n } from "@/i18n/LanguageProvider";

interface ProjectDetailProps {
  id: string;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ id }) => {
  const { locale, t } = useI18n();
  const project = getResolvedProject(id, locale);
  if (!project) {
    notFound();
  }

  const {
    index,
    title,
    status,
    architecture,
    stack,
    location,
    latency,
    icon: Icon,
    heroImage,
    scope,
    challenge,
    objectives,
    gallery,
    liveUrl,
  } = project;

  const accent = STATUS_STYLES[status];
  const deployStatus = status === "PROD" ? t.projectDetail.live : t.projectDetail.building;

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);

  // Action bar hides on scroll down, returns on scroll up — same thresholds and
  // spring as the navbar, so both pieces of floating chrome move as a pair.
  // Reading direction off the motion value keeps this off the React render path;
  // only the boolean flip re-renders.
  const { scrollY } = useScroll();
  const [isBarHidden, setIsBarHidden] = useState(false);

  // Galleries big enough to be grouped (VeeBot's eight modules) render a tab bar
  // so the page stays close in length to its siblings. Projects whose images
  // carry no group fall through to the original one-row-per-image list.
  const galleryGroups: { id: string; label: string }[] = [];
  for (const image of gallery) {
    if (image.group && !galleryGroups.some((group) => group.id === image.group?.id)) {
      galleryGroups.push(image.group);
    }
  }
  const isTabbed = galleryGroups.length > 1;
  // Held as an id, not a label, so the active tab survives a locale switch.
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const currentGroupId = activeGroupId ?? galleryGroups[0]?.id ?? null;
  const visibleGallery = isTabbed
    ? gallery.filter((image) => image.group?.id === currentGroupId)
    : gallery;
  const currentPage = Math.max(1, galleryGroups.findIndex((group) => group.id === currentGroupId) + 1);

  // Anchors the "3. FEATURE SHOWCASE" section — the pagination control at its
  // bottom scrolls back here on every page change. Without this, switching
  // sections from the bottom pagination would swap the content while the
  // viewport stays scrolled to where the control was clicked, landing the
  // visitor mid-way through the new section instead of at its top — the top
  // tab bar doesn't have this problem since clicking it never moves you.
  const galleryTopRef = useRef<HTMLElement>(null);

  // Whenever the rendered row count changes — a tab switch, or this instance
  // staying mounted while its gallery data changes (e.g. a dev hot-reload
  // after editing projects.ts) — the document height changes and Lenis's
  // cached scroll limit goes stale, clamping scroll at the old height with
  // the last row(s) unreachable. Keying on visibleGallery.length (not just
  // isTabbed/currentGroupId) covers the untabbed-gallery case too. Same fix
  // already applied on route changes (SmoothScrollProvider) and locale
  // changes (LanguageProvider).
  const lenis = useLenis();
  useEffect(() => {
    // One frame is enough: the rows are fixed-aspect, so the new height is
    // final as soon as React commits — it does not wait on image decode.
    const frame = requestAnimationFrame(() => lenis?.resize());
    return () => cancelAnimationFrame(frame);
  }, [currentGroupId, visibleGallery.length, lenis]);

  // Same offset/duration/easing as the hero's own anchor-scroll (HeroPaths.tsx)
  // — one scroll feel across the site rather than a bottom-pagination-specific one.
  const handlePageChange = (nextPage: number) => {
    const group = galleryGroups[nextPage - 1];
    if (!group) return;
    setActiveGroupId(group.id);
    if (galleryTopRef.current) {
      lenis?.scrollTo(galleryTopRef.current, {
        offset: -100,
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    }
  };

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > 120 && latest > previous) {
      setIsBarHidden(true);
    } else if (latest < previous || latest <= 120) {
      setIsBarHidden(false);
    }
  });

  // Scroll-to-top + Lenis resize on navigation now lives in SmoothScrollProvider,
  // keyed off the route pathname — it handles both entering AND leaving this page,
  // which a per-page effect here couldn't (it fixed this page's own boundary but left
  // Lenis's cached height stale when navigating back to a taller page like the homepage).

  return (
    <main className="relative w-full bg-neutral-950 text-white overflow-visible pb-40">
      {/* 1. CINEMATIC HUD HERO */}
      <section ref={heroRef} className="relative min-h-[90vh] w-full flex flex-col justify-end pb-24 overflow-visible">
        {/* Hero background image, behind the title — a legibility scrim plus the
            section's existing radial wash and grid layer on top, unchanged */}
        <div className="absolute inset-0 bg-neutral-950" />
        <div className="absolute inset-0">
          <Image
            alt=""
            className="object-cover object-[80%_20%] sm:object-[70%_20%] lg:object-[center_20%]"
            fill
            priority
            sizes="100vw"
            src={heroImage}
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(10,10,10,0.55)_0%,rgba(10,10,10,0.6)_35%,rgba(10,10,10,0.94)_78%,#0a0a0a_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_15%,rgba(34,211,238,0.18),transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_25%,black,transparent_85%)]" />

        <m.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative z-10 max-w-6xl mx-auto w-full px-6 flex flex-col items-center text-center will-change-transform transform-gpu"
        >
          

          <div className="flex items-center gap-3 mb-6 font-mono text-xs">
            <span className="px-3 py-1 rounded-full bg-black/50 border border-white/15 text-cyan-400 tracking-wider">
              {"//"} {index}
            </span>
            <span className={`flex items-center gap-2 px-3 py-1 rounded-full ${accent.badgeBg} border ${accent.badgeBorder} ${accent.accent}`}>
              <span className={`w-1.5 h-1.5 rounded-full bg-current ${accent.dotGlow} ${accent.pulse ? "animate-pulse" : ""}`} />
              {deployStatus}
            </span>
          </div>

          <h1 className="text-3xl sm:text-6xl md:text-8xl font-black uppercase tracking-tight !leading-[1.02] mb-4 drop-shadow-2xl">
            <VerticalCutReveal
              containerClassName="justify-center text-center w-full flex-wrap"
              splitBy="words"
              staggerDuration={0.05}
              staggerFrom="first"
            >
              {title}
            </VerticalCutReveal>
          </h1>

          <div className="flex items-center gap-3 text-cyan-400 mb-10">
            <Icon className="text-2xl sm:text-3xl" />
          </div>

          {/* THE HUD: asymmetrical floating telemetry bar — no backdrop-blur here since this whole
              block sits inside a scroll-transformed parent; blur would recomposite every frame */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 bg-neutral-900/85 border border-white/15 rounded-2xl sm:rounded-full pl-5 pr-6 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
            <div className={`flex items-center gap-2 pr-5 border-r border-white/10 font-mono text-sm ${accent.accent}`}>
              <FiRadio className={`text-lg ${accent.pulse ? "animate-pulse" : ""}`} />
              <span className="text-neutral-500 text-xs">{t.projectDetail.deployStatusLabel}</span>
              <span className="font-bold">{deployStatus}</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs sm:text-sm text-neutral-300">
              <FiZap className="text-cyan-400" />
              <span className="text-neutral-500">{t.projectDetail.latencyLabel}</span>
              <span className="font-bold text-cyan-300">{latency}</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs sm:text-sm text-neutral-300">
              <FiCpu className="text-cyan-400" />
              <span className="text-neutral-500">{t.projectDetail.architectureLabel}</span>
              <span className="font-bold text-cyan-300">{architecture}</span>
            </div>
          </div>
        </m.div>
      </section>

      {/* 2. ASYMMETRICAL SCOPE BENTO */}
      <section className="max-w-6xl mx-auto px-6 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Span 7: Challenge & Solution — obsidian card w/ inner glow */}
          <div className="lg:col-span-7 relative rounded-3xl bg-neutral-900/70 border border-white/10 p-8 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden">
            <div className="absolute -top-32 -left-32 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="font-mono text-xs text-cyan-400 mb-4">{t.projectDetail.challengeHeading}</div>
              <p className="text-neutral-100 text-base sm:text-lg leading-relaxed mb-8">
                {challenge}
              </p>

              <div className="font-mono text-xs text-cyan-400 mb-4">{t.projectDetail.scopeHeading}</div>
              <p className="text-neutral-300 text-sm sm:text-base leading-relaxed mb-6">
                {scope}
              </p>
              <ul className="space-y-3">
                {objectives.map((objective) => (
                  <li key={objective} className="flex items-start gap-3 text-neutral-300 text-sm sm:text-base">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 shadow-[0_0_8px_rgba(34,211,238,1)]" />
                    {objective}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Span 5: Mock terminal — simulated deployment log */}
          <div className="lg:col-span-5 rounded-3xl bg-black/90 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/10 bg-neutral-900/70">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
              <span className="ml-3 font-mono text-[10px] text-neutral-500">{t.projectDetail.terminal.fileName(id)}</span>
            </div>
            <div className="p-4 sm:p-6 font-mono text-[11px] sm:text-xs leading-relaxed overflow-x-auto space-y-1.5">
              <div className="text-cyan-400">{t.projectDetail.terminal.deployCommand(location.split(" // ")[0])}</div>
              <div className="text-neutral-400">{"> "}{t.projectDetail.terminal.provisioning(architecture)}</div>
              <div className="text-neutral-400">{"> "}{t.projectDetail.terminal.stack(stack.join(", "))}</div>
              <div className="text-neutral-400">{"> "}{t.projectDetail.terminal.healthCheck}<span className={accent.accent}>{deployStatus}</span></div>
              <div className="text-neutral-400">{"> "}{t.projectDetail.terminal.latencyProbe}<span className="text-cyan-300">{latency}</span></div>
              <div className="text-emerald-400 pt-1">
                ✓ {status === "PROD" ? t.projectDetail.terminal.stable : t.projectDetail.terminal.stagingReady}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURE SHOWCASE — alternating macOS-framed windows */}
      <section ref={galleryTopRef} className="max-w-6xl mx-auto px-6 mt-16 sm:mt-24">
        <div className={`font-mono text-xs text-cyan-400 ${isTabbed ? "mb-6" : "mb-10"}`}>
          {t.projectDetail.featuresHeading}
        </div>

        {isTabbed && (
          <div className="flex flex-wrap items-center gap-2 w-fit p-1.5 mb-12 rounded-2xl sm:rounded-full bg-neutral-900/70 border border-white/10">
            {galleryGroups.map((group) => {
              const isActive = group.id === currentGroupId;
              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => setActiveGroupId(group.id)}
                  className={`font-mono text-[11px] sm:text-xs px-4 py-2 rounded-full border transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-[0_0_15px_rgba(34,211,238,0.15)]"
                      : "bg-transparent text-neutral-400 border-transparent hover:text-white hover:bg-white/5"
                  }`}
                >
                  {group.label}
                </button>
              );
            })}
          </div>
        )}

        <div className="space-y-16 sm:space-y-24">
          {visibleGallery.map((image, i) => {
            const reversed = i % 2 === 1;
            return (
              <div key={image.src + image.caption} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className={`lg:col-span-7 ${reversed ? "lg:order-2" : "lg:order-1"}`}>
                  <div className="rounded-2xl border border-white/10 bg-neutral-900/60 backdrop-blur-xl shadow-2xl p-2">
                    <div className="flex items-center gap-1.5 px-2 py-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                    </div>
                    {/* Captures far from 16:9 letterbox instead of cropping —
                        object-cover would cut real content out of the near-square
                        onboarding steps and the 3:1 subscription panel. */}
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-neutral-950">
                      <Image
                        alt={image.alt}
                        // These are full-page screenshots at ~1.6:1, shorter than the
                        // 16:9 well, so object-cover crops top+bottom. Every one of
                        // them has its site's own navbar pinned at y=0 — center
                        // cropping (the default) slices straight through it. Anchoring
                        // to the top instead absorbs 100% of that crop at the bottom,
                        // which is empty page/whitespace, not chrome. No-op wherever
                        // the source is already wider than 16:9 (crop is horizontal
                        // there, unaffected by vertical position) or fit is "contain".
                        className={image.fit === "contain" ? "object-contain" : "object-cover object-top"}
                        fill
                        sizes="(max-width: 1024px) 100vw, 60vw"
                        src={image.src}
                      />
                    </div>
                  </div>
                </div>

                <div className={`lg:col-span-5 ${reversed ? "lg:order-1" : "lg:order-2"}`}>
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-4">
                    {image.caption}
                  </h3>
                  <ul className="space-y-3">
                    {image.specs.map((spec) => (
                      <li key={spec} className="flex items-start gap-3 text-neutral-300 text-sm sm:text-base">
                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_8px_rgba(52,211,153,1)]" />
                        {spec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom-of-section pagination — moves linearly to the next/previous
            group and scrolls back to galleryTopRef so the visitor lands at
            its start. Complements, not replaces, the top tab bar: that one
            jumps straight to any named section, this one is for continuing
            once you've finished scrolling the current one. Only tabbed
            galleries have more than one "page" to move between. */}
        {isTabbed && (
          <Pagination
            className="mt-16 sm:mt-24"
            onChange={handlePageChange}
            page={currentPage}
            pageLabels={galleryGroups.map((group) => group.label)}
            totalPages={galleryGroups.length}
          />
        )}
      </section>

      {/* 4. FLOATING COMMAND ACTION BAR — dynamic island. Stacks to a full-width column on
          mobile (two full-length text buttons side-by-side in a fixed pill guaranteed to
          overflow a phone screen); becomes the horizontal pill again from sm+. */}
      <m.div
        animate={isBarHidden ? "hidden" : "visible"}
        initial="visible"
        transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.8 }}
        variants={{
          visible: { y: 0, opacity: 1 },
          // 140px clears the pill's own height plus the bottom-8 offset, so it
          // parks fully outside the viewport rather than peeking at the edge.
          hidden: { y: 140, opacity: 0 },
        }}
        className="fixed bottom-8 inset-x-0 z-50 flex justify-center px-6 pointer-events-none will-change-transform transform-gpu"
      >
        <div className="pointer-events-auto w-full max-w-xs sm:max-w-none sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-neutral-900/90 backdrop-blur-sm border border-white/15 rounded-2xl sm:rounded-full p-2 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
          <Link className="px-4 py-2 rounded-xl sm:rounded-full bg-white/5 hover:bg-white/10 text-white font-mono text-xs transition-colors border border-white/10 text-center" href="/#deployment-matrix">
            {t.projectDetail.returnToMatrix}
          </Link>

          {/* No placeholder when there is no live URL — the bar simply shows the
              return action rather than a disabled "pending" chip. */}
          {liveUrl && (
            <Link
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl sm:rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-neutral-950 font-bold font-mono text-xs shadow-[0_0_20px_rgba(34,211,238,0.5)] hover:shadow-[0_0_30px_rgba(34,211,238,0.8)] transition-all"
            >
              <span>{t.projectDetail.initializeLive}</span>
              <FiArrowUpRight />
            </Link>
          )}
        </div>
      </m.div>
    </main>
  );
};
