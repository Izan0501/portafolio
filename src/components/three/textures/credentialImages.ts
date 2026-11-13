import * as THREE from "three";
import type { Credential } from "@/types/content";

/**
 * Loads the real certification images for the 3D cert plates — artifact
 * `_onImg` (line 842): `new T2.Texture(im)`, a direct image texture, not
 * a `CanvasTexture` with `drawImage` (unlike the profile photo/badge,
 * M9). Each plate shows the real credential image verbatim.
 *
 * Reads the optimized derivative M2 already generated
 * (`public/media/projects/certifications/{name}-{size}.webp`) instead of
 * the original — derived from each `Credential.image` path rather than a
 * separate id→filename map that could drift out of sync with
 * `content/credentials.ts`. `python`'s original (1280×914) is small
 * enough that M2 never generated a 1600 variant for it — every other
 * credential uses 1600, `python` uses 1080.
 */

function derivativePath(credential: Credential): string {
  const baseName = credential.image.split("/").pop()!.replace(/\.(png|jpe?g)$/i, "");
  const size = credential.id === "python" ? 1080 : 1600;
  return `/media/projects/certifications/${baseName}-${size}.webp`;
}

export interface CredentialTexture {
  texture: THREE.Texture;
  /** The raw decoded image — `macbook/screens/certv.ts`/`iphone-island/screens/case.ts` draw it directly into a 2D canvas (`ctx.drawImage`), which needs the `HTMLImageElement` itself, not the `THREE.Texture` wrapping it. */
  image: HTMLImageElement;
  /** `height / width` — needed once the image decodes, to size the plate's face plane correctly. */
  aspect: number;
}

const cache = new Map<string, CredentialTexture>();
const listeners = new Map<string, Set<() => void>>();

/** Starts loading (idempotent) and returns the current state — `null` until the image decodes. Call `subscribeCredentialImage` to redraw once it's ready. */
export function getCredentialTexture(credential: Credential): CredentialTexture | null {
  const existing = cache.get(credential.id);
  if (existing) return existing;
  if (typeof window === "undefined" || listeners.has(credential.id)) return null;

  listeners.set(credential.id, new Set());
  const img = new Image();
  img.decoding = "async";
  img.onload = () => {
    const texture = new THREE.Texture(img);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
    const entry: CredentialTexture = { texture, image: img, aspect: img.naturalHeight / img.naturalWidth };
    cache.set(credential.id, entry);
    listeners.get(credential.id)?.forEach((listener) => listener());
    listeners.delete(credential.id);
  };
  img.src = derivativePath(credential);
  return null;
}

export function subscribeCredentialImage(credentialId: string, listener: () => void): () => void {
  const set = listeners.get(credentialId);
  if (!set) return () => {};
  set.add(listener);
  return () => set.delete(listener);
}
