/**
 * The home indicator + the iPhone's own on-screen Dynamic Island, drawn as
 * an overlay *on top of* whatever `PhoneScreen.ts` already drew (same
 * canvas, no clear) — ported 1:1 from the approved artifact
 * (`docs/reference/artifact-a/Hero.dc.html`, the tail of `_drawPhone`,
 * lines 1943-1958, plus the `_rrect` canvas helper at line 779).
 *
 * This is the on-*screen* island (a 2D shape baked into the phone's
 * `CanvasTexture`) — unrelated to `DynamicIslandNav`, the real DOM
 * navigation element. They happen to share a name and a spring constant
 * (`SPRING.island`, K380/C26) because the artifact itself reuses both for
 * this purely decorative on-screen echo of the real one.
 *
 * The artifact also draws a text label inside the island once wide enough
 * (`prof`/`cert`/`pipe`/`shot` modes) — none of those chapters have
 * geometry yet (M9-M12), so `label` is always `null` for now; the drawing
 * code for it is intentionally not ported ahead of a real caller.
 */

const LOGICAL_WIDTH = 360;
const LOGICAL_HEIGHT = 767;

function roundedRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

export interface DrawIslandTextureParams {
  /** Current island width/height, in the same logical units as `PhoneScreen.ts` (artifact `pisl.w`/`pisl.h`, after the spring). */
  islandWidth: number;
  islandHeight: number;
}

export function drawIslandTexture(ctx: CanvasRenderingContext2D, { islandWidth, islandHeight }: DrawIslandTextureParams): void {
  const scale = ctx.canvas.width / LOGICAL_WIDTH;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);

  // Home indicator.
  ctx.fillStyle = "rgba(238,233,223,0.55)";
  roundedRectPath(ctx, LOGICAL_WIDTH / 2 - 60, LOGICAL_HEIGHT - 14, 120, 5, 3);
  ctx.fill();

  // The on-screen island itself.
  const iw = Math.max(60, islandWidth);
  const ih = Math.max(22, islandHeight);
  const ix = (LOGICAL_WIDTH - iw) / 2;
  const iy = 14;
  ctx.fillStyle = "#000";
  roundedRectPath(ctx, ix, iy, iw, ih, ih / 2);
  ctx.fill();
}
