"use client";

import React, { useRef } from "react";
import { useScroll, useTransform, type MotionValue } from "motion/react";
import { m } from "motion/react";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { useI18n } from "@/i18n/LanguageProvider";
import type { Dictionary } from "@/i18n/dictionaries/en";

type MetricId = keyof Dictionary["telemetry"]["metrics"];

interface TelemetryMetric {
  id: MetricId;
  label: string;
  value: string;
  subtext: string;
  badge: string;
  speed: number;
}

/** Numeric values and parallax speeds are data, not copy. */
const METRIC_STATS: { id: MetricId; value: string; speed: number }[] = [
  { id: "uptime", value: "99.999%", speed: 25 },
  { id: "latency", value: "0.42ms", speed: -25 },
  { id: "concurrency", value: "25k+", speed: 35 },
  { id: "security", value: "100%", speed: -15 },
];

function buildMetrics(t: Dictionary): TelemetryMetric[] {
  return METRIC_STATS.map(({ id, value, speed }) => ({
    id,
    value,
    speed,
    ...t.telemetry.metrics[id],
  }));
}

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
        <div className="flex flex-wrap justify-between items-center gap-x-3 gap-y-1.5 mb-6">
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
  const { t } = useI18n();
  const metrics = buildMetrics(t);
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
              <span>{t.telemetry.eyebrow}</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight !leading-[1.1] antialiased subpixel-antialiased select-none">
              <VerticalCutReveal splitBy="words" staggerDuration={0.05} staggerFrom="first">
                {t.telemetry.heading}
              </VerticalCutReveal>
            </h2>
          </div>
          <div className="font-mono text-xs text-neutral-400 bg-neutral-900/80 px-4 py-2 rounded-lg border border-white/10 self-start md:self-auto flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{t.telemetry.streamingLabel}</span>
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
