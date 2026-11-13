import type { Locale } from "@/i18n/config";
import { getProfileImage } from "@/components/three/textures/profileImage";

/**
 * The Mac screen's "prof" draw — ported 1:1 from the approved artifact
 * (`docs/reference/artifact-a/Hero.dc.html`, `_drawMac`'s `mode === 'prof'`
 * branch, lines 1587-1624). Driven by `st.k` (progress *within* the
 * chapter, not the global `p` `boot.ts` uses) through a handful of
 * independent `smoothstep` windows (artifact's own `rv(a,b)` helper).
 */

const BONE = "#EEE9DF";
const STONE = "#A39C8F";
const LEMON = "#E6D84A";

const LOGICAL_WIDTH = 1280;
const LOGICAL_HEIGHT = 800;

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

function drawDot(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

const PILLARS: Record<Locale, readonly string[]> = {
  es: ["CÓDIGO LIMPIO", "ARQUITECTURA ESCALABLE", "SDD", "CERO REGRESIONES"],
  en: ["CLEAN CODE", "SCALABLE ARCHITECTURE", "SDD", "ZERO REGRESSIONS"],
};

/** Artifact `E` — real timeline milestones, year/title/detail. Project/course proper nouns stay as-is across locales. */
const TIMELINE: Record<Locale, ReadonlyArray<readonly [number, string, string]>> = {
  es: [
    [2023, "Ciberseguridad", "Coderhouse · nov"],
    [2024, "JavaScript · Apps TOP 10", "Coderhouse · UTN inicia"],
    [2025, "Python", "Coderhouse · dic"],
    [2026, "Ciberseguridad", "UGR · en curso"],
    [2027, "Técnico en Programación", "UTN · meta feb"],
  ],
  en: [
    [2023, "Cybersecurity", "Coderhouse · nov"],
    [2024, "JavaScript · Top 10 Apps", "Coderhouse · UTN starts"],
    [2025, "Python", "Coderhouse · dec"],
    [2026, "Cybersecurity", "UGR · ongoing"],
    [2027, "Programming Technician", "UTN · target feb"],
  ],
};

const AVAILABLE_LABEL: Record<Locale, string> = { es: "DISPONIBLE PARA EQUIPOS", en: "AVAILABLE FOR TEAMS" };
const PROFILE_EYEBROW: Record<Locale, string> = { es: "PERFIL · 02 / 11", en: "PROFILE · 02 / 11" };
const ROLE_LABEL = "Full-Stack Developer";
const BASE_LABEL: Record<Locale, string> = { es: "TUCUMÁN, ARGENTINA  ·  UTN FRT  ·  UGR", en: "TUCUMÁN, ARGENTINA  ·  UTN FRT  ·  UGR" };
const TIMELINE_LABEL: Record<Locale, string> = { es: "TRAYECTORIA", en: "TIMELINE" };
const PRACTICE_LABEL: Record<Locale, string> = {
  es: "SCRUM · SPRINT PLANNING · DAILIES · BACKLOG · RETROS · ASYNC",
  en: "SCRUM · SPRINT PLANNING · DAILIES · BACKLOG · RETROS · ASYNC",
};
const STACK_HINT_LABEL: Record<Locale, string> = { es: "▲ STACK · 4 CAPAS", en: "▲ STACK · 4 LAYERS" };

export interface DrawProfileParams {
  /** Progress *within* the prof chapter, 0..1 (artifact `st.k`). */
  chapterProgress: number;
  /** Elapsed time, in seconds — drives the small pulsing availability dot. */
  t: number;
  locale: Locale;
}

export function profileScreenKey(chapterProgress: number, t: number, locale: Locale): string {
  const hasPhoto = getProfileImage() !== null;
  return `profile|${locale}|${hasPhoto}|${Math.round(chapterProgress * 300)}|${Math.floor(t * 8)}`;
}

export function drawProfile(ctx: CanvasRenderingContext2D, { chapterProgress: k, t, locale }: DrawProfileParams): void {
  const scale = ctx.canvas.width / LOGICAL_WIDTH;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  // Unlike the artifact's `_drawMac` (one function, clears once up front
  // for every mode), each mode here is its own standalone draw function —
  // without this, switching from `boot` would leave its last frame
  // showing through underneath this one.
  ctx.fillStyle = "#0B0A09";
  ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
  const rv = (a: number, b: number) => smoothstep(a, b, k);

  // Photo with lemon corner brackets + availability status.
  const photoAlpha = rv(0.0, 0.12);
  ctx.globalAlpha = photoAlpha;
  ctx.save();
  roundedRectPath(ctx, 72, 92, 300, 300, 24);
  ctx.clip();
  const photo = getProfileImage();
  if (photo) ctx.drawImage(photo, 72, 92, 300, 300);
  ctx.restore();
  ctx.strokeStyle = LEMON;
  ctx.lineWidth = 4;
  for (const [cx, cy, sx, sy] of [
    [60, 80, 1, 1],
    [384, 80, -1, 1],
    [60, 404, 1, -1],
    [384, 404, -1, -1],
  ]) {
    ctx.beginPath();
    ctx.moveTo(cx, cy + sy * 34);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + sx * 34, cy);
    ctx.stroke();
  }
  drawDot(ctx, 84, 444, 8 + Math.sin(t * 4) * 1.2, LEMON);
  setFont(ctx, 16, 600, true);
  ctx.fillStyle = LEMON;
  ctx.fillText(AVAILABLE_LABEL[locale], 104, 450);

  // Identity: big name, role, base.
  const identityAlpha = rv(0.04, 0.18);
  ctx.globalAlpha = identityAlpha;
  setFont(ctx, 15, 600, true);
  ctx.fillStyle = STONE;
  ctx.fillText(PROFILE_EYEBROW[locale], 430, 118);
  setFont(ctx, 92, 800);
  ctx.fillStyle = BONE;
  ctx.fillText("Ivo Zanacchi", 426 - (1 - identityAlpha) * 30, 210);
  setFont(ctx, 32, 500);
  ctx.fillStyle = "#C9C2B5";
  ctx.fillText(ROLE_LABEL, 430, 262);
  setFont(ctx, 16, 500, true);
  ctx.fillStyle = STONE;
  ctx.fillText(BASE_LABEL[locale], 430, 302);

  // Pillars as chips.
  const pillars = PILLARS[locale];
  let chipX = 430;
  setFont(ctx, 15, 600, true);
  pillars.forEach((pillar, i) => {
    const a = rv(0.12 + i * 0.04, 0.22 + i * 0.04);
    const w = ctx.measureText(pillar).width + 36;
    ctx.globalAlpha = a;
    ctx.strokeStyle = i === 2 ? LEMON : "#4A443B";
    ctx.lineWidth = 2;
    roundedRectPath(ctx, chipX, 336 + (1 - a) * 12, w, 42, 21);
    ctx.stroke();
    ctx.fillStyle = i === 2 ? LEMON : BONE;
    ctx.fillText(pillar, chipX + 18, 363 + (1 - a) * 12);
    chipX += w + 12;
  });
  ctx.globalAlpha = 1;

  // Timeline: a real progress rail with 5 real milestones.
  const timeline = TIMELINE[locale];
  const x0 = 110;
  const x1 = 1170;
  const lineY = 590;
  const head = rv(0.2, 0.75);
  setFont(ctx, 14, 600, true);
  ctx.fillStyle = STONE;
  ctx.fillText(TIMELINE_LABEL[locale], 72, 520);
  ctx.strokeStyle = "#2E2A24";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x0, lineY);
  ctx.lineTo(x1, lineY);
  ctx.stroke();
  ctx.strokeStyle = LEMON;
  ctx.beginPath();
  ctx.moveTo(x0, lineY);
  ctx.lineTo(x0 + (x1 - x0) * head, lineY);
  ctx.stroke();
  timeline.forEach(([year, title, detail], i) => {
    const ex = x0 + (x1 - x0) * (i / 4);
    const on = head * 4 >= i - 0.02;
    const up = i % 2 === 0;
    drawDot(ctx, ex, lineY, on ? 10 : 6, on ? LEMON : "#4A443B");
    ctx.globalAlpha = on ? 1 : 0.35;
    ctx.textAlign = i === 0 ? "left" : i === 4 ? "right" : "center";
    const tx = i === 0 ? ex - 10 : i === 4 ? ex + 10 : ex;
    setFont(ctx, 22, 800);
    ctx.fillStyle = on ? LEMON : STONE;
    ctx.fillText(String(year), tx, up ? lineY - 28 : lineY + 46);
    setFont(ctx, 19, 600);
    ctx.fillStyle = BONE;
    ctx.fillText(title, tx, up ? lineY + 46 : lineY - 50);
    setFont(ctx, 13, 500, true);
    ctx.fillStyle = STONE;
    // Artifact: `LY - 28 - 50 + 26 + 26` = `LY - 26`, not a round number on its own.
    ctx.fillText(detail, tx, up ? lineY + 72 : lineY - 26);
    ctx.globalAlpha = 1;
    ctx.textAlign = "left";
  });

  setFont(ctx, 14, 500, true);
  ctx.fillStyle = STONE;
  ctx.fillText(PRACTICE_LABEL[locale], 72, 762);

  // Hint: the stack now lives above the lid.
  const stackHintAlpha = rv(0.2, 0.32) * (1 - rv(0.84, 0.9));
  ctx.globalAlpha = stackHintAlpha;
  setFont(ctx, 14, 600, true);
  ctx.fillStyle = LEMON;
  ctx.textAlign = "right";
  ctx.fillText(STACK_HINT_LABEL[locale], 1208, 118);
  ctx.textAlign = "left";
  ctx.globalAlpha = 1;
}
