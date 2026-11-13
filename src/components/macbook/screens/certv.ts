import type { Locale } from "@/i18n/config";
import type { Credential } from "@/types/content";
import { smoothstep } from "@/lib/math/ease";

/**
 * The Mac screen's "certv" draw (one certificate actively being verified)
 * — reconstructed from a *descriptive summary* of the artifact's own
 * `_drawMac` `certv` branch, not a line-for-line citation (the research
 * pass summarized this branch in prose rather than quoting its exact
 * pixel coordinates — documented here rather than presented as a 1:1
 * port like `boot.ts`/`profile.ts`).
 *
 * Confirmed real content: header "maletin/credenciales — N de 5
 * verificadas", the real credential image inside the panel rect, a gold
 * flash that fades on settle, title/org/hours/date, "Certificado por X"
 * when present, a "✓ VERIFICADA" mark, and 5 progress chips.
 */

const BONE = "#EEE9DF";
const STONE = "#A39C8F";
const LEMON = "#E6D84A";

const LOGICAL_WIDTH = 1280;
const LOGICAL_HEIGHT = 800;
const PANEL = { x: 72, y: 128, width: 780, height: 560 };

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

const HEADER_LABEL: Record<Locale, (index: number) => string> = {
  es: (i) => `maletin/credenciales — ${i + 1} de 5 verificadas`,
  en: (i) => `briefcase/credentials — ${i + 1} of 5 verified`,
};
const VERIFIED_LABEL: Record<Locale, string> = { es: "✓ VERIFICADA", en: "✓ VERIFIED" };
const CERTIFIED_BY_LABEL: Record<Locale, (by: string) => string> = { es: (by) => `Certificado por ${by}`, en: (by) => `Certified by ${by}` };
const HOURS_LABEL: Record<Locale, (h: number) => string> = { es: (h) => `${h} horas`, en: (h) => `${h} hours` };

export interface DrawCertVParams {
  index: number;
  credential: Credential;
  /** Certificate `index`'s own local progress (artifact `u`) — drives the settle-in flash. */
  localProgress: number;
  image: HTMLImageElement | null;
  locale: Locale;
}

export function certvScreenKey(index: number, localProgress: number, hasImage: boolean, locale: Locale): string {
  return `certv|${locale}|${index}|${hasImage}|${Math.round(localProgress * 100)}`;
}

export function drawCertV(ctx: CanvasRenderingContext2D, { index, credential, localProgress: u, image, locale }: DrawCertVParams): void {
  const scale = ctx.canvas.width / LOGICAL_WIDTH;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillStyle = "#0B0A09";
  ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

  setFont(ctx, 16, 500, true);
  ctx.fillStyle = STONE;
  ctx.fillText(HEADER_LABEL[locale](index), 72, 78);

  ctx.fillStyle = "#171512";
  roundedRectPath(ctx, PANEL.x, PANEL.y, PANEL.width, PANEL.height, 16);
  ctx.fill();
  if (image) {
    const aspect = image.naturalWidth / image.naturalHeight;
    let width = PANEL.width;
    let height = width / aspect;
    if (height > PANEL.height) {
      height = PANEL.height;
      width = height * aspect;
    }
    ctx.drawImage(image, PANEL.x + (PANEL.width - width) / 2, PANEL.y + (PANEL.height - height) / 2, width, height);
  }
  const flash = 1 - smoothstep(0.8, 1.2, u);
  if (flash > 0.01) {
    ctx.fillStyle = `rgba(230,216,74,${0.35 * flash})`;
    ctx.fillRect(PANEL.x, PANEL.y, PANEL.width, PANEL.height);
  }

  const colX = PANEL.x + PANEL.width + 24;
  let y = PANEL.y + 24;
  setFont(ctx, 13, 700, true);
  ctx.fillStyle = LEMON;
  ctx.fillText(credential.tag, colX, y);
  if (credential.top10) {
    setFont(ctx, 11, 700, true);
    ctx.fillStyle = "#0D0C0A";
    const label = "TOP 10";
    const labelWidth = ctx.measureText(label).width + 16;
    ctx.fillStyle = LEMON;
    roundedRectPath(ctx, colX + ctx.measureText(credential.tag).width + 12, y - 14, labelWidth, 20, 10);
    ctx.fill();
    ctx.fillStyle = "#0D0C0A";
    ctx.fillText(label, colX + ctx.measureText(credential.tag).width + 20, y + 1);
  }
  y += 40;
  setFont(ctx, 26, 800);
  ctx.fillStyle = BONE;
  ctx.fillText(credential.title, colX, y);
  y += 32;
  setFont(ctx, 16, 500);
  ctx.fillStyle = "#C9C2B5";
  ctx.fillText(credential.issuer, colX, y);
  y += 36;

  if (credential.hours) {
    setFont(ctx, 14, 500, true);
    ctx.fillStyle = STONE;
    ctx.fillText(HOURS_LABEL[locale](credential.hours), colX, y);
    y += 26;
  }
  if (credential.dateLabel) {
    ctx.fillText(credential.dateLabel, colX, y);
    y += 26;
  }
  if (credential.certifiedBy) {
    ctx.fillText(CERTIFIED_BY_LABEL[locale](credential.certifiedBy), colX, y);
    y += 26;
  }

  y += 16;
  setFont(ctx, 15, 700, true);
  ctx.fillStyle = LEMON;
  ctx.fillText(VERIFIED_LABEL[locale], colX, y);

  const chipY = PANEL.y + PANEL.height + 32;
  const chipGap = 14;
  const chipSize = 28;
  for (let i = 0; i < 5; i++) {
    const chipX = PANEL.x + i * (chipSize + chipGap);
    ctx.strokeStyle = i === index ? LEMON : "#4A443B";
    ctx.lineWidth = 2;
    roundedRectPath(ctx, chipX, chipY, chipSize, chipSize, 14);
    if (i < index || (i === index && u > 0.9)) {
      ctx.fillStyle = i === index ? LEMON : "#2E2A24";
      ctx.fill();
    }
    ctx.stroke();
  }
}
