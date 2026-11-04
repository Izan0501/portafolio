import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  images: {
    // No remote hosts: FeaturedSystems.tsx's Unsplash background is a plain
    // CSS url(), never next/image, so it never needed remotePatterns in the
    // first place (plan finding A8). Every image this site serves is local.
    // AVIF first — Next negotiates by Accept header and falls back to WebP,
    // then the original, so this only ever helps. ~20-30% smaller than WebP
    // at equal quality on the photographic project screenshots this site serves.
    formats: ["image/avif", "image/webp"],
    // Every local project screenshot is a static, hash-free path committed to
    // git — the underlying pixels don't change without the filename changing
    // too. The 4-hour default forces needless re-optimization of the same
    // derivative; a long TTL lets the edge cache it for the life of the file.
    minimumCacheTTL: 31536000,
  },
};

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withAnalyzer(nextConfig);
