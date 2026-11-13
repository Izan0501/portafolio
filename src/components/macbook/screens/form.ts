import type { Locale } from "@/i18n/config";
import { programProgress } from "@/features/chapters/programProgress";
import { CREDENTIALS } from "@/content/credentials";

/**
 * The Mac screen's "form" draw (briefcase visible, no certificate active
 * yet, or the tail end once Formación finished) — reconstructed from a
 * descriptive summary, not a line-for-line citation (same caveat as
 * `certv.ts`). Confirmed real content: header "formación.sh", 2 real
 * degree panels (UTN/UGR), a progress bar, and the 5 certificates marking
 * themselves verified as the chapter advances.
 *
 * The progress bar's percentage is computed from real dates (confirmed
 * with Ivo) — the artifact's own fixed "62%" has no visible formula
 * deriving it and is already stale (today's real UTN progress is ~91%,
 * not 62%).
 */

const BONE = "#EEE9DF";
const STONE = "#A39C8F";
const LEMON = "#E6D84A";

const LOGICAL_WIDTH = 1280;
const LOGICAL_HEIGHT = 800;

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

interface Degree {
  institution: string;
  title: Record<Locale, string>;
  start: string;
  end: string | null;
  statusLabel: Record<Locale, string>;
}

/** Same real dates as the ID badge's back face (M9, `ProfileBadge.tsx`). */
const DEGREES: readonly Degree[] = [
  { institution: "UTN FR Tucumán", title: { es: "Técnico en Programación", en: "Programming Technician" }, start: "2024-04-01", end: "2027-02-28", statusLabel: { es: "EN CURSO", en: "ONGOING" } },
  { institution: "UGR", title: { es: "Tecnicatura en Ciberseguridad", en: "Cybersecurity Degree" }, start: "2026-03-01", end: null, statusLabel: { es: "EN CURSO", en: "ONGOING" } },
];

const HEADER_SUBTITLE: Record<Locale, string> = { es: "2 carreras · 5 certificaciones", en: "2 degrees · 5 certifications" };
const IN_BRIEFCASE_LABEL: Record<Locale, string> = { es: "EN EL MALETÍN", en: "IN THE BRIEFCASE" };
const VERIFIED_LABEL: Record<Locale, string> = { es: "✓ VERIFICADA", en: "✓ VERIFIED" };

export interface DrawFormParams {
  /** How many certificates have already been verified (artifact `ver`: `st.mc`, or 4 once Formación is fully done). */
  verifiedCount: number;
  locale: Locale;
  now: Date;
}

export function formScreenKey(verifiedCount: number, locale: Locale, now: Date): string {
  return `form|${locale}|${verifiedCount}|${now.toDateString()}`;
}

export function drawForm(ctx: CanvasRenderingContext2D, { verifiedCount, locale, now }: DrawFormParams): void {
  const scale = ctx.canvas.width / LOGICAL_WIDTH;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillStyle = "#0B0A09";
  ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

  setFont(ctx, 22, 700);
  ctx.fillStyle = BONE;
  ctx.fillText("formación.sh", 72, 80);
  setFont(ctx, 13, 500, true);
  ctx.fillStyle = STONE;
  ctx.fillText(HEADER_SUBTITLE[locale], 72, 104);

  let y = 150;
  for (const degree of DEGREES) {
    ctx.fillStyle = "#171512";
    roundedRectPath(ctx, 72, y, 540, 110, 16);
    ctx.fill();
    setFont(ctx, 18, 700);
    ctx.fillStyle = BONE;
    ctx.fillText(degree.institution, 96, y + 36);
    setFont(ctx, 14, 500);
    ctx.fillStyle = "#C9C2B5";
    ctx.fillText(degree.title[locale], 96, y + 60);
    setFont(ctx, 11, 600, true);
    ctx.fillStyle = LEMON;
    ctx.fillText(degree.statusLabel[locale], 96, y + 86);

    if (degree.end) {
      const progress = programProgress(degree.start, degree.end, now);
      const barX = 350;
      const barWidth = 240;
      ctx.strokeStyle = "#2E2A24";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(barX, y + 40);
      ctx.lineTo(barX + barWidth, y + 40);
      ctx.stroke();
      ctx.strokeStyle = LEMON;
      ctx.beginPath();
      ctx.moveTo(barX, y + 40);
      ctx.lineTo(barX + barWidth * progress, y + 40);
      ctx.stroke();
      setFont(ctx, 20, 800);
      ctx.fillStyle = LEMON;
      ctx.fillText(`${Math.round(progress * 100)}%`, barX, y + 70);
    }
    y += 130;
  }

  y += 10;
  setFont(ctx, 13, 600, true);
  ctx.fillStyle = STONE;
  ctx.fillText(locale === "es" ? "CERTIFICACIONES" : "CERTIFICATIONS", 72, y);
  y += 24;
  for (let i = 0; i < CREDENTIALS.length; i++) {
    const verified = i < verifiedCount;
    const rowY = y + i * 44;
    ctx.fillStyle = "#141210";
    roundedRectPath(ctx, 72, rowY, 540, 36, 12);
    ctx.fill();
    setFont(ctx, 14, 600);
    ctx.fillStyle = verified ? LEMON : BONE;
    ctx.fillText(CREDENTIALS[i].title, 88, rowY + 24);
    setFont(ctx, 11, 600, true);
    ctx.fillStyle = verified ? LEMON : STONE;
    ctx.textAlign = "right";
    ctx.fillText(verified ? VERIFIED_LABEL[locale] : IN_BRIEFCASE_LABEL[locale], 596, rowY + 23);
    ctx.textAlign = "left";
  }
}
