import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";
import { securityHeaders } from "@/lib/security/headers";

const nextConfig: NextConfig = {
  images: {
    // No remote hosts: every image this site serves is local (M14 removed
    // FeaturedSystems.tsx's last remaining remote one, an Unsplash
    // background — plan §5.1: "sin dominios de terceros en runtime", and
    // img-src in the CSP below doesn't allow any). AVIF first — Next
    // negotiates by Accept header and falls back to WebP, then the
    // original, so this only ever helps. ~20-30% smaller than WebP at
    // equal quality on the photographic project screenshots this site serves.
    formats: ["image/avif", "image/webp"],
    // Every local project screenshot is a static, hash-free path committed to
    // git — the underlying pixels don't change without the filename changing
    // too. The 4-hour default forces needless re-optimization of the same
    // derivative; a long TTL lets the edge cache it for the life of the file.
    minimumCacheTTL: 31536000,
  },
  // M14 (plan §5.1): static via `headers()`, not a `proxy.ts` — a nonce
  // would force `/` and `/projects/[id]` into dynamic rendering for no
  // real benefit here (Ivo's call, `docs/next16-notes.md` §2), so there's
  // no per-request value this actually needs a proxy for.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders(process.env.NODE_ENV === "development"),
      },
    ];
  },
};

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withAnalyzer(nextConfig);
