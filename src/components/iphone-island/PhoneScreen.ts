import type { Locale } from "@/i18n/config";

/**
 * The iPhone screen's content draw — ported 1:1 from the approved artifact
 * (`docs/reference/artifact-a/Hero.dc.html`, `_drawPhone`'s `hero`/`open`
 * branch, lines 1802-1815, plus the `_phHead` helper at 1744-1749).
 *
 * Draws in a *logical* 360×767 coordinate space scaled up to the real
 * canvas resolution (artifact: `setTransform(1.5, 0, 0, 1.5, 0, 0)` onto a
 * fixed 540×1150 canvas — here the scale is computed from the real canvas
 * width instead of hardcoded, so every tier in `screenTiers.ts` draws
 * correctly, not just the artifact's own fixed size).
 *
 * Only `hero`/`open` exist — the rest of `_drawPhone`'s branches
 * (`prof`/`cert`/`shot`/`pipe`/`cta`) belong to chapters M7 doesn't build
 * geometry for yet (M9-M12).
 */

const BONE = "#EEE9DF";
const STONE = "#A39C8F";
const LEMON = "#E6D84A";

/** Logical coordinate space the artifact draws this screen in — scaled to whatever the real canvas resolution is. */
const LOGICAL_WIDTH = 360;
const LOGICAL_HEIGHT = 767;

function setFont(ctx: CanvasRenderingContext2D, size: number, weight = 400, mono = false): void {
  ctx.font = `${weight} ${size}px ${mono ? '"Martian Mono", ui-monospace, monospace' : '"Schibsted Grotesk", system-ui, sans-serif'}`;
}

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

function drawHeader(ctx: CanvasRenderingContext2D, title: string, subtitle: string, top: number): void {
  setFont(ctx, 22, 700);
  ctx.fillStyle = BONE;
  ctx.fillText(title, 24, top);
  setFont(ctx, 11.5, 500, true);
  ctx.fillStyle = STONE;
  ctx.fillText(subtitle, 24, top + 24);
  ctx.strokeStyle = "#2E2A24";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, top + 42);
  ctx.lineTo(LOGICAL_WIDTH, top + 42);
  ctx.stroke();
}

const TERMINAL_LINES: Record<Locale, readonly (readonly [string, string])[]> = {
  es: [
    ["$ help", LEMON],
    ["[stack] [experience] [contact]", STONE],
    ["[github] [resume] [hire]", STONE],
    ["", ""],
    ["$ contact", LEMON],
    ["Email:", STONE],
    ["ivozanacchi501@gmail.com", BONE],
    ["LinkedIn:", STONE],
    ["in/ivo-zanacchi-87822326a", BONE],
    ["Archivo fuente:", STONE],
    ["github.com/Izan0501", BONE],
    ["", ""],
    ["$ hire", LEMON],
    ["ACCESO CONCEDIDO.", BONE],
    ["Enrutamiento prioritario activado.", STONE],
  ],
  en: [
    ["$ help", LEMON],
    ["[stack] [experience] [contact]", STONE],
    ["[github] [resume] [hire]", STONE],
    ["", ""],
    ["$ contact", LEMON],
    ["Email:", STONE],
    ["ivozanacchi501@gmail.com", BONE],
    ["LinkedIn:", STONE],
    ["in/ivo-zanacchi-87822326a", BONE],
    ["Source:", STONE],
    ["github.com/Izan0501", BONE],
    ["", ""],
    ["$ hire", LEMON],
    ["ACCESS GRANTED.", BONE],
    ["Priority routing activated.", STONE],
  ],
};

const HEADER_SUBTITLE: Record<Locale, string> = {
  es: "terminal interactiva",
  en: "interactive terminal",
};

export interface DrawPhoneScreenParams {
  /** Progress *within* the current chapter, 0..1 (artifact `st.k` — `chapterProgressAt`, not the global `p` the Mac's `boot` screen uses). */
  chapterProgress: number;
  locale: Locale;
}

/** The redraw key for this screen — changes whenever the quantized typing progress moves (artifact: part of `_phKey`, line 1511's `Math.round(st.k * 60)` term). */
export function phoneScreenKey(chapterProgress: number, locale: Locale): string {
  return `contact|${locale}|${Math.round(chapterProgress * 60)}`;
}

export function drawPhoneScreen(ctx: CanvasRenderingContext2D, { chapterProgress, locale }: DrawPhoneScreenParams): void {
  const scale = ctx.canvas.width / LOGICAL_WIDTH;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillStyle = "#0B0A09";
  ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

  const top = 100;
  drawHeader(ctx, "ivo_contact.sh", HEADER_SUBTITLE[locale], top);

  const lines = TERMINAL_LINES[locale];
  const shown = Math.floor(clamp01(chapterProgress * 1.4 + 0.1) * lines.length);

  setFont(ctx, 13.5, 400, true);
  for (let i = 0; i < shown; i++) {
    const [text, color] = lines[i];
    ctx.fillStyle = color;
    ctx.fillText(text, 24, top + 80 + i * 30);
  }
}
