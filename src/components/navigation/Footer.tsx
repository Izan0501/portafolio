"use client";

import React, { useState } from "react";
import { useLenis } from "lenis/react";
import { m, useMotionValue, useSpring, useMotionTemplate } from "motion/react";
import { useI18n } from "@/i18n/LanguageProvider";

// ==========================================
// ELITE KINETIC CAD SPOTLIGHT WATERMARK
// ==========================================
const KineticWatermark: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const { t } = useI18n();
  
  // GPU-accelerated mouse coordinate tracking (Zero React re-renders)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Silicon Valley heavy physics damping for a high-end instrument feel
  const smoothX = useSpring(mouseX, { stiffness: 280, damping: 35, mass: 0.5 });
  const smoothY = useSpring(mouseY, { stiffness: 280, damping: 35, mass: 0.5 });

  // Dynamic GPU radial mask centered on the dampened mouse coordinates
  const maskImage = useMotionTemplate`radial-gradient(400px circle at ${smoothX}px ${smoothY}px, black 0%, transparent 85%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="w-full overflow-hidden flex flex-col items-center border-t border-white/10 pt-16 pb-8 relative group select-none cursor-crosshair bg-neutral-950"
    >
      {/* 1. Orbiting Diagnostic Telemetry Badges */}
      <div className="flex flex-wrap justify-center gap-4 sm:gap-8 font-mono text-[10px] sm:text-xs text-neutral-500 mb-6 z-20 tracking-widest pointer-events-none">
        <span className="flex items-center gap-1.5 bg-neutral-900/90 px-3.5 py-1 rounded-full border border-white/10 shadow-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          {t.footer.badges.cluster}
        </span>
        <span className="flex items-center gap-1.5 bg-neutral-900/90 px-3.5 py-1 rounded-full border border-white/10 shadow-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          {t.footer.badges.diagnostic}
        </span>
        <span className="flex items-center gap-1.5 bg-neutral-900/90 px-3.5 py-1 rounded-full border border-white/10 shadow-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          {t.footer.badges.protocol}
        </span>
      </div>

      {/* 2. Interactive Typography Stage */}
      <div className="relative w-full flex justify-center items-center py-4">
        
        {/* LAYER A: Base Architectural Text (Subtle, dark, solid foundation) */}
        <div className="text-[11vw] font-black font-sans tracking-tighter text-neutral-900/90 leading-none select-none pointer-events-none whitespace-nowrap drop-shadow-[0_10px_15px_rgba(0,0,0,0.9)]">
          IVO.DEV
        </div>

        {/* LAYER B: The Illuminated Blueprint Reveal (Masked by GPU Cursor Spotlight) */}
        <m.div
          style={{
            maskImage,
            WebkitMaskImage: maskImage,
          }}
          className="absolute inset-0 flex justify-center items-center pointer-events-none overflow-hidden z-10"
        >
          {/* Blueprint Grid Overlay inside the spotlight */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#00ffff15_1px,transparent_1px),linear-gradient(to_bottom,#00ffff15_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          {/* High-Intensity Glowing Typography */}
          <div className="text-[11vw] font-black font-sans tracking-tighter leading-none select-none whitespace-nowrap text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-emerald-400 drop-shadow-[0_0_30px_rgba(34,211,238,0.8)]">
            IVO.DEV
          </div>
        </m.div>

        {/* LAYER C: CAD Diagnostic Crosshairs (Vertical & Horizontal tracking lines) */}
        <m.div
          style={{ x: smoothX, opacity: isHovered ? 1 : 0 }}
          transition={{ opacity: { duration: 0.2 } }}
          className="absolute top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-cyan-400/60 to-transparent pointer-events-none z-20 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
        />
        <m.div
          style={{ y: smoothY, opacity: isHovered ? 1 : 0 }}
          transition={{ opacity: { duration: 0.2 } }}
          className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none z-20"
        />
      </div>

      {/* 3. Bottom Engineering Legend */}
      <div className="font-mono text-[11px] text-neutral-500 tracking-widest mt-4 uppercase z-20 flex items-center gap-2">
        <span>{t.footer.watermarkLegend}</span>
        <span className="text-cyan-400 font-semibold">{t.footer.watermarkHint}</span>
      </div>
    </div>
  );
};

export const Footer = () => {
  const lenis = useLenis();
  const { t } = useI18n();

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement && lenis) {
      lenis.scrollTo(targetElement, {
        offset: -100,
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    } else if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="w-full bg-neutral-950 relative z-10 border-t border-white/10 overflow-hidden pt-20 pb-12 select-none">
      {/* Top Telemetry Ticker Bar */}
      <div className="max-w-7xl mx-auto px-6 mb-16 pb-8 border-b border-white/10 flex flex-wrap justify-between items-center gap-4 font-mono text-xs text-neutral-400">
        <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-md border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{t.footer.ticker.operational}</span>
        </div>
        <div className="flex flex-wrap gap-6 text-neutral-400">
          <span>{t.footer.ticker.latencyLabel} <strong className="text-cyan-400">0.38ms</strong></span>
          <span>{t.footer.ticker.uptimeLabel} <strong className="text-white">99.999%</strong></span>
          <span>{t.footer.ticker.locationLabel} <strong className="text-white">{t.footer.ticker.locationValue}</strong></span>
          <span>{t.footer.ticker.buildLabel} <strong className="text-cyan-400">NEXT.JS 16 TURBO</strong></span>
        </div>
      </div>

      {/* Main Grid Columns */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 mb-20 font-sans">
        
        {/* Col 1: Brand & Philosophy (Span 5) */}
        <div className="md:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 font-mono text-sm font-bold text-white tracking-tight">
              <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
              <span>{t.footer.brandName}</span>
            </div>
            <p className="text-neutral-400 text-sm md:text-base leading-relaxed max-w-sm mb-6">
              {t.footer.philosophy}
            </p>
          </div>
          <div className="font-mono text-xs text-neutral-400">
            <span>{t.footer.availability}</span>
          </div>
        </div>

        {/* Col 2: Architecture Navigation (Span 3) */}
        <div className="md:col-span-3 flex flex-col gap-3 font-mono text-xs">
          <span className="text-white font-bold tracking-wider mb-2 border-l-2 border-cyan-400 pl-2">
            {t.footer.modulesHeading}
          </span>
          {[
            { label: t.footer.modules.stack, id: "stack" },
            { label: t.footer.modules.systems, id: "systems" },
            { label: t.footer.modules.pipeline, id: "pipeline" },
            { label: t.footer.modules.topology, id: "topology" },
            { label: t.footer.modules.telemetry, id: "telemetry" },
            // Target is #terminal-card (the id TerminalCard renders); "terminal"
            // was a dangling anchor that scrolled nowhere.
            { label: t.footer.modules.terminal, id: "terminal-card" },
          ].map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(e) => handleSmoothScroll(e, link.id)}
              className="text-neutral-400 hover:text-cyan-400 transition-colors cursor-pointer w-fit flex items-center gap-1 hover:translate-x-1 duration-200"
            >
              <span>{link.label}</span>
            </a>
          ))}
        </div>

        {/* Col 3: Protocols & Socials (Span 4) */}
        <div className="md:col-span-4 flex flex-col gap-3 font-mono text-xs">
          <span className="text-white font-bold tracking-wider mb-2 border-l-2 border-cyan-400 pl-2">
            {t.footer.channelsHeading}
          </span>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors flex flex-wrap items-center justify-between gap-x-2 gap-y-1 p-2.5 rounded-lg bg-neutral-900/60 border border-white/5 hover:border-white/20">
            <span>{t.footer.channels.github}</span>
            <span className="text-cyan-400">→ /ivozanacchi</span>
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors flex flex-wrap items-center justify-between gap-x-2 gap-y-1 p-2.5 rounded-lg bg-neutral-900/60 border border-white/5 hover:border-white/20">
            <span>{t.footer.channels.linkedin}</span>
            <span className="text-cyan-400">→ /in/ivozanacchi</span>
          </a>
          <a href="mailto:ivozanacchi@example.com" className="text-neutral-400 hover:text-white transition-colors flex flex-wrap items-center justify-between gap-x-2 gap-y-1 p-2.5 rounded-lg bg-neutral-900/60 border border-white/5 hover:border-white/20">
            <span>{t.footer.channels.email}</span>
            <span className="text-emerald-400">{t.footer.channels.emailAction}</span>
          </a>
        </div>

      </div>

      {/* KINETIC LASER-SCANNED ENGINEERING WATERMARK */}
      <KineticWatermark />

      {/* Bottom Legal & Tech Stack Note */}
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 font-mono text-xs text-neutral-400 pt-6">
        <span>{t.footer.copyright(new Date().getFullYear())}</span>
        <span>{t.footer.builtWith}</span>
      </div>
    </footer>
  );
};
