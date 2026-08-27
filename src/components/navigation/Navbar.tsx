"use client";

import React, { useState } from "react";
import { m, AnimatePresence, useScroll, useMotionValueEvent } from "motion/react";
import { useLenis } from "lenis/react";
import { cn } from "@/lib/utils";
import { FiChevronDown, FiLayers, FiActivity, FiTerminal, FiDatabase, FiCpu, FiServer } from "react-icons/fi";
import { useI18n } from "@/i18n/LanguageProvider";
import { LanguageToggle } from "@/components/navigation/LanguageToggle";

interface NavItem {
  label: string;
  id: string;
  badge?: string;
  icon?: React.ReactNode;
  description?: string;
}

interface DropdownLinkItemProps {
  item: NavItem;
  onNavigate: (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => void;
}

const DropdownLinkItem: React.FC<DropdownLinkItemProps> = ({ item, onNavigate }) => (
  <a
    href={`#${item.id}`}
    onClick={(e) => onNavigate(e, item.id)}
    className="group/item flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-all duration-200 cursor-pointer border border-transparent hover:border-white/10"
  >
    <div className="p-2 rounded-lg bg-neutral-900 border border-white/10 group-hover/item:scale-110 group-hover/item:border-cyan-500/40 transition-all shrink-0 mt-0.5">
      {item.icon}
    </div>
    <div className="flex flex-col">
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-xs font-bold text-neutral-200 group-hover/item:text-cyan-300 transition-colors">
          {item.label}
        </span>
        {item.badge && (
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
            {item.badge}
          </span>
        )}
      </div>
      {item.description && (
        <span className="font-sans text-[11px] text-neutral-400 line-clamp-1 mt-0.5 group-hover/item:text-neutral-300 transition-colors">
          {item.description}
        </span>
      )}
    </div>
  </a>
);

export const Navbar: React.FC = () => {
  const lenis = useLenis();
  const { t } = useI18n();

  // Built from the active dictionary rather than module scope, so the labels
  // re-render on a locale switch. Section ids stay locale-invariant — they are
  // anchor targets, not copy.
  const primaryNavItems: NavItem[] = [
    { label: t.nav.items.stack.label, id: "stack", icon: <FiCpu className="text-cyan-400"/>, description: t.nav.items.stack.description },
    { label: t.nav.items.systems.label, id: "systems", badge: t.nav.items.systems.badge, icon: <FiServer className="text-emerald-400"/>, description: t.nav.items.systems.description },
  ];

  const dropdownNavItems: NavItem[] = [
    { label: t.nav.items.pipeline.label, id: "pipeline", icon: <FiDatabase className="text-cyan-400"/>, description: t.nav.items.pipeline.description },
    { label: t.nav.items.topology.label, id: "topology", icon: <FiLayers className="text-emerald-400"/>, description: t.nav.items.topology.description },
    { label: t.nav.items.telemetry.label, id: "telemetry", icon: <FiActivity className="text-purple-400"/>, description: t.nav.items.telemetry.description },
    { label: t.nav.items.terminal.label, id: "terminal-card", icon: <FiTerminal className="text-cyan-300"/>, badge: t.nav.items.terminal.badge, description: t.nav.items.terminal.description },
  ];

  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const [isHovered, setIsHovered] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Apple-grade zero-thrashing scroll direction detection
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > 120 && latest > previous) {
      setHidden(true);
      setIsDropdownOpen(false); // Close dropdown when hiding navbar
    } else if (latest < previous || latest <= 120) {
      setHidden(false);
    }
  });

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setActiveSection(targetId);
    setIsDropdownOpen(false);

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
    <>
      <m.header
        variants={{
          visible: { y: 0, scale: 1, opacity: 1 },
          hidden: { y: -100, scale: 0.92, opacity: 0 },
        }}
        initial="visible"
        animate={hidden ? "hidden" : "visible"}
        transition={{
          type: "spring",
          stiffness: 380,
          damping: 32,
          mass: 0.8,
        }}
        className="fixed top-6 inset-x-0 mx-auto z-50 flex justify-center px-3 min-[740px]:px-4 pointer-events-none select-none w-fit"
      >
        {/* MAIN COMPACT DYNAMIC ISLAND CONTAINER */}
        <nav
          onMouseLeave={() => setIsDropdownOpen(false)}
          className="relative pointer-events-auto flex items-center gap-1.5 p-1 min-[740px]:p-1.5 rounded-full bg-neutral-950/80 backdrop-blur-2xl will-change-transform transform-gpu shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-visible group"
        >
          {/* LAYER 1: MAIN ISLAND LIQUID GLASS REFRACTIVE SHELL */}
          <div className="absolute inset-0 z-0 rounded-full pointer-events-none transition-all duration-500 shadow-[0_0_8px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3.5px_rgba(255,255,255,0.15),inset_-3px_-3px_0.5px_-3.5px_rgba(255,255,255,0.85),inset_1px_1px_1px_-0.5px_rgba(255,255,255,0.6),inset_-1px_-1px_1px_-0.5px_rgba(255,255,255,0.6),inset_0_0_6px_6px_rgba(255,255,255,0.12),inset_0_0_2px_2px_rgba(255,255,255,0.06),0_0_15px_rgba(34,211,238,0.15)] group-hover:shadow-[0_0_8px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3.5px_rgba(255,255,255,0.2),inset_-3px_-3px_0.5px_-3.5px_rgba(255,255,255,0.9),inset_1px_1px_1px_-0.5px_rgba(255,255,255,0.7),inset_-1px_-1px_1px_-0.5px_rgba(255,255,255,0.7),inset_0_0_6px_6px_rgba(255,255,255,0.15),inset_0_0_2px_2px_rgba(255,255,255,0.08),0_0_25px_rgba(34,211,238,0.3)]" />
          
          {/* LAYER 2: COMPACT KINETIC UI CONTENT */}
          <div className="relative z-10 flex items-center gap-1 min-[740px]:gap-1.5 w-full">
            
            {/* Brand Core LED Indicator */}
            <a
              href="#hero"
              onClick={(e) => handleSmoothScroll(e, "hero")}
              className="flex items-center gap-2 min-[740px]:gap-2.5 pl-3 pr-2.5 min-[740px]:pl-4 min-[740px]:pr-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer"
            >
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,1)]" />
              </div>
              <span className="font-mono font-bold text-xs tracking-tight text-white transition-colors">
                IVO.DEV
              </span>
            </a>

            <div className="h-4 w-[1px] bg-white/15 mx-1 hidden min-[740px]:block" />

            {/* Top-Level Primary Nav Links */}
            <div className="hidden min-[740px]:flex items-center gap-1">
              {primaryNavItems.map((item) => {
                const isActive = activeSection === item.id;
                const isCurrentHover = isHovered === item.id;

                return (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(e) => handleSmoothScroll(e, item.id)}
                    onMouseEnter={() => setIsHovered(item.id)}
                    onMouseLeave={() => setIsHovered(null)}
                    className="relative px-3.5 py-1.5 rounded-full font-mono text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <AnimatePresence>
                      {(isActive || isCurrentHover) && (
                        <m.div
                          layoutId="activeNavPill"
                          transition={{ type: "spring", stiffness: 450, damping: 35 }}
                          className={cn(
                            "absolute inset-0 rounded-full -z-10 overflow-hidden shadow-inner",
                            isActive
                              ? "bg-gradient-to-r from-cyan-950/90 via-neutral-900 to-emerald-950/90 border border-cyan-500/40 shadow-[0_0_15px_rgba(34,211,238,0.25)]"
                              : "bg-white/10 border border-white/10"
                          )}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/10 pointer-events-none" />
                        </m.div>
                      )}
                    </AnimatePresence>

                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold shadow-[0_0_8px_rgba(34,211,238,0.2)]">
                        {item.badge}
                      </span>
                    )}
                  </a>
                );
              })}
            </div>

            {/* DROPDOWN TRIGGER PILL (Architecture & Deep Dive) */}
            <div className="relative">
              <button
                aria-label={t.nav.architectureAria}
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                onMouseEnter={() => setIsDropdownOpen(true)}
                className={cn(
                  "relative px-2 min-[740px]:px-3.5 py-1.5 rounded-full font-mono text-xs transition-all duration-300 cursor-pointer flex items-center gap-1.5 border",
                  isDropdownOpen
                    ? "bg-white/15 text-white border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                    : "text-neutral-400 hover:text-white bg-transparent border-transparent hover:bg-white/5 hover:border-white/10"
                )}
              >
                <span className="hidden min-[740px]:inline">{t.nav.architectureLabel}</span>
                <FiChevronDown className={cn("transition-transform duration-300 text-cyan-400", isDropdownOpen ? "rotate-180" : "")} />
              </button>

              {/* APPLE-STYLE LIQUID GLASS FLOATING DROPDOWN MENU */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <m.div
                    initial={{ opacity: 0, y: -10, scale: 0.94, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -10, scale: 0.94, filter: "blur(6px)" }}
                    transition={{ type: "spring", stiffness: 420, damping: 28, mass: 0.7 }}
                    className="absolute top-full mt-3 left-1/2 -translate-x-1/2 min-[740px]:left-auto min-[740px]:right-0 min-[740px]:translate-x-0 w-[min(85vw,16rem)] min-[740px]:w-72 p-2 rounded-2xl bg-neutral-950/85 backdrop-blur-2xl border border-white/15 shadow-[0_30px_70px_rgba(0,0,0,0.95)] overflow-hidden z-50 will-change-transform transform-gpu"
                  >
                    {/* DROPDOWN LAYER 1: LIQUID GLASS REFRACTIVE SHELL */}
                    <div className="absolute inset-0 z-0 rounded-2xl pointer-events-none shadow-[0_0_8px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3.5px_rgba(255,255,255,0.15),inset_-3px_-3px_0.5px_-3.5px_rgba(255,255,255,0.85),inset_1px_1px_1px_-0.5px_rgba(255,255,255,0.6),inset_-1px_-1px_1px_-0.5px_rgba(255,255,255,0.6),inset_0_0_6px_6px_rgba(255,255,255,0.12),inset_0_0_2px_2px_rgba(255,255,255,0.06),0_0_15px_rgba(34,211,238,0.15)]" />
                    
                    {/* DROPDOWN LAYER 2: KINETIC LINKS */}
                    <div className="relative z-10 flex flex-col gap-1">
                      {/* Below 740px the primary pills (Stack, Systems) are hidden from the
                          main island with nowhere else to go — surface them here too, only
                          on mobile, so they're never actually unreachable. */}
                      <div className="min-[740px]:hidden flex flex-col gap-1 pb-1 mb-1 border-b border-white/10">
                        {primaryNavItems.map((item) => (
                          <DropdownLinkItem key={item.id} item={item} onNavigate={handleSmoothScroll} />
                        ))}
                      </div>

                      <div className="px-3 py-1.5 font-mono text-[10px] text-neutral-500 uppercase tracking-widest border-b border-white/10 mb-1">
                        {t.nav.dropdownHeader}
                      </div>

                      {dropdownNavItems.map((item) => (
                        <DropdownLinkItem key={item.id} item={item} onNavigate={handleSmoothScroll} />
                      ))}
                    </div>
                  </m.div>
                )}
              </AnimatePresence>
            </div>

            {/* Language switch — sits in the middle cluster, matching the
                dropdown trigger's geometry. Closing the architecture dropdown on
                hover keeps the two panels from ever overlapping, since the pill's
                own onMouseLeave only fires when the pointer leaves the whole nav. */}
            <LanguageToggle onMouseEnter={() => setIsDropdownOpen(false)} />

            <div className="h-4 w-[1px] bg-white/15 mx-1 hidden min-[740px]:block" />

            {/* Right Liquid-Metal Executive Action Chip */}
            <a
              href="#terminal-card"
              onClick={(e) => handleSmoothScroll(e, "terminal-card")}
              className="relative group/btn px-3 min-[740px]:px-5 py-2 rounded-full bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-neutral-950 font-sans font-extrabold text-xs tracking-tight transition-all duration-300 shadow-[0_0_20px_rgba(34,211,238,0.5),inset_0_1px_1px_rgba(255,255,255,0.8)] hover:shadow-[0_0_30px_rgba(34,211,238,0.9),inset_0_1px_2px_rgba(255,255,255,1)] hover:scale-105 cursor-pointer flex items-center gap-1.5 overflow-hidden shrink-0"
            >
              <div className="absolute top-0 inset-x-0 h-[1px] bg-white opacity-80 group-hover/btn:opacity-100 transition-opacity" />
              <span className="relative z-10">
                <span className="hidden min-[740px]:inline">{t.nav.ctaPrefix}</span>{t.nav.ctaCore}
              </span>
            </a>

          </div>
        </nav>
      </m.header>
    </>
  );
};
