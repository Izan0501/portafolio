"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Canvas, useThree, type RootState } from "@react-three/fiber";
import { PerformanceMonitor, useDetectGPU } from "@react-three/drei";
import * as THREE from "three";
import { FrameDriver } from "./FrameDriver";
import { Environment } from "./Environment";
import { Bench, type BenchProps } from "./Bench";
import { MacBook } from "@/components/macbook/MacBook";
import { IPhonePro } from "@/components/iphone-island/IPhonePro";
import { disposeMaterialRegistry } from "@/components/three/materials/materialRegistry";
import { useVisibilityPause } from "@/hooks/useVisibilityPause";
import { QUALITY_TIERS, qualityTierForGPU } from "@/config/quality";
import { disposeObject3D, disposeRenderer } from "@/lib/three/dispose";
import type { Locale } from "@/i18n/config";

/**
 * The 3D stage's foundation (plan M5): a lazily-mounted `<Canvas>` with the
 * renderer configured per DESIGN.md §4/plan §2.3, adaptive DPR, visibility
 * pause, full disposal on unmount, a no-WebGL fallback, and a dev-only
 * `?perf` HUD. M6 added the MacBook; M7 adds `<IPhonePro/>` — camera
 * choreography still doesn't live here, that's M8.
 *
 * Imported via `next/dynamic(() => import('@/components/three/Stage'), {
 * ssr: false, loading: () => <StagePoster/> })` from whichever Client
 * Component mounts it (`ExperienceShell`) — never imported statically, so
 * the three.js/R3F chunk never enters the initial bundle (plan §2.1).
 *
 * `useDetectGPU()` below suspends (drei wraps it in `suspend-react`,
 * verified in `node_modules/@react-three/drei/core/DetectGPU.js` before
 * relying on it) — caught by `next/dynamic`'s own Suspense boundary (it
 * wraps the lazy-loaded component, not just its chunk load: "next/dynamic
 * is a composite of React.lazy() and Suspense", `node_modules/next/dist/docs`),
 * so a slow GPU-tier lookup just holds `<StagePoster/>` a little longer
 * instead of needing a Suspense boundary of this file's own.
 */

function isWebGL2Available(): boolean {
  if (typeof window === "undefined" || typeof WebGL2RenderingContext === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!canvas.getContext("webgl2");
  } catch {
    return false;
  }
}

function useHasPerfQueryParam(): boolean {
  // Read once per navigation, not reactively — a dev-only query flag never
  // needs to track live URL changes, so a no-op subscribe is correct here
  // (useSyncExternalStore still needed over a plain check: reading
  // `window.location` outside an effect/snapshot would differ from the
  // server's "no window" render and warn).
  const subscribe = useCallback(() => () => {}, []);
  const getSnapshot = useCallback(() => (process.env.NODE_ENV === "development" ? new URLSearchParams(window.location.search).has("perf") : false), []);
  const getServerSnapshot = useCallback(() => false, []);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

interface RendererInfoSnapshot {
  calls: number;
  triangles: number;
  textures: number;
  geometries: number;
}

/** Dev-only HUD (`?perf`) — plan §2.0: "`renderer.info`... volcado por un HUD solo en desarrollo, nunca en producción." Lives outside the Canvas, polling the `gl` ref Stage hands it through `onCreated`. */
function PerfHud({ glRef }: { glRef: React.RefObject<THREE.WebGLRenderer | null> }) {
  const [info, setInfo] = useState<RendererInfoSnapshot | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      const gl = glRef.current;
      if (!gl) return;
      setInfo({
        calls: gl.info.render.calls,
        triangles: gl.info.render.triangles,
        textures: gl.info.memory.textures,
        geometries: gl.info.memory.geometries,
      });
    }, 500);
    return () => clearInterval(id);
  }, [glRef]);

  if (!info) return null;

  return (
    <div className="pointer-events-none absolute bottom-3 left-3 z-20 rounded-panel bg-carbon/90 px-3 py-2 font-mono text-[11px] leading-[1.7] text-texto-2 shadow-[inset_0_0_0_1px_var(--color-linea)]">
      <div>
        draw calls: {info.calls} <span className="text-piedra-2">/ 90</span>
      </div>
      <div>
        triangles: {info.triangles.toLocaleString()} <span className="text-piedra-2">/ 15k</span>
      </div>
      <div>textures: {info.textures}</div>
      <div>geometries: {info.geometries}</div>
    </div>
  );
}

/** Applies `frameloop` from `useVisibilityPause` — a Canvas child so it can reach the R3F store (`setFrameloop` isn't accessible from outside). */
function FrameloopController({ shouldRun }: { shouldRun: boolean }) {
  const setFrameloop = useThree((state) => state.setFrameloop);
  useEffect(() => {
    setFrameloop(shouldRun ? "always" : "never");
  }, [shouldRun, setFrameloop]);
  return null;
}

export interface StageProps {
  /** Forwarded to `<Bench>` — no real pose exists before M6, so this is optional and defaults to the bench's own origin-centered pool. */
  benchProps?: BenchProps;
  locale: Locale;
}

export function Stage({ benchProps, locale }: StageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const glRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);

  const shouldRun = useVisibilityPause(containerRef);
  const gpu = useDetectGPU();
  const tierName = qualityTierForGPU(gpu.tier);
  const tier = QUALITY_TIERS[tierName];
  const showPerfHud = useHasPerfQueryParam();

  // Lazy initializer, not useState(null) + a setting effect: this component
  // only ever renders client-side (next/dynamic ssr:false), so there's no
  // server/client mismatch to guard against here, and settling it inside
  // the initializer instead of an effect body sidesteps
  // react-hooks/set-state-in-effect for no real cost (same one tick either way).
  const [webgl2] = useState(isWebGL2Available);

  // DPR is real React state on purpose (plan §2.3: "El setDpr es estado del
  // Canvas, no del scroll") — PerformanceMonitor's onIncline/onDecline below
  // drive it. Verified against the real R3F source before relying on it:
  // passing `dpr={[1, 1.5]}` directly to Canvas does NOT self-adapt to
  // frame rate — `calculateDpr()` only clamps the device's own
  // devicePixelRatio into that range, it has nothing to do with
  // PerformanceMonitor. The explicit onIncline/onDecline wiring below is
  // the actual adaptive mechanism, not a redundant extra.
  const [dpr, setDpr] = useState<number>(() => (tierName === "low" ? 1 : 1.5));

  const handleCreated = useCallback((state: RootState) => {
    glRef.current = state.gl;
    sceneRef.current = state.scene;
    // toneMapping (ACESFilmic) and outputColorSpace (sRGB) are already R3F's
    // own defaults (verified in node_modules/@react-three/fiber's
    // configuration types: `flat?: boolean` — "Use NoToneMapping instead of
    // ACESFilmicToneMapping" implies ACES is the default already); set
    // explicitly anyway so this file states its own requirement instead of
    // silently depending on a library default. toneMappingExposure has no
    // such default and does need setting here.
    state.gl.toneMapping = THREE.ACESFilmicToneMapping;
    state.gl.toneMappingExposure = 1.05;
    state.gl.outputColorSpace = THREE.SRGBColorSpace;
  }, []);

  // Full teardown on unmount (plan §2.3 "Limpieza"): every geometry/material/
  // texture still in the scene (Bench's shader material, the MacBook's own
  // geometries/canvas textures), plus the renderer's own render-list cache
  // and the shared material registry (M6: `alu`/`aluD`/`well`/`key`/`glass`/
  // `black`, module-singleton, not part of the scene graph `disposeObject3D`
  // walks). `Environment.tsx` disposes its own PMREM generator/texture in
  // its own cleanup — not duplicated here.
  useEffect(() => {
    return () => {
      if (sceneRef.current) disposeObject3D(sceneRef.current);
      if (glRef.current) disposeRenderer(glRef.current);
      disposeMaterialRegistry();
    };
  }, []);

  if (webgl2 === false) {
    return (
      <div ref={containerRef} className="absolute inset-0 flex items-center justify-center bg-grafito">
        <div role="status" className="max-w-[360px] rounded-panel bg-carbon px-[18px] py-[18px] text-[14px] leading-[1.5] text-texto-2 shadow-[inset_0_0_0_1px_var(--color-linea)]">
          WebGL no está disponible en este navegador. El recorrido sigue funcionando como texto; los modelos 3D necesitan aceleración por hardware.
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="absolute inset-0">
      <Canvas
        aria-hidden="true"
        dpr={dpr}
        gl={{
          antialias: tier.antialias,
          powerPreference: "high-performance",
        }}
        onCreated={handleCreated}
        camera={{ position: [1.1, 2.0, 7.6], fov: 45, near: 0.1, far: 60 }}
      >
        <FrameloopController shouldRun={shouldRun} />
        <FrameDriver />
        <Environment />
        <Bench {...benchProps} />
        <MacBook locale={locale} />
        <IPhonePro locale={locale} />
        {tierName === "high" && <PerformanceMonitor onIncline={() => setDpr(1.5)} onDecline={() => setDpr(1)} flipflops={3} />}
      </Canvas>
      {showPerfHud && <PerfHud glRef={glRef} />}
    </div>
  );
}

export default Stage;
