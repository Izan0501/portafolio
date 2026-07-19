"use client";

import React, { useRef } from "react";
import { useScroll, useTransform } from "motion/react";
import { m } from "motion/react";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { ThreeDCardContainer, ThreeDCardBody, ThreeDCardItem } from "@/components/ui/ThreeDCard";

export const TechStackBento = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Parallax Y-offsets for grid column differentiation
  const leftColY = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const rightColY = useTransform(scrollYProgress, [0, 1], [-50, 50]);

  return (
    <section ref={containerRef} className="w-full max-w-7xl mx-auto px-6 py-32 relative z-10 bg-neutral-950">
      {/* Section Header */}
      <div className="mb-20 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-white/10 text-cyan-400 font-mono text-xs mb-4">
          <span>{"// 01. CORE ARCHITECTURE & INFRASTRUCTURE"}</span>
        </div>
        <h2 className="text-3xl md:text-6xl font-bold text-white tracking-tight !leading-[1.1] mb-6 antialiased subpixel-antialiased select-none">
          <VerticalCutReveal splitBy="words" staggerDuration={0.05} staggerFrom="first">
            Engineered for High Concurrency & Zero Latency.
          </VerticalCutReveal>
        </h2>
        <p className="text-neutral-400 text-base md:text-lg font-sans leading-relaxed">
          An ecosystem built on robust backend microservices, advanced vector databases, and containerized orchestration designed to scale effortlessly under load.
        </p>
      </div>

      {/* Asymmetric Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (Span 7) - Heavy Backend & DevOps */}
        <m.div style={{ y: leftColY }} className="lg:col-span-7 flex flex-col gap-8 will-change-transform transform-gpu">
          
          {/* Card 1: Containerization & DevOps */}
          <ThreeDCardContainer className="w-full">
            <ThreeDCardBody className="w-full h-auto p-8 rounded-3xl bg-neutral-900/60 border border-white/10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-500" />
              <ThreeDCardItem className="font-mono text-xs text-cyan-400 mb-2" translateZ={30}>
                [ORCHESTRATION & CI/CD]
              </ThreeDCardItem>
              <ThreeDCardItem className="text-2xl md:text-3xl font-bold text-white mb-4 block" translateZ={50}>
                Docker & Cloud Native Orchestration
              </ThreeDCardItem>
              <ThreeDCardItem className="text-neutral-300 text-sm md:text-base leading-relaxed mb-6 font-sans block" translateZ={40}>
                Full container lifecycle management, multi-stage automated build matrices, and zero-downtime deployment pipelines engineered for high-availability environments.
              </ThreeDCardItem>
              <ThreeDCardItem className="w-full bg-black/80 p-4 rounded-xl border border-white/5 font-mono text-xs text-emerald-400 overflow-x-auto shadow-inner block" translateZ={60}>
                <code>$ docker compose up -d --scale api-gateway=4 --no-recreate</code>
              </ThreeDCardItem>
            </ThreeDCardBody>
          </ThreeDCardContainer>

          {/* Card 2: AI & Vector Engines */}
          <ThreeDCardContainer className="w-full">
            <ThreeDCardBody className="w-full h-auto p-8 rounded-3xl bg-neutral-900/60 border border-white/10 shadow-2xl relative overflow-hidden group">
              <ThreeDCardItem className="font-mono text-xs text-purple-400 mb-2" translateZ={30}>
                [AI / RAG / VECTOR STORAGE]
              </ThreeDCardItem>
              <ThreeDCardItem className="text-2xl font-bold text-white mb-4 block" translateZ={50}>
                Pinecone & MongoDB Advanced Persistence
              </ThreeDCardItem>
              <ThreeDCardItem className="text-neutral-300 text-sm leading-relaxed font-sans block" translateZ={40}>
                High-dimensional vector embedding storage for real-time Retrieval-Augmented Generation (RAG) pipelines, coupled with distributed NoSQL document architectures.
              </ThreeDCardItem>
            </ThreeDCardBody>
          </ThreeDCardContainer>
        </m.div>

        {/* Right Column (Span 5) - High Performance APIs & Security */}
        <m.div style={{ y: rightColY }} className="lg:col-span-5 flex flex-col gap-8 will-change-transform transform-gpu">
          
          {/* Card 3: Python & FastAPI Microservices */}
          <ThreeDCardContainer className="w-full">
            <ThreeDCardBody className="w-full h-auto p-8 rounded-3xl bg-neutral-900/60 border border-white/10 shadow-2xl relative overflow-hidden group">
              <ThreeDCardItem className="font-mono text-xs text-emerald-400 mb-2" translateZ={30}>
                [HIGH-CONCURRENCY BACKEND]
              </ThreeDCardItem>
              <ThreeDCardItem className="text-2xl md:text-3xl font-bold text-white mb-4 block" translateZ={50}>
                Python FastAPI & Node Ecosystems
              </ThreeDCardItem>
              <ThreeDCardItem className="text-neutral-300 text-sm leading-relaxed mb-6 font-sans block" translateZ={40}>
                Asynchronous API endpoints with sub-millisecond execution times, automated OpenAPI documentation, and strict Pydantic type-safety validation.
              </ThreeDCardItem>
              <ThreeDCardItem className="flex flex-wrap gap-2 pt-2 border-t border-white/10" translateZ={60}>
                <span className="px-3 py-1 rounded-full bg-white/5 text-xs font-mono text-neutral-300 border border-white/5">AsyncIO</span>
                <span className="px-3 py-1 rounded-full bg-white/5 text-xs font-mono text-neutral-300 border border-white/5">JWT Auth</span>
                <span className="px-3 py-1 rounded-full bg-white/5 text-xs font-mono text-neutral-300 border border-white/5">WebSockets</span>
              </ThreeDCardItem>
            </ThreeDCardBody>
          </ThreeDCardContainer>

          {/* Card 4: Frontend Precision & Cyber Security */}
          <ThreeDCardContainer className="w-full">
            <ThreeDCardBody className="w-full h-auto p-8 rounded-3xl bg-neutral-900/60 border border-white/10 shadow-2xl relative overflow-hidden group">
              <ThreeDCardItem className="font-mono text-xs text-red-400 mb-2" translateZ={30}>
                [FRONTEND & PROTOCOL AUDITS]
              </ThreeDCardItem>
              <ThreeDCardItem className="text-2xl font-bold text-white mb-4 block" translateZ={50}>
                React, Next.js & Security Hardening
              </ThreeDCardItem>
              <ThreeDCardItem className="text-neutral-300 text-sm leading-relaxed font-sans block" translateZ={40}>
                Server-side rendering with reactive client states, reinforced by rigorous network protocol analysis, OSI layer audits, and vulnerability mitigation.
              </ThreeDCardItem>
            </ThreeDCardBody>
          </ThreeDCardContainer>
        </m.div>

      </div>
    </section>
  );
};
