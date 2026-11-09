"use client";

import dynamic from "next/dynamic";
import { useI18n } from "@/i18n/LanguageProvider";
import { CH, PMAX } from "@/config/chapters";
import { CHAPTERS } from "@/content/chapters";
import { NarrativeChapter } from "./chapters/NarrativeChapter";
import { ProjectChapterPlaceholder } from "./chapters/ProjectChapterPlaceholder";
import { StagePoster } from "@/components/three/StagePoster";

// M5: the three.js/R3F chunk is dynamically imported, ssr:false, so it never
// enters the initial bundle (plan §2.1) — StagePoster (a flat grafito fill;
// no real render of the Mac exists yet, see M2's report) covers both the
// chunk's own load and `Stage`'s internal `useDetectGPU()` suspense.
const Stage = dynamic(() => import("@/components/three/Stage").then((mod) => mod.Stage), {
  ssr: false,
  loading: () => <StagePoster />,
});

/**
 * The 3D recorrido's shell (plan §2.1, §3.3): one tall spacer giving the
 * page `PMAX` screens of real scroll, with a single sticky stage pinned for
 * all of it. Not mounted yet (`app/page.tsx` still renders the legacy
 * sections) — M3's shell/tokens are live, but swapping `page.tsx` over to
 * this component is a product decision for whichever module actually
 * replaces the legacy hero (M6+), not M4's to make unilaterally.
 *
 * CLAUDE.md rule 1 (sticky isolation): the sticky element below is a bare
 * `<div>` — no `transform`, no `<m.div>` on it. Every animated piece
 * (`NarrativeChapter`/`ProjectChapterPlaceholder`'s own `<m.div>`) nests
 * *inside* it instead.
 *
 * CLAUDE.md rule 2 (overflow ban): neither the spacer nor the sticky stage
 * sets `overflow-hidden`/`overflow-clip` — both default to visible.
 *
 * `dvh` rather than `vh` for the spacer height: avoids the resize jump
 * mobile browsers cause by changing the viewport as chrome (the address
 * bar) hides/shows during scroll — `vh` would make `PMAX` screens worth of
 * spacer height shift under the user mid-scroll.
 */
export function ExperienceShell() {
  const { locale } = useI18n();

  return (
    <div className="relative w-full" style={{ height: `${PMAX * 100}dvh` }}>
      <div className="sticky top-0 h-dvh w-full">
        {/* The canvas inside <Stage> is aria-hidden (plan §4: "el 3D va
            aria-hidden"); every fact it will eventually show also lives in
            the chapter copy below, in the DOM — nothing 3D-only is ever the
            sole source of a fact a screen reader or JS-off visitor needs. */}
        <Stage />

        {CH.map((chapter) => {
          const copy = CHAPTERS[chapter.id];
          return copy.kind === "narrative" ? (
            <NarrativeChapter key={chapter.id} chapter={chapter} copy={copy} locale={locale} />
          ) : (
            <ProjectChapterPlaceholder key={chapter.id} chapter={chapter} copy={copy} locale={locale} />
          );
        })}
      </div>
    </div>
  );
}

export default ExperienceShell;
