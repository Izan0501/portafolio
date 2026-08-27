"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { m, AnimatePresence } from "motion/react";
import { useLenis } from "lenis/react";
import { SiJavascript, SiPython } from "react-icons/si";
import { FiAward, FiLayers, FiMaximize2, FiShield, FiSmartphone } from "react-icons/fi";
import { useI18n } from "@/i18n/LanguageProvider";

/**
 * A row of macOS-style windows displaying real certification documents,
 * matching the exact window chrome already used elsewhere on the site
 * (ProjectDetail's gallery frames, AgileCard/TerminalCard's mac bars):
 * traffic lights, rounded-2xl frame, bg-neutral-900/60 + backdrop-blur-xl.
 *
 * Artwork is `object-contain`, not `object-cover`: these are documents where
 * every element (issuer, signatures, dates) matters, so nothing is ever
 * cropped — unlike a photographic hero image, a clipped certificate reads as
 * broken. Brand icons (JS, Python) reuse their own hue from the toolchain
 * data; the other two accents reuse hues already present elsewhere in the
 * app (teal from the navbar CTA, purple from the footer badge).
 *
 * Clicking a window opens it larger in a lightbox, ported to document.body:
 * every card is itself a `will-change-transform` m.div, which establishes a
 * containing block for `position: fixed` descendants — a lightbox rendered
 * inline would be trapped inside that card's box instead of covering the
 * viewport. The portal sidesteps that entirely.
 */

type CertId = "fullstack" | "javascript" | "python" | "mobile" | "cybersecurity";

interface CertMeta {
  id: CertId;
  icon: React.ElementType;
  accent: string;
  /** Real filename in public/projects/certifications — shown verbatim in the mac bar, case-sensitive. */
  fileName: string;
  image: string;
  /** Real intrinsic pixel dimensions, so the lightbox can size the Image without `fill`. */
  width: number;
  height: number;
}

const CERT_META: readonly CertMeta[] = [
  {
    id: "fullstack",
    icon: FiLayers,
    accent: "#22d3ee",
    fileName: "FullStack.png",
    image: "/projects/certifications/FullStack.png",
    width: 2044,
    height: 1456,
  },
  {
    id: "javascript",
    icon: SiJavascript,
    accent: "#F7DF1E",
    fileName: "JS.jpeg",
    image: "/projects/certifications/JS.jpeg",
    width: 1600,
    height: 1037,
  },
  {
    id: "python",
    icon: SiPython,
    accent: "#3776AB",
    fileName: "python.jpeg",
    image: "/projects/certifications/python.jpeg",
    width: 1280,
    height: 914,
  },
  {
    id: "mobile",
    icon: FiSmartphone,
    accent: "#5eead4",
    fileName: "AppsDev.jpeg",
    image: "/projects/certifications/AppsDev.jpeg",
    width: 1600,
    height: 1037,
  },
  {
    id: "cybersecurity",
    icon: FiShield,
    accent: "#c084fc",
    fileName: "CiberSeg.jpeg",
    image: "/projects/certifications/CiberSeg.jpeg",
    width: 1600,
    height: 1037,
  },
] as const;

interface CertWindowProps {
  meta: CertMeta;
  tag: string;
  title: string;
  alt: string;
  index: number;
  onOpen: () => void;
}

const CertWindow: React.FC<CertWindowProps> = ({ meta, tag, title, alt, index, onOpen }) => {
  const Icon = meta.icon;

  return (
    <m.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ type: "tween", duration: 0.5, ease: "easeOut", delay: index * 0.06 }}
      className="flex flex-col will-change-transform transform-gpu"
    >
      <div
        aria-label={title}
        className="group rounded-2xl border border-white/10 bg-neutral-900/60 backdrop-blur-xl shadow-2xl p-2 hover:-translate-y-1 hover:border-white/20 transition-all duration-300 cursor-pointer"
        onClick={onOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen();
          }
        }}
        role="button"
        tabIndex={0}
      >
        {/* Mac bar — matches AgileCard / TerminalCard / ToolchainIntegrityScan.
            Grid, not flex: a bare `flex-1 text-center` centers the title in
            whatever space is left after the dots, not in the bar itself. The
            1fr/auto/1fr split gives it two equal-width flanking columns, so
            it's centered on the bar regardless of what (if anything) sits
            in the third column. */}
        <div className="grid grid-cols-[1fr_minmax(0,auto)_1fr] items-center gap-2 px-2 py-2">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
          </span>
          <span className="text-center font-mono text-[10px] text-neutral-500 truncate">
            {meta.fileName}
          </span>
        </div>

        {/* Image Bounding Box: explicit aspect-ratio container, never a bare fill.
            object-contain (not cover) so the full document is always visible —
            these are certificates, not decorative photography; cropping would
            cut real content (logos, signatures, dates). */}
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-neutral-950">
          <Image
            alt={alt}
            className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 380px"
            src={meta.image}
          />
          <span className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 border border-white/10 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <FiMaximize2 className="text-xs" />
          </span>
        </div>
      </div>

      <div className="pt-3">
        <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.12em] mb-1" style={{ color: meta.accent }}>
          <Icon className="text-xs" />
          {tag}
        </span>
        <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">{title}</h4>
      </div>
    </m.div>
  );
};

interface CertLightboxProps {
  meta: CertMeta;
  alt: string;
  title: string;
  onClose: () => void;
}

const CertLightbox: React.FC<CertLightboxProps> = ({ meta, alt, title, onClose }) => (
  <m.div
    animate={{ opacity: 1 }}
    className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
    exit={{ opacity: 0 }}
    initial={{ opacity: 0 }}
    onClick={onClose}
    transition={{ duration: 0.2 }}
  >
    <div aria-hidden="true" className="absolute inset-0 bg-black/85 backdrop-blur-sm" />

    <m.div
      animate={{ opacity: 1, scale: 1, y: 0 }}
      aria-label={title}
      aria-modal="true"
      className="relative w-full sm:w-auto max-w-4xl max-h-[90vh] rounded-2xl border border-white/10 bg-neutral-900/95 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col will-change-transform transform-gpu"
      exit={{ opacity: 0, scale: 0.94, y: 12 }}
      initial={{ opacity: 0, scale: 0.94, y: 12 }}
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
    >
      {/* Mac bar — same recipe as the small card, but the red light is now live */}
      <div className="grid grid-cols-[1fr_minmax(0,auto)_1fr] items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/[0.02] flex-shrink-0">
        <span className="flex items-center gap-1.5">
          <button
            aria-label="Close"
            className="group/dot relative w-3 h-3 rounded-full bg-[#FF5F57] shadow-[0_0_6px_rgba(255,95,87,0.6)] cursor-pointer flex items-center justify-center"
            onClick={onClose}
            type="button"
          >
            <span className="opacity-0 group-hover/dot:opacity-100 transition-opacity text-black/60 text-[8px] leading-none font-bold">
              ×
            </span>
          </button>
          <span className="w-3 h-3 rounded-full bg-[#FEBC2E] shadow-[0_0_6px_rgba(254,188,46,0.4)]" />
          <span className="w-3 h-3 rounded-full bg-[#28C840] shadow-[0_0_6px_rgba(40,200,64,0.4)]" />
        </span>
        <span className="text-center font-mono text-xs text-neutral-400 truncate px-2">
          {meta.fileName}
        </span>
      </div>

      <div className="relative flex-1 min-h-0 overflow-auto p-4 sm:p-6 flex items-center justify-center bg-neutral-950">
        <Image
          alt={alt}
          className="w-auto h-auto max-w-full max-h-[75vh] object-contain rounded-lg"
          height={meta.height}
          sizes="(max-width: 1024px) 90vw, 70vw"
          src={meta.image}
          width={meta.width}
        />
      </div>
    </m.div>
  </m.div>
);

export const CertificationWindows: React.FC = () => {
  const { t } = useI18n();
  const lenis = useLenis();
  const copy = t.stack.certifications;
  const [openId, setOpenId] = useState<CertId | null>(null);

  // Pause Lenis (rather than fight it with a raw overflow:hidden) while the
  // lightbox is open, and always resume — including on unmount, in case the
  // section is torn down with the lightbox still open.
  useEffect(() => {
    if (!openId) return;
    lenis?.stop();
    return () => lenis?.start();
  }, [openId, lenis]);

  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openId]);

  const openMeta = CERT_META.find((meta) => meta.id === openId) ?? null;

  return (
    <div>
      <div className="flex items-center justify-center gap-2 font-mono text-[10px] sm:text-xs text-neutral-500 mb-10 uppercase tracking-widest">
        <FiAward className="text-cyan-500 flex-shrink-0" />
        {copy.label}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {CERT_META.map((meta, index) => (
          <CertWindow
            alt={copy.items[meta.id].imageAlt}
            index={index}
            key={meta.id}
            meta={meta}
            onOpen={() => setOpenId(meta.id)}
            tag={copy.items[meta.id].tag}
            title={copy.items[meta.id].title}
          />
        ))}
      </div>

      {/* typeof-check rather than a mounted-state effect: safe on the server
          (typeof never throws for an undeclared global) and, since openMeta
          starts null on the client too, there is nothing for the extra
          wrapper to mismatch during hydration. */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {openMeta && (
              <CertLightbox
                alt={copy.items[openMeta.id].imageAlt}
                key={openMeta.id}
                meta={openMeta}
                onClose={() => setOpenId(null)}
                title={copy.items[openMeta.id].title}
              />
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
};
