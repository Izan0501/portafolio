import type { ChapterRange } from "@/types/content";

/**
 * Chapter/scroll constants, ported 1:1 from the approved artifact
 * (`docs/reference/artifact-a/Hero.dc.html`, `this.CH` / `this.PMAX` / `this.NAV` /
 * `this.NAVCH`, lines 348-364 of the v19 export). Every number here is copied
 * from that source, not re-derived — M4+ consumes these instead of re-reading
 * the artifact.
 */

/** Total scroll length, in screens (`p = scrollTop / innerHeight`). */
export const PMAX = 16.7;

/** The 12 chapters, in scroll order. `a`/`b` are the start/end of each range. */
export const CH: readonly ChapterRange[] = [
  { id: "hero", a: 0.0, b: 0.8, label: "Inicio", n: "00" },
  { id: "open", a: 0.8, b: 1.8, label: "Método", n: "01" },
  { id: "prof", a: 1.8, b: 3.4, label: "Perfil", n: "02" },
  { id: "cert", a: 3.4, b: 6.6, label: "Formación", n: "03" },
  { id: "dive", a: 6.6, b: 7.1, label: "Proyectos", n: "04" },
  { id: "nave", a: 7.1, b: 8.6, label: "Nave24 Stock", n: "05" },
  { id: "vee", a: 8.6, b: 10.1, label: "VeeBot SaaS", n: "06" },
  { id: "est", a: 10.1, b: 11.6, label: "Estudio Zanacchi", n: "07" },
  { id: "mel", a: 11.6, b: 13.1, label: "Portafolio Mel", n: "08" },
  { id: "con", a: 13.1, b: 14.6, label: "Consultorio", n: "09" },
  { id: "pipe", a: 14.6, b: 15.8, label: "Garantías", n: "10" },
  { id: "cta", a: 15.8, b: 16.7, label: "Contacto", n: "11" },
] as const;

/**
 * Every teleport target the artifact's `go0..go9` functions scroll to
 * (`this.NAV`), paired with the `CH` index it lands on (`this.NAVCH`). Only 5
 * of these are wired to a visible Dynamic Island link (`NAV_LINKS` below) —
 * the rest are kept because they are real values from the source, not because
 * every one is reachable from the current UI.
 */
export const NAV_TELEPORT: readonly number[] = [0, 2.0, 3.5, 7.2, 8.7, 10.2, 11.7, 13.2, 14.75, 16.7] as const;
export const NAV_TELEPORT_CHAPTER_INDEX: readonly number[] = [0, 2, 3, 5, 6, 7, 8, 9, 10, 11] as const;

/**
 * The 5 links the Dynamic Island actually renders (plan Anexo A + artifact's
 * `<ul class="iz-isl-row">`: Inicio/Perfil/Formación/Proyectos/Contacto).
 * `p` is the scroll position each link's `go*` handler teleports to.
 */
export const NAV_LINKS: readonly { chapterId: ChapterRange["id"]; p: number }[] = [
  { chapterId: "hero", p: 0 },
  { chapterId: "prof", p: 2.0 },
  { chapterId: "cert", p: 3.5 },
  { chapterId: "dive", p: 7.2 },
  { chapterId: "cta", p: 16.7 },
] as const;

/**
 * Dynamic Island behaviour thresholds (artifact `this.isl`, README diffs §).
 * Placed here rather than in a future `features/` module because both are
 * read against the same `p`/direction this file already describes — M7 is
 * free to relocate them if the isla's own module ends up needing a home.
 */
export const ISLAND_DIRECTION_THRESHOLD = 0.05;
export const ISLAND_AUTO_OPEN_P = 0.12;
