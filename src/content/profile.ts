import type { Localized } from "@/types/content";

/**
 * Ivo's profile data: role, education, career timeline, and the 4 stack
 * tiles — all ported 1:1 from the approved artifact
 * (`docs/reference/artifact-a/Hero.dc.html`): the cenital profile screen
 * (`_profile`, around line 1605), the career timeline (`const E`, line 1606),
 * and the stack tiles (`_buildTiles`'s `const D`, line 1027). English copy is
 * a faithful translation — the artifact itself is Spanish-only.
 */

export interface TimelineEntry {
  year: number;
  title: Localized<string>;
  sub: Localized<string>;
}

export interface StackTile {
  index: string;
  label: Localized<string>;
  /** Technology names — proper nouns, not localized. */
  items: string[];
}

export interface EducationEntry {
  code: string;
  institution: Localized<string>;
  degree: Localized<string>;
  period: Localized<string>;
}

export const PROFILE = {
  name: "Ivo Zanacchi",
  role: { es: "Full-Stack Developer", en: "Full-Stack Developer" } satisfies Localized<string>,
  location: { es: "Tucumán, Argentina", en: "Tucumán, Argentina" } satisfies Localized<string>,
  method: { es: "SDD + Agile", en: "SDD + Agile" } satisfies Localized<string>,
  availability: { es: "Disponible para equipos", en: "Available for teams" } satisfies Localized<string>,
  email: "ivozanacchi501@gmail.com",
  github: "https://github.com/Izan0501",
  githubLabel: "github.com/Izan0501",
  linkedin: "https://www.linkedin.com/in/ivo-zanacchi-87822326a",

  /** Chips under the profile heading — the 3rd one (SDD) renders emphasized in the artifact. */
  pillars: [
    { es: "CÓDIGO LIMPIO", en: "CLEAN CODE" },
    { es: "ARQUITECTURA ESCALABLE", en: "SCALABLE ARCHITECTURE" },
    { es: "SDD", en: "SDD", emphasis: true },
    { es: "CERO REGRESIONES", en: "ZERO REGRESSIONS" },
  ] satisfies (Localized<string> & { emphasis?: boolean })[],

  education: [
    {
      code: "UTN",
      institution: { es: "UTN · FR Tucumán", en: "UTN · Tucumán Regional Faculty" },
      degree: { es: "Técnico Universitario en Programación", en: "University Technician in Programming" },
      period: { es: "abr 2024 — feb 2027", en: "Apr 2024 — Feb 2027" },
    },
    {
      code: "UGR",
      institution: { es: "UGR", en: "UGR" },
      degree: { es: "Tecnicatura Universitaria en Ciberseguridad", en: "University Technical Degree in Cybersecurity" },
      period: { es: "mar 2026 — en curso", en: "Mar 2026 — ongoing" },
    },
  ] satisfies EducationEntry[],

  /** Career timeline (artifact `const E`) — real certifications and degree milestones, 2023-2027. */
  timeline: [
    { year: 2023, title: { es: "Ciberseguridad", en: "Cybersecurity" }, sub: { es: "Coderhouse · nov", en: "Coderhouse · Nov" } },
    { year: 2024, title: { es: "JavaScript · Apps TOP 10", en: "JavaScript · Apps TOP 10" }, sub: { es: "Coderhouse · UTN inicia", en: "Coderhouse · UTN starts" } },
    { year: 2025, title: { es: "Python", en: "Python" }, sub: { es: "Coderhouse · dic", en: "Coderhouse · Dec" } },
    { year: 2026, title: { es: "Ciberseguridad", en: "Cybersecurity" }, sub: { es: "UGR · en curso", en: "UGR · ongoing" } },
    { year: 2027, title: { es: "Técnico en Programación", en: "Technician in Programming" }, sub: { es: "UTN · meta feb", en: "UTN · Feb target" } },
  ] satisfies TimelineEntry[],

  /** The 4 stack tiles the Formation chapter flies in front of the Mac screen. */
  stackTiles: [
    { index: "01", label: { es: "FRONTEND", en: "FRONTEND" }, items: ["React · Vite", "TypeScript · Next.js", "Tailwind · Framer Motion"] },
    { index: "02", label: { es: "BACKEND", en: "BACKEND" }, items: ["Python · FastAPI", "Node.js · Express", "JWT · OAuth2"] },
    { index: "03", label: { es: "DATOS", en: "DATA" }, items: ["PostgreSQL · Supabase", "MySQL · MongoDB", "Firebase · Pinecone"] },
    { index: "04", label: { es: "ENTREGA", en: "DELIVERY" }, items: ["Docker · GitHub Actions", "VPS · Vercel", "Cloudflare"] },
  ] satisfies StackTile[],
} as const;
