import type * as THREE from "three";

/**
 * Full GPU resource teardown for a scene, ported from plan §2.3 "Limpieza":
 * `geometry.dispose()`, `material.dispose()`, every texture slot a material
 * might carry, `renderer.renderLists.dispose()`. Nothing here is optional —
 * three.js never frees GPU memory on its own when a mesh is unmounted, only
 * when `.dispose()` is called explicitly.
 *
 * Pure, no React — safe to call from a `useEffect` cleanup (`Stage.tsx`) or
 * a route change, and safe to call twice (every `.dispose()` is idempotent).
 */

/** Every texture-valued slot three.js materials expose — disposed if present, skipped if not (most materials only set a few). */
const TEXTURE_KEYS = [
  "map",
  "alphaMap",
  "aoMap",
  "bumpMap",
  "displacementMap",
  "emissiveMap",
  "envMap",
  "gradientMap",
  "lightMap",
  "metalnessMap",
  "normalMap",
  "roughnessMap",
  "specularMap",
  "clearcoatMap",
  "clearcoatNormalMap",
  "clearcoatRoughnessMap",
  "sheenColorMap",
  "sheenRoughnessMap",
  "transmissionMap",
  "thicknessMap",
] as const;

function disposeMaterial(material: THREE.Material): void {
  for (const key of TEXTURE_KEYS) {
    const value = (material as unknown as Record<string, unknown>)[key];
    if (value && typeof value === "object" && "dispose" in value && typeof value.dispose === "function") {
      value.dispose();
    }
  }
  material.dispose();
}

/** Disposes every geometry and material (and their textures) under `root`, walking the full subtree. */
export function disposeObject3D(root: THREE.Object3D): void {
  root.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }
    const material = (node as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(material)) {
      material.forEach(disposeMaterial);
    } else if (material) {
      disposeMaterial(material);
    }
  });
}

/**
 * Disposes a renderer's own state in addition to a scene's objects — the
 * render-list cache (`renderLists`) and, when passed, the PMREM-generated
 * environment texture (`Environment.tsx`'s procedural softbox map), which
 * `scene.environment` references but `disposeObject3D` never walks into
 * (it isn't part of the object graph).
 */
export function disposeRenderer(renderer: THREE.WebGLRenderer, environmentTexture?: THREE.Texture | null): void {
  renderer.renderLists.dispose();
  environmentTexture?.dispose();
}
