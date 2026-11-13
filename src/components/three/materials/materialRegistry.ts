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
 * M6 (MacBook) built `alu`/`aluD`/`well`/`key`/`glass`/`black`. M7 (iPhone)
 * added `ti` (titanium) and `lens` (camera glass). M9 added `card` (ID
 * badge, stack tiles). M10 adds `leather`/`brass`/`lining`/`lemon`
 * (briefcase, cert plates, pulse particles) — the full registry now
 * matches the plan's own list (§2.3) exactly. `lining` is registered for
 * completeness but `Briefcase.tsx`'s own interior lining uses its own
 * ad-hoc material instead (artifact: the real lining isn't built from
 * `this.mat.lining` either — confirmed, not an oversight to fix).
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
  /** Lid glass bezel / trackpad front glass / iPhone front glass. #050505 metalness 0 roughness 0.08. */
  glass: THREE.MeshStandardMaterial;
  /** Flat unlit black — the screen notch. */
  black: THREE.MeshBasicMaterial;
  /** iPhone titanium — body, camera plate, side buttons. #4A4740 metalness 1 roughness 0.30. */
  ti: THREE.MeshStandardMaterial;
  /** Camera lenses. #0A0A0C metalness 0.6 roughness 0.12. */
  lens: THREE.MeshStandardMaterial;
  /** ID badge card stock, stack tiles. #1A1815 metalness 0.4 roughness 0.5. */
  card: THREE.MeshStandardMaterial;
  /** Briefcase leather — body, lid, handle. #2B2520 roughness 0.62, non-metal. */
  leather: THREE.MeshStandardMaterial;
  /** Brass — briefcase lip, corners, feet, hasps, nameplate. #C8B46A metalness 1 roughness 0.32. */
  brass: THREE.MeshStandardMaterial;
  /** Interior lining — registered for completeness; `Briefcase.tsx` builds its own ad-hoc lining material instead (see module comment). #1B1914 roughness 0.95, non-metal. */
  lining: THREE.MeshStandardMaterial;
  /** Flat unlit lemon accent — pulse particles, scan lines. #E6D84A, unlit (never tone-mapped). */
  lemon: THREE.MeshBasicMaterial;
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
    ti: new THREE.MeshStandardMaterial({ color: 0x4a4740, metalness: 1, roughness: 0.3 }),
    lens: new THREE.MeshStandardMaterial({ color: 0x0a0a0c, metalness: 0.6, roughness: 0.12 }),
    card: new THREE.MeshStandardMaterial({ color: 0x1a1815, metalness: 0.4, roughness: 0.5 }),
    leather: new THREE.MeshStandardMaterial({ color: 0x2b2520, metalness: 0, roughness: 0.62 }),
    brass: new THREE.MeshStandardMaterial({ color: 0xc8b46a, metalness: 1, roughness: 0.32 }),
    lining: new THREE.MeshStandardMaterial({ color: 0x1b1914, metalness: 0, roughness: 0.95 }),
    lemon: new THREE.MeshBasicMaterial({ color: 0xe6d84a, toneMapped: false }),
  };
  return registry;
}

/** Disposes every material in the registry and clears it, so the next `getMaterialRegistry()` call builds fresh ones. Called once, from `Stage`'s own unmount — individual components never dispose shared materials themselves. */
export function disposeMaterialRegistry(): void {
  if (!registry) return;
  for (const material of Object.values(registry)) material.dispose();
  registry = null;
}
