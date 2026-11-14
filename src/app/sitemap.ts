import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/site";
import { PROJECTS } from "@/content/projects";

/**
 * Home + the 5 real projects (plan §5.2). `lastModified` uses the build's
 * own timestamp for every entry — `content/projects.ts` has no real
 * per-project "last edited" date (confirmed: no `updatedAt`/`date` field
 * exists there), and inventing one would be exactly the kind of
 * unverifiable fact this whole project's "cero datos inventados" rule
 * forbids. The build time is still a true fact about the page, just a
 * coarser one than a real content-edit date would be.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: SITE_URL, lastModified: now, changeFrequency: "monthly", priority: 1 },
    ...PROJECTS.map((project) => ({
      url: `${SITE_URL}/projects/${project.id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
