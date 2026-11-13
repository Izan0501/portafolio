/**
 * Loads a project showcase screenshot as a real `HTMLImageElement`, for
 * `macbook/screens/shot.ts`/the iPhone's project screens to draw with
 * `ctx.drawImage` — same pattern as `profileImage.ts`/`credentialImages.ts`
 * (M9/M10), reading the optimized derivative M2 already generated
 * (`public/media/{path}-{size}.webp`) instead of the original.
 *
 * `showcase[].src` paths (from `content/projects.ts`) look like
 * `/projects/nave24stock/stock-dash.png` — the optimized derivative lives
 * at `/media/projects/nave24stock/stock-dash-{size}.webp`.
 */

const cache = new Map<string, HTMLImageElement>();
const loading = new Set<string>();
const listeners = new Map<string, Set<() => void>>();

function derivativePath(src: string, size: 640 | 1080 | 1600 | 2048): string {
  const lastSlash = src.lastIndexOf("/");
  const dir = src.slice(0, lastSlash);
  const baseName = src.slice(lastSlash + 1).replace(/\.(png|jpe?g)$/i, "");
  return `/media${dir}/${baseName}-${size}.webp`;
}

/** Starts loading (idempotent) and returns the current image — `null` until it decodes. Tier `L` (plan quality gate: "capturas nítidas en tier L") uses the 2048 derivative. */
export function getShowcaseImage(src: string, tier: "S" | "M" | "L" = "M"): HTMLImageElement | null {
  const existing = cache.get(src);
  if (existing) return existing;
  if (typeof window === "undefined" || loading.has(src)) return null;

  loading.add(src);
  const size = tier === "L" ? 2048 : tier === "M" ? 1600 : 1080;
  const img = new Image();
  img.decoding = "async";
  img.onload = () => {
    cache.set(src, img);
    loading.delete(src);
    listeners.get(src)?.forEach((listener) => listener());
    listeners.delete(src);
  };
  img.src = derivativePath(src, size);
  return null;
}

export function subscribeShowcaseImage(src: string, listener: () => void): () => void {
  let set = listeners.get(src);
  if (!set) {
    set = new Set();
    listeners.set(src, set);
  }
  set.add(listener);
  return () => set?.delete(listener);
}
