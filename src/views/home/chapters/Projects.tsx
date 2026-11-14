"use client";

import { useTransform } from "motion/react";
import type { ChapterRange, ProjectChapterCopy } from "@/types/content";
import type { Locale } from "@/i18n/config";
import { scrollPMotionValue } from "@/features/scroll/scrollMotionValue";
import { chapterFadeWindow } from "@/features/scroll/chapterMath";
import { getProjectContent } from "@/content/projects";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";

/**
 * A project chapter's DOM copy (plan M11) — replaces
 * `ProjectChapterPlaceholder.tsx` now that the real 3D showcase exists
 * (the Mac/iPhone screens, `shot.ts`/`projectScreens.ts`, callouts on the
 * real screenshots). Adds the challenge/solution pairing and a link to
 * the full indexable detail page (`/projects/[id]`, also rewritten in
 * M11) — the placeholder had neither, since there was no real 3D
 * presentation yet to point back to.
 *
 * M13: challenge/solution/stack move into `moreContent` — the artifact's
 * own split for every one of its 5 project chapters (`t5`-`t9`): the
 * scope line stays always-visible, "Ver detalle" reveals the rest. The
 * link to the full `/projects/[id]` page is named "Ver página completa"
 * here, not "Ver detalle" — that label is already `<Sheet>`'s own
 * expand/collapse toggle, and reusing it for a *second*, different
 * action (navigating away) on the same sheet would read as broken.
 */
export function Projects({ chapter, copy, locale }: { chapter: ChapterRange; copy: ProjectChapterCopy; locale: Locale }) {
  const project = getProjectContent(copy.projectId);
  const opacity = useTransform(scrollPMotionValue, (p) => chapterFadeWindow(chapter, p).opacity);
  const y = useTransform(opacity, (o) => (1 - o) * 16);
  const willChange = useTransform(opacity, (o) => (o > 0.01 && o < 0.99 ? "transform, opacity" : "auto"));
  const pointerEvents = useTransform(opacity, (o) => (o > 0.5 ? "auto" : "none"));

  if (!project) return null;

  const moreContent = (
    <>
      <p className="text-[16px] leading-[1.55] text-texto-2">
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
    </>
  );

  return (
    <Sheet chapter={chapter} style={{ opacity, y, willChange, pointerEvents }} locale={locale} moreContent={moreContent}>
      <p className="iz-eyebrow font-mono text-[12px] uppercase tracking-[0.04em] text-piedra mb-[18px]">
        <b className="text-limon font-semibold">{copy.eyebrowIndex}</b> · {project.statusLabel[locale]}
      </p>
      <h2 id={`heading-${chapter.id}`} className="text-h2 font-extrabold tracking-[-0.03em] leading-[1.02] text-hueso mb-3.5">
        {project.title}
      </h2>
      <p className="font-mono text-[11.5px] leading-[1.7] text-piedra mb-3.5">
        {project.architecture[locale]} · {project.location[locale]}
      </p>
      <p className="iz-lead text-lead leading-[1.55] text-texto-2">{project.scope[locale]}</p>
      <div className="mt-[22px] flex flex-wrap gap-2.5">
        <Button variant="primary" href={`/projects/${project.id}`}>
          {locale === "es" ? "Ver página completa" : "View full page"}
        </Button>
        {project.liveUrl && (
          <Button variant="secondary" href={project.liveUrl}>
            {locale === "es" ? "Ver en vivo" : "View live"}
          </Button>
        )}
      </div>
    </Sheet>
  );
}

export default Projects;
