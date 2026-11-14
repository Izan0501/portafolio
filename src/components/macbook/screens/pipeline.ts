import type { Locale } from "@/i18n/config";
import { pipelineStageAt } from "@/features/chapters/pipelineProgress";

/**
 * The Mac screen's `'pipe'` draw (Garantías) — ported 1:1 from the
 * approved artifact (`docs/reference/artifact-a/Hero.dc.html`, `_drawMac`
 * lines 1662-1675): `deploy.sh — ciclo de entrega`, 5 real stages, each
 * with a number, title, detail line, a thin in-progress bar while active,
 * and a status word (done/in-progress/pending).
 *
 * Stage copy here is the artifact's own short technical phrasing — the
 * DOM chapter (`Guarantees.tsx`) uses the slightly longer, outcome-framed
 * copy already approved in `content/chapters.ts`'s `pipe.steps`; both
 * describe the same real 5-stage process, phrased for their own medium.
 */

const BONE = "#EEE9DF";
const STONE = "#A39C8F";
const LEMON = "#E6D84A";
const PENDING = "#5C564C";
const IDLE_BORDER = "#2E2A24";

const LOGICAL_WIDTH = 1280;
const LOGICAL_HEIGHT = 800;
const STAGE_HEIGHT = 96;
const STAGE_GAP = 120;
const STAGE_TOP = 150;

const STAGES: Record<Locale, readonly (readonly [string, string])[]> = {
  es: [
    ["Spec-Driven", "Claude — diseño estructural · SDD · MCP · Skills"],
    ["Capa de acceso", "JWT / OAuth2 — rotación de access y refresh · revisión manual"],
    ["Contenedores", "Docker multi-etapa · Turbopack para frontend"],
    ["CI", "GitHub Actions — build · type-check · lint · QA manual pre-merge"],
    ["Release", "Docker // VPS // Vercel Edge + Cloudflare · verificación post-deploy"],
  ],
  en: [
    ["Spec-Driven", "Claude — structural design · SDD · MCP · Skills"],
    ["Access layer", "JWT / OAuth2 — access/refresh rotation · manual review"],
    ["Containers", "Multi-stage Docker · Turbopack for the frontend"],
    ["CI", "GitHub Actions — build · type-check · lint · manual QA pre-merge"],
    ["Release", "Docker // VPS // Vercel Edge + Cloudflare · post-deploy verification"],
  ],
};

const HEADER_TITLE: Record<Locale, string> = {
  es: "deploy.sh — ciclo de entrega",
  en: "deploy.sh — delivery cycle",
};

const STATUS_DONE: Record<Locale, string> = { es: "✓ OK", en: "✓ OK" };
const STATUS_PENDING = "—";

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

export interface DrawPipelineParams {
  /** Progress within the Garantías chapter, 0..1 (artifact `st.k`). */
  chapterProgress: number;
  t: number;
  locale: Locale;
}

export function pipelineScreenKey(chapterProgress: number, t: number, locale: Locale): string {
  return `pipeline|${Math.round(chapterProgress * 300)}|${Math.floor(t * 3)}|${locale}`;
}

export function drawPipeline(ctx: CanvasRenderingContext2D, { chapterProgress, t, locale }: DrawPipelineParams): void {
  const scale = ctx.canvas.width / LOGICAL_WIDTH;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillStyle = "#0B0A09";
  ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

  setFont(ctx, 16, 500, true);
  ctx.fillStyle = STONE;
  ctx.fillText(HEADER_TITLE[locale], 72, 72);

  const { activeIndex, stageProgress } = pipelineStageAt(chapterProgress);
  const stages = STAGES[locale];

  stages.forEach(([title, detail], i) => {
    const y = STAGE_TOP + i * STAGE_GAP;
    const isActive = i === activeIndex;
    const isDone = i < activeIndex;

    ctx.strokeStyle = isActive ? LEMON : IDLE_BORDER;
    ctx.lineWidth = 2;
    roundedRectPath(ctx, 72, y, 1136, STAGE_HEIGHT, 16);
    ctx.stroke();

    if (isActive) {
      ctx.fillStyle = "rgba(230,216,74,0.06)";
      ctx.fill();
      ctx.fillStyle = "rgba(230,216,74,0.22)";
      ctx.fillRect(74, y + STAGE_HEIGHT - 4, 1132 * stageProgress, 3);
    }

    setFont(ctx, 18, 600, true);
    ctx.fillStyle = isActive || isDone ? LEMON : STONE;
    ctx.fillText(String(i + 1).padStart(2, "0"), 104, y + 58);

    setFont(ctx, 30, 700);
    ctx.fillStyle = BONE;
    ctx.fillText(title, 176, y + 46);

    setFont(ctx, 17, 400, true);
    ctx.fillStyle = STONE;
    ctx.fillText(detail, 176, y + 76);

    setFont(ctx, 18, 600, true);
    ctx.textAlign = "right";
    if (isDone) {
      ctx.fillStyle = LEMON;
      ctx.fillText(STATUS_DONE[locale], 1176, y + 58);
    } else if (isActive) {
      ctx.fillStyle = BONE;
      const dots = "...".slice(0, 1 + Math.floor(t * 3) % 3);
      ctx.fillText(`${locale === "es" ? "EN CURSO" : "IN PROGRESS"}${dots}`, 1176, y + 58);
    } else {
      ctx.fillStyle = PENDING;
      ctx.fillText(STATUS_PENDING, 1176, y + 58);
    }
    ctx.textAlign = "left";
  });
}
