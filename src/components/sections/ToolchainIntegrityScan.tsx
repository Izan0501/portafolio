"use client";

import React from "react";
import { m } from "motion/react";
import {
  SiReact,
  SiNextdotjs,
  SiVite,
  SiTypescript,
  SiJavascript,
  SiTailwindcss,
  SiBootstrap,
  SiCss,
  SiHtml5,
  SiExpo,
  SiNodedotjs,
  SiExpress,
  SiPython,
  SiFastapi,
  SiDjango,
  SiPostgresql,
  SiSupabase,
  SiMongodb,
  SiMysql,
  SiSqlite,
  SiFirebase,
  SiDatabricks,
  SiDocker,
  SiGit,
  SiGithub,
  SiPostman,
} from "react-icons/si";
import { FiTerminal } from "react-icons/fi";
import { useI18n } from "@/i18n/LanguageProvider";

/* ────────────────────────────────────────────────────────────────────────────
   TOOLCHAIN INTEGRITY SCAN
   ──────────────────────────────────────────────────────────────────────────── */

type BandId = "frontend" | "backend" | "data" | "devops";

interface Module {
  icon: React.ElementType;
  name: string;
  /** Official brand hue — taken verbatim from the previous IconCard data. */
  brand: string;
  glow: string;
}

interface Band {
  id: BandId;
  items: readonly Module[];
}

const BANDS: readonly Band[] = [
  {
    id: "frontend",
    items: [
      { icon: SiReact,       name: "React/React-Native", brand: "#61DAFB", glow: "rgba(97,218,251,0.5)"  },
      { icon: SiNextdotjs,   name: "Next.js",      brand: "#ffffff", glow: "rgba(255,255,255,0.3)" },
      { icon: SiVite,        name: "Vite",          brand: "#646CFF", glow: "rgba(100,108,255,0.5)" },
      { icon: SiTypescript,  name: "TypeScript",    brand: "#3178C6", glow: "rgba(49,120,198,0.5)"  },
      { icon: SiJavascript,  name: "JavaScript",    brand: "#F7DF1E", glow: "rgba(247,223,30,0.5)"  },
      { icon: SiTailwindcss, name: "Tailwind",      brand: "#06B6D4", glow: "rgba(6,182,212,0.5)"   },
      { icon: SiBootstrap,   name: "Bootstrap",     brand: "#7952B3", glow: "rgba(121,82,179,0.5)"  },
      { icon: SiCss,         name: "CSS3",          brand: "#1572B6", glow: "rgba(21,114,182,0.5)"  },
      { icon: SiHtml5,       name: "HTML5",         brand: "#E34F26", glow: "rgba(227,79,38,0.5)"   },
      { icon: SiExpo,        name: "Expo",          brand: "#e4e4e7", glow: "rgba(228,228,231,0.3)" },
    ],
  },
  {
    id: "backend",
    items: [
      { icon: SiNodedotjs, name: "Node.js",    brand: "#339933", glow: "rgba(51,153,51,0.5)"  },
      { icon: SiExpress,   name: "Express.js",  brand: "#ffffff", glow: "rgba(255,255,255,0.3)" },
      { icon: SiPython,    name: "Python",      brand: "#3776AB", glow: "rgba(55,118,171,0.5)" },
      { icon: SiFastapi,   name: "FastAPI",     brand: "#009688", glow: "rgba(0,150,136,0.5)"  },
      { icon: SiDjango,    name: "Django",      brand: "#092E20", glow: "rgba(9,46,32,0.5)"   },
    ],
  },
  {
    id: "data",
    items: [
      { icon: SiPostgresql, name: "PostgreSQL",       brand: "#4169E1", glow: "rgba(65,105,225,0.5)" },
      { icon: SiSupabase,   name: "Supabase",         brand: "#3ECF8E", glow: "rgba(62,207,142,0.5)" },
      { icon: SiMongodb,    name: "MongoDB",          brand: "#47A248", glow: "rgba(71,162,72,0.5)"  },
      { icon: SiMysql,      name: "MySQL",            brand: "#4479A1", glow: "rgba(68,121,161,0.5)" },
      { icon: SiSqlite,     name: "SQLite",           brand: "#44a8d8", glow: "rgba(68,168,216,0.5)" },
      { icon: SiFirebase,   name: "Firebase",         brand: "#FFCA28", glow: "rgba(255,202,40,0.5)" },
      { icon: SiDatabricks, name: "Pinecone / Vector", brand: "#FF3621", glow: "rgba(255,54,33,0.5)"  },
    ],
  },
  {
    id: "devops",
    items: [
      { icon: SiDocker,  name: "Docker",  brand: "#2496ED", glow: "rgba(36,150,237,0.5)"  },
      { icon: SiGit,     name: "Git",     brand: "#F05032", glow: "rgba(240,80,50,0.5)"   },
      { icon: SiGithub,  name: "GitHub",  brand: "#ffffff", glow: "rgba(255,255,255,0.3)" },
      { icon: SiPostman, name: "Postman", brand: "#FF6C37", glow: "rgba(255,108,55,0.5)"  },
    ],
  },
] as const;

/** Derived, never hardcoded — the counter and the per-band counts cannot drift. */
const TOTAL_MODULES = BANDS.reduce((n, band) => n + band.items.length, 0);

const pad2 = (n: number) => String(n).padStart(2, "0");

/* ── Scoped stylesheet ──────────────────────────────────────────────────────
   Static, author-authored, no interpolation. Pure CSS keyframes — the whole
   point of the section is that nothing here costs a JS frame.
   ────────────────────────────────────────────────────────────────────────── */
const STYLES = `
.tcs {
  --tcs-accent: #22d3ee;
  --scan-dur: 9s;
  --cols: 3;
  --rail: 0px;
  --rail-gap: 0px;
  --pad: 16px;
  --stack-gap: 10px;
  --cell-gap: 8px;
  --icon: 24px;
  --label: 9px;
  position: relative;
}
/* Column count climbs with available width so the square cells never grow
   absurd on tablets nor crush the labels on small phones. */
@media (min-width: 375px) { .tcs { --cols: 4; } }
@media (min-width: 640px) { .tcs { --cols: 6; --pad: 20px; --cell-gap: 10px; --icon: 26px; } }
@media (min-width: 768px) { .tcs { --cols: 8; --pad: 24px; --cell-gap: 12px; --icon: 28px; --label: 10px; } }
@media (min-width: 1024px) { .tcs { --rail: 132px; --rail-gap: 24px; --pad: 32px; --icon: 30px; } }

/* The ONLY clipping context in the animated path — a plain div, never a section.
   Horizontal padding is driven by --pad so the scan track below cannot desync. */
.tcs__scanArea { position: relative; padding: 18px var(--pad) 20px; }
@media (min-width: 768px) { .tcs__scanArea { padding: 22px var(--pad) 26px; } }

.tcs__track {
  position: absolute; top: 0; bottom: 0; z-index: 3;
  left: calc(var(--pad) + var(--rail) + var(--rail-gap));
  right: var(--pad);
  overflow: hidden; pointer-events: none;
}
.tcs__sweep {
  position: absolute; inset: 0; color: var(--tcs-accent);
  will-change: transform;
  animation: tcs-sweep var(--scan-dur) linear infinite;
}
.tcs__sweepWash {
  position: absolute; top: 0; bottom: 0; left: -150px; width: 150px;
  opacity: 0.13; background: linear-gradient(90deg, transparent, currentColor);
}
.tcs__sweepCore {
  position: absolute; top: 0; bottom: 0; left: -1px; width: 2px;
  background: currentColor; box-shadow: 0 0 18px 2px currentColor; opacity: 0.85;
}

.tcs__band {
  display: grid; grid-template-columns: 1fr; gap: var(--stack-gap);
  padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.05);
}
@media (min-width: 768px) { .tcs__band { padding: 18px 0; } }
@media (min-width: 1024px) {
  .tcs__band {
    grid-template-columns: var(--rail) 1fr;
    gap: var(--rail-gap);
    align-items: center;
  }
}
.tcs__band:first-child { padding-top: 0; }
.tcs__band:last-child { padding-bottom: 0; border-bottom: 0; }

.tcs__rail { display: flex; align-items: baseline; gap: 10px; }
@media (min-width: 1024px) {
  .tcs__rail { flex-direction: column; align-items: flex-start; gap: 5px; }
}

.tcs__cells {
  display: grid; grid-template-columns: repeat(var(--cols), minmax(0, 1fr));
  list-style: none; margin: 0; padding: 0;
}

.tcs__cell {
  --col: var(--col-3);
  position: relative; aspect-ratio: 1; border-radius: 16px;
  margin: calc(var(--cell-gap) / 2);
  min-width: 0;
  background: linear-gradient(to bottom, rgba(38,38,38,0.8), #171717);
  border: 1px solid rgba(255,255,255,0.06);
  box-shadow: 0 8px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 5px; cursor: crosshair;
  transition: transform 300ms ease, border-color 300ms ease;
}
/* --col is the grid column index, so it must track --cols at every breakpoint. */
@media (min-width: 375px) { .tcs__cell { --col: var(--col-4); } }
@media (min-width: 640px) { .tcs__cell { --col: var(--col-6); } }
@media (min-width: 768px) { .tcs__cell { --col: var(--col-8); gap: 8px; } }
.tcs__cell:hover { transform: translateY(-4px); border-color: rgba(255,255,255,0.2); }

/* Both overlays are painted up front at opacity 0 and only their OPACITY moves —
   never box-shadow, never filter. */
.tcs__glow {
  position: absolute; inset: 0; border-radius: 16px; pointer-events: none;
  opacity: 0; transition: opacity 300ms ease;
  box-shadow: 0 0 24px var(--tcs-glow);
}
.tcs__cell:hover .tcs__glow { opacity: 1; }

.tcs__scan {
  position: absolute; inset: 0; border-radius: 16px; pointer-events: none; opacity: 0;
  box-shadow: 0 0 0 1px var(--tcs-accent), 0 0 26px -6px var(--tcs-accent);
  animation: tcs-ignite var(--scan-dur) linear infinite;
  /* MUST stay after the shorthand: the animation shorthand resets
     animation-delay to 0s, which would fire all 19 cells at once.
     Subtracting 1.03 achieves a negative delay (starts instantly) AND shifts
     the timeline so the 3% opacity peak perfectly aligns with the laser. */
  animation-delay: calc(((var(--col) + 0.5) / var(--cols) - 1.03) * var(--scan-dur));
}

.tcs__led {
  position: absolute; top: 7px; right: 7px; width: 6px; height: 6px;
  border-radius: 9999px; background: #404040;
}
@media (min-width: 768px) { .tcs__led { top: 10px; right: 10px; } }
.tcs__led span {
  position: absolute; inset: 0; border-radius: 9999px;
  background: var(--tcs-accent); box-shadow: 0 0 8px var(--tcs-accent); opacity: 0.2;
  animation: tcs-verify var(--scan-dur) linear infinite;
  animation-delay: calc(((var(--col) + 0.5) / var(--cols) - 1.03) * var(--scan-dur));
}

.tcs__icon { display: flex; color: #a3a3a3; transition: color 300ms ease; }
.tcs__icon svg { display: block; width: var(--icon); height: var(--icon); }
.tcs__cell:hover .tcs__icon { color: var(--tcs-brand); }

.tcs__label {
  font-size: var(--label); line-height: 1.2; text-align: center;
  padding: 0 3px; color: #a3a3a3; transition: color 300ms ease;
}
.tcs__cell:hover .tcs__label { color: #ffffff; }

@keyframes tcs-sweep {
  from { transform: translateX(0); }
  to   { transform: translateX(100%); }
}
@keyframes tcs-ignite {
  0%   { opacity: 0; }
  3%   { opacity: 1; }
  18%  { opacity: 0.15; }
  100% { opacity: 0; }
}
@keyframes tcs-verify {
  0%   { opacity: 0.2; }
  3%   { opacity: 1; }
  32%  { opacity: 0.65; }
  100% { opacity: 0.2; }
}

/* Reduced motion: the sweep is removed and the grid settles as a completed
   pass — every LED lit, every cell outlined. Pure CSS, so it holds even if the
   Motion provider never mounts. */
@media (prefers-reduced-motion: reduce) {
  .tcs__sweep { display: none; }
  .tcs__scan { animation: none; opacity: 0.12; }
  .tcs__led span { animation: none; opacity: 0.9; }
  .tcs__cell { transition: none; }
  .tcs__cell:hover { transform: none; }
}
`;

/* ── Cell ─────────────────────────────────────────────────────────────────── */

interface CellProps {
  module: Module;
  /** Index within its band — drives the grid-column index at each breakpoint. */
  index: number;
}

const Cell: React.FC<CellProps> = ({ module: { icon: Icon, name, brand, glow }, index }) => (
  <li
    className="tcs__cell"
    style={
      {
        "--tcs-brand": brand,
        "--tcs-glow": glow,
        "--col-3": String(index % 3),
        "--col-4": String(index % 4),
        "--col-6": String(index % 6),
        "--col-8": String(index % 8),
      } as React.CSSProperties
    }
  >
    <span aria-hidden="true" className="tcs__scan" />
    <span aria-hidden="true" className="tcs__glow" />
    <span aria-hidden="true" className="tcs__led">
      <span />
    </span>
    <span aria-hidden="true" className="tcs__icon">
      <Icon />
    </span>
    <span className="tcs__label font-mono">{name}</span>
  </li>
);

/* ── Section ──────────────────────────────────────────────────────────────── */

export const ToolchainIntegrityScan: React.FC = () => {
  const { t } = useI18n();
  const copy = t.stack.toolchain;

  return (
    <div className="tcs">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* Head — eyebrow + verification counter */}
      <div className="flex flex-wrap items-end justify-between gap-x-5 gap-y-4 mb-7">
        <span className="flex items-center gap-2.5 font-mono text-[10px] sm:text-[11px] tracking-widest text-neutral-400">
          <span>{copy.modulesLabel}</span>
          <span className="text-neutral-100 font-semibold">
            {TOTAL_MODULES} / {TOTAL_MODULES}
          </span>
          <span className="text-emerald-400">{copy.verified}</span>
        </span>
      </div>

      {/* Matrix — the m.div carries the entrance; overflow-hidden lives on a div,
          never on the section (see the 100/100 defence protocol). */}
      <m.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ type: "tween", duration: 0.6, ease: "easeOut" }}
        className="relative rounded-3xl bg-neutral-900/50 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden will-change-transform transform-gpu"
      >
        {/* Mac bar — matches AgileCard / TerminalCard. Grid, not flex: a bare
            `flex-1 justify-center` centers the title in whatever space is
            left after the dots, not in the bar itself — the 1fr/auto/1fr
            split gives equal-width flanking columns regardless of what's
            in the third one. */}
        <div className="relative h-10 border-b border-white/[0.06] bg-white/[0.02] grid grid-cols-[1fr_minmax(0,auto)_1fr] items-center px-4 gap-3">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57] shadow-[0_0_6px_rgba(255,95,87,0.6)]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E] shadow-[0_0_6px_rgba(254,188,46,0.4)]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28C840] shadow-[0_0_6px_rgba(40,200,64,0.4)]" />
          </div>
          <div className="flex items-center justify-center gap-2 font-mono text-[10px] text-neutral-400">
            <FiTerminal className="text-neutral-500" aria-hidden="true" />
            <span>{copy.fileName}</span>
          </div>
          <span className="justify-self-end font-mono text-[10px] tracking-widest text-emerald-400">
            {copy.state}
          </span>
        </div>

        <div className="tcs__scanArea">
          {/* The one translating layer in the whole section. */}
          <div className="tcs__track" aria-hidden="true">
            <div className="tcs__sweep">
              <div className="tcs__sweepWash" />
              <div className="tcs__sweepCore" />
            </div>
          </div>

          {BANDS.map((band) => (
            <div className="tcs__band" key={band.id}>
              <div className="tcs__rail">
                <span className="font-mono text-[10px] lg:text-[11px] tracking-[0.14em] text-cyan-400">
                  {copy.bands[band.id]}
                </span>
                <span className="font-mono text-[9px] lg:text-[10px] tracking-[0.1em] text-neutral-400">
                  {pad2(band.items.length)} {copy.modulesSuffix}
                </span>
              </div>

              <ul className="tcs__cells">
                {band.items.map((module, i) => (
                  <Cell index={i} key={module.name} module={module} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </m.div>

      {/* Foot */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-5 font-mono text-[10px] tracking-widest text-neutral-400">
        <span>{copy.footScope}</span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
          {copy.footCost}
        </span>
      </div>
    </div>
  );
};
