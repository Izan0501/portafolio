"use client";

import { m, useTransform } from "motion/react";
import type { ChapterRange } from "@/types/content";
import type { NarrativeChapterCopy } from "@/types/content";
import type { Locale } from "@/i18n/config";
import { scrollPMotionValue } from "@/features/scroll/scrollMotionValue";
import { chapterFadeWindow } from "@/features/scroll/chapterMath";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";

/**
 * Renders one narrative chapter's copy (hero/open/prof/cert/dive/pipe/cta —
 * the project chapters use `Projects.tsx` instead, M11).
 *
 * Always mounted, never conditionally rendered — "el texto se lee completo
 * con JS deshabilitado" (plan M4 quality gate) needs every chapter's copy
 * actually in the DOM at all times; only its *opacity* is scroll-driven.
 * Without JS, Motion never applies its inline style at all, so every
 * chapter shows at its CSS default (visible, stacked) — content stays
 * readable, only the choreography is lost, which is the expected fallback.
 *
 * `will-change-transform transform-gpu` only while the chapter is actually
 * in its fade window (CLAUDE.md rule 4 + plan §3.3: "will-change se agrega
 * al entrar... y se quita al salir") — `useTransform` below ties it
 * directly to the same opacity curve instead of a separate effect.
 *
 * `data-chapter-id` (M8): `CameraDirector` measures the active chapter's
 * real `getBoundingClientRect()` through this attribute to find the free
 * area 3D content can occupy (artifact `_layout`'s `_copyFrac`/`_sheetTop`,
 * which measure its own per-chapter DOM elements the same way).
 */
export function NarrativeChapter({ chapter, copy, locale }: { chapter: ChapterRange; copy: NarrativeChapterCopy; locale: Locale }) {
  const opacity = useTransform(scrollPMotionValue, (p) => chapterFadeWindow(chapter, p).opacity);
  const y = useTransform(opacity, (o) => (1 - o) * 16);
  const willChange = useTransform(opacity, (o) => (o > 0.01 && o < 0.99 ? "transform, opacity" : "auto"));
  const pointerEvents = useTransform(opacity, (o) => (o > 0.5 ? "auto" : "none"));

  const Heading = copy.headingLevel;

  return (
    <m.div
      data-chapter-id={chapter.id}
      style={{ opacity, y, willChange, pointerEvents }}
      className="absolute left-[clamp(20px,6vw,96px)] top-1/2 w-[min(440px,36vw)] max-w-[calc(100vw-40px)] -translate-y-1/2 transform-gpu"
    >
      <p className="font-mono text-[12px] uppercase tracking-[0.04em] text-piedra mb-[18px]">
        <b className="text-limon font-semibold">{copy.eyebrowIndex}</b> · {copy.eyebrowLabel[locale]}
      </p>
      <Heading className={Heading === "h1" ? "text-display font-extrabold tracking-[-0.035em] leading-[0.98] text-hueso mb-5" : "text-h2 font-extrabold tracking-[-0.03em] leading-[1.02] text-hueso mb-3.5"}>
        {copy.heading[locale]}
      </Heading>
      <p className="text-lead leading-[1.55] text-texto-2">{copy.lead[locale]}</p>

      {copy.trust && (
        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label={locale === "es" ? "Garantías de trabajo" : "Work guarantees"}>
          {copy.trust[locale].map((item) => (
            <li key={item}>
              <Chip variant="trust">{item}</Chip>
            </li>
          ))}
        </ul>
      )}

      {copy.facts && (
        <dl className="mt-3.5 grid grid-cols-2 gap-2">
          {copy.facts.map((fact) => (
            <div key={fact.label[locale]} className="rounded-panel bg-carbon px-3 py-2.5 shadow-[inset_0_0_0_1px_var(--color-linea)]">
              <dt className="text-[30px] font-extrabold leading-none text-limon tabular-nums">{fact.value}</dt>
              <dd className="mt-1 font-mono text-[11px] text-texto-2">{fact.label[locale]}</dd>
            </div>
          ))}
        </dl>
      )}

      {copy.detail?.map((paragraph, i) => (
        <p key={i} className="text-[16px] leading-[1.55] text-texto-2 mt-3.5">
          {paragraph[locale]}
        </p>
      ))}

      {copy.team && <p className="text-[16px] leading-[1.55] text-texto-2 mt-3.5">{copy.team[locale]}</p>}

      {copy.education && (
        <ol className="mt-2 flex flex-col gap-2 list-none p-0">
          {copy.education.map((entry) => (
            <li key={entry.code} className="grid grid-cols-[34px_minmax(0,1fr)] gap-2 text-[14px] leading-[1.45] text-texto-2">
              <span className="font-mono text-[11px] text-limon pt-0.5">{entry.code}</span>
              <div>
                <strong className="text-hueso font-semibold">{entry.degree[locale]}</strong>
                {entry.institution ? ` · ${entry.institution}` : ""} · {entry.period[locale]}
              </div>
            </li>
          ))}
        </ol>
      )}

      {copy.steps && (
        <ol className="mt-2 flex flex-col gap-2 list-none p-0">
          {copy.steps.map((step) => (
            <li key={step.index} className="grid grid-cols-[34px_minmax(0,1fr)] gap-2 text-[14px] leading-[1.45] text-texto-2">
              <span className="font-mono text-[11px] text-limon pt-0.5">{step.index}</span>
              <div>
                <strong className="text-hueso font-semibold">{step.title[locale]}</strong>
                <em className="not-italic"> · {step.detail[locale]}</em>
              </div>
            </li>
          ))}
        </ol>
      )}

      {copy.ctas && (
        <div className="mt-[22px] flex flex-wrap gap-2.5">
          {copy.ctas.map((cta, i) => (
            <Button key={i} variant={i === 0 ? "primary" : "secondary"} href={cta.href ?? `#${cta.targetChapter}`}>
              {cta.label[locale]}
            </Button>
          ))}
        </div>
      )}
    </m.div>
  );
}
