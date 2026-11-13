import type { ChapterCopy, ChapterId } from "@/types/content";

/**
 * Copy for the 12 chapters, ported 1:1 from the approved artifact
 * (`docs/reference/artifact-a/Hero.dc.html`, the `<section id="iz-t0">`..
 * `<section id="iz-t11">` markup, lines 168-316 of the v19 export). Spanish
 * text is copied verbatim; English is a faithful translation — the artifact
 * itself only ships Spanish.
 *
 * Project chapters (`nave`/`vee`/`est`/`mel`/`con`) carry no copy of their
 * own: their eyebrow/heading/meta/challenge/solution/stack already live in
 * `content/projects.ts`, keyed by `projectId` — duplicating them here would
 * create two sources of truth for the same fact.
 *
 * Internal CTAs reference a `targetChapter` (a `ChapterId`) rather than a
 * DOM anchor — the artifact's `#iz-s5`-style hrefs are wiring for its own
 * canvas, not a content fact; M4 decides how scrolling to a chapter actually
 * works.
 */
export const CHAPTERS: Record<ChapterId, ChapterCopy> = {
  hero: {
    kind: "narrative",
    id: "hero",
    eyebrowIndex: "00",
    eyebrowLabel: {
      es: "Ivo Zanacchi · Full-Stack Developer · Tucumán, AR",
      en: "Ivo Zanacchi · Full-Stack Developer · Tucumán, AR",
    },
    headingLevel: "h1",
    heading: {
      es: "Sistemas que llegan enteros a producción.",
      en: "Systems that reach production whole.",
    },
    lead: {
      es: "Desarrollo aplicaciones web de punta a punta: interfaces en React y Next.js con TypeScript, APIs en FastAPI y Node.js, bases de datos y despliegue con Docker y CI/CD.",
      en: "I build web applications end to end: interfaces in React and Next.js with TypeScript, APIs in FastAPI and Node.js, databases, and deployment with Docker and CI/CD.",
    },
    trust: {
      es: ["Spec antes del código", "CI en cada push", "Deploy verificado"],
      en: ["Spec before code", "CI on every push", "Verified deploy"],
    },
    ctas: [
      { label: { es: "Ver proyectos", en: "View projects" }, targetChapter: "dive" },
      { label: { es: "Escribirme", en: "Email me" }, href: "mailto:ivozanacchi501@gmail.com" },
    ],
  },

  open: {
    kind: "narrative",
    id: "open",
    eyebrowIndex: "01",
    eyebrowLabel: { es: "Método", en: "Method" },
    headingLevel: "h2",
    heading: {
      es: "Primero la spec. Después el código.",
      en: "Spec first. Code after.",
    },
    lead: {
      es: "Cada proyecto arranca con una especificación acordada: estructura, datos y flujos definidos antes de programar. Así el resultado responde exactamente a lo pedido.",
      en: "Every project starts from an agreed specification: structure, data and flows defined before writing code. That way the result matches exactly what was asked for.",
    },
    detail: [
      {
        es: "Trabajo con Spec-Driven Development junto a Claude, MCP para el contexto vivo del proyecto y Skills como módulos de conocimiento reutilizables.",
        en: "I work with Spec-Driven Development alongside Claude, MCP for live project context, and Skills as reusable knowledge modules.",
      },
    ],
    trust: {
      es: ["Código limpio", "Arquitectura escalable", "Cero regresiones"],
      en: ["Clean code", "Scalable architecture", "Zero regressions"],
    },
  },

  prof: {
    kind: "narrative",
    id: "prof",
    eyebrowIndex: "02",
    eyebrowLabel: { es: "Perfil", en: "Profile" },
    headingLevel: "h2",
    heading: { es: "Quién está detrás.", en: "Who's behind this." },
    lead: {
      es: "Ivo Zanacchi, desarrollador Full-Stack. Construyo productos completos (frontend, backend y datos) y los dejo funcionando en producción con Docker y CI/CD.",
      en: "Ivo Zanacchi, Full-Stack developer. I build complete products (frontend, backend and data) and ship them running in production with Docker and CI/CD.",
    },
    facts: [
      { value: "5", label: { es: "sistemas reales", en: "real systems" } },
      { value: "2", label: { es: "en producción", en: "in production" } },
      { value: "5", label: { es: "certificaciones", en: "certifications" } },
      { value: "2", label: { es: "carreras · UTN · UGR", en: "degrees · UTN · UGR" } },
    ],
    detail: [
      {
        es: "Stack: React/Vite, TypeScript, Next.js y Tailwind · Python (FastAPI) y Node.js/Express · PostgreSQL/Supabase, MySQL, MongoDB, Firebase y Pinecone · Docker, GitHub Actions, VPS, Vercel y Cloudflare.",
        en: "Stack: React/Vite, TypeScript, Next.js and Tailwind · Python (FastAPI) and Node.js/Express · PostgreSQL/Supabase, MySQL, MongoDB, Firebase and Pinecone · Docker, GitHub Actions, VPS, Vercel and Cloudflare.",
      },
    ],
    team: {
      es: "En equipo: sprint planning, dailies, refinamiento de backlog, retrospectivas y comunicación asíncrona.",
      en: "On a team: sprint planning, dailies, backlog grooming, retrospectives and async communication.",
    },
    // Same 5 real milestones the Mac screen draws (M9, `macbook/screens/profile.ts`'s `TIMELINE`) — kept here too so they're indexable, not only visible inside the aria-hidden canvas.
    timeline: [
      { year: 2023, title: { es: "Ciberseguridad", en: "Cybersecurity" }, detail: { es: "Coderhouse · nov", en: "Coderhouse · nov" } },
      { year: 2024, title: { es: "JavaScript · Apps TOP 10", en: "JavaScript · Top 10 Apps" }, detail: { es: "Coderhouse · UTN inicia", en: "Coderhouse · UTN starts" } },
      { year: 2025, title: { es: "Python", en: "Python" }, detail: { es: "Coderhouse · dic", en: "Coderhouse · dec" } },
      { year: 2026, title: { es: "Ciberseguridad", en: "Cybersecurity" }, detail: { es: "UGR · en curso", en: "UGR · ongoing" } },
      { year: 2027, title: { es: "Técnico en Programación", en: "Programming Technician" }, detail: { es: "UTN · meta feb", en: "UTN · target feb" } },
    ],
  },

  cert: {
    kind: "narrative",
    id: "cert",
    eyebrowIndex: "03",
    eyebrowLabel: { es: "Formación", en: "Formation" },
    headingLevel: "h2",
    heading: {
      es: "Formación que respalda cada entrega.",
      en: "Formal training behind every delivery.",
    },
    lead: {
      es: "Dos carreras universitarias y cinco certificaciones verificables.",
      en: "Two university degrees and five verifiable certifications.",
    },
    education: [
      {
        code: "UTN",
        institution: "FR Tucumán",
        degree: { es: "Técnico Universitario en Programación", en: "University Technician in Programming" },
        period: { es: "abr 2024 – feb 2027", en: "Apr 2024 – Feb 2027" },
      },
      {
        code: "UGR",
        institution: "",
        degree: { es: "Tecnicatura Universitaria en Ciberseguridad", en: "University Technical Degree in Cybersecurity" },
        period: { es: "mar 2026 – en curso", en: "Mar 2026 – ongoing" },
      },
    ],
  },

  dive: {
    kind: "narrative",
    id: "dive",
    eyebrowIndex: "04",
    eyebrowLabel: { es: "Proyectos", en: "Projects" },
    headingLevel: "h2",
    heading: { es: "Proyectos reales, pantallas reales.", en: "Real projects, real screens." },
    lead: {
      es: "Cinco sistemas: dos en producción y tres en desarrollo, cada uno con sus capturas reales.",
      en: "Five systems: two in production and three in development, each with its real screenshots.",
    },
  },

  // ── Project chapters — copy lives in content/projects.ts, keyed by projectId ──
  nave: { kind: "project", id: "nave", eyebrowIndex: "P/01", projectId: "nave24-stock" },
  vee: { kind: "project", id: "vee", eyebrowIndex: "P/02", projectId: "veebot-saas" },
  est: { kind: "project", id: "est", eyebrowIndex: "P/03", projectId: "estudio-zanacchi" },
  mel: { kind: "project", id: "mel", eyebrowIndex: "P/04", projectId: "portafolio-mel" },
  con: { kind: "project", id: "con", eyebrowIndex: "P/05", projectId: "consultorio-odontologico" },

  pipe: {
    kind: "narrative",
    id: "pipe",
    eyebrowIndex: "10",
    eyebrowLabel: { es: "Garantías", en: "Guarantees" },
    headingLevel: "h2",
    heading: { es: "Cómo aseguro cada entrega.", en: "How I guarantee every delivery." },
    lead: {
      es: "Un proceso fijo, de la especificación al deploy, para que cada entrega llegue estable a producción.",
      en: "A fixed process, from spec to deploy, so every delivery reaches production stable.",
    },
    steps: [
      {
        index: "01",
        title: { es: "Especificación", en: "Specification" },
        detail: { es: "alcance, datos y flujos acordados antes de programar", en: "scope, data and flows agreed before coding" },
      },
      {
        index: "02",
        title: { es: "Seguridad", en: "Security" },
        detail: { es: "autenticación JWT/OAuth2 con rotación de tokens y revisión manual", en: "JWT/OAuth2 authentication with token rotation and manual review" },
      },
      {
        index: "03",
        title: { es: "Contenedores", en: "Containers" },
        detail: { es: "Docker multi-etapa: el mismo build en desarrollo y en producción", en: "multi-stage Docker: the same build in development and production" },
      },
      {
        index: "04",
        title: { es: "Integración continua", en: "Continuous integration" },
        detail: {
          es: "GitHub Actions corre build, type-check y lint en cada push, con QA manual antes de cada merge",
          en: "GitHub Actions runs build, type-check and lint on every push, with manual QA before every merge",
        },
      },
      {
        index: "05",
        title: { es: "Release", en: "Release" },
        detail: { es: "VPS con Docker o Vercel + Cloudflare, con verificación después de cada deploy", en: "VPS with Docker or Vercel + Cloudflare, with verification after every deploy" },
      },
    ],
  },

  cta: {
    kind: "narrative",
    id: "cta",
    eyebrowIndex: "11",
    eyebrowLabel: { es: "Contacto", en: "Contact" },
    headingLevel: "h2",
    heading: { es: "¿Armamos el próximo sistema?", en: "Shall we build the next system?" },
    lead: {
      es: "Disponible para proyectos y para sumarme a equipos de producto. Contame qué necesitás y te propongo un alcance claro, con etapas y entregables.",
      en: "Available for projects and to join product teams. Tell me what you need and I'll propose a clear scope, with stages and deliverables.",
    },
    ctas: [
      { label: { es: "ivozanacchi501@gmail.com", en: "ivozanacchi501@gmail.com" }, href: "mailto:ivozanacchi501@gmail.com" },
      { label: { es: "LinkedIn", en: "LinkedIn" }, href: "https://www.linkedin.com/in/ivo-zanacchi-87822326a" },
      { label: { es: "GitHub", en: "GitHub" }, href: "https://github.com/Izan0501" },
    ],
  },
};

export function getChapterCopy(id: ChapterId): ChapterCopy {
  return CHAPTERS[id];
}
