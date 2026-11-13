import type { Locale } from "@/i18n/config";
import { SITE } from "@/config/site";

/**
 * The iPhone screen's `'cta'` draw (Contacto) — ported 1:1 from the
 * approved artifact (`docs/reference/artifact-a/Hero.dc.html`, `_drawPhone`
 * lines 1938-1941): "Disponible.", one supporting line, and 3 pill
 * buttons (email/LinkedIn/GitHub) — the first (email) highlighted.
 */

const BONE = "#EEE9DF";
const LEMON = "#E6D84A";
const IDLE_BORDER = "#4A443B";

const LOGICAL_WIDTH = 360;
const LOGICAL_HEIGHT = 767;
const TOP = 100;

const HEADLINE: Record<Locale, string> = {
  es: "Disponible.",
  en: "Available.",
};

const SUPPORTING: Record<Locale, string> = {
  es: "Para sumarme a un equipo de producto desde el primer sprint.",
  en: "To join a product team from the very first sprint.",
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

/** Ported from `_wrap` (artifact line ~779-area helper reused across phone screens, M7's own `drawPhoneScreen`-adjacent files don't export it, so re-implemented here identically). */
function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): void {
  const words = text.split(" ");
  let line = "";
  let cursorY = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cursorY);
      line = word;
      cursorY += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, cursorY);
}

export interface DrawCtaPhoneParams {
  locale: Locale;
}

export function ctaPhoneScreenKey(locale: Locale): string {
  return `ctaphone|${locale}`;
}

export function drawCtaPhone(ctx: CanvasRenderingContext2D, { locale }: DrawCtaPhoneParams): void {
  const scale = ctx.canvas.width / LOGICAL_WIDTH;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillStyle = "#0B0A09";
  ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

  setFont(ctx, 40, 800);
  ctx.fillStyle = BONE;
  ctx.fillText(HEADLINE[locale], 24, TOP + 140);

  setFont(ctx, 15, 400);
  ctx.fillStyle = "#C9C2B5";
  wrapText(ctx, SUPPORTING[locale], 24, TOP + 182, LOGICAL_WIDTH - 48, 22);

  const channels = [SITE.email, "LinkedIn", "GitHub"];
  channels.forEach((label, i) => {
    const y = TOP + 260 + i * 66;
    const isPrimary = i === 0;
    ctx.strokeStyle = isPrimary ? LEMON : IDLE_BORDER;
    ctx.lineWidth = 2;
    roundedRectPath(ctx, 24, y, LOGICAL_WIDTH - 48, 52, 26);
    ctx.stroke();
    setFont(ctx, 15, 600);
    ctx.fillStyle = isPrimary ? LEMON : BONE;
    ctx.textAlign = "center";
    ctx.fillText(label, LOGICAL_WIDTH / 2, y + 32);
    ctx.textAlign = "left";
  });
}
