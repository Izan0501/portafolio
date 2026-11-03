import type { Locale } from "@/i18n/config";

/**
 * Structural contract for the new content layer (M1 of IMPLEMENTATION_PLAN.md).
 *
 * Deliberately independent of `src/data/projects.ts` (the legacy data file kept
 * alive for the components that still import it, see its own `@deprecated`
 * note). Nothing here imports a legacy *type* — only `content/projects.ts`
 * reads the legacy *values* at module load, so this file stays the single
 * source of truth once M16 deletes the legacy one.
 */

/** Every piece of copy lives here in both locales — no silent English fallback. */
export type Localized<T> = Record<Locale, T>;

export type ChapterId =
  | "hero"
  | "open"
  | "prof"
  | "cert"
  | "dive"
  | "nave"
  | "vee"
  | "est"
  | "mel"
  | "con"
  | "pipe"
  | "cta";

/** One chapter's scroll range, in screens (`p = scrollTop / innerHeight`). */
export interface ChapterRange {
  id: ChapterId;
  /** Start, in screens. */
  a: number;
  /** End, in screens. */
  b: number;
  label: string;
  /** Two-digit index as shown in the artifact's eyebrow ('00'..'11'). */
  n: string;
}

export type ProjectStatus = "PROD" | "DEV";

export interface GalleryGroup {
  id: string;
  label: Localized<string>;
}

export interface GalleryImageContent {
  src: string;
  alt: Localized<string>;
  caption: Localized<string>;
  specs: Localized<string[]>;
  group?: GalleryGroup;
  fit?: "cover" | "contain";
}

/** A labelled point on a screenshot, `u`/`v` in `[0, 1]` (horizontal/vertical). */
export interface Hotspot {
  u: number;
  v: number;
  label: Localized<string>;
  sub: Localized<string>;
}

/**
 * One of the three screenshots per project that the 3D showcase frames and
 * annotates (ported 1:1 from the artifact's `this.SHOTS`). `src` matches a
 * `gallery[].src` for the same project — metadata (alt/caption/specs) is not
 * duplicated here, it stays in `gallery`.
 */
export interface ShowcaseShot {
  src: string;
  /** Dynamic Island label/sub shown while this shot is framed (artifact `isl`). */
  islandLabel: Localized<string>;
  islandSub: Localized<string>;
  hotspots: Hotspot[];
}

/**
 * A project, as the new content layer exposes it: everything the legacy
 * `Project` type had **except `latency`** (plan finding A2 — no fabricated
 * metric), plus `solution` and `showcase`, both ported from the artifact.
 */
export interface ProjectContent {
  id: string;
  index: string;
  title: string;
  status: ProjectStatus;
  statusLabel: Localized<string>;
  architecture: Localized<string>;
  stack: string[];
  location: Localized<string>;
  heroImage: string;
  scope: Localized<string>;
  challenge: Localized<string>;
  /** The artifact's "La solución: …" paragraph — not present in the legacy data file. */
  solution: Localized<string>;
  objectives: Localized<string[]>;
  gallery: GalleryImageContent[];
  showcase: ShowcaseShot[];
  liveUrl?: string;
}

/** A single CTA: internal scroll target (a chapter) XOR an external href. */
export interface ChapterCta {
  label: Localized<string>;
  targetChapter?: ChapterId;
  href?: string;
}

/** Narrative chapters carry their own copy; project chapters point at `content/projects.ts`. */
export interface NarrativeChapterCopy {
  kind: "narrative";
  id: ChapterId;
  eyebrowIndex: string;
  eyebrowLabel: Localized<string>;
  headingLevel: "h1" | "h2";
  heading: Localized<string>;
  lead: Localized<string>;
  trust?: Localized<string[]>;
  /** The "Ver detalle" expandable paragraph(s). */
  detail?: Localized<string>[];
  team?: Localized<string>;
  facts?: { value: string; label: Localized<string> }[];
  education?: {
    code: string;
    degree: Localized<string>;
    institution: string;
    period: Localized<string>;
  }[];
  steps?: { index: string; title: Localized<string>; detail: Localized<string> }[];
  ctas?: ChapterCta[];
}

export interface ProjectChapterCopy {
  kind: "project";
  id: ChapterId;
  /** 'P/01'..'P/05' — the status word itself comes from `ProjectContent.statusLabel`. */
  eyebrowIndex: string;
  projectId: string;
}

export type ChapterCopy = NarrativeChapterCopy | ProjectChapterCopy;

export interface Credential {
  id: "fullstack" | "python" | "mobile" | "javascript" | "cybersecurity";
  image: string;
  /** Real intrinsic pixel dimensions (CLAUDE.md rule 3 — bounding box). */
  width: number;
  height: number;
  tag: string;
  title: string;
  issuer: string;
  /** The company that certifies/sponsors the course — empty when the artifact has none. */
  certifiedBy?: string;
  hours?: number;
  weeks?: number;
  /** ISO date, mechanically derived from `dateLabel` — never fabricated. */
  date?: string;
  /** The real date string as the artifact shows it. */
  dateLabel?: string;
  /** Only `fullstack` has this — a curriculum list instead of hours/date. */
  curriculum?: string[];
  top10: boolean;
}
