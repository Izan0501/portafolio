import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
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

export default nextConfig;
