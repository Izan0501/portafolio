"use client";

import React, { useRef } from "react";
import { useScroll, useTransform, type MotionValue } from "motion/react";
import { m } from "motion/react";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";

interface NodeData {
  id: string;
  layer: string;
  title: string;
  protocol: string;
  status: string;
  speed: number;
}

const clusterNodes: NodeData[] = [
  { id: "gateway", layer: "EDGE LAYER // 01", title: "Cloudflare Workers & API Gateway", protocol: "HTTPS / HTTP3 / SSL", status: "HEALTHY (0.8ms)", speed: 40 },
  { id: "auth", layer: "SECURITY // 02", title: "Zero-Trust JWT & OAuth2 Service", protocol: "gRPC / mTLS", status: "SECURED", speed: -30 },
  { id: "core", layer: "COMPUTE LAYER // 03", title: "Python FastAPI & Node Microservices", protocol: "AsyncIO / REST / WS", status: "AUTO-SCALING (8 PODS)", speed: 60 },
  { id: "cache", layer: "IN-MEMORY // 04", title: "Distributed Redis Cache Cluster", protocol: "RESP Protocol", status: "HIT RATE: 98.4%", speed: -40 },
  { id: "db", layer: "PERSISTENCE // 05", title: "MongoDB Sharded & PostgreSQL", protocol: "TCP / ACID Compliant", status: "SYNCHRONIZED", speed: 30 },
  { id: "ai", layer: "AI / RAG ENGINE // 06", title: "Pinecone Vector DB & RAG Pipeline", protocol: "gRPC / High-Dim Embeddings", status: "INDEXED", speed: -50 },
];

interface TopologyNodeProps {
  node: NodeData;
  progress: MotionValue<number>;
  index: number;
}

const TopologyNode: React.FC<TopologyNodeProps> = ({ node, progress }) => {
  const yOffset = useTransform(progress, [0, 1], [node.speed, -node.speed]);

  return (
    <m.div
      style={{ y: yOffset }}
      whileHover={{ scale: 1.02, x: 10, transition: { duration: 0.2, ease: "easeOut" } }}
      className="relative p-6 sm:p-8 rounded-2xl bg-neutral-900/80 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] will-change-transform transform-gpu group overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-400/20 transition-all duration-500" />
      
      <div className="flex flex-wrap justify-between items-start gap-x-3 gap-y-1.5 mb-3">
        <span className="font-mono text-xs text-cyan-400 tracking-wider bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
          {node.layer}
        </span>
        <span className="font-mono text-xs text-emerald-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {node.status}
        </span>
      </div>

      <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 font-sans group-hover:text-cyan-300 transition-colors">
        {node.title}
      </h3>
      
      <div className="font-mono text-xs text-neutral-400 border-t border-white/5 pt-3 mt-3 flex flex-wrap justify-between items-center gap-x-2 gap-y-1">
        <span>PROTOCOL:</span>
        <span className="text-neutral-200 font-semibold">{node.protocol}</span>
      </div>
    </m.div>
  );
};

export const ArchitectureTopology = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  return (
    <section ref={sectionRef} className="w-full bg-neutral-950 py-32 relative z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="mb-20 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-white/10 text-cyan-400 font-mono text-xs mb-4">
            <span>{"// 04. SYSTEM TOPOLOGY & DATA ROUTING"}</span>
          </div>
          <h2 className="text-3xl md:text-6xl font-bold text-white tracking-tight !leading-[1.1] mb-6 antialiased subpixel-antialiased select-none">
            <VerticalCutReveal splitBy="words" staggerDuration={0.05} staggerFrom="first">
              Decoupled Architecture Engineered for Scale.
            </VerticalCutReveal>
          </h2>
          <p className="text-neutral-400 text-base md:text-lg font-sans leading-relaxed">
            Every layer is isolated, containerized, and asynchronously communicated. Designed to prevent single points of failure while maintaining sub-millisecond data throughput across global clusters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 relative">
          {clusterNodes.map((node, idx) => (
            <TopologyNode index={idx} key={node.id} node={node} progress={scrollYProgress} />
          ))}
        </div>
      </div>
    </section>
  );
};
