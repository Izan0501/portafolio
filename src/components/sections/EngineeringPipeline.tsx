"use client";

import React, { useRef } from "react";
import { useScroll, useTransform, type MotionValue } from "motion/react";
import { m } from "motion/react";
import { SiGithubactions } from "react-icons/si";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";

interface PipelineStage {
  phase: string;
  badge: string;
  title: string;
  desc: string;
  artifactType: "security" | "docker" | "cicd" | "edge";
}

const stages: PipelineStage[] = [
  {
    phase: "01",
    badge: "PROTOCOL // ACCESS & AUTH DESIGN",
    title: "Access-Layer Architecture & Security Review",
    desc: "Designing session and permission boundaries before implementation — JWT/OAuth2 token flows with access & refresh rotation, and a manual review pass on every auth-adjacent endpoint.",
    artifactType: "security",
  },
  {
    phase: "02",
    badge: "INFRASTRUCTURE // ISOLATION",
    title: "Containerization & Reproducible Environments",
    desc: "Multi-stage Docker builds with Swarm-based scaling for backend services (VeeBot), and Turbopack-optimized production builds for frontend platforms (Axon Crafts).",
    artifactType: "docker",
  },
  {
    phase: "03",
    badge: "AUTOMATION // CI PIPELINES",
    title: "CI Automation & Manual QA Gate",
    desc: "GitHub Actions runs build, type-check, and lint on every push. A manual QA pass is still the gate before merging to main — automated test coverage is on the roadmap, not a claim we make yet.",
    artifactType: "cicd",
  },
  {
    phase: "04",
    badge: "RELEASE // DEPLOYMENT",
    title: "Zero-Downtime Release & Manual Verification",
    desc: "Rolling Swarm deploys on AWS for backend services, instant edge deploys via Vercel + Cloudflare for frontend platforms — verified manually post-release while dedicated observability tooling is still on the roadmap.",
    artifactType: "edge",
  },
];

// STANDALONE CHILD COMPONENT (Ensures 100% compliance with React Rules of Hooks)
interface PipelineStepCardProps {
  stage: PipelineStage;
  index: number;
  total: number;
  progress: MotionValue<number>;
}

const PipelineStepCard: React.FC<PipelineStepCardProps> = ({ stage, index, total, progress }) => {
  // Calculate precise scroll activation thresholds for this specific step
  const startThreshold = (index / total) * 0.8;
  const endThreshold = ((index + 1) / total) * 0.8;

  // Scroll-linked visual elevation
  const cardOpacity = useTransform(progress, [startThreshold - 0.1, startThreshold, endThreshold, endThreshold + 0.1], [0.3, 1, 1, 0.4]);
  const cardScale = useTransform(progress, [startThreshold - 0.1, startThreshold, endThreshold], [0.96, 1.02, 1]);
  const nodeGlow = useTransform(progress, [startThreshold - 0.05, startThreshold], [0, 1]);

  return (
    <div className="relative pl-8 sm:pl-16 md:pl-24 py-6 group">
      {/* 1. CYBER-REACTOR NODE (Ignites when laser touches its threshold) */}
      <div className="absolute -left-[17px] sm:-left-[21px] md:-left-[25px] top-10 flex items-center justify-center z-20">
        <m.div
          style={{ scale: useTransform(nodeGlow, [0, 1], [0.8, 1.2]) }}
          className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-neutral-950 border-2 border-white/20 flex items-center justify-center transition-colors duration-500 group-hover:border-cyan-400 shadow-[0_0_20px_rgba(0,0,0,0.9)]"
        >
          {/* Inner core pulse */}
          <m.div
            style={{ opacity: nodeGlow }}
            className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,1)] animate-pulse"
          />
        </m.div>
      </div>

      {/* 2. MAIN ENGINEERING CARD */}
      <m.div
        style={{ opacity: cardOpacity, scale: cardScale }}
        whileHover={{ x: 10, transition: { duration: 0.2, ease: "easeOut" } }}
        className="p-6 sm:p-8 md:p-10 rounded-3xl bg-gradient-to-br from-neutral-900/90 via-neutral-900/60 to-neutral-950/90 border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.8)] will-change-transform transform-gpu relative overflow-hidden group-hover:border-cyan-500/40 transition-all duration-300"
      >
        {/* Ambient Corner Glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-500" />

        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <span className="font-mono text-xs px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 tracking-wider">
            PHASE {"//"} {stage.phase} — {stage.badge}
          </span>
          <span className="font-mono text-xs text-neutral-500 select-none">
            [EXECUTION PROTOCOL]
          </span>
        </div>

        <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-4 font-sans group-hover:text-cyan-300 transition-colors">
          {stage.title}
        </h3>

        <p className="text-neutral-300 text-sm sm:text-base leading-relaxed font-sans mb-6 max-w-3xl">
          {stage.desc}
        </p>

        {/* 3. EMBEDDED TECHNICAL ARTIFACTS (Interactive engineering proof) */}
        <div className="mt-6 pt-6 border-t border-white/10">
          {stage.artifactType === "security" && (
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
              <span className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                JWT / OAuth2 — Access & Refresh Rotation
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-neutral-300">
                Manual Code Review — Auth & Session Paths
              </span>
            </div>
          )}

          {stage.artifactType === "docker" && (
            <div className="bg-black/90 p-4 rounded-xl border border-white/10 font-mono text-xs text-neutral-300 overflow-x-auto shadow-inner space-y-1">
              <div className="text-neutral-500">{"// Multi-stage production container build"}</div>
              <div><span className="text-cyan-400">FROM</span> node:20-alpine <span className="text-cyan-400">AS</span> builder</div>
              <div><span className="text-cyan-400">WORKDIR</span> /app</div>
              <div><span className="text-cyan-400">RUN</span> npm ci && npm run build</div>
              <div className="text-neutral-500 pt-1">{"// Swarm scaling (VeeBot)"}</div>
              <div><span className="text-emerald-400">$</span> docker service scale veebot_api=4</div>
            </div>
          )}

          {stage.artifactType === "cicd" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex flex-wrap items-center gap-x-1.5 gap-y-1 justify-between">
                <span className="flex items-center gap-1.5"><SiGithubactions className="text-sm" /> Actions — Build</span>
                <span className="font-bold">✓ PASS</span>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex flex-wrap items-center justify-between gap-x-1.5 gap-y-1">
                <span>TypeScript Strict</span>
                <span className="font-bold">✓ PASS</span>
              </div>
              <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 flex flex-wrap items-center justify-between gap-x-1.5 gap-y-1">
                <span>Manual QA — Pre-Merge</span>
                <span className="font-bold">✓ CHECKED</span>
              </div>
            </div>
          )}

          {stage.artifactType === "edge" && (
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-gradient-to-r from-cyan-950/40 to-black/80 border border-cyan-500/20 font-mono text-xs">
              <div className="flex items-center gap-2 text-cyan-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>AWS Docker Swarm {"//"} Vercel Edge + Cloudflare</span>
              </div>
              <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Manual Post-Deploy Verification
              </span>
            </div>
          )}
        </div>
      </m.div>
    </div>
  );
};

export const EngineeringPipeline = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 80%", "end 30%"],
  });

  // Animated laser height filling up the timeline
  const laserHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={containerRef} className="w-full bg-neutral-950 py-32 relative z-10 overflow-visible border-t border-white/5">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="mb-24 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-white/10 text-cyan-400 font-mono text-xs mb-4 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>{"// 03. ARCHITECTURE & DELIVERY LIFECYCLE"}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight !leading-[1.1] mb-6 antialiased subpixel-antialiased select-none">
            <VerticalCutReveal splitBy="words" staggerDuration={0.05} staggerFrom="first">
              THE ENGINEERING LIFECYCLE.
            </VerticalCutReveal>
          </h2>
          <p className="text-neutral-400 text-base sm:text-lg font-sans max-w-2xl leading-relaxed">
            From access-layer architecture and container isolation to CI-driven builds and manually verified deployments — the real workflow behind every shipped system.
          </p>
        </div>

        {/* Timeline Layout Container */}
        <div className="relative ml-4 sm:ml-12 md:ml-20 flex flex-col gap-12 sm:gap-16">
          {/* Static Background Track */}
          <div className="absolute top-0 -left-[1px] w-[2px] h-full bg-white/10 rounded-full" />

          {/* Animated Laser Progress Line (Shoots down on scroll) */}
          <m.div
            style={{ height: laserHeight }}
            className="absolute top-0 -left-[1px] w-[2px] bg-gradient-to-b from-cyan-400 via-emerald-400 to-cyan-500 shadow-[0_0_15px_rgba(34,211,238,1)] rounded-full will-change-transform transform-gpu"
          />

          {/* Render Timeline Step Cards */}
          {stages.map((stage, idx) => (
            <PipelineStepCard index={idx} key={stage.phase} progress={scrollYProgress} stage={stage} total={stages.length} />
          ))}
        </div>
      </div>
    </section>
  );
};
