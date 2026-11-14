"use client";

import { useRef } from "react";
import { useAnimationFrame, useTransform } from "motion/react";
import type { ChapterRange, NarrativeChapterCopy } from "@/types/content";
import type { Locale } from "@/i18n/config";
import { scrollPMotionValue } from "@/features/scroll/scrollMotionValue";
import { chapterFadeWindow, chapterProgressAt } from "@/features/scroll/chapterMath";
import { scrollStore } from "@/features/scroll/scrollStore";
import { formationProgress } from "@/features/chapters/certFlight";
import { CREDENTIALS } from "@/content/credentials";
import { Sheet } from "@/components/ui/Sheet";

/**
 * The Formación chapter's copy — a dedicated component (plan M10) for
 * one real behavioral difference: the 5 real certificates render as an
 * accessible list, each marked `data-on="true"` while it's the one
 * actively being verified in 3D (artifact's own `cl0`..`cl4` elements,
 * `_dom`: `li.setAttribute('data-on', st.id==='cert' && st.cert===i ?
 * 'true':'false')`, confirmed in M7's research). Written imperatively
 * (`useAnimationFrame`, same mechanism `DynamicIslandNav` already uses)
 * because the active index changes with scroll — never React state.
 */

function useActiveCertificateRefs(chapter: ChapterRange) {
  const itemRefs = useRef<Array<HTMLLIElement | null>>(Array(CREDENTIALS.length).fill(null));
  const lastActive = useRef<number>(-2);

  useAnimationFrame(() => {
    const p = scrollStore.p;
    const isCertChapter = p >= chapter.a && p < chapter.b;
    const k = isCertChapter ? chapterProgressAt(p, chapter) : 0;
    const cf = formationProgress(k);
    const active = isCertChapter ? Math.floor(cf) : -1;
    if (active === lastActive.current) return;
    lastActive.current = active;
    itemRefs.current.forEach((item, i) => {
      item?.setAttribute("data-on", i === active ? "true" : "false");
    });
  });

  return itemRefs;
}

export function Formation({ chapter, copy, locale }: { chapter: ChapterRange; copy: NarrativeChapterCopy; locale: Locale }) {
  const opacity = useTransform(scrollPMotionValue, (p) => chapterFadeWindow(chapter, p).opacity);
  const y = useTransform(opacity, (o) => (1 - o) * 16);
  const willChange = useTransform(opacity, (o) => (o > 0.01 && o < 0.99 ? "transform, opacity" : "auto"));
  const pointerEvents = useTransform(opacity, (o) => (o > 0.5 ? "auto" : "none"));

  const itemRefs = useActiveCertificateRefs(chapter);

  const moreContent = copy.education && (
    <ol className="flex flex-col gap-2 list-none p-0">
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
  );

  return (
    <Sheet chapter={chapter} style={{ opacity, y, willChange, pointerEvents }} locale={locale} moreContent={moreContent}>
      <p className="iz-eyebrow font-mono text-[12px] uppercase tracking-[0.04em] text-piedra mb-[18px]">
        <b className="text-limon font-semibold">{copy.eyebrowIndex}</b> · {copy.eyebrowLabel[locale]}
      </p>
      <h2 id={`heading-${chapter.id}`} className="text-h2 font-extrabold tracking-[-0.03em] leading-[1.02] text-hueso mb-3.5">
        {copy.heading[locale]}
      </h2>
      <p className="iz-lead text-lead leading-[1.55] text-texto-2">{copy.lead[locale]}</p>

      <ul className="iz-certs mt-4 flex flex-col gap-1.5 list-none p-0" aria-label={locale === "es" ? "Certificaciones" : "Certifications"}>
        {CREDENTIALS.map((credential, i) => (
          <li
            key={credential.id}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            data-on="false"
            className="rounded-panel bg-carbon px-3 py-2 shadow-[inset_0_0_0_1px_var(--color-linea)] text-[13px] text-texto-2 data-[on=true]:shadow-[inset_0_0_0_1px_var(--color-limon)] data-[on=true]:text-hueso"
          >
            <span className="font-semibold">{credential.title}</span> · {credential.issuer}
            {credential.certifiedBy ? ` · ${credential.certifiedBy}` : ""}
          </li>
        ))}
      </ul>
    </Sheet>
  );
}

export default Formation;
