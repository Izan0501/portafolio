/**
 * Screen-texture resolution tiers, ported 1:1 from IMPLEMENTATION_PLAN.md
 * §3.1 "Nitidez en las pantallas 3D". `S` is mobile, `M` the floor every
 * render-quality tier uses (plan §2.3: low GPU tier always uses M, never
 * the sharper L — `config/quality.ts`'s own `screenTextureTier`), `L` for
 * a wide/high-DPR desktop (M8's `useViewportProfile` decides when to
 * upgrade to it — not built yet, so every screen defaults to `M` until then).
 */
export type ScreenTier = "S" | "M" | "L";

export interface ScreenResolution {
  width: number;
  height: number;
}

export const MAC_SCREEN_RESOLUTION: Record<ScreenTier, ScreenResolution> = {
  S: { width: 1280, height: 800 },
  M: { width: 1600, height: 1000 },
  L: { width: 2048, height: 1280 },
};

export const PHONE_SCREEN_RESOLUTION: Record<ScreenTier, ScreenResolution> = {
  S: { width: 540, height: 1150 },
  M: { width: 720, height: 1534 },
  L: { width: 900, height: 1916 },
};

export const CERT_PLATE_WIDTH: Record<ScreenTier, number> = {
  S: 1024,
  M: 1024,
  L: 1536,
};

/** Credential/stack-module canvas size — same at every tier (plan §3.1 table: "ídem" for S/M/L). */
export const CREDENTIAL_RESOLUTION: ScreenResolution = { width: 1280, height: 800 };
