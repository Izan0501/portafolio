/**
 * Converts an original asset path (`/projects/nave24stock/stock-back.png`,
 * still used as the *identifier* in `content/projectsData.ts`/`credentials.ts`)
 * to its optimized derivative in `public/media/**` (M2's sharp pipeline) —
 * the only copy that still exists once M16 removes the original,
 * unoptimized `public/projects/**`/`public/profile/ivodev.jpeg` files.
 *
 * Same transform `showcaseImages.ts` (M11) already does for canvas
 * textures, pulled out here so `lib/seo/jsonld.ts` and
 * `app/projects/[id]/opengraph-image.tsx` (M15, both written before this
 * file existed) don't each re-derive it.
 */
export function mediaDerivativePath(src: string, size: 640 | 1080 | 1600 | 2048 = 1600): string {
  const lastSlash = src.lastIndexOf("/");
  const dir = src.slice(0, lastSlash);
  const baseName = src.slice(lastSlash + 1).replace(/\.(png|jpe?g)$/i, "");
  return `/media${dir}/${baseName}-${size}.webp`;
}
