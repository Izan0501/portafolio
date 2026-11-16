/**
 * English dictionary — the source of truth for the shape of every other locale.
 *
 * `Dictionary` is derived from this object (`typeof en`), so `es.ts` is checked
 * against it at compile time: a missing or misspelled key is a build error, not
 * a silent fallback to English at runtime.
 *
 * Values that interpolate runtime data are functions rather than templates with
 * placeholder tokens — that keeps interpolation type-safe and avoids a parser.
 */
export const en = {

  // ── ProjectDetail ─────────────────────────────────────────────────────────
  projectView: {
    back: "← Back to the recorrido",
    live: "LIVE",
    inDevelopment: "IN DEVELOPMENT",
    challengeHeading: "The challenge",
    solutionHeading: "The solution",
    stackHeading: "Stack",
    galleryHeading: "Screenshots",
    viewLive: "View live",
  },

  // ── Contact chapter (M12) ─────────────────────────────────────────────────
  contact: {
    downloadCv: "Download CV",
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  // M12: replaces the legacy namespace (cyberpunk tone; a fabricated
  // "SALTA, AR" location — `config/site.ts`'s real one is Tucumán; dead
  // anchors to sections the recorrido no longer has; an unused WhatsApp
  // channel). No translation reused from it.
  footer: {
    availability: "Available for projects and to join product teams.",
    channelsHeading: "Contact",
    channels: {
      github: "GitHub",
      linkedin: "LinkedIn",
      email: "Email",
    },
    copyright: (year: number) => `© ${year} Ivo Zanacchi.`,
    builtWith: "Built with Next.js, Motion and Tailwind CSS.",
  },
};

/** Structural contract every locale file must satisfy. */
export type Dictionary = typeof en;
