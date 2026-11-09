import type { Locale } from "@/i18n/config";

/**
 * The Mac screen's "boot" draw — ported 1:1 from the approved artifact
 * (`docs/reference/artifact-a/Hero.dc.html`, `_drawMac`'s `mode === 'boot'`
 * branch, lines 1570-1586). Shown for both `hero` and `open` chapters (the
 * artifact's own `_screens`, line 1496: `if (id === 'hero' || id === 'open')
 * mode = 'boot'` — there is no separate "método" screen in the source,
 * `method.ts` re-exports this same draw rather than inventing a different
 * one that doesn't exist in the artifact).
 *
 * Spanish copy is the artifact's own text, verbatim. English is a faithful
 * translation, keeping the terminal's column alignment where the artifact
 * has it — the artifact itself ships Spanish only.
 */

const BONE = "#EEE9DF";
const STONE = "#A39C8F";
const LEMON = "#E6D84A";

function setFont(ctx: CanvasRenderingContext2D, size: number, weight = 400, mono = false): void {
  ctx.font = `${weight} ${size}px ${mono ? '"Martian Mono", ui-monospace, monospace' : '"Schibsted Grotesk", system-ui, sans-serif'}`;
}

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

const TERMINAL_LINES: Record<Locale, [string, string][]> = {
  es: [
    ["$ ", "init --system"],
    ["› ", "spec       SDD + Claude · MCP · Skills"],
    ["› ", "frontend   React/Vite · TypeScript · Next.js"],
    ["› ", "backend    FastAPI · Node/Express"],
    ["› ", "datos      PostgreSQL/Supabase · MySQL · MongoDB · Firebase · Pinecone"],
    ["› ", "entrega    Docker · GitHub Actions · VPS · Vercel + Cloudflare"],
    ["✓ ", "banco listo. desplazate para montar el primer sistema"],
  ],
  en: [
    ["$ ", "init --system"],
    ["› ", "spec       SDD + Claude · MCP · Skills"],
    ["› ", "frontend   React/Vite · TypeScript · Next.js"],
    ["› ", "backend    FastAPI · Node/Express"],
    ["› ", "data       PostgreSQL/Supabase · MySQL · MongoDB · Firebase · Pinecone"],
    ["› ", "delivery   Docker · GitHub Actions · VPS · Vercel + Cloudflare"],
    ["✓ ", "bench ready. scroll to mount the first system"],
  ],
};

const HEADER: Record<Locale, string> = {
  es: "banco de pruebas · ivo zanacchi",
  en: "test bench · ivo zanacchi",
};

export interface DrawBootParams {
  /** Scroll position, in screens — drives the typewriter progress (artifact: `p`). */
  p: number;
  /** Elapsed time, in seconds — drives the cursor blink and scan sweep (artifact: `t`). */
  t: number;
  locale: Locale;
}

/** The redraw key for this screen — changes ~12×/s while the typewriter/cursor animate (artifact `_screens`: `anim ? Math.floor(t * 12) : 0`), and whenever the quantized typing progress moves. */
export function bootScreenKey(p: number, t: number, locale: Locale): string {
  const q = Math.round(clamp01((p - 0.5) / 1.05) * 400);
  return `boot|${locale}|${q}|${Math.floor(t * 12)}`;
}

export function drawBoot(ctx: CanvasRenderingContext2D, { p, t, locale }: DrawBootParams): void {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillStyle = "#0B0A09";
  ctx.fillRect(0, 0, W, H);

  // Giant faint "IZ" watermark, scaled to this canvas's own resolution
  // (the artifact draws it at a fixed 1280×800; every tier here keeps the
  // same proportions by scaling off `W`).
  const scale = W / 1280;
  ctx.fillStyle = "rgba(230,216,74,0.05)";
  setFont(ctx, 520 * scale, 800);
  ctx.textAlign = "center";
  ctx.fillText("IZ", W / 2, 600 * scale);
  ctx.textAlign = "left";

  setFont(ctx, 16 * scale, 500, true);
  ctx.fillStyle = STONE;
  ctx.fillText(HEADER[locale], 72 * scale, 70 * scale);

  const lines = TERMINAL_LINES[locale];
  const total = lines.reduce((sum, line) => sum + line[1].length, 0);
  const typed = clamp01((p - 0.5) / 1.05);
  let remaining = Math.floor(typed * total * 1.08);

  setFont(ctx, 22 * scale, 400, true);
  let y = 170 * scale;
  let cursorX = 72 * scale;
  let cursorY = y;

  for (let i = 0; i < lines.length && remaining > 0; i++) {
    const [prefix, text] = lines[i];
    const shown = text.slice(0, remaining);
    remaining -= text.length;
    const isLast = i === lines.length - 1;

    ctx.fillStyle = isLast || i === 0 ? LEMON : STONE;
    ctx.fillText(prefix, 72 * scale, y);
    ctx.fillStyle = isLast ? LEMON : BONE;
    ctx.fillText(shown, 106 * scale, y);

    cursorX = 106 * scale + ctx.measureText(shown).width + 6 * scale;
    cursorY = y;
    y += 62 * scale;
  }

  if (Math.floor(t * 2) % 2 === 0) {
    ctx.fillStyle = LEMON;
    ctx.fillRect(cursorX, cursorY - 22 * scale, 13 * scale, 28 * scale);
  }

  // Power-on scan sweep.
  const sweepY = (clamp01((p - 0.6) / 0.9) * 1.2 - 0.1) * H;
  ctx.fillStyle = "rgba(238,233,223,0.05)";
  ctx.fillRect(0, sweepY, W, 60 * scale);
}
