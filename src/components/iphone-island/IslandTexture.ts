/**
 * The home indicator + the iPhone's own on-screen Dynamic Island, drawn as
 * an overlay *on top of* whatever `PhoneScreen.ts` already drew (same
 * canvas, no clear) — ported 1:1 from the approved artifact
 * (`docs/reference/artifact-a/Hero.dc.html`, the tail of `_drawPhone`,
 * lines 1943-1966, plus the `_rrect` canvas helper at line 779).
 *
 * This is the on-*screen* island (a 2D shape baked into the phone's
 * `CanvasTexture`) — unrelated to `DynamicIslandNav`, the real DOM
 * navigation element. They happen to share a name and a spring constant
 * (`SPRING.island`, K380/C26) because the artifact itself reuses both for
 * this purely decorative on-screen echo of the real one.
 *
 * The artifact also draws a 2-line text `label` once the island is wide
 * enough (`iw > 120`) for `prof`/`cert`/`shot` modes — none of M9-M11
 * actually wired a caller for it (left as documented debt each time), so
 * `label` stays a generic, optional mechanism here: real today for no
 * mode, ready for whichever module closes that gap. `pipe`'s own label
 * (`['CI', 'build'|'types'|...]`) is in the artifact's source but never
 * actually visible regardless: `islandTargetSize.ts`'s own `tg` for
 * `pipe` is the default `[100, 30]` (`pipe` isn't one of the branches
 * that widens it), so its island never crosses the 120px threshold the
 * label needs — dead code in the artifact itself, not ported here for
 * that reason (M12 confirmed this by reading `_screens`' `tg` assignment
 * directly, not by assumption).
 *
 * `cta`'s island *does* reach `[312, 72]` (`islandTargetSize.ts`), so its
 * extra "Disponible" + email card (artifact lines 1960-1966, gated on
 * `ih > 50`) is real and ported as `expandedContact`.
 */

const BONE = "#EEE9DF";
const STONE = "#A39C8F";
const LEMON = "#E6D84A";

const LOGICAL_WIDTH = 360;
const LOGICAL_HEIGHT = 767;

function setFont(ctx: CanvasRenderingContext2D, size: number, weight = 400, mono = false): void {
  ctx.font = `${weight} ${size}px ${mono ? '"Martian Mono", ui-monospace, monospace' : '"Schibsted Grotesk", system-ui, sans-serif'}`;
}

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

function dot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

export interface DrawIslandTextureParams {
  /** Current island width/height, in the same logical units as `PhoneScreen.ts` (artifact `pisl.w`/`pisl.h`, after the spring). */
  islandWidth: number;
  islandHeight: number;
  /** 2-line label (title, sub) shown once `islandWidth > 120` — `null` when the active chapter/shot has none. */
  label?: readonly [string, string] | null;
  /** `cta`'s extra expanded card, shown once `islandHeight > 50`. */
  expandedContact?: { label: string; sub: string } | null;
  t?: number;
}

export function drawIslandTexture(ctx: CanvasRenderingContext2D, { islandWidth, islandHeight, label, expandedContact, t = 0 }: DrawIslandTextureParams): void {
  const scale = ctx.canvas.width / LOGICAL_WIDTH;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.textBaseline = "alphabetic";

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

  if (label && iw > 120) {
    ctx.globalAlpha = Math.min(1, Math.max(0, (iw - 120) / 60));
    ctx.textAlign = "left";
    dot(ctx, ix + 18, iy + ih / 2, 4 + Math.sin(t * 5) * 0.8, LEMON);
    setFont(ctx, 12.5, 600);
    ctx.fillStyle = BONE;
    ctx.fillText(label[0], ix + 30, iy + ih / 2 + 4);
    setFont(ctx, 10.5, 500, true);
    ctx.fillStyle = STONE;
    ctx.textAlign = "right";
    ctx.fillText(label[1], ix + iw - 14, iy + ih / 2 + 4);
    ctx.textAlign = "left";
    ctx.globalAlpha = 1;
  }

  if (expandedContact && ih > 50) {
    ctx.globalAlpha = Math.min(1, Math.max(0, (ih - 50) / 20));
    dot(ctx, ix + 30, iy + ih / 2, 8, LEMON);
    setFont(ctx, 16, 700);
    ctx.fillStyle = BONE;
    ctx.fillText(expandedContact.label, ix + 52, iy + ih / 2 - 3);
    setFont(ctx, 11, 500, true);
    ctx.fillStyle = STONE;
    ctx.fillText(expandedContact.sub, ix + 52, iy + ih / 2 + 16);
    ctx.globalAlpha = 1;
  }
}
