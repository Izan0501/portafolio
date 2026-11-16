import type { Dictionary } from "./en";

/**
 * Spanish dictionary. Typed as `Dictionary`, so TypeScript fails the build if a
 * key drifts from `en.ts` — there is no silent runtime fallback.
 *
 * M16: the legacy `hero`/`stack`/`systems`/`pipeline` namespaces (the
 * old cyberpunk hero/toolchain/systems/pipeline sections) were removed
 * here along with the components that read them — the 3D recorrido's
 * own copy lives in `content/chapters.ts`/`content/projects.ts` instead,
 * not in this dictionary.
 */
export const es: Dictionary = {

  // ── ProjectDetail ─────────────────────────────────────────────────────────
  // M11: replaces the legacy `projectDetail` namespace (cyberpunk tone,
  // included a `latencyProbe` string for the metric the plan already
  // dropped as unverifiable) — no translation reused from it.
  projectView: {
    back: "← Volver al recorrido",
    live: "EN VIVO",
    inDevelopment: "EN DESARROLLO",
    challengeHeading: "El desafío",
    solutionHeading: "La solución",
    stackHeading: "Stack",
    galleryHeading: "Capturas",
    viewLive: "Ver en vivo",
  },

  // ── Contact chapter (M12) ─────────────────────────────────────────────────
  contact: {
    downloadCv: "Descargar CV",
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  // M12: replaces the legacy namespace (cyberpunk tone; a fabricated
  // "SALTA, AR" location — `config/site.ts`'s real one is Tucumán; dead
  // anchors to sections the recorrido no longer has; an unused WhatsApp
  // channel). No translation reused from it.
  footer: {
    availability: "Disponible para proyectos y para sumarme a equipos de producto.",
    channelsHeading: "Contacto",
    channels: {
      github: "GitHub",
      linkedin: "LinkedIn",
      email: "Email",
    },
    copyright: (year: number) => `© ${year} Ivo Zanacchi.`,
    builtWith: "Construido con Next.js, Motion y Tailwind CSS.",
  },
};
