import type { Locale } from "@/i18n/config";
import type { Credential } from "@/types/content";
import { smoothstep } from "@/lib/math/ease";

/**
 * The iPhone screen's "cert" draws — reconstructed from a descriptive
 * summary of the artifact's `_phCase` (briefcase opening checklist) and
 * the certificate-active view, not a line-for-line citation (same
 * caveat as `macbook/screens/certv.ts`/`form.ts`).
 *
 * `_phCase` (no certificate active yet): header "maletin.sh", a 4-step
 * checklist (left/right hasp, lid, "credencial 01 → Mac") ticking off at
 * fixed `k` thresholds (0.04/0.055/0.12/0.2), an open/closed lock icon.
 *
 * Certificate-active view: the real cropped image, org + "TOP 10", title,
 * hours/date, "Certificado por X", and 5 progress dots (active one larger
 * and lemon).
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

const CHECKLIST_STEPS: Record<Locale, readonly string[]> = {
  es: ["Cierre izquierdo", "Cierre derecho", "Tapa", "Credencial 01 → Mac"],
  en: ["Left hasp", "Right hasp", "Lid", "Credential 01 → Mac"],
};
const CHECKLIST_THRESHOLDS: readonly number[] = [0.04, 0.055, 0.12, 0.2];
const CASE_HEADER_SUBTITLE: Record<Locale, string> = { es: "apertura verificada", en: "opening verified" };

export function caseScreenKey(chapterProgress: number, locale: Locale): string {
  return `case|${locale}|${Math.round(chapterProgress * 300)}`;
}

export function drawCase(ctx: CanvasRenderingContext2D, chapterProgress: number, locale: Locale): void {
  const scale = ctx.canvas.width / LOGICAL_WIDTH;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillStyle = "#0B0A09";
  ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

  drawHeader(ctx, "maletin.sh", CASE_HEADER_SUBTITLE[locale], TOP);

  const steps = CHECKLIST_STEPS[locale];
  steps.forEach((step, i) => {
    const done = chapterProgress >= CHECKLIST_THRESHOLDS[i];
    const y = TOP + 70 + i * 54;
    ctx.strokeStyle = done ? LEMON : "#4A443B";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(32, y, 11, 0, Math.PI * 2);
    ctx.stroke();
    if (done) {
      ctx.fillStyle = LEMON;
      ctx.beginPath();
      ctx.arc(32, y, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#0D0C0A";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(27, y);
      ctx.lineTo(31, y + 4);
      ctx.lineTo(38, y - 5);
      ctx.stroke();
    }
    setFont(ctx, 14, 600);
    ctx.fillStyle = done ? BONE : STONE;
    ctx.fillText(step, 54, y + 5);
  });

  const lockOpen = chapterProgress >= CHECKLIST_THRESHOLDS[2];
  const lockY = TOP + 70 + steps.length * 54 + 40;
  ctx.strokeStyle = lockOpen ? LEMON : STONE;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(LOGICAL_WIDTH / 2 - 16, lockY, 32, 24, 4);
  ctx.stroke();
  ctx.beginPath();
  if (lockOpen) ctx.arc(LOGICAL_WIDTH / 2 - 4, lockY, 12, Math.PI, Math.PI * 1.85);
  else ctx.arc(LOGICAL_WIDTH / 2, lockY, 12, Math.PI, Math.PI * 2);
  ctx.stroke();
}

export interface DrawCaseCredentialParams {
  credential: Credential;
  /** This certificate's own local progress (artifact `u`). */
  localProgress: number;
  activeIndex: number;
  image: HTMLImageElement | null;
  locale: Locale;
}

export function caseCredentialScreenKey(index: number, localProgress: number, hasImage: boolean, locale: Locale): string {
  return `casecred|${locale}|${index}|${hasImage}|${Math.round(localProgress * 100)}`;
}

export function drawCaseCredential(ctx: CanvasRenderingContext2D, { credential, localProgress: u, activeIndex, image, locale }: DrawCaseCredentialParams): void {
  const scale = ctx.canvas.width / LOGICAL_WIDTH;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillStyle = "#0B0A09";
  ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

  const imageHeight = 180;
  if (image) {
    const aspect = image.naturalWidth / image.naturalHeight;
    const drawWidth = imageHeight * aspect;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, LOGICAL_WIDTH, imageHeight);
    ctx.clip();
    ctx.drawImage(image, (LOGICAL_WIDTH - drawWidth) / 2, 0, drawWidth, imageHeight);
    ctx.restore();
  }
  const settle = 1 - smoothstep(0.8, 1.2, u);
  if (settle > 0.01) {
    ctx.fillStyle = `rgba(230,216,74,${0.3 * settle})`;
    ctx.fillRect(0, 0, LOGICAL_WIDTH, imageHeight);
  }

  let y = imageHeight + 36;
  setFont(ctx, 12, 700, true);
  ctx.fillStyle = LEMON;
  ctx.fillText(credential.issuer + (credential.top10 ? " · TOP 10" : ""), 24, y);
  y += 30;
  setFont(ctx, 20, 800);
  ctx.fillStyle = BONE;
  ctx.fillText(credential.title, 24, y);
  y += 30;
  if (credential.hours) {
    setFont(ctx, 12, 500, true);
    ctx.fillStyle = STONE;
    ctx.fillText(locale === "es" ? `${credential.hours} horas` : `${credential.hours} hours`, 24, y);
    y += 22;
  }
  if (credential.dateLabel) {
    ctx.fillText(credential.dateLabel, 24, y);
    y += 22;
  }
  if (credential.certifiedBy) {
    ctx.fillText(locale === "es" ? `Certificado por ${credential.certifiedBy}` : `Certified by ${credential.certifiedBy}`, 24, y);
    y += 22;
  }

  const dotsY = LOGICAL_HEIGHT - 48;
  const spacing = 36;
  const startX = LOGICAL_WIDTH / 2 - (spacing * 4) / 2;
  for (let i = 0; i < 5; i++) {
    const isActive = i === activeIndex;
    ctx.fillStyle = isActive ? LEMON : "#4A443B";
    ctx.beginPath();
    ctx.arc(startX + i * spacing, dotsY, isActive ? 6 : 4, 0, Math.PI * 2);
    ctx.fill();
  }
}
