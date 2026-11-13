import type { Locale } from "@/i18n/config";

/**
 * The iPhone screen's "prof" draw — ported 1:1 from the approved artifact
 * (`docs/reference/artifact-a/Hero.dc.html`, `_phProf`, lines 1762-1781).
 * Same logical 360×767 coordinate space as `PhoneScreen.ts`'s hero/open
 * draw, scaled to the real canvas resolution.
 *
 * The 4 figures animate as a count-up (`cnt`, artifact line 1766), not a
 * static number — rounds `figure.value * cnt` every redraw while `cnt` is
 * mid-ramp, matching the Mac's own equivalent numbers (`content/chapters.ts`'s
 * `prof.facts`: 5/2/5/2) but with different subtitles than that DOM copy —
 * verified against the artifact, not assumed to match.
 */

const BONE = "#EEE9DF";
const STONE = "#A39C8F";
const LEMON = "#E6D84A";

const LOGICAL_WIDTH = 360;
const LOGICAL_HEIGHT = 767;
const TOP = 100;

function setFont(ctx: CanvasRenderingContext2D, size: number, weight = 400, mono = false): void {
  ctx.font = `${weight} ${size}px ${mono ? '"Martian Mono", ui-monospace, monospace' : '"Schibsted Grotesk", system-ui, sans-serif'}`;
}

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

function smoothstep(a: number, b: number, x: number): number {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
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

const HEADER_TITLE: Record<Locale, string> = { es: "perfil.json", en: "profile.json" };
const HEADER_SUBTITLE = "Ivo Zanacchi · Full-Stack Developer";

interface Figure {
  value: number;
  label: string;
  detail: string;
}

const FIGURES: Record<Locale, readonly Figure[]> = {
  es: [
    { value: 5, label: "sistemas reales", detail: "web · móvil · SaaS" },
    { value: 2, label: "en producción", detail: "Nave24 · Estudio" },
    { value: 5, label: "certificaciones", detail: "DevSchool · Coderhouse" },
    { value: 2, label: "carreras", detail: "UTN · UGR" },
  ],
  en: [
    { value: 5, label: "real systems", detail: "web · mobile · SaaS" },
    { value: 2, label: "in production", detail: "Nave24 · Estudio" },
    { value: 5, label: "certifications", detail: "DevSchool · Coderhouse" },
    { value: 2, label: "degrees", detail: "UTN · UGR" },
  ],
};

const CONTACT_LABEL: Record<Locale, string> = { es: "CONTACTO", en: "CONTACT" };
const CONTACT_ROWS: ReadonlyArray<readonly [string, string]> = [
  ["Email", "ivozanacchi501@gmail.com"],
  ["LinkedIn", "in/ivo-zanacchi-87822326a"],
  ["GitHub", "github.com/Izan0501"],
];
const AVAILABLE_BUTTON_LABEL: Record<Locale, string> = { es: "Disponible para equipos", en: "Available for teams" };

export interface DrawProfileParams {
  /** Progress *within* the prof chapter, 0..1 (artifact `st.k`). */
  chapterProgress: number;
  locale: Locale;
}

export function profileScreenKey(chapterProgress: number, locale: Locale): string {
  return `profile|${locale}|${Math.round(chapterProgress * 300)}`;
}

export function drawProfile(ctx: CanvasRenderingContext2D, { chapterProgress: k, locale }: DrawProfileParams): void {
  const scale = ctx.canvas.width / LOGICAL_WIDTH;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillStyle = "#0B0A09";
  ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

  drawHeader(ctx, HEADER_TITLE[locale], HEADER_SUBTITLE, TOP);

  const countUp = smoothstep(0.08, 0.42, k);
  FIGURES[locale].forEach((figure, i) => {
    const cx = 16 + (i % 2) * 168;
    const cy = TOP + 60 + Math.floor(i / 2) * 150;
    const a = smoothstep(0.06 + i * 0.05, 0.16 + i * 0.05, k);
    ctx.globalAlpha = a;
    ctx.fillStyle = "#171512";
    roundedRectPath(ctx, cx, cy + (1 - a) * 14, 160, 138, 18);
    ctx.fill();
    ctx.strokeStyle = i === 0 ? "rgba(230,216,74,0.5)" : "#2E2A24";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    setFont(ctx, 56, 800);
    ctx.fillStyle = i === 0 ? LEMON : BONE;
    ctx.fillText(String(Math.round(figure.value * countUp)), cx + 16, cy + 66 + (1 - a) * 14);
    setFont(ctx, 15, 600);
    ctx.fillStyle = BONE;
    ctx.fillText(figure.label, cx + 16, cy + 96 + (1 - a) * 14);
    setFont(ctx, 10.5, 500, true);
    ctx.fillStyle = STONE;
    ctx.fillText(figure.detail, cx + 16, cy + 120 + (1 - a) * 14);
  });
  ctx.globalAlpha = 1;

  const contactTop = TOP + 370;
  const contactAlpha = smoothstep(0.3, 0.45, k);
  ctx.globalAlpha = contactAlpha;
  setFont(ctx, 11.5, 600, true);
  ctx.fillStyle = STONE;
  ctx.fillText(CONTACT_LABEL[locale], 24, contactTop);
  CONTACT_ROWS.forEach(([label, value], i) => {
    const y = contactTop + 18 + i * 58;
    ctx.fillStyle = "#141210";
    roundedRectPath(ctx, 16, y, LOGICAL_WIDTH - 32, 48, 14);
    ctx.fill();
    setFont(ctx, 11, 600, true);
    ctx.fillStyle = STONE;
    ctx.fillText(label.toUpperCase(), 32, y + 20);
    setFont(ctx, 14, 600);
    ctx.fillStyle = BONE;
    ctx.fillText(value, 32, y + 39);
  });

  const buttonTop = contactTop + 200;
  ctx.fillStyle = LEMON;
  roundedRectPath(ctx, 16, buttonTop, LOGICAL_WIDTH - 32, 50, 25);
  ctx.fill();
  setFont(ctx, 16, 700);
  ctx.fillStyle = "#0D0C0A";
  ctx.textAlign = "center";
  ctx.fillText(AVAILABLE_BUTTON_LABEL[locale], LOGICAL_WIDTH / 2, buttonTop + 32);
  ctx.textAlign = "left";
  ctx.globalAlpha = 1;
}
