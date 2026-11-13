"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiArrowLeft, FiExternalLink } from "react-icons/fi";
import type { ProjectContent } from "@/types/content";
import { useI18n } from "@/i18n/LanguageProvider";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/pagination";

/**
 * The full project detail page (plan M11) — replaces
 * `components/sections/ProjectDetail.tsx` (100% legacy: cyan/neon palette,
 * `data/projects.ts`'s now-dropped `latency`, `VerticalCutReveal`). Reads
 * `content/projects.ts` directly instead, same source the 3D recorrido's
 * `Projects.tsx` chapter already uses.
 *
 * Gallery images use `next/image` against the *original* files
 * (`public/projects/...`) — `next.config.ts` already negotiates
 * AVIF/WebP via its own optimizer, so this page never touches the
 * `public/media/...` derivatives `showcaseImages.ts`/`credentialImages.ts`
 * generate for the 2D canvas screens, which can't use that optimizer.
 */
export function ProjectView({ project }: { project: ProjectContent }) {
  const { locale, t: dictionary } = useI18n();
  const t = dictionary.projectView;
  const groups = useMemo(() => dedupeGroups(project.gallery), [project.gallery]);
  const [activeGroupId, setActiveGroupId] = useState<string | undefined>(groups[0]?.id);
  const imagesInGroup = useMemo(
    () => project.gallery.filter((image) => (groups.length === 0 ? true : image.group?.id === activeGroupId)),
    [project.gallery, groups.length, activeGroupId],
  );
  const [page, setPage] = useState(1);
  const activeImage = imagesInGroup[page - 1] ?? imagesInGroup[0];

  return (
    <main className="min-h-dvh bg-tinta px-[clamp(20px,6vw,96px)] py-20">
      <Link href="/" className="inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.04em] text-piedra hover:text-limon transition-colors">
        <FiArrowLeft aria-hidden /> {t.back}
      </Link>

      <header className="mt-10 max-w-[720px]">
        <p className="font-mono text-[12px] uppercase tracking-[0.04em] text-piedra mb-[18px]">
          <b className="text-limon font-semibold">{project.index}</b> · {project.statusLabel[locale]}
        </p>
        <h1 className="text-display font-extrabold tracking-[-0.035em] leading-[0.98] text-hueso mb-5">{project.title}</h1>
        <p className="font-mono text-[11.5px] leading-[1.7] text-piedra mb-3.5">
          {project.architecture[locale]} · {project.location[locale]}
        </p>
        <p className="text-lead leading-[1.55] text-texto-2">{project.scope[locale]}</p>

        <div className="mt-[22px] flex flex-wrap gap-2.5">
          {project.liveUrl && (
            <Button variant="primary" href={project.liveUrl}>
              {t.viewLive} <FiExternalLink aria-hidden className="ml-1 inline" />
            </Button>
          )}
        </div>
      </header>

      <section className="mt-16 max-w-[720px] grid gap-8 sm:grid-cols-2">
        <div>
          <h2 className="font-mono text-[12px] uppercase tracking-[0.04em] text-limon mb-2.5">{t.challengeHeading}</h2>
          <p className="text-[16px] leading-[1.55] text-texto-2">{project.challenge[locale]}</p>
        </div>
        <div>
          <h2 className="font-mono text-[12px] uppercase tracking-[0.04em] text-limon mb-2.5">{t.solutionHeading}</h2>
          <p className="text-[16px] leading-[1.55] text-texto-2">{project.solution[locale]}</p>
        </div>
      </section>

      {project.objectives[locale].length > 0 && (
        <section className="mt-12 max-w-[720px]">
          <ol className="flex flex-col gap-2 list-none p-0">
            {project.objectives[locale].map((objective, i) => (
              <li key={i} className="grid grid-cols-[34px_minmax(0,1fr)] gap-2 text-[14px] leading-[1.45] text-texto-2">
                <span className="font-mono text-[11px] text-limon pt-0.5">{String(i + 1).padStart(2, "0")}</span>
                {objective}
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="mt-12">
        <h2 className="font-mono text-[12px] uppercase tracking-[0.04em] text-limon mb-2.5">{t.stackHeading}</h2>
        <ul className="flex flex-wrap gap-1.5" aria-label={t.stackHeading}>
          {project.stack.map((tech) => (
            <li key={tech}>
              <Chip variant="stack">{tech}</Chip>
            </li>
          ))}
        </ul>
      </section>

      {project.gallery.length > 0 && (
        <section className="mt-16 max-w-[960px]">
          <h2 className="font-mono text-[12px] uppercase tracking-[0.04em] text-limon mb-4">{t.galleryHeading}</h2>

          {groups.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-5" role="tablist" aria-label={t.galleryHeading}>
              {groups.map((group) => (
                <button
                  key={group.id}
                  role="tab"
                  aria-selected={activeGroupId === group.id}
                  onClick={() => {
                    setActiveGroupId(group.id);
                    setPage(1);
                  }}
                  className={`rounded-pill px-3.5 py-1.5 font-mono text-[12px] transition-colors cursor-pointer ${
                    activeGroupId === group.id ? "bg-limon/15 text-limon shadow-[inset_0_0_0_1px_var(--color-limon)]" : "text-piedra shadow-[inset_0_0_0_1px_var(--color-linea)] hover:text-hueso"
                  }`}
                >
                  {group.label[locale]}
                </button>
              ))}
            </div>
          )}

          {activeImage && (
            <figure>
              <div className="relative w-full aspect-video rounded-panel overflow-hidden shadow-[inset_0_0_0_1px_var(--color-linea)] bg-carbon">
                <Image
                  src={activeImage.src}
                  alt={activeImage.alt[locale]}
                  fill
                  sizes="(min-width: 960px) 960px, 100vw"
                  className={activeImage.fit === "contain" ? "object-contain" : "object-cover"}
                  priority={page === 1}
                />
              </div>
              <figcaption className="mt-3">
                <p className="text-[14px] text-texto-2">{activeImage.caption[locale]}</p>
                {activeImage.specs[locale].length > 0 && (
                  <ul className="mt-1.5 flex flex-wrap gap-1.5">
                    {activeImage.specs[locale].map((spec) => (
                      <li key={spec} className="font-mono text-[11px] text-piedra">
                        {spec}
                      </li>
                    ))}
                  </ul>
                )}
              </figcaption>
            </figure>
          )}

          <Pagination page={page} totalPages={imagesInGroup.length} onChange={setPage} className="mt-6" />
        </section>
      )}
    </main>
  );
}

function dedupeGroups(gallery: ProjectContent["gallery"]) {
  const seen = new Map<string, ProjectContent["gallery"][number]["group"]>();
  for (const image of gallery) {
    if (image.group && !seen.has(image.group.id)) seen.set(image.group.id, image.group);
  }
  return [...seen.values()].filter((group): group is NonNullable<typeof group> => Boolean(group));
}

export default ProjectView;
