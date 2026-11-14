import { ImageResponse } from "next/og";
import { SITE } from "@/config/site";
import { SITE_DESCRIPTION } from "@/lib/seo/metadata";

/**
 * Home's dynamic OG image (plan §5.2) — grafito/limón palette, `next/og`'s
 * `ImageResponse`, 1200×630. No fonts loaded (`next/og` defaults to a
 * system sans) — this project's real Schibsted Grotesk/Martian Mono are
 * `next/font` variable fonts, not simple files `ImageResponse` can fetch
 * the same way; matching the exact typeface here isn't worth the added
 * fetch, and the palette/layout alone already reads as this site's.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#0D0C0A",
          backgroundImage: "radial-gradient(circle at 15% 15%, rgba(230,216,74,0.08), transparent 55%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#E6D84A" }} />
          <div style={{ fontSize: 22, color: "#A39C8F", letterSpacing: 2 }}>{SITE.locationLabel.toUpperCase()}</div>
        </div>
        <div style={{ fontSize: 88, fontWeight: 800, color: "#EEE9DF", letterSpacing: -2, lineHeight: 1 }}>{SITE.name}</div>
        <div style={{ fontSize: 40, fontWeight: 600, color: "#E6D84A", marginTop: 12 }}>{SITE.role}</div>
        <div style={{ fontSize: 26, color: "#A39C8F", marginTop: 28, maxWidth: 920, lineHeight: 1.4 }}>{SITE_DESCRIPTION}</div>
      </div>
    ),
    { ...size },
  );
}
