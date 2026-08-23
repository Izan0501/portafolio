"use client";

import React, { useState } from "react";
import { m } from "motion/react";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import {
  SiReact,
  SiVite,
  SiTypescript,
  SiJavascript,
  SiNodedotjs,
  SiPython,
  SiGit,
  SiGithub,
  SiDocker,
  SiPostgresql,
  SiTailwindcss,
  SiCss,
  SiHtml5,
  SiMongodb,
  SiFirebase,
  SiExpo,
  SiDatabricks,
  SiMysql,
  SiSqlite,
} from "react-icons/si";
import { FiCheckCircle, FiTerminal, FiServer, FiMapPin } from "react-icons/fi";

// ─── Tech Stack Data ──────────────────────────────────────────────────────────

const ICONS_ROW1 = [
  { icon: SiReact,      name: "React",      color: "group-hover:text-[#61DAFB]",  glow: "rgba(97,218,251,0.5)"  },
  { icon: SiVite,       name: "Vite",       color: "group-hover:text-[#646CFF]",  glow: "rgba(100,108,255,0.5)" },
  { icon: SiTypescript, name: "TypeScript", color: "group-hover:text-[#3178C6]",  glow: "rgba(49,120,198,0.5)"  },
  { icon: SiJavascript, name: "JavaScript", color: "group-hover:text-[#F7DF1E]",  glow: "rgba(247,223,30,0.5)"  },
  { icon: SiNodedotjs,  name: "Node.js",    color: "group-hover:text-[#339933]",  glow: "rgba(51,153,51,0.5)"   },
  { icon: SiPython,     name: "Python",     color: "group-hover:text-[#3776AB]",  glow: "rgba(55,118,171,0.5)"  },
  { icon: SiDocker,     name: "Docker",     color: "group-hover:text-[#2496ED]",  glow: "rgba(36,150,237,0.5)"  },
  { icon: SiGit,        name: "Git",        color: "group-hover:text-[#F05032]",  glow: "rgba(240,80,50,0.5)"   },
  { icon: SiGithub,     name: "GitHub",     color: "group-hover:text-[#ffffff]",  glow: "rgba(255,255,255,0.3)" },
] as const;

const ICONS_ROW2 = [
  { icon: SiPostgresql,  name: "PostgreSQL",       color: "group-hover:text-[#4169E1]",  glow: "rgba(65,105,225,0.5)"  },
  { icon: SiTailwindcss, name: "Tailwind",          color: "group-hover:text-[#06B6D4]",  glow: "rgba(6,182,212,0.5)"   },
  { icon: SiCss,         name: "CSS3",              color: "group-hover:text-[#1572B6]",  glow: "rgba(21,114,182,0.5)"  },
  { icon: SiHtml5,       name: "HTML5",             color: "group-hover:text-[#E34F26]",  glow: "rgba(227,79,38,0.5)"   },
  { icon: SiMongodb,     name: "MongoDB",           color: "group-hover:text-[#47A248]",  glow: "rgba(71,162,72,0.5)"   },
  { icon: SiFirebase,    name: "Firebase",          color: "group-hover:text-[#FFCA28]",  glow: "rgba(255,202,40,0.5)"  },
  { icon: SiExpo,        name: "Expo",              color: "group-hover:text-[#e4e4e7]",  glow: "rgba(228,228,231,0.3)" },
  { icon: SiDatabricks,  name: "Pinecone / Vector", color: "group-hover:text-[#FF3621]",  glow: "rgba(255,54,33,0.5)"   },
  { icon: SiMysql,       name: "MySQL",             color: "group-hover:text-[#4479A1]",  glow: "rgba(68,121,161,0.5)"  },
  { icon: SiSqlite,      name: "SQLite",            color: "group-hover:text-[#44a8d8]",  glow: "rgba(68,168,216,0.5)"  },
] as const;

// ─── Tactile Glass Key ────────────────────────────────────────────────────────

interface IconCardProps {
  icon: React.ElementType;
  name: string;
  color: string;
  glowColor: string;
}

const IconCard = ({ icon: Icon, name, color, glowColor }: IconCardProps) => (
  <div
    className="group relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 rounded-2xl
               bg-gradient-to-b from-neutral-800/80 to-neutral-900
               border border-white/[0.06] hover:border-white/20
               shadow-[0_8px_24px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)]
               flex flex-col items-center justify-center gap-2
               transition-[border-color,box-shadow,transform] duration-300
               hover:-translate-y-1 cursor-crosshair"
    style={{ "--glow": glowColor } as React.CSSProperties}
  >
    <div
      aria-hidden="true"
      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
      style={{ boxShadow: `0 0 24px ${glowColor}` }}
    />
    <Icon className={`relative text-3xl sm:text-4xl text-neutral-400 transition-colors duration-300 ${color}`} />
    <span className="relative font-mono text-[9px] sm:text-[10px] text-neutral-500 group-hover:text-white transition-colors text-center leading-tight px-1">
      {name}
    </span>
  </div>
);

// ─── Variants ─────────────────────────────────────────────────────────────────

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { type: "tween", duration: 0.6, ease: "easeOut", delay } as const,
  }),
};

// ─── Sub-component: ArchitectCard (The Architect — bio identity) ─────────────

const FOCUS_PILLARS = ["CLEAN CODE", "SCALABLE ARCHITECTURE", "ZERO-REGRESSION"];

const ArchitectCard: React.FC = () => (
  <m.div
    variants={cardVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-80px" }}
    custom={0}
    className="lg:col-span-8 group relative rounded-3xl bg-neutral-900/50 backdrop-blur-xl border border-white/10 hover:border-cyan-500/40 transition-[border-color] duration-500 shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden p-8 sm:p-10 flex flex-col justify-between will-change-transform transform-gpu"
  >
    <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.06] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

    <div className="relative z-10">
      <div className="flex items-center gap-2 font-mono text-xs text-cyan-400 mb-4">
        <span>{"// 00. THE ARCHITECT"}</span>
      </div>

      <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
        Full-Stack Developer & DevOps Architect
      </h3>
      <div className="flex items-center gap-1.5 font-mono text-xs text-neutral-500 mb-6">
        <FiMapPin className="text-emerald-400" />
        <span>Tucumán, Argentina</span>
      </div>

      <p className="text-neutral-300 leading-relaxed font-sans text-base sm:text-lg max-w-2xl">
        I&apos;m Ivo Zanacchi. I build systems the way I&apos;d want to inherit them: clean,
        documented, and boring in the best way — infrastructure that scales without duct tape,
        and code reviews that don&apos;t need a translator. My focus is zero-regression delivery:
        every deploy should be routine, every rollback should be unnecessary, and every service
        should still make sense to read six months from now.
      </p>
    </div>

    <div className="relative z-10 mt-8 pt-6 border-t border-white/[0.06] flex flex-wrap gap-2">
      {FOCUS_PILLARS.map((pillar) => (
        <span
          key={pillar}
          className="font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-400"
        >
          {pillar}
        </span>
      ))}
    </div>
  </m.div>
);

// ─── Sub-component: AcademicCard ──────────────────────────────────────────────

const AcademicCard: React.FC = () => (
  <m.div
    variants={cardVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-80px" }}
    custom={0.15}
    className="lg:col-span-4 group relative rounded-3xl bg-neutral-900/50 backdrop-blur-xl border border-white/10 hover:border-emerald-500/40 transition-[border-color] duration-500 shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col p-8 sm:p-10 will-change-transform transform-gpu"
  >
    <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-bl from-emerald-500/[0.06] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

    <div className="relative z-10 flex-1 flex flex-col">
      <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-10 flex items-center gap-3 group-hover:text-emerald-200 transition-colors duration-300">
        <FiServer className="text-emerald-500 flex-shrink-0" />
        Academic Core
      </h3>

      <div className="relative flex-1">
        <div aria-hidden="true" className="absolute left-[5px] top-3 bottom-3 w-px bg-gradient-to-b from-emerald-500/60 via-white/10 to-transparent" />

        <div className="space-y-10 pl-8">
          <div className="relative">
            <div aria-hidden="true" className="absolute -left-8 top-1.5 flex items-center justify-center">
              <div className="absolute w-5 h-5 rounded-full bg-emerald-500/20 animate-ping" />
              <div className="relative w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_14px_rgba(52,211,153,0.9)]" />
            </div>
            <div className="flex flex-col">
              <span className="font-sans font-bold text-white text-base sm:text-lg leading-tight">
                Tecnicatura Universitaria en Ciberseguridad
              </span>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="font-mono text-xs text-neutral-500">{"// UGR"}</span>
                <span className="px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">En Curso</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div aria-hidden="true" className="absolute -left-8 top-1.5 w-3 h-3 rounded-full bg-neutral-700 border-2 border-neutral-600 shadow-[0_0_6px_rgba(255,255,255,0.1)]" />
            <div className="flex flex-col">
              <span className="font-sans font-bold text-neutral-300 text-base sm:text-lg leading-tight">
                Técnico Universitario en Programación
              </span>
              <span className="font-mono text-xs text-neutral-500 mt-2">
                {"// UTN — Facultad Regional Tucumán"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </m.div>
);

// ─── Sub-component: AgileCard (readiness, not a claimed active sprint) ───────

const AGILE_COMPETENCIES = ["Sprint Planning", "Daily Standups", "Backlog Grooming", "Retrospectives", "Async Communication"];

const AgileCard: React.FC = () => (
  <m.div
    variants={cardVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-80px" }}
    custom={0}
    className="lg:col-span-5 group relative rounded-3xl bg-neutral-900/50 backdrop-blur-xl border border-white/10 hover:border-cyan-500/40 transition-[border-color] duration-500 shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col will-change-transform transform-gpu"
  >
    <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.06] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

    <div className="relative z-10 h-10 border-b border-white/[0.06] bg-white/[0.02] flex items-center px-4 gap-3 flex-shrink-0">
      <div className="flex items-center gap-1.5" aria-hidden="true">
        <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57] shadow-[0_0_6px_rgba(255,95,87,0.6)]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E] shadow-[0_0_6px_rgba(254,188,46,0.4)]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#28C840] shadow-[0_0_6px_rgba(40,200,64,0.4)]" />
      </div>
      <div className="flex-1 flex items-center justify-center gap-2 font-mono text-[10px] text-neutral-500">
        <FiTerminal className="text-neutral-600" />
        <span>agile_readiness.sh</span>
      </div>
    </div>

    <div className="relative z-10 p-8 sm:p-10 flex-1 flex flex-col justify-between">
      <div>
        <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4 group-hover:text-cyan-200 transition-colors duration-300">
          Agile & Scrum Readiness
        </h3>
        <p className="text-neutral-400 leading-relaxed font-sans text-base sm:text-lg">
          I&apos;ve built a deep, deliberate foundation in{" "}
          <strong className="text-cyan-400 font-semibold">SCRUM and Agile frameworks</strong> —
          not just the ceremonies, but the discipline behind them. I&apos;m ready to drop into a
          fast-paced team&apos;s existing workflow from day one: clear communication, rapid
          unblocking, and sprint commitments that get kept.
        </p>
      </div>

      <div className="mt-8 pt-6 border-t border-white/[0.06]">
        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
          Core Competencies
        </span>
        <div className="flex flex-wrap gap-2 mt-3">
          {AGILE_COMPETENCIES.map((competency) => (
            <span
              key={competency}
              className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-300"
            >
              {competency}
            </span>
          ))}
        </div>
      </div>
    </div>
  </m.div>
);

// ─── Sub-component: TerminalCard (interactive contact CLI, ported in) ────────

const CONTACT_EMAIL = "ivozanacchi@example.com"; // TODO: swap for the real inbox when ready
const GITHUB_URL = "https://github.com/ivozanacchi";
const LINKEDIN_URL = "https://linkedin.com/in/ivozanacchi";

interface CommandOutput {
  id: string;
  cmd: string;
  output: string | React.ReactNode;
}

const TERMINAL_QUICK_CMDS = ["help", "stack", "contact", "github", "resume", "clear"];

const TerminalCard: React.FC = () => {
  const [inputVal, setInputVal] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<CommandOutput[]>([
    { id: "init-0", cmd: "init --system", output: "System initialized. Type 'help' or click a command chip below." },
  ]);

  const handleCommand = (cmdToRun: string) => {
    const cleanCmd = cmdToRun.trim().toLowerCase();
    let response: React.ReactNode = "";

    switch (cleanCmd) {
      case "help":
        response = "Available commands: [stack] [experience] [contact] [github] [resume] [clear] [hire]";
        break;
      case "stack":
        response = "Backend: Python (FastAPI), Node.js, TypeScript. DevOps: Docker, Kubernetes, CI/CD, AWS. DBs: MongoDB, PostgreSQL, Pinecone RAG.";
        break;
      case "experience":
        response = "Full-Stack Software Engineer & DevOps specializing in zero-downtime architectures, multi-tenant SaaS platforms, and network protocol audits.";
        break;
      case "contact":
        response = (
          <span>
            Email: <a className="text-cyan-400 underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>{" "}
            {"//"} LinkedIn: <a className="text-cyan-400 underline" href={LINKEDIN_URL} rel="noopener noreferrer" target="_blank">linkedin.com/in/ivozanacchi</a>
          </span>
        );
        break;
      case "github":
        response = (
          <span>
            Source archive: <a className="text-cyan-400 underline" href={GITHUB_URL} rel="noopener noreferrer" target="_blank">github.com/ivozanacchi</a>
          </span>
        );
        break;
      case "resume":
      case "cv":
        response = "Resume artifact not uploaded to this build yet — use 'contact' to request one directly.";
        break;
      case "hire":
      case "sudo hire":
        response = `ACCESS GRANTED. High-priority recruitment routing activated — send a transmission to ${CONTACT_EMAIL} to initiate contract discussions.`;
        break;
      case "clear":
        setHistory([]);
        setInputVal("");
        return;
      default:
        response = `Command not recognized: '${cleanCmd}'. Type 'help' for available directives.`;
    }

    setHistory((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, cmd: cmdToRun, output: response }]);
    setInputVal("");
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal) return;
    handleCommand(inputVal);
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable in this context — button simply won't confirm.
    }
  };

  return (
    <m.div
      id="terminal-card"
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      custom={0.15}
      className="col-span-1 lg:col-span-7 scroll-mt-28 group relative rounded-3xl bg-neutral-900/50 backdrop-blur-xl border border-white/10 hover:border-emerald-500/40 transition-[border-color] duration-500 shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col min-h-[450px] lg:h-full will-change-transform transform-gpu"
    >
      {/* Mac Bar */}
      <div className="relative z-10 h-10 border-b border-white/[0.06] bg-white/[0.02] flex items-center px-4 gap-3 flex-shrink-0">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57] shadow-[0_0_6px_rgba(255,95,87,0.6)]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E] shadow-[0_0_6px_rgba(254,188,46,0.4)]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28C840] shadow-[0_0_6px_rgba(40,200,64,0.4)]" />
        </div>
        <div className="flex-1 flex items-center justify-center gap-2 font-mono text-[10px] text-neutral-500">
          <FiTerminal className="text-neutral-600" />
          <span className="hidden sm:inline">ivo_contact.sh</span>
        </div>
        <button
          className="font-mono text-[10px] px-2 py-1 rounded bg-white/5 hover:bg-cyan-500/20 border border-white/10 text-neutral-400 hover:text-cyan-300 transition-colors cursor-pointer"
          onClick={handleCopyEmail}
          type="button"
        >
          {copied ? "COPIED ✓" : "COPY EMAIL"}
        </button>
      </div>

      {/* Output Display — flex-1 consumes all leftover height so the chips/input never float mid-card */}
      <div className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 font-mono text-sm text-neutral-300 select-text">
        {history.map((item) => (
          <div key={item.id} className="leading-relaxed">
            <div className="text-cyan-400 flex items-center gap-2">
              <span className="text-emerald-400">$</span>
              <span>{item.cmd}</span>
            </div>
            <div className="text-neutral-300 pl-4 pt-1 border-l-2 border-white/10 mt-1">
              {item.output}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Chip Executables */}
      <div className="relative z-10 flex flex-wrap items-center gap-2 px-4 sm:px-6 pb-2">
        {TERMINAL_QUICK_CMDS.map((cmd) => (
          <button
            key={cmd}
            className="px-3 py-1 rounded bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-300 border border-white/10 text-neutral-300 transition-colors text-xs cursor-pointer"
            onClick={() => handleCommand(cmd)}
            type="button"
          >
            [{cmd}]
          </button>
        ))}
      </div>

      {/* Input Bar — mt-auto anchors it at the true bottom of the flex column */}
      <form className="relative z-10 mt-auto bg-neutral-900/50 border-t border-white/10 p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4" onSubmit={onSubmit}>
        <div className="flex items-center gap-3 w-full">
          <span className="text-emerald-400 font-bold font-mono text-xs sm:text-sm shrink-0">$</span>
          <input
            className="flex-1 w-full bg-transparent border-none focus:ring-0 text-white font-mono text-sm placeholder:text-neutral-600"
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Type a command..."
            type="text"
            value={inputVal}
          />
        </div>
        <button className="w-full sm:w-auto shrink-0 bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 rounded-md font-bold transition-colors cursor-pointer" type="submit">
          RUN ↵
        </button>
      </form>
    </m.div>
  );
};

// ─── Sub-component: ToolchainMarquee ─────────────────────────────────────────

const ToolchainMarquee: React.FC = () => (
  <div className="relative">
    <div className="flex items-center justify-center gap-2 font-mono text-[10px] sm:text-xs text-neutral-500 mb-10 uppercase tracking-widest">
      <FiCheckCircle className="text-cyan-500 flex-shrink-0" />
      Verified Integration Toolchain
    </div>

    <div className="overflow-hidden">
      <div className="flex gap-4 sm:gap-5 animate-scroll-left" style={{ width: "max-content" }}>
        {([...ICONS_ROW1, ...ICONS_ROW1] as typeof ICONS_ROW1[number][]).map((item, i) => (
          <IconCard key={`r1-${item.name}-copy${i < ICONS_ROW1.length ? 0 : 1}`} icon={item.icon} name={item.name} color={item.color} glowColor={item.glow} />
        ))}
      </div>
      <div className="flex gap-4 sm:gap-5 mt-4 sm:mt-5 animate-scroll-right" style={{ width: "max-content" }}>
        {([...ICONS_ROW2, ...ICONS_ROW2] as typeof ICONS_ROW2[number][]).map((item, i) => (
          <IconCard key={`r2-${item.name}-copy${i < ICONS_ROW2.length ? 0 : 1}`} icon={item.icon} name={item.name} color={item.color} glowColor={item.glow} />
        ))}
      </div>
    </div>

    <div aria-hidden="true" className="absolute left-0 top-0 h-full w-24 sm:w-48 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-transparent pointer-events-none z-10" />
    <div aria-hidden="true" className="absolute right-0 top-0 h-full w-24 sm:w-48 bg-gradient-to-l from-neutral-950 via-neutral-950/80 to-transparent pointer-events-none z-10" />
  </div>
);

// ─── Root Component ───────────────────────────────────────────────────────────

export const TechStackBento: React.FC = () => (
  <section
    id="stack"
    className="relative w-full bg-neutral-950 py-32 border-t border-white/10"
  >
    <style
      dangerouslySetInnerHTML={{
        __html: `
          @keyframes marquee-left {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes marquee-right {
            0%   { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }
          .animate-scroll-left {
            animation: marquee-left 45s linear infinite;
            will-change: transform;
          }
          .animate-scroll-right {
            animation: marquee-right 45s linear infinite;
            will-change: transform;
          }
          .animate-scroll-left:hover,
          .animate-scroll-right:hover {
            animation-play-state: paused;
          }
        `,
      }}
    />

    <div aria-hidden="true" className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/25 to-transparent pointer-events-none" />
    <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(34,211,238,0.05),transparent)] pointer-events-none" />
    <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

    <div className="relative max-w-7xl mx-auto px-6 z-10">
      <div className="text-center mb-20 flex flex-col items-center justify-center w-full">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900/80 backdrop-blur-md border border-white/10 text-cyan-400 font-mono text-xs mb-6 shadow-[0_0_20px_rgba(34,211,238,0.08)]">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,1)]" />
          <span>{"// 01. ENGINEER IDENTITY & TOOLCHAIN"}</span>
        </div>
        <h2 className="text-4xl sm:text-5xl md:text-7xl font-black font-sans tracking-tight text-white uppercase !leading-[1.05] drop-shadow-xl mb-6 flex justify-center w-full text-center select-none">
          <VerticalCutReveal containerClassName="justify-center text-center w-full flex-wrap" splitBy="words" staggerDuration={0.04} staggerFrom="first">
            {"Architecture & Execution"}
          </VerticalCutReveal>
        </h2>
        <p className="text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto font-sans leading-relaxed text-center">
          A relentless focus on resilient systems, continuous integration,
          and deep collaboration within industry-standard Agile frameworks.
        </p>
      </div>

      {/* Row 1: Bio & Academic */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        <ArchitectCard />
        <AcademicCard />
      </div>

      {/* Row 2: Methodology & Terminal Contact */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-24">
        <AgileCard />
        <TerminalCard />
      </div>

      {/* Row 3: Marquee */}
      <ToolchainMarquee />
    </div>
  </section>
);
