"use client";

import React, { useRef } from "react";
import { useScroll, useTransform, type MotionValue } from "motion/react";
import { m } from "motion/react";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";

interface TelemetryMetric {
  id: string;
  label: string;
  value: string;
  subtext: string;
  badge: string;
  speed: number;
}

const metrics: TelemetryMetric[] = [
  { id: "uptime", label: "GLOBAL CLUSTER UPTIME", value: "99.999%", subtext: "Zero unplanned outages over 24 months of production deployments.", badge: "HIGH AVAILABILITY", speed: 25 },
  { id: "latency", label: "API GATEWAY LATENCY", value: "0.42ms", subtext: "Average response time across US-East and South American edge regions.", badge: "ULTRA-LOW LATENCY", speed: -25 },
  { id: "concurrency", label: "THROUGHPUT CAPACITY", value: "25k+", subtext: "Simultaneous WebSocket connections handled per containerized instance.", badge: "CONCURRENCY", speed: 35 },
  { id: "security", label: "VULNERABILITY MITIGATION", value: "100%", subtext: "Automated CI/CD security audits and zero-trust protocol enforcement.", badge: "OSI HARDENED", speed: -15 },
];

interface TelemetryCardProps {
  metric: TelemetryMetric;
  progress: MotionValue<number>;
}

const TelemetryCard: React.FC<TelemetryCardProps> = ({ metric, progress }) => {
  const yTranslate = useTransform(progress, [0, 1], [metric.speed, -metric.speed]);

  return (
    <m.div
      style={{ y: yTranslate }}
      className="p-8 rounded-3xl bg-gradient-to-b from-neutral-900/90 to-neutral-950/90 border border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.9)] flex flex-col justify-between will-change-transform transform-gpu relative overflow-hidden group"
    >
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl group-hover:bg-cyan-400/10 transition-all duration-500 pointer-events-none" />
      
      <div>
        <div className="flex justify-between items-center mb-6">
          <span className="font-mono text-xs text-neutral-400 tracking-wider">
            {metric.label}
          </span>
          <span className="font-mono text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-cyan-400 font-semibold">
            {metric.badge}
          </span>
        </div>
        <div className="text-4xl sm:text-6xl font-bold font-mono text-white tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-cyan-400">
          {metric.value}
        </div>
      </div>

      <p className="text-neutral-400 text-sm leading-relaxed font-sans border-t border-white/5 pt-4">
        {metric.subtext}
      </p>
    </m.div>
  );
};

export const LiveTelemetryMatrix = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  return (
    <section ref={sectionRef} className="w-full bg-neutral-950 py-24 relative z-10 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-white/10 text-cyan-400 font-mono text-xs mb-4">
              <span>{"// 05. PRODUCTION TELEMETRY"}</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight !leading-[1.1] antialiased subpixel-antialiased select-none">
              <VerticalCutReveal splitBy="words" staggerDuration={0.05} staggerFrom="first">
                VERIFIED PERFORMANCE BENCHMARKS.
              </VerticalCutReveal>
            </h2>
          </div>
          <div className="font-mono text-xs text-neutral-400 bg-neutral-900/80 px-4 py-2 rounded-lg border border-white/10 self-start md:self-auto flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{"STREAMING LIVE TELEMETRY FROM PROD // US-EAST"}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {metrics.map((m) => (
            <TelemetryCard key={m.id} metric={m} progress={scrollYProgress} />
          ))}
        </div>
      </div>
    </section>
  );
};
