/**
 * Fallback shown while the 3D chunk loads (`next/dynamic`'s `loading`) and,
 * inside the canvas tree, while anything inside it suspends.
 *
 * Plan §2.1 describes this as "una imagen AVIF de la Mac cerrada vista
 * desde arriba (el primer frame del hero)" — that export doesn't exist yet
 * (M2's report: there's no MacBook render to take it from until M6 builds
 * the real geometry; see `scripts/optimize-assets.mjs`'s own note).
 * Shipping a placeholder photo instead would be a fabricated asset, so this
 * is a flat `grafito` fill instead — the same colour the stage sits on
 * either way, so there's no flash when the canvas actually mounts over it.
 * M6 swaps this for the real AVIF once it exists.
 */
export function StagePoster() {
  return <div className="absolute inset-0 bg-grafito" aria-hidden="true" />;
}

export default StagePoster;
