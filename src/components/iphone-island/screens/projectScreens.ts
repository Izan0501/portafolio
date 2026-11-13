import type { Locale } from "@/i18n/config";
import type { ProjectContent } from "@/types/content";
import { fpsStore } from "@/features/scroll/fpsStore";

/**
 * The iPhone's per-project screens — the artifact dispatches these by a
 * `ph` code each shot carries (`ph = sh ? sh.ph : id`, 14 real branches:
 * feed/alert/sale — Nave24; score/twin/verdict — VeeBot; emini/areas/echat
 * — Estudio; gal — Mel (with a *real* FPS counter, not invented);
 * cmini/pick/cchat — Consultorio). `content/projects.ts`'s `ShowcaseShot`
 * never ported that `ph` code, so which of a project's 3 real shots maps
 * to which screen below is inferred from their already-real content
 * (hotspot text, island labels) matching the artifact's own branch
 * descriptions — documented per project, not a literal citation of the
 * `ph` field itself.
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
  setFont(ctx, 20, 700);
  ctx.fillStyle = BONE;
  ctx.fillText(title, 24, TOP);
  setFont(ctx, 11, 500, true);
  ctx.fillStyle = STONE;
  ctx.fillText(subtitle, 24, TOP + 22);
  ctx.strokeStyle = "#2E2A24";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, TOP + 38);
  ctx.lineTo(LOGICAL_WIDTH, TOP + 38);
  ctx.stroke();
}

function clearScreen(ctx: CanvasRenderingContext2D): void {
  const scale = ctx.canvas.width / LOGICAL_WIDTH;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillStyle = "#0B0A09";
  ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
}

export interface DrawProjectScreenParams {
  project: ProjectContent;
  shotIndex: number;
  t: number;
  locale: Locale;
}

export function projectScreenKey(projectId: string, shotIndex: number, t: number, locale: Locale): string {
  return `pscreen|${projectId}|${shotIndex}|${Math.floor(t * 4)}|${locale}`;
}

function drawNave24(ctx: CanvasRenderingContext2D, shotIndex: number, t: number, locale: Locale): void {
  if (shotIndex === 0) {
    drawHeader(ctx, "nave24.feed", locale === "es" ? "movimientos en vivo" : "live movements");
    const movements = [
      ["+12", locale === "es" ? "Bebidas" : "Drinks"],
      ["−3", locale === "es" ? "Alimentos" : "Food"],
      ["+8", locale === "es" ? "Golosinas" : "Candy"],
    ];
    movements.forEach((row, i) => {
      const y = TOP + 70 + i * 60;
      ctx.fillStyle = "#171512";
      roundedRectPath(ctx, 16, y, LOGICAL_WIDTH - 32, 48, 14);
      ctx.fill();
      setFont(ctx, 16, 700);
      ctx.fillStyle = row[0].startsWith("+") ? LEMON : "#E6704A";
      ctx.fillText(row[0], 28, y + 30);
      setFont(ctx, 13, 500);
      ctx.fillStyle = BONE;
      ctx.fillText(row[1], 90, y + 30);
    });
  } else if (shotIndex === 1) {
    drawHeader(ctx, "nave24.alert", locale === "es" ? "stock bajo umbral" : "below threshold");
    ctx.fillStyle = "rgba(230,216,74,0.1)";
    roundedRectPath(ctx, 16, TOP + 70, LOGICAL_WIDTH - 32, 120, 16);
    ctx.fill();
    setFont(ctx, 40, 800);
    ctx.fillStyle = LEMON;
    ctx.fillText("4", 32, TOP + 130);
    setFont(ctx, 13, 500, true);
    ctx.fillStyle = STONE;
    ctx.fillText(locale === "es" ? "unidades restantes" : "units remaining", 32, TOP + 155);
    ctx.fillStyle = LEMON;
    roundedRectPath(ctx, 16, TOP + 210, LOGICAL_WIDTH - 32, 48, 24);
    ctx.fill();
    setFont(ctx, 14, 700);
    ctx.fillStyle = "#0D0C0A";
    ctx.textAlign = "center";
    ctx.fillText(locale === "es" ? "Reponer ahora" : "Reorder now", LOGICAL_WIDTH / 2, TOP + 238);
    ctx.textAlign = "left";
  } else {
    drawHeader(ctx, "nave24.sale", locale === "es" ? "checkout en curso" : "checkout in progress");
    const items = [["Coca-Cola 500ml", "x2"], ["Alfajor Terrabusi", "x1"]];
    items.forEach((item, i) => {
      const y = TOP + 70 + i * 46;
      setFont(ctx, 14, 600);
      ctx.fillStyle = BONE;
      ctx.fillText(item[0], 16, y);
      setFont(ctx, 13, 500, true);
      ctx.fillStyle = STONE;
      ctx.textAlign = "right";
      ctx.fillText(item[1], LOGICAL_WIDTH - 16, y);
      ctx.textAlign = "left";
    });
    const pulse = 0.5 + 0.5 * Math.sin(t * 3);
    setFont(ctx, 13, 700, true);
    ctx.fillStyle = `rgba(230,216,74,${0.5 + pulse * 0.5})`;
    ctx.fillText(locale === "es" ? "stock −3 ✓" : "stock −3 ✓", 16, TOP + 180);
  }
}

function drawVeeBot(ctx: CanvasRenderingContext2D, shotIndex: number, t: number, locale: Locale): void {
  if (shotIndex === 0) {
    drawHeader(ctx, "veebot.score", locale === "es" ? "calidad global" : "overall quality");
    const score = 78;
    const cx = LOGICAL_WIDTH / 2;
    const cy = TOP + 140;
    const radius = 70;
    ctx.strokeStyle = "#2E2A24";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = LEMON;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + (score / 100) * Math.PI * 2);
    ctx.stroke();
    setFont(ctx, 36, 800);
    ctx.fillStyle = LEMON;
    ctx.textAlign = "center";
    ctx.fillText(String(score), cx, cy + 12);
    ctx.textAlign = "left";
  } else if (shotIndex === 1) {
    drawHeader(ctx, "veebot.twin", locale === "es" ? "gemelo digital" : "digital twin");
    const bubbles = locale === "es" ? ["¿Qué experiencia tiene en React?", "3 años, liderando migraciones a TypeScript."] : ["What's their React experience?", "3 years, leading TypeScript migrations."];
    bubbles.forEach((text, i) => {
      const y = TOP + 70 + i * 70;
      const isQuestion = i % 2 === 0;
      ctx.fillStyle = isQuestion ? "#171512" : "rgba(230,216,74,0.12)";
      roundedRectPath(ctx, isQuestion ? 16 : 60, y, LOGICAL_WIDTH - 76, 56, 16);
      ctx.fill();
      setFont(ctx, 12, 500);
      ctx.fillStyle = isQuestion ? STONE : BONE;
      ctx.fillText(text, isQuestion ? 28 : 72, y + 32);
    });
  } else {
    drawHeader(ctx, "veebot.verdict", locale === "es" ? "comparación de tenants" : "tenant comparison");
    const tenants = [["A", "82"], ["B", "74"]];
    tenants.forEach((tenant, i) => {
      const x = 16 + i * ((LOGICAL_WIDTH - 32) / 2 + 8);
      ctx.fillStyle = "#171512";
      roundedRectPath(ctx, x, TOP + 70, (LOGICAL_WIDTH - 48) / 2, 100, 14);
      ctx.fill();
      setFont(ctx, 12, 600, true);
      ctx.fillStyle = STONE;
      ctx.fillText(`Tenant ${tenant[0]}`, x + 16, TOP + 95);
      setFont(ctx, 32, 800);
      ctx.fillStyle = LEMON;
      ctx.fillText(tenant[1], x + 16, TOP + 140);
    });
  }
}

function drawEstudio(ctx: CanvasRenderingContext2D, shotIndex: number, locale: Locale): void {
  if (shotIndex === 0) {
    drawHeader(ctx, "estudio.mini", locale === "es" ? "versión móvil · recreación del layout" : "mobile version · layout recreation");
    setFont(ctx, 24, 800);
    ctx.fillStyle = BONE;
    ctx.fillText(locale === "es" ? "Estudio Zanacchi" : "Zanacchi Law Office", 24, TOP + 80);
    setFont(ctx, 13, 500, true);
    ctx.fillStyle = STONE;
    ctx.fillText(locale === "es" ? "Consulta directa" : "Direct consultation", 24, TOP + 104);
  } else if (shotIndex === 1) {
    drawHeader(ctx, "estudio.areas", locale === "es" ? "áreas de práctica" : "practice areas");
    const areas = locale === "es" ? ["Derecho del consumidor", "Derecho penal", "Derecho de género"] : ["Consumer law", "Criminal law", "Gender law"];
    areas.forEach((area, i) => {
      const y = TOP + 70 + i * 50;
      ctx.fillStyle = "#171512";
      roundedRectPath(ctx, 16, y, LOGICAL_WIDTH - 32, 40, 12);
      ctx.fill();
      setFont(ctx, 13, 600);
      ctx.fillStyle = BONE;
      ctx.fillText(area, 28, y + 26);
    });
  } else {
    drawHeader(ctx, "estudio.chat", locale === "es" ? "chat seguro, pre-cargado" : "secure chat, pre-loaded");
    setFont(ctx, 13, 500);
    ctx.fillStyle = STONE;
    ctx.fillText(locale === "es" ? "Naturaleza del conflicto:" : "Nature of the conflict:", 24, TOP + 70);
    ctx.fillStyle = "rgba(230,216,74,0.12)";
    roundedRectPath(ctx, 16, TOP + 90, LOGICAL_WIDTH - 32, 56, 16);
    ctx.fill();
    setFont(ctx, 13, 600);
    ctx.fillStyle = BONE;
    ctx.fillText(locale === "es" ? "Consumidor — producto defectuoso" : "Consumer — defective product", 28, TOP + 122);
  }
}

function drawMel(ctx: CanvasRenderingContext2D, shotIndex: number, fps: number, locale: Locale): void {
  drawHeader(ctx, "mel.gal", locale === "es" ? "galería · rendimiento real" : "gallery · real performance");
  ctx.fillStyle = "#171512";
  roundedRectPath(ctx, 16, TOP + 70, LOGICAL_WIDTH - 32, 200, 16);
  ctx.fill();
  setFont(ctx, 13, 600, true);
  ctx.fillStyle = STONE;
  ctx.fillText(`${shotIndex + 1} / 3`, 32, TOP + 100);
  setFont(ctx, 28, 800);
  ctx.fillStyle = fps >= 55 ? LEMON : "#E6704A";
  ctx.fillText(`${Math.round(fps)} fps`, 32, TOP + 150);
  setFont(ctx, 11, 500, true);
  ctx.fillStyle = STONE;
  ctx.fillText(locale === "es" ? "en vivo" : "live", 32, TOP + 170);
}

function drawConsultorio(ctx: CanvasRenderingContext2D, shotIndex: number, locale: Locale): void {
  if (shotIndex === 0) {
    drawHeader(ctx, "consultorio.mini", locale === "es" ? "versión móvil · recreación del layout" : "mobile version · layout recreation");
    setFont(ctx, 24, 800);
    ctx.fillStyle = BONE;
    ctx.fillText(locale === "es" ? "Consultorio" : "Dental Office", 24, TOP + 80);
  } else if (shotIndex === 1) {
    drawHeader(ctx, "consultorio.pick", locale === "es" ? "selector de tratamiento" : "treatment picker");
    const treatments = locale === "es" ? ["Aclaramiento láser", "Ortodoncia invisible", "Implantes"] : ["Laser whitening", "Invisible orthodontics", "Implants"];
    treatments.forEach((treatment, i) => {
      const y = TOP + 70 + i * 48;
      const active = i === 0;
      ctx.strokeStyle = active ? LEMON : "#2E2A24";
      ctx.lineWidth = 2;
      roundedRectPath(ctx, 16, y, LOGICAL_WIDTH - 32, 38, 19);
      ctx.stroke();
      setFont(ctx, 13, 600);
      ctx.fillStyle = active ? LEMON : BONE;
      ctx.fillText(treatment, 32, y + 25);
    });
  } else {
    drawHeader(ctx, "consultorio.chat", locale === "es" ? "chat pre-cargado" : "pre-loaded chat");
    setFont(ctx, 13, 500);
    ctx.fillStyle = STONE;
    ctx.fillText(locale === "es" ? "Tratamiento elegido:" : "Chosen treatment:", 24, TOP + 70);
    ctx.fillStyle = "rgba(230,216,74,0.12)";
    roundedRectPath(ctx, 16, TOP + 90, LOGICAL_WIDTH - 32, 56, 16);
    ctx.fill();
    setFont(ctx, 13, 600);
    ctx.fillStyle = BONE;
    ctx.fillText(locale === "es" ? "Aclaramiento láser · 1 sesión" : "Laser whitening · 1 session", 28, TOP + 122);
  }
}

export function drawProjectScreen(ctx: CanvasRenderingContext2D, { project, shotIndex, t, locale }: DrawProjectScreenParams): void {
  clearScreen(ctx);
  switch (project.id) {
    case "nave24-stock":
      drawNave24(ctx, shotIndex, t, locale);
      break;
    case "veebot-saas":
      drawVeeBot(ctx, shotIndex, t, locale);
      break;
    case "estudio-zanacchi":
      drawEstudio(ctx, shotIndex, locale);
      break;
    case "portafolio-mel":
      // Real measured frame rate (`fpsStore`, updated every frame from
      // `FrameDriver.tsx`) — not an invented number, matches the
      // artifact's own `this.fps.val`.
      drawMel(ctx, shotIndex, fpsStore.value, locale);
      break;
    case "consultorio-odontologico":
      drawConsultorio(ctx, shotIndex, locale);
      break;
    default:
      break;
  }
}
