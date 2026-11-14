"use client";

import { useTransform } from "motion/react";
import { FiDownload } from "react-icons/fi";
import type { ChapterRange, NarrativeChapterCopy } from "@/types/content";
import type { Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/LanguageProvider";
import { scrollPMotionValue } from "@/features/scroll/scrollMotionValue";
import { chapterFadeWindow } from "@/features/scroll/chapterMath";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";

/**
 * The Contacto chapter's copy — a dedicated component (plan M12) for the
 * one real addition `NarrativeChapter.tsx`'s generic `copy.ctas` rendering
 * doesn't cover: the CV download link (plan §1.2: `public/cv/Ivo_Zanacchi_CV.pdf`,
 * kept at the same path). `copy.ctas` itself (email/LinkedIn/GitHub) is
 * already real content from `content/chapters.ts`'s `cta` entry.
 */
export function Contact({ chapter, copy, locale }: { chapter: ChapterRange; copy: NarrativeChapterCopy; locale: Locale }) {
  const { t } = useI18n();
  const opacity = useTransform(scrollPMotionValue, (p) => chapterFadeWindow(chapter, p).opacity);
  const y = useTransform(opacity, (o) => (1 - o) * 16);
  const willChange = useTransform(opacity, (o) => (o > 0.01 && o < 0.99 ? "transform, opacity" : "auto"));
  const pointerEvents = useTransform(opacity, (o) => (o > 0.5 ? "auto" : "none"));

  return (
    <Sheet chapter={chapter} style={{ opacity, y, willChange, pointerEvents }} locale={locale}>
      <p className="iz-eyebrow font-mono text-[12px] uppercase tracking-[0.04em] text-piedra mb-[18px]">
        <b className="text-limon font-semibold">{copy.eyebrowIndex}</b> · {copy.eyebrowLabel[locale]}
      </p>
      <h2 id={`heading-${chapter.id}`} className="text-h2 font-extrabold tracking-[-0.03em] leading-[1.02] text-hueso mb-3.5">
        {copy.heading[locale]}
      </h2>
      <p className="iz-lead text-lead leading-[1.55] text-texto-2">{copy.lead[locale]}</p>

      {copy.ctas && (
        <div className="mt-[22px] flex flex-wrap gap-2.5">
          {copy.ctas.map((cta, i) => (
            <Button key={i} variant={i === 0 ? "primary" : "secondary"} href={cta.href ?? `#${cta.targetChapter}`}>
              {cta.label[locale]}
            </Button>
          ))}
          <Button variant="secondary" href="/cv/Ivo_Zanacchi_CV.pdf" download>
            {t.contact.downloadCv} <FiDownload aria-hidden className="ml-1 inline" />
          </Button>
        </div>
      )}
    </Sheet>
  );
}

export default Contact;
