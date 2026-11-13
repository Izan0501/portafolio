"use client";

import { m, useTransform } from "motion/react";
import type { ChapterRange, ProjectChapterCopy } from "@/types/content";
import type { Locale } from "@/i18n/config";
import { scrollPMotionValue } from "@/features/scroll/scrollMotionValue";
import { chapterFadeWindow } from "@/features/scroll/chapterMath";
import { getProjectContent } from "@/content/projects";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";

/**
 * A project chapter's DOM copy (plan M11) — replaces
 * `ProjectChapterPlaceholder.tsx` now that the real 3D showcase exists
 * (the Mac/iPhone screens, `shot.ts`/`projectScreens.ts`, callouts on the
 * real screenshots). Adds the challenge/solution pairing and a link to
 * the full indexable detail page (`/projects/[id]`, also rewritten in
 * M11) — the placeholder had neither, since there was no real 3D
 * presentation yet to point back to.
 */
export function Projects({ chapter, copy, locale }: { chapter: ChapterRange; copy: ProjectChapterCopy; locale: Locale }) {
  const project = getProjectContent(copy.projectId);
  const opacity = useTransform(scrollPMotionValue, (p) => chapterFadeWindow(chapter, p).opacity);
  const y = useTransform(opacity, (o) => (1 - o) * 16);
  const willChange = useTransform(opacity, (o) => (o > 0.01 && o < 0.99 ? "transform, opacity" : "auto"));
  const pointerEvents = useTransform(opacity, (o) => (o > 0.5 ? "auto" : "none"));

  if (!project) return null;

  return (
    <m.div
      data-chapter-id={chapter.id}
      style={{ opacity, y, willChange, pointerEvents }}
      className="absolute left-[clamp(20px,6vw,96px)] top-1/2 w-[min(440px,36vw)] max-w-[calc(100vw-40px)] -translate-y-1/2 transform-gpu"
    >
      <p className="font-mono text-[12px] uppercase tracking-[0.04em] text-piedra mb-[18px]">
        <b className="text-limon font-semibold">{copy.eyebrowIndex}</b> · {project.statusLabel[locale]}
      </p>
      <h2 className="text-h2 font-extrabold tracking-[-0.03em] leading-[1.02] text-hueso mb-3.5">{project.title}</h2>
      <p className="font-mono text-[11.5px] leading-[1.7] text-piedra mb-3.5">
        {project.architecture[locale]} · {project.location[locale]}
      </p>
      <p className="text-lead leading-[1.55] text-texto-2">{project.scope[locale]}</p>
      <p className="text-[16px] leading-[1.55] text-texto-2 mt-3.5">
        <strong className="text-hueso font-semibold">{locale === "es" ? "El desafío: " : "The challenge: "}</strong>
        {project.challenge[locale]}
      </p>
      <p className="text-[16px] leading-[1.55] text-texto-2 mt-2.5">
        <strong className="text-hueso font-semibold">{locale === "es" ? "La solución: " : "The solution: "}</strong>
        {project.solution[locale]}
      </p>
      <ul className="mt-3.5 flex flex-wrap gap-1.5" aria-label={locale === "es" ? "Stack" : "Stack"}>
        {project.stack.map((tech) => (
          <li key={tech}>
            <Chip variant="stack">{tech}</Chip>
          </li>
        ))}
      </ul>
      <div className="mt-[22px] flex flex-wrap gap-2.5">
        <Button variant="primary" href={`/projects/${project.id}`}>
          {locale === "es" ? "Ver detalle" : "View details"}
        </Button>
        {project.liveUrl && (
          <Button variant="secondary" href={project.liveUrl}>
            {locale === "es" ? "Ver en vivo" : "View live"}
          </Button>
        )}
      </div>
    </m.div>
  );
}

export default Projects;
