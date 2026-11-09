"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import type { ScreenResolution } from "./screenTiers";

/**
 * A `CanvasTexture` backed by a real 2D canvas, configured per plan §3.1:
 * `colorSpace = SRGBColorSpace`, mipmaps on with
 * `LinearMipmapLinearFilter`/`LinearFilter`, and anisotropy at the real
 * hardware maximum (`renderer.capabilities.getMaxAnisotropy()` — the
 * artifact hardcodes 8; this reads the actual device limit, which can be
 * 16, exactly the upgrade plan §3.1 calls for).
 *
 * `redrawIfKeyChanged` ports the artifact's own throttling pattern
 * (`_macKey`/`_phKey`, `Hero.dc.html` line 1503: only redraw — and only
 * mark `needsUpdate` — when a cheap string key actually changed, not every
 * frame). The draw callback itself stays the caller's: this hook only owns
 * *whether* to call it.
 */
export function useCanvasTexture(resolution: ScreenResolution) {
  const gl = useThree((state) => state.gl);

  const { canvas, ctx, texture } = useMemo(() => {
    const canvasEl = document.createElement("canvas");
    canvasEl.width = resolution.width;
    canvasEl.height = resolution.height;
    const context = canvasEl.getContext("2d");
    if (!context) throw new Error("2D canvas context unavailable");

    const tex = new THREE.CanvasTexture(canvasEl);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.anisotropy = gl.capabilities.getMaxAnisotropy();

    return { canvas: canvasEl, ctx: context, texture: tex };
    // Deliberately built once per mount (resolution/gl changes aren't
    // expected mid-life for a given screen instance — a tier change
    // remounts the owning component instead of resizing this canvas).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => texture.dispose();
  }, [texture]);

  const lastKeyRef = useRef<string | null>(null);

  /** Calls `draw(ctx)` and flags the texture dirty only when `key` differs from the last call — the artifact's own redraw-throttling pattern. Stable identity (`useCallback`) so consumers exposing it through `useImperativeHandle` don't rebuild their handle on every render. */
  const redrawIfKeyChanged = useCallback(
    (key: string, draw: (ctx: CanvasRenderingContext2D) => void): void => {
      if (key === lastKeyRef.current) return;
      lastKeyRef.current = key;
      draw(ctx);
      texture.needsUpdate = true;
    },
    [ctx, texture],
  );

  return { canvas, ctx, texture, redrawIfKeyChanged };
}
