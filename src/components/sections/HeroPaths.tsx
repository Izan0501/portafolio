"use client";

import React, { useRef } from "react";
import { m, useScroll, useTransform } from "motion/react";
import { FloatingPaths } from "@/components/ui/floating-paths";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { TextRotate } from "@/components/ui/text-rotate";
import { useLenis } from "lenis/react";

export const HeroPaths: React.FC = () => {
  const lenis = useLenis();
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // ==========================================
  // SYNCHRONIZED MULTI-LAYER PARALLAX (Z-Depth)
  // ==========================================
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 260]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.15]);

  const pillY = useTransform(scrollYProgress, [0, 0.5], [0, -90]);
  const pillOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  const titleY = useTransform(scrollYProgress, [0, 1], [0, -170]);
  const titleScale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const descY = useTransform(scrollYProgress, [0, 1], [0, -230]);
  const descOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const dockY = useTransform(scrollYProgress, [0, 1], [0, -290]);
  const dockOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  const tickerY = useTransform(scrollYProgress, [0, 0.5], [0, 80]);
  const tickerOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

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
      ref={heroRef}
      id="hero"
      className="relative min-h-screen w-full flex flex-col justify-between items-center overflow-hidden bg-neutral-950 pt-32 pb-16 px-6 select-none border-b border-white/10"
    >
      {/* 1. HIGH-VISIBILITY KINETIC BÉZIER BACKGROUND */}
      <m.div
        style={{ y: bgY, opacity: bgOpacity }}
        className="absolute inset-0 z-0 pointer-events-none will-change-transform transform-gpu"
      >
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-transparent to-neutral-950/90 pointer-events-none" />
      </m.div>

      {/* Top Spacer for layout balance */}
      <div className="w-full" />

      {/* 2. THE CENTERED COMMAND CENTER (Restored Architectural Balance) */}
      <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center justify-center my-auto w-full">
        
        {/* Centered Status Pill (PARALLAX LAYER 1) */}
        <m.div
          style={{ y: pillY, opacity: pillOpacity }}
          className="will-change-transform transform-gpu"
        >
          <m.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-neutral-900/90 backdrop-blur-md border border-white/15 shadow-[0_0_20px_rgba(34,211,238,0.15)] mb-8 font-mono text-xs text-neutral-300 mx-auto"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,1)]" />
            <span>IVO ZANACCHI // FULL-STACK & DEVOPS ARCHITECT</span>
          </m.div>
        </m.div>

        {/* Centered Kinetic Headline with Strict Flex Centering (PARALLAX LAYER 2) */}
        <m.div
          style={{ y: titleY, scale: titleScale, opacity: titleOpacity }}
          className="w-full will-change-transform transform-gpu flex justify-center"
        >
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold font-sans tracking-tight text-white !leading-[1.18] mb-8 antialiased subpixel-antialiased max-w-5xl mx-auto drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)] flex flex-col items-center justify-center gap-2 sm:gap-3 text-center w-full">
            
            {/* ROW 1: Strictly Centered Static Authority Line */}
            <div className="w-full flex justify-center items-center">
              <VerticalCutReveal containerClassName="justify-center text-center w-full flex-wrap" splitBy="words" staggerDuration={0.05} staggerFrom="first">
                Architecting High-Performance Systems &
              </VerticalCutReveal>
            </div>

            {/* ROW 2: Strictly Centered 3D Kinetic Rotor (Dedicated Row prevents layout shifting) */}
            <div className="w-full flex justify-center items-center pt-1">
              <TextRotate
                texts={[
                  "Cloud-Native Infrastructure.",
                  "Distributed RAG Pipelines.",
                  "High-Concurrency APIs.",
                  "Resilient Microservices.",
                  "Zero-Downtime DevOps."
                ]}
                className="justify-center text-center"
                rotationInterval={3500}
              />
            </div>

          </h1>
        </m.div>

        {/* Centered Engineering Narrative (PARALLAX LAYER 3) */}
        <m.div
          style={{ y: descY, opacity: descOpacity }}
          className="will-change-transform transform-gpu w-full"
        >
          <m.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="max-w-xl text-sm sm:text-base md:text-lg text-neutral-300 font-sans leading-relaxed mb-10 drop-shadow-md mx-auto text-center"
          >
            We engineer zero-regression backend microservices, resilient cloud infrastructure, and ultra-fluid web ecosystems. Built for high concurrency and absolute precision.
          </m.p>
        </m.div>

        {/* CENTERED SILICON VALLEY ACTION DOCK (PARALLAX LAYER 4) */}
        <m.div
          style={{ y: dockY, opacity: dockOpacity }}
          className="will-change-transform transform-gpu w-full flex justify-center"
        >
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, type: "spring", stiffness: 250, damping: 25 }}
            className="p-2 sm:p-2.5 rounded-2xl sm:rounded-full bg-neutral-900/80 backdrop-blur-2xl border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.2)] flex flex-col sm:flex-row items-center gap-3 sm:gap-6 max-w-fit mx-auto"
          >
            {/* Primary Executable Button */}
            <a
              href="#stack"
              onClick={(e) => handleSmoothScroll(e, "stack")}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl sm:rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-neutral-950 font-sans font-extrabold text-sm tracking-tight transition-all duration-300 shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.8)] hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2 group"
            >
              <span>INSPECT ARCHITECTURE</span>
              <span className="font-mono group-hover:translate-x-1 transition-transform">→</span>
            </a>

            {/* Integrated Cluster Telemetry Indicators */}
            <div className="flex items-center gap-4 px-4 py-2 sm:py-0 font-mono text-xs text-neutral-400 border-t sm:border-t-0 sm:border-l border-white/10 w-full sm:w-auto justify-center">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-neutral-200 font-semibold">0.38ms</span>
              </div>
              <span className="text-white/20">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-cyan-400">PODS:</span>
                <span className="text-neutral-200">24 ACTIVE</span>
              </div>
              <span className="text-white/20 hidden md:inline">|</span>
              <div className="hidden md:flex items-center gap-1.5">
                <span className="text-purple-400">RAG:</span>
                <span className="text-neutral-200">INDEXED</span>
              </div>
            </div>
          </m.div>
        </m.div>

      </div>

      {/* 3. BOTTOM ARCHITECTURAL TICKER (PARALLAX LAYER 5) */}
      <m.div
        style={{ y: tickerY, opacity: tickerOpacity }}
        className="relative z-10 w-full max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 font-mono text-xs text-neutral-500 border-t border-white/10 pt-6 mt-16 uppercase tracking-wider will-change-transform transform-gpu"
      >
        <div className="flex items-center gap-2">
          <span className="text-cyan-400">{"// INFRASTRUCTURE STACK:"}</span>
          <span className="text-neutral-300">{"NEXT.JS 16 // TURBOPACK // DOCKER // FASTAPI"}</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#systems" onClick={(e) => handleSmoothScroll(e, "systems")} className="hover:text-cyan-400 transition-colors cursor-pointer">
            {"[01. PROD SYSTEMS ↓]"}
          </a>
          <a href="#pipeline" onClick={(e) => handleSmoothScroll(e, "pipeline")} className="hover:text-cyan-400 transition-colors cursor-pointer">
            {"[02. PIPELINE ↓]"}
          </a>
        </div>
      </m.div>

    </section>
  );
};
