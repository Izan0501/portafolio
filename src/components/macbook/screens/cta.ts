import type { Locale } from "@/i18n/config";
import { SITE } from "@/config/site";

/**
 * The Mac screen's `'cta'` draw (Contacto) — ported 1:1 from the approved
 * artifact (`docs/reference/artifact-a/Hero.dc.html`, `_drawMac` lines
 * 1677-1683): an "available" dot+label, a large "Escribime." headline,
 * the real email, and LinkedIn/GitHub as plain text. All 3 channels come
 * from `config/site.ts` — the same source `Footer.tsx`/`Contact.tsx` use,
 * not retyped here.
 */

const BONE = "#EEE9DF";
const STONE = "#A39C8F";
const LEMON = "#E6D84A";

const LOGICAL_WIDTH = 1280;
const LOGICAL_HEIGHT = 800;

const AVAILABLE_LABEL: Record<Locale, string> = {
  es: "DISPONIBLE PARA EQUIPOS",
  en: "AVAILABLE FOR TEAMS",
};

const HEADLINE: Record<Locale, string> = {
  es: "Escribime.",
  en: "Write to me.",
};

function setFont(ctx: CanvasRenderingContext2D, size: number, weight = 400, mono = false): void {
  ctx.font = `${weight} ${size}px ${mono ? '"Martian Mono", ui-monospace, monospace' : '"Schibsted Grotesk", system-ui, sans-serif'}`;
}

function dot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

export interface DrawCtaParams {
  locale: Locale;
}

export function ctaScreenKey(locale: Locale): string {
  return `cta|${locale}`;
}

export function drawCta(ctx: CanvasRenderingContext2D, { locale }: DrawCtaParams): void {
  const scale = ctx.canvas.width / LOGICAL_WIDTH;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillStyle = "#0B0A09";
  ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

  dot(ctx, 86, 150, 9, LEMON);
  setFont(ctx, 18, 600, true);
  ctx.fillStyle = LEMON;
  ctx.fillText(AVAILABLE_LABEL[locale], 108, 157);

  setFont(ctx, 84, 800);
  ctx.fillStyle = BONE;
  ctx.fillText(HEADLINE[locale], 72, 290);

  setFont(ctx, 40, 500);
  ctx.fillStyle = BONE;
  ctx.fillText(SITE.email, 72, 380);

  setFont(ctx, 20, 400, true);
  ctx.fillStyle = STONE;
  ctx.fillText(SITE.linkedin.replace("https://www.", ""), 72, 450);
  ctx.fillText(SITE.github.replace("https://", ""), 72, 490);
}
