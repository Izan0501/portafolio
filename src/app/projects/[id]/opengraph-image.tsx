import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { PROJECTS, getProjectContent } from "@/content/projects";
import { DEFAULT_LOCALE } from "@/i18n/config";
import { mediaDerivativePath } from "@/lib/media";

/**
 * Without its own `generateStaticParams`, Next doesn't reuse `page.tsx`'s
 * one for this sibling special file — confirmed in practice: the first
 * build of this route came out as `ƒ /projects/-/opengraph-image`
 * (a single dynamic, on-demand route), not 5 real pre-rendered images.
 */
export function generateStaticParams() {
  return PROJECTS.map((project) => ({ id: project.id }));
}

/**
 * Per-project dynamic OG image (plan §5.2) — same palette as the home OG,
 * over the project's own real `heroImage`, read from its M2-optimized
 * 2048px derivative in `public/media/**` (the only copy left once M16
 * removes the original, unoptimized `public/projects/**`) with a dark
 * overlay for text legibility. `params` arrives as a `Promise` here —
 * confirmed as a real Next 16 breaking change in `docs/next16-notes.md`
 * §5, not assumed from the v15 (synchronous) signature.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = getProjectContent(id);
  if (!project) notFound();

  const imageBuffer = await readFile(join(process.cwd(), "public", mediaDerivativePath(project.heroImage, 2048)));
  const imageDataUrl = `data:image/png;base64,${imageBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "72px",
          backgroundColor: "#0D0C0A",
          backgroundImage: `linear-gradient(to bottom, rgba(13,12,10,0.25), rgba(13,12,10,0.92)), url(${imageDataUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Satori (next/og's renderer) requires an explicit `display` on
            any element with more than one child node — `{a} · {b}` is 2
            text nodes, not 1, so this needs its own `display: flex`
            (confirmed by a real build failure before adding it). */}
        <div style={{ display: "flex", fontSize: 24, color: "#E6D84A", fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>
          {project.index} · {project.statusLabel[DEFAULT_LOCALE]}
        </div>
        <div style={{ fontSize: 72, fontWeight: 800, color: "#EEE9DF", letterSpacing: -1.5, lineHeight: 1.02 }}>{project.title}</div>
        <div style={{ fontSize: 28, color: "#A39C8F", marginTop: 18, maxWidth: 980 }}>{project.scope[DEFAULT_LOCALE]}</div>
      </div>
    ),
    { ...size },
  );
}
