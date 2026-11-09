import * as THREE from "three";

/**
 * Shared material registry (plan §2.3: "Materiales compartidos en un
 * registro: alu, aluD, key, ti, glass, leather, brass, lining, card,
 * lemon"), ported 1:1 from the approved artifact
 * (`docs/reference/artifact-a/Hero.dc.html`, `this.mat`, lines 603-618).
 *
 * One instance per material, shared across every mesh that uses it — not
 * one per mesh. Created lazily (`getMaterialRegistry()`), not at module
 * load: materials must be constructed after a WebGL context exists, and
 * this file is imported from both server and client code paths before
 * `Stage`'s Canvas ever mounts.
 *
 * Only the materials M6 (MacBook) actually uses are built so far — `ti`
 * (iPhone titanium), `leather`/`brass`/`lining` (briefcase), `card`
 * (cert plates/stack tiles) and `lemon` (accents) are real values already
 * verified against the artifact, filled in as M7/M9/M10 need them rather
 * than guessed now.
 */
export interface MaterialRegistry {
  /** Aluminum — chassis, trackpad bezel. #C2C8CC metalness 1 roughness 0.30. */
  alu: THREE.MeshStandardMaterial;
  /** Darker aluminum — trackpad surface, hinge barrel. #8E9290 metalness 1 roughness 0.25. */
  aluD: THREE.MeshStandardMaterial;
  /** The keyboard well. #0F0F0E metalness 0.2 roughness 0.85. */
  well: THREE.MeshStandardMaterial;
  /** Individual keycaps. #151513 metalness 0.05 roughness 0.75. */
  key: THREE.MeshStandardMaterial;
  /** Lid glass bezel / trackpad front glass. #050505 metalness 0 roughness 0.08. */
  glass: THREE.MeshStandardMaterial;
  /** Flat unlit black — the screen notch. */
  black: THREE.MeshBasicMaterial;
}

let registry: MaterialRegistry | null = null;

export function getMaterialRegistry(): MaterialRegistry {
  registry ??= {
    alu: new THREE.MeshStandardMaterial({ color: 0xc2c8cc, metalness: 1, roughness: 0.3 }),
    aluD: new THREE.MeshStandardMaterial({ color: 0x8e9290, metalness: 1, roughness: 0.25 }),
    well: new THREE.MeshStandardMaterial({ color: 0x0f0f0e, metalness: 0.2, roughness: 0.85 }),
    key: new THREE.MeshStandardMaterial({ color: 0x151513, metalness: 0.05, roughness: 0.75 }),
    glass: new THREE.MeshStandardMaterial({ color: 0x050505, metalness: 0, roughness: 0.08 }),
    black: new THREE.MeshBasicMaterial({ color: 0x000000 }),
  };
  return registry;
}

/** Disposes every material in the registry and clears it, so the next `getMaterialRegistry()` call builds fresh ones. Called once, from `Stage`'s own unmount — individual components never dispose shared materials themselves. */
export function disposeMaterialRegistry(): void {
  if (!registry) return;
  for (const material of Object.values(registry)) material.dispose();
  registry = null;
}
