"use client";

import { m, useTransform } from "motion/react";
import type { ChapterRange, ProjectChapterCopy } from "@/types/content";
import type { Locale } from "@/i18n/config";
import { scrollPMotionValue } from "@/features/scroll/scrollMotionValue";
import { chapterFadeWindow } from "@/features/scroll/chapterMath";
import { getProjectContent } from "@/content/projects";
import { Chip } from "@/components/ui/Chip";

/**
 * Minimal DOM-only stand-in for a project chapter. The real presentation —
 * the 3D showcase with hotspots on the real screenshot, the status-coloured
 * eyebrow, the challenge/solution pairing laid out like the artifact — is
 * M11's job (it needs the Mac/iPhone/camera from M6-M8 to actually show
 * anything in 3D). This keeps the chapter's copy indexable and readable
 * with JS off in the meantime, same as every narrative chapter, instead of
 * leaving a blank 1.5-screen gap in the recorrido.
 */
export function ProjectChapterPlaceholder({ chapter, copy, locale }: { chapter: ChapterRange; copy: ProjectChapterCopy; locale: Locale }) {
  const project = getProjectContent(copy.projectId);
  const opacity = useTransform(scrollPMotionValue, (p) => chapterFadeWindow(chapter, p).opacity);
  const y = useTransform(opacity, (o) => (1 - o) * 16);
  const pointerEvents = useTransform(opacity, (o) => (o > 0.5 ? "auto" : "none"));

  if (!project) return null;

  return (
    <m.div
      style={{ opacity, y, pointerEvents }}
      className="absolute left-[clamp(20px,6vw,96px)] top-1/2 w-[min(440px,36vw)] max-w-[calc(100vw-40px)] -translate-y-1/2 transform-gpu"
    >
      <p className="font-mono text-[12px] uppercase tracking-[0.04em] text-piedra mb-[18px]">
        <b className="text-limon font-semibold">{copy.eyebrowIndex}</b> · {project.statusLabel[locale]}
      </p>
      <h2 className="text-h2 font-extrabold tracking-[-0.03em] leading-[1.02] text-hueso mb-3.5">{project.title}</h2>
      <p className="font-mono text-[11.5px] leading-[1.7] text-piedra mb-3.5">{project.architecture[locale]} · {project.location[locale]}</p>
      <p className="text-lead leading-[1.55] text-texto-2">{project.scope[locale]}</p>
      <ul className="mt-3.5 flex flex-wrap gap-1.5" aria-label={locale === "es" ? "Stack" : "Stack"}>
        {project.stack.map((tech) => (
          <li key={tech}>
            <Chip variant="stack">{tech}</Chip>
          </li>
        ))}
      </ul>
    </m.div>
  );
}
