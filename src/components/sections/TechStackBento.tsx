"use client";

import React, { useState } from "react";
import { m } from "motion/react";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { FiTerminal, FiServer, FiMapPin } from "react-icons/fi";
import { ToolchainIntegrityScan } from "@/components/sections/ToolchainIntegrityScan";
import { CertificationWindows } from "@/components/sections/CertificationWindows";
import { useI18n } from "@/i18n/LanguageProvider";

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

const ArchitectCard: React.FC = () => {
  const { t } = useI18n();

  return (
  <m.div
    variants={cardVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-80px" }}
    custom={0}
    className="lg:col-span-8 group relative isolate rounded-3xl bg-neutral-900/50 backdrop-blur-md border border-white/10 hover:border-cyan-500/40 transition-[border-color] duration-500 shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden p-8 sm:p-10 flex flex-col justify-between will-change-transform transform-gpu"
  >
    <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.06] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

    <div className="relative z-10">
      <div className="flex items-center gap-2 font-mono text-xs text-cyan-400 mb-4">
        <span>{t.stack.architect.eyebrow}</span>
      </div>

      <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
        {t.stack.architect.title}
      </h3>
      <div className="flex items-center gap-1.5 font-mono text-xs text-neutral-500 mb-6">
        <FiMapPin className="text-emerald-400" />
        <span>{t.stack.architect.location}</span>
      </div>

      <p className="text-neutral-300 leading-relaxed font-sans text-base sm:text-lg max-w-2xl">
        {t.stack.architect.bio}
      </p>
    </div>

    <div className="relative z-10 mt-8 pt-6 border-t border-white/[0.06] flex flex-wrap gap-2">
      {t.stack.architect.pillars.map((pillar) => (
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
};

// ─── Sub-component: AcademicCard ──────────────────────────────────────────────

const AcademicCard: React.FC = () => {
  const { t } = useI18n();

  return (
  <m.div
    variants={cardVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-80px" }}
    custom={0.15}
    className="lg:col-span-4 group relative isolate rounded-3xl bg-neutral-900/50 backdrop-blur-md border border-white/10 hover:border-emerald-500/40 transition-[border-color] duration-500 shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col p-8 sm:p-10 will-change-transform transform-gpu"
  >
    <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-bl from-emerald-500/[0.06] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

    <div className="relative z-10 flex-1 flex flex-col">
      <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-10 flex items-center gap-3 group-hover:text-emerald-200 transition-colors duration-300">
        <FiServer className="text-emerald-500 flex-shrink-0" />
        {t.stack.academic.title}
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
                {t.stack.academic.degrees.cybersecurity.name}
              </span>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="font-mono text-xs text-neutral-500">{t.stack.academic.degrees.cybersecurity.institution}</span>
                <span className="font-mono text-xs text-neutral-600">·</span>
                <span className="font-mono text-xs text-emerald-400/80">{t.stack.academic.degrees.cybersecurity.period}</span>
                <span className="px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">{t.stack.academic.inProgress}</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div aria-hidden="true" className="absolute -left-8 top-1.5 w-3 h-3 rounded-full bg-neutral-700 border-2 border-neutral-600 shadow-[0_0_6px_rgba(255,255,255,0.1)]" />
            <div className="flex flex-col">
              <span className="font-sans font-bold text-neutral-300 text-base sm:text-lg leading-tight">
                {t.stack.academic.degrees.programming.name}
              </span>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="font-mono text-xs text-neutral-500">{t.stack.academic.degrees.programming.institution}</span>
                <span className="font-mono text-xs text-neutral-600">·</span>
                <span className="font-mono text-xs text-neutral-500">{t.stack.academic.degrees.programming.period}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </m.div>
  );
};

// ─── Sub-component: AgileCard (readiness, not a claimed active sprint) ───────

const AgileCard: React.FC = () => {
  const { t } = useI18n();

  return (
  <m.div
    variants={cardVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-80px" }}
    custom={0}
    className="lg:col-span-5 group relative isolate rounded-3xl bg-neutral-900/50 backdrop-blur-md border border-white/10 hover:border-cyan-500/40 transition-[border-color] duration-500 shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col will-change-transform transform-gpu"
  >
    <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.06] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

    {/* Grid, not flex: a bare `flex-1 justify-center` centers the title in
        whatever space is left after the dots, not in the bar itself. */}
    <div className="relative z-10 h-10 border-b border-white/[0.06] bg-white/[0.02] grid grid-cols-[1fr_minmax(0,auto)_1fr] items-center px-4 gap-3 flex-shrink-0">
      <div className="flex items-center gap-1.5" aria-hidden="true">
        <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57] shadow-[0_0_6px_rgba(255,95,87,0.6)]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E] shadow-[0_0_6px_rgba(254,188,46,0.4)]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#28C840] shadow-[0_0_6px_rgba(40,200,64,0.4)]" />
      </div>
      <div className="flex items-center justify-center gap-2 font-mono text-[10px] text-neutral-500">
        <FiTerminal className="text-neutral-600" />
        <span>{t.stack.agile.fileName}</span>
      </div>
    </div>

    <div className="relative z-10 p-8 sm:p-10 flex-1 flex flex-col justify-between">
      <div>
        <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4 group-hover:text-cyan-200 transition-colors duration-300">
          {t.stack.agile.title}
        </h3>
        {/* Split into three parts rather than one string with markup, so the
            emphasised clause can sit anywhere a language needs it. */}
        <p className="text-neutral-400 leading-relaxed font-sans text-base sm:text-lg">
          {t.stack.agile.bodyBefore}
          <strong className="text-cyan-400 font-semibold">{t.stack.agile.bodyStrong}</strong>
          {t.stack.agile.bodyAfter}
        </p>
      </div>

      <div className="mt-8 pt-6 border-t border-white/[0.06]">
        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
          {t.stack.agile.competenciesLabel}
        </span>
        <div className="flex flex-wrap gap-2 mt-3">
          {t.stack.agile.competencies.map((competency) => (
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
};

// ─── Sub-component: TerminalCard (interactive contact CLI, ported in) ────────

const CONTACT_EMAIL = "ivozanacchi@example.com"; // TODO: swap for the real inbox when ready
const GITHUB_URL = "https://github.com/ivozanacchi";
const LINKEDIN_URL = "https://linkedin.com/in/ivozanacchi";

interface CommandOutput {
  id: string;
  cmd: string;
  output: string | React.ReactNode;
}

// Command tokens are identifiers, not copy: they are matched by the switch below
// and typed by the user, so they stay English in every locale. Their OUTPUT is
// fully translated.
const TERMINAL_QUICK_CMDS = ["help", "stack", "contact", "github", "resume", "clear"];

const TerminalCard: React.FC = () => {
  const { t } = useI18n();
  const [inputVal, setInputVal] = useState("");
  const [copied, setCopied] = useState(false);
  // The seeded line's output is resolved at render time from the active
  // dictionary (see renderOutput) rather than frozen into state, so it follows a
  // language switch. Lines the user actually ran keep the wording they were
  // produced in — a terminal log is a record of what happened, not live copy.
  const [history, setHistory] = useState<CommandOutput[]>([
    { id: "init-0", cmd: "init --system", output: null },
  ]);

  const renderOutput = (item: CommandOutput) =>
    item.id === "init-0" ? t.stack.terminal.initOutput : item.output;

  const handleCommand = (cmdToRun: string) => {
    const cleanCmd = cmdToRun.trim().toLowerCase();
    let response: React.ReactNode = "";

    switch (cleanCmd) {
      case "help":
        response = t.stack.terminal.help;
        break;
      case "stack":
        response = t.stack.terminal.techStack;
        break;
      case "experience":
        response = t.stack.terminal.experience;
        break;
      case "contact":
        response = (
          <span>
            {t.stack.terminal.emailLabel} <a className="text-cyan-400 underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>{" "}
            {"//"} {t.stack.terminal.linkedinLabel} <a className="text-cyan-400 underline" href={LINKEDIN_URL} rel="noopener noreferrer" target="_blank">linkedin.com/in/ivozanacchi</a>
          </span>
        );
        break;
      case "github":
        response = (
          <span>
            {t.stack.terminal.githubLabel} <a className="text-cyan-400 underline" href={GITHUB_URL} rel="noopener noreferrer" target="_blank">github.com/ivozanacchi</a>
          </span>
        );
        break;
      case "resume":
      case "cv":
        response = (
          <span>
            {t.stack.terminal.resume}{" "}
            <a className="text-cyan-400 underline" download="Ivo_Zanacchi_CV.pdf" href="/cv/Ivo_Zanacchi_CV.pdf">
              Ivo_Zanacchi_CV.pdf
            </a>
          </span>
        );
        break;
      case "hire":
      case "sudo hire":
        response = t.stack.terminal.hire(CONTACT_EMAIL);
        break;
      case "clear":
        setHistory([]);
        setInputVal("");
        return;
      default:
        response = t.stack.terminal.notRecognized(cleanCmd);
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
      className="col-span-1 lg:col-span-7 scroll-mt-28 group relative isolate rounded-3xl bg-neutral-900/50 backdrop-blur-md border border-white/10 hover:border-emerald-500/40 transition-[border-color] duration-500 shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col min-h-[450px] lg:h-full will-change-transform transform-gpu"
    >
      {/* Mac Bar — grid, not flex: a bare `flex-1 justify-center` centers the
          title in whatever space is left after the dots, not in the bar
          itself. The 1fr/auto/1fr split keeps it centered regardless of the
          copy button's width on the right. */}
      <div className="relative z-10 h-10 border-b border-white/[0.06] bg-white/[0.02] grid grid-cols-[1fr_minmax(0,auto)_1fr] items-center px-4 gap-3 flex-shrink-0">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57] shadow-[0_0_6px_rgba(255,95,87,0.6)]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E] shadow-[0_0_6px_rgba(254,188,46,0.4)]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28C840] shadow-[0_0_6px_rgba(40,200,64,0.4)]" />
        </div>
        <div className="flex items-center justify-center gap-2 font-mono text-[10px] text-neutral-500">
          <FiTerminal className="text-neutral-600" />
          <span className="hidden sm:inline">{t.stack.terminal.fileName}</span>
        </div>
        <button
          className="justify-self-end font-mono text-[10px] px-2 py-1 rounded bg-white/5 hover:bg-cyan-500/20 border border-white/10 text-neutral-400 hover:text-cyan-300 transition-colors cursor-pointer"
          onClick={handleCopyEmail}
          type="button"
        >
          {copied ? t.stack.terminal.copied : t.stack.terminal.copyEmail}
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
              {renderOutput(item)}
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
            placeholder={t.stack.terminal.placeholder}
            type="text"
            value={inputVal}
          />
        </div>
        <button className="w-full sm:w-auto shrink-0 bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 rounded-md font-bold transition-colors cursor-pointer" type="submit">
          {t.stack.terminal.run}
        </button>
      </form>
    </m.div>
  );
};

// ─── Root Component ───────────────────────────────────────────────────────────

export const TechStackBento: React.FC = () => {
  const { t } = useI18n();

  return (
  <section
    id="stack"
    className="relative w-full bg-neutral-950 py-32 border-t border-white/10"
  >
    <div aria-hidden="true" className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/25 to-transparent pointer-events-none" />
    <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(34,211,238,0.05),transparent)] pointer-events-none" />
    <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

    <div className="relative max-w-7xl mx-auto px-6 z-10">
      <div className="text-center mb-20 flex flex-col items-center justify-center w-full">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900/80 backdrop-blur-md border border-white/10 text-cyan-400 font-mono text-xs mb-6 shadow-[0_0_20px_rgba(34,211,238,0.08)]">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,1)]" />
          <span>{t.stack.eyebrow}</span>
        </div>
        <h2 className="text-4xl sm:text-5xl md:text-7xl font-black font-sans tracking-tight text-white uppercase !leading-[1.05] drop-shadow-xl mb-6 flex justify-center w-full text-center select-none">
          <VerticalCutReveal containerClassName="justify-center text-center w-full flex-wrap" splitBy="words" staggerDuration={0.04} staggerFrom="first">
            {t.stack.heading}
          </VerticalCutReveal>
        </h2>
        <p className="text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto font-sans leading-relaxed text-center">
          {t.stack.subheading}
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

      {/* Row 3: Toolchain integrity scan */}
      <div className="mb-24">
        <ToolchainIntegrityScan />
      </div>

      {/* Row 4: Certifications */}
      <CertificationWindows />
    </div>
  </section>
  );
};
