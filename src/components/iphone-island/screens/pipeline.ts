import type { Locale } from "@/i18n/config";
import { pipelineStageAt } from "@/features/chapters/pipelineProgress";

/**
 * The iPhone screen's `'pipe'` draw (Garantías) — ported 1:1 from the
 * approved artifact (`docs/reference/artifact-a/Hero.dc.html`, `_drawPhone`
 * lines 1934-1937): a `GitHub Actions` header and the same 5-stage
 * checklist as the Mac's `pipeline.ts`, condensed to one short label per
 * row (✓ done / … in progress / · pending).
 */

const BONE = "#EEE9DF";
const STONE = "#A39C8F";
const LEMON = "#E6D84A";
const PENDING = "#5C564C";

const LOGICAL_WIDTH = 360;
const LOGICAL_HEIGHT = 767;
const TOP = 100;

const CHECKS: Record<Locale, readonly string[]> = {
  es: ["build", "type-check", "lint", "QA manual · pre-merge", "deploy · VPS / Vercel"],
  en: ["build", "type-check", "lint", "manual QA · pre-merge", "deploy · VPS / Vercel"],
};

const HEADER_SUBTITLE: Record<Locale, string> = {
  es: "push → main · checks",
  en: "push → main · checks",
};

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

function drawHeader(ctx: CanvasRenderingContext2D, title: string, subtitle: string): void {
  setFont(ctx, 22, 700);
  ctx.fillStyle = BONE;
  ctx.fillText(title, 24, TOP);
  setFont(ctx, 11.5, 500, true);
  ctx.fillStyle = STONE;
  ctx.fillText(subtitle, 24, TOP + 24);
  ctx.strokeStyle = "#2E2A24";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, TOP + 42);
  ctx.lineTo(LOGICAL_WIDTH, TOP + 42);
  ctx.stroke();
}

export interface DrawPipelinePhoneParams {
  /** Progress within the Garantías chapter, 0..1 (artifact `st.k`). */
  chapterProgress: number;
  locale: Locale;
}

export function pipelinePhoneScreenKey(chapterProgress: number, locale: Locale): string {
  return `pipelinephone|${Math.round(chapterProgress * 300)}|${locale}`;
}

export function drawPipelinePhone(ctx: CanvasRenderingContext2D, { chapterProgress, locale }: DrawPipelinePhoneParams): void {
  const scale = ctx.canvas.width / LOGICAL_WIDTH;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillStyle = "#0B0A09";
  ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

  drawHeader(ctx, "GitHub Actions", HEADER_SUBTITLE[locale]);

  const { activeIndex } = pipelineStageAt(chapterProgress);
  const checks = CHECKS[locale];

  checks.forEach((check, i) => {
    const y = TOP + 64 + i * 64;
    ctx.fillStyle = "#141210";
    roundedRectPath(ctx, 16, y, LOGICAL_WIDTH - 32, 52, 12);
    ctx.fill();

    setFont(ctx, 15, 500, true);
    ctx.fillStyle = BONE;
    ctx.fillText(check, 32, y + 32);

    ctx.textAlign = "right";
    if (i < activeIndex) {
      ctx.fillStyle = LEMON;
      ctx.fillText("✓", LOGICAL_WIDTH - 32, y + 32);
    } else if (i === activeIndex) {
      ctx.fillStyle = BONE;
      ctx.fillText("…", LOGICAL_WIDTH - 32, y + 32);
    } else {
      ctx.fillStyle = PENDING;
      ctx.fillText("·", LOGICAL_WIDTH - 32, y + 32);
    }
    ctx.textAlign = "left";
  });
}
