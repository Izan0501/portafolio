/**
 * Screen-texture resolution tiers, ported 1:1 from IMPLEMENTATION_PLAN.md
 * §3.1 "Nitidez en las pantallas 3D". `S` is mobile, `M` the floor every
 * render-quality tier uses (plan §2.3: low GPU tier always uses M, never
 * the sharper L — `config/quality.ts`'s own `screenTextureTier`), `L` for
 * a wide/high-DPR desktop.
 *
 * fix/m17 (Directiva 1): the upgrade-to-`L` condition below is the part
 * that was "not built yet" — every Mac/iPhone screen defaulted to `M`
 * regardless of device, confirmed as the real cause of the Mac screen
 * reading as blurry on a sharp desktop display (`useCanvasTexture.ts`'s
 * anisotropy/mipmap setup was already correct; the texture itself was
 * simply never asked to be bigger).
 */
export type ScreenTier = "S" | "M" | "L";

/**
 * `floor` is `config/quality.ts`'s own `screenTextureTier` (never lower
 * than `M`, and `low`-GPU tier's own ceiling — a weak GPU doesn't get a
 * sharper texture just because the display happens to be wide). Only
 * raises to `L` on a wide-enough, non-compact viewport — a vertical or
 * narrow one (phones, small tablets) never benefits from a texture bigger
 * than what it can actually show at readable size.
 */
export function resolveScreenTier(floor: ScreenTier, viewportWidth: number, compact: boolean): ScreenTier {
  if (floor === "L") return "L";
  if (!compact && viewportWidth >= 1440) return "L";
  return floor;
}

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
