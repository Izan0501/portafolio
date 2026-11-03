/**
 * Site-wide identity and the `SITE_URL` resolution order confirmed in
 * IMPLEMENTATION_PLAN.md §0.1-2:
 *
 *   1. `NEXT_PUBLIC_SITE_URL`                        — a future custom domain
 *   2. `https://${VERCEL_PROJECT_PRODUCTION_URL}`     — Vercel's own production URL
 *   3. `http://localhost:3000`                        — local dev fallback
 *
 * When a custom domain exists, only `NEXT_PUBLIC_SITE_URL` needs to change —
 * no code here changes with it. `VERCEL_PROJECT_PRODUCTION_URL` is a Vercel
 * system env var (no scheme, e.g. `my-app.vercel.app`), hence the `https://`
 * prefix only on that branch.
 */
function resolveSiteUrl(): string {
  const custom = process.env.NEXT_PUBLIC_SITE_URL;
  if (custom) return custom;

  const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProductionUrl) return `https://${vercelProductionUrl}`;

  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();

export const SITE = {
  name: "Ivo Zanacchi",
  /** Confirmed role (plan §0.1-1 / §3) — never "DevOps" or "DevSecOps" in a title. */
  role: "Full-Stack Developer",
  locationLabel: "Tucumán, Argentina",
  email: "ivozanacchi501@gmail.com",
  /** `rel="me"`/JSON-LD `sameAs` profiles — real accounts only. */
  sameAs: ["https://www.linkedin.com/in/ivo-zanacchi-87822326a", "https://github.com/Izan0501"] as const,
  linkedin: "https://www.linkedin.com/in/ivo-zanacchi-87822326a",
  github: "https://github.com/Izan0501",
} as const;
