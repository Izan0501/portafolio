"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getMaterialRegistry } from "@/components/three/materials/materialRegistry";
import { roundedRectShape } from "@/components/three/geometry/roundedRectShape";
import { useCanvasTexture } from "@/components/three/textures/useCanvasTexture";
import type { MacBookHandle } from "@/components/macbook/MacBook";
import type { Locale } from "@/i18n/config";
import { CH } from "@/config/chapters";
import { chapterIndexAt, chapterProgressAt } from "@/features/scroll/chapterMath";
import { scrollStore } from "@/features/scroll/scrollStore";
import { viewportStore } from "@/hooks/useViewportProfile";
import { stackTileTransform } from "./stackTileTransform";

/**
 * The 4 stack modules — ported 1:1 from the artifact's `_buildTiles`
 * (lines 1022-1043) and the tile-only portion of `_profile` (lines
 * 1466-1480; `ProfileBadge.tsx` owns the rest of that function).
 *
 * Real children of the Mac's *lid* group (artifact: `this.lid.add(g)`,
 * confirmed — not the scene root), which this file isn't a React child
 * of (`MacBook`/`Lid` own that part of the tree). Built imperatively:
 * each tile's `THREE.Group` is created once and attached to the real
 * `lidGroup` via `.add()` the first frame it's available, then only
 * animated (position/rotation/scale/visible) per frame — the same
 * "mutate only inside useFrame/useEffect" discipline as everywhere else
 * in `components/three`, just without JSX describing the parent-child
 * relationship since the parent isn't this component's own.
 *
 * Three phases per tile, by index `i` by `s0 = 0.14 + i * 0.13`:
 *  1. "Salida" (`em`, window `[s0, s0+0.04]`): eases out from the screen's
 *     own position/scale toward a floating "focus" pose in front of camera.
 *  2. "Acople" (`dk`, window `[s0+0.085, s0+0.13]`): docks into a row above
 *     the lid (desktop) or back onto the screen itself (compact — same
 *     geometry, same docking target as the screen, not a 2D fallback).
 *  3. "Regreso" (`back`, window depends on `i`, in *reverse* tile order —
 *     tile 3 returns first): shrinks back onto the screen.
 */

const TILE_WIDTH = 0.74;
const TILE_HEIGHT = 0.4625;

interface StackModule {
  index: string;
  title: Record<Locale, string>;
  lines: readonly string[];
}

const MODULES: readonly StackModule[] = [
  { index: "01", title: { es: "FRONTEND", en: "FRONTEND" }, lines: ["React · Vite", "TypeScript · Next.js", "Tailwind · Framer Motion"] },
  { index: "02", title: { es: "BACKEND", en: "BACKEND" }, lines: ["Python · FastAPI", "Node.js · Express", "JWT · OAuth2"] },
  { index: "03", title: { es: "DATOS", en: "DATA" }, lines: ["PostgreSQL · Supabase", "MySQL · MongoDB", "Firebase · Pinecone"] },
  { index: "04", title: { es: "ENTREGA", en: "DELIVERY" }, lines: ["Docker · GitHub Actions", "VPS · Vercel", "Cloudflare"] },
];

function setFont(ctx: CanvasRenderingContext2D, size: number, weight = 400, mono = false): void {
  ctx.font = `${weight} ${size}px ${mono ? '"Martian Mono", ui-monospace, monospace' : '"Schibsted Grotesk", system-ui, sans-serif'}`;
}

function drawTileFace(ctx: CanvasRenderingContext2D, module: StackModule, locale: Locale): void {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#1A1815";
  ctx.fillRect(0, 0, w, h);
  setFont(ctx, 180, 800);
  ctx.fillStyle = "rgba(230,216,74,0.12)";
  ctx.fillText(module.index, 48, 260);
  setFont(ctx, 72, 800);
  ctx.fillStyle = "#EEE9DF";
  ctx.fillText(module.title[locale], 48, 400);
  setFont(ctx, 24, 500, true);
  ctx.fillStyle = "#A39C8F";
  module.lines.forEach((line, i) => ctx.fillText(line, 48, 480 + i * 48));
}

export interface StackTilesProps {
  macRef: React.RefObject<MacBookHandle | null>;
  locale: Locale;
}

export function StackTiles({ macRef, locale }: StackTilesProps) {
  const mat = getMaterialRegistry();
  const attachedLid = useRef<THREE.Group | null>(null);

  const slabGeometry = useMemo(() => {
    const geometry = new THREE.ExtrudeGeometry(roundedRectShape(TILE_WIDTH, TILE_HEIGHT, 0.035), {
      depth: 0.018,
      bevelEnabled: true,
      bevelThickness: 0.004,
      bevelSize: 0.004,
      bevelSegments: 2,
      curveSegments: 8,
    });
    geometry.translate(0, 0, -0.02);
    return geometry;
  }, []);
  const faceGeometry = useMemo(() => new THREE.PlaneGeometry(TILE_WIDTH - 0.01, TILE_HEIGHT - 0.01), []);

  // Called explicitly 4 times, not in a `.map()` — `MODULES` has a fixed
  // length known at compile time, but a hook call inside any loop/map is
  // flagged (correctly, in general) by the Rules of Hooks; unrolling it
  // keeps this file honest about hook-call order without a lint override.
  const texture0 = useCanvasTexture({ width: 1280, height: 800 });
  const texture1 = useCanvasTexture({ width: 1280, height: 800 });
  const texture2 = useCanvasTexture({ width: 1280, height: 800 });
  const texture3 = useCanvasTexture({ width: 1280, height: 800 });
  const textures = useMemo(() => [texture0, texture1, texture2, texture3], [texture0, texture1, texture2, texture3]);

  const faceMaterials = useMemo(
    () => textures.map((tex) => new THREE.MeshBasicMaterial({ map: tex.texture, toneMapped: false })),
    [textures],
  );
  useEffect(() => {
    return () => {
      slabGeometry.dispose();
      faceGeometry.dispose();
      faceMaterials.forEach((m) => m.dispose());
    };
  }, [slabGeometry, faceGeometry, faceMaterials]);

  useEffect(() => {
    textures.forEach((tex, i) => {
      tex.texture.generateMipmaps = true;
      tex.texture.minFilter = THREE.LinearMipmapLinearFilter;
      tex.redrawIfKeyChanged(`tile|${i}|${locale}`, (ctx) => drawTileFace(ctx, MODULES[i], locale));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `textures`' `redrawIfKeyChanged` identities are stable; re-running per render isn't needed.
  }, [locale]);

  const tileGroups = useMemo(() => {
    return MODULES.map((_module, i) => {
      const group = new THREE.Group();
      group.visible = false;
      const slab = new THREE.Mesh(slabGeometry, mat.card);
      const face = new THREE.Mesh(faceGeometry, faceMaterials[i]);
      face.position.z = 0.0025;
      group.add(slab, face);
      return group;
    });
  }, [slabGeometry, faceGeometry, faceMaterials, mat.card]);
  useEffect(() => {
    return () => {
      tileGroups.forEach((g) => attachedLid.current?.remove(g));
    };
  }, [tileGroups]);

  useFrame(() => {
    const lid = macRef.current?.lidGroup;
    if (lid && attachedLid.current !== lid) {
      tileGroups.forEach((g) => lid.add(g));
      attachedLid.current = lid;
    }
    if (!attachedLid.current) return;

    // Purely position-based from scroll progress — no spring state, so no `delta` needed here (unlike ProfileBadge's badge, which does spring).
    const p = scrollStore.p;
    const chapter = CH[chapterIndexAt(p, CH)];
    const live = chapter.id === "prof";
    const k = live ? chapterProgressAt(p, chapter) : p < 1.8 ? 0 : 1;
    const compact = viewportStore.compact;

    tileGroups.forEach((group, i) => {
      const transform = stackTileTransform(i, k, compact);
      group.visible = live && transform.visible;
      if (!group.visible) return;
      group.position.set(...transform.position);
      group.rotation.set(...transform.rotation);
      group.scale.setScalar(transform.scale);
    });
  });

  return null;
}

export default StackTiles;
