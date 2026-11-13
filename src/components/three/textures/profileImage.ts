/**
 * The real profile photo (artifact `this.img.ivo`, line 646:
 * `/_blob/7ebb6b24a...` → mapped in `docs/reference/artifact-a/README.md`
 * to `public/profile/ivodev.jpeg`), loaded once and shared between every
 * canvas that draws it (the Mac's `prof` screen, the ID badge's front
 * face) — same singleton pattern as `getMaterialRegistry()`.
 *
 * Uses the optimized `public/media/profile/ivodev-640.webp` M2 already
 * generated, not the original unoptimized JPEG — WebP decodes inside a
 * canvas with the same broad support `<img>` has, with no format-fallback
 * logic needed the way AVIF-in-canvas would want.
 *
 * Loads asynchronously; callers that already drew a no-photo fallback
 * subscribe here to redraw once it's ready (artifact `_onImg`, line 655:
 * `this._macKey = ''; this._phKey = ''` on load, forcing a redraw).
 */

let image: HTMLImageElement | null = null;
let loading = false;
const listeners = new Set<() => void>();

export function getProfileImage(): HTMLImageElement | null {
  if (!image && !loading && typeof window !== "undefined") {
    loading = true;
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      image = img;
      listeners.forEach((listener) => listener());
    };
    img.src = "/media/profile/ivodev-640.webp";
  }
  return image;
}

/** Notifies `listener` once, the first time the image finishes loading — never again after. Callers fold `getProfileImage() !== null` into their own redraw key; this just tells them when to re-check it. */
export function subscribeProfileImage(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
