import type { Metadata } from "next";
import { SITE, SITE_URL } from "@/config/site";

/**
 * Metadata shared between `layout.tsx` (the root default) and
 * `projects/[id]`'s own `generateMetadata` (plan §5.2). `openGraph.images`
 * / `twitter.images` are deliberately absent here — Next auto-detects the
 * sibling `opengraph-image.tsx` file in each segment and wires it in on
 * its own, no manual `images` array needed.
 */
export const SITE_TITLE_TEMPLATE = "%s · Ivo Zanacchi";
export const SITE_DEFAULT_TITLE = `${SITE.name} · ${SITE.role}`;

/** The hero chapter's own already-approved copy (`content/chapters.ts`'s `hero.lead`) — reused here instead of writing a second, separate description. */
export const SITE_DESCRIPTION = "Desarrollo aplicaciones web de punta a punta: interfaces en React y Next.js con TypeScript, APIs en FastAPI y Node.js, bases de datos y despliegue con Docker y CI/CD.";

export const baseOpenGraph: Metadata["openGraph"] = {
  locale: "es_AR",
  alternateLocale: ["en_US"],
  siteName: SITE.name,
};

export const baseTwitter: Metadata["twitter"] = {
  card: "summary_large_image",
};

export const rootMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_DEFAULT_TITLE, template: SITE_TITLE_TEMPLATE },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { ...baseOpenGraph, type: "profile", url: "/", title: SITE_DEFAULT_TITLE, description: SITE_DESCRIPTION },
  twitter: { ...baseTwitter, title: SITE_DEFAULT_TITLE, description: SITE_DESCRIPTION },
  robots: { index: true, follow: true },
};
