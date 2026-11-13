import type { Locale } from "@/i18n/config";
import type { ProjectContent, ShowcaseShot } from "@/types/content";
import { getShowcaseImage } from "@/components/three/textures/showcaseImages";
import { cursorOpacityAt, cursorPositionAt, shotTransitionEaseAt } from "@/features/chapters/projectShots";

/**
 * The Mac screen's "shot" draw — ported 1:1 where citable, reconstructed
 * where the research pass summarized instead of quoting (same caveat as
 * `certv.ts`/`form.ts`, M10) from the artifact's `_drawMac` `'shot'` mode
 * (lines 1684-1741): a real screenshot with a fake browser chrome, a
 * slide transition between a project's 3 shots, a simulated cursor that
 * visits up to 2 real hotspots with callouts, and project-specific
 * overlays (Nave24's live counter, VeeBot's pipeline).
 */

const BONE = "#EEE9DF";
const STONE = "#A39C8F";
const LEMON = "#E6D84A";

const LOGICAL_WIDTH = 1280;
const LOGICAL_HEIGHT = 800;
const CHROME_HEIGHT = 48;
const IMAGE_Y = CHROME_HEIGHT;
const IMAGE_HEIGHT = LOGICAL_HEIGHT - CHROME_HEIGHT - 24;

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

function drawBrowserChrome(ctx: CanvasRenderingContext2D, url: string | undefined, shotIndex: number, shotCount: number, loadFraction: number): void {
  ctx.fillStyle = "#171512";
  ctx.fillRect(0, 0, LOGICAL_WIDTH, CHROME_HEIGHT);
  const dotColors = ["#FF5F57", "#FEBC2E", "#28C840"];
  dotColors.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(24 + i * 20, CHROME_HEIGHT / 2, 6, 0, Math.PI * 2);
    ctx.fill();
  });
  setFont(ctx, 12, 500, true);
  ctx.fillStyle = STONE;
  ctx.textAlign = "center";
  ctx.fillText(url ?? "", LOGICAL_WIDTH / 2, CHROME_HEIGHT / 2 + 4);
  ctx.textAlign = "right";
  ctx.fillText(`${shotIndex + 1}/${shotCount}`, LOGICAL_WIDTH - 24, CHROME_HEIGHT / 2 + 4);
  ctx.textAlign = "left";

  if (loadFraction < 1) {
    ctx.fillStyle = LEMON;
    ctx.fillRect(0, CHROME_HEIGHT - 2, LOGICAL_WIDTH * loadFraction, 2);
  }
}

function drawShotImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement | null, offsetX: number, alpha: number, shadow: boolean): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  if (shadow) {
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 40;
  }
  ctx.beginPath();
  ctx.rect(offsetX, IMAGE_Y, LOGICAL_WIDTH, IMAGE_HEIGHT);
  ctx.clip();
  if (image) {
    const scale = Math.max(LOGICAL_WIDTH / image.naturalWidth, IMAGE_HEIGHT / image.naturalHeight);
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    ctx.drawImage(image, offsetX + (LOGICAL_WIDTH - drawWidth) / 2, IMAGE_Y, drawWidth, drawHeight);
  } else {
    ctx.fillStyle = "#171512";
    ctx.fillRect(offsetX, IMAGE_Y, LOGICAL_WIDTH, IMAGE_HEIGHT);
  }
  ctx.restore();
}

function drawCursor(ctx: CanvasRenderingContext2D, x: number, y: number, opacity: number): void {
  if (opacity <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.translate(x, y);
  ctx.fillStyle = BONE;
  ctx.strokeStyle = "#0D0C0A";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 16);
  ctx.lineTo(4.5, 12.5);
  ctx.lineTo(7.5, 19);
  ctx.lineTo(10, 17.5);
  ctx.lineTo(7, 11.5);
  ctx.lineTo(12.5, 11.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawCallout(ctx: CanvasRenderingContext2D, hotspot: ShowcaseShot["hotspots"][number], reveal: number, locale: Locale): void {
  if (reveal <= 0.01) return;
  const px = hotspot.u * LOGICAL_WIDTH;
  const py = IMAGE_Y + hotspot.v * IMAGE_HEIGHT;
  ctx.save();
  ctx.globalAlpha = reveal;

  ctx.fillStyle = LEMON;
  ctx.beginPath();
  ctx.arc(px, py, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(230,216,74,0.5)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(px, py, 5 + (1 - reveal) * 14, 0, Math.PI * 2);
  ctx.stroke();

  const labelX = px + 20;
  const labelY = py - 10;
  setFont(ctx, 13, 700);
  ctx.fillStyle = "#0D0C0A";
  const label = hotspot.label[locale];
  const labelWidth = ctx.measureText(label).width + 20;
  roundedRectPath(ctx, labelX, labelY - 18, labelWidth, 26, 13);
  ctx.fillStyle = LEMON;
  ctx.fill();
  ctx.fillStyle = "#0D0C0A";
  ctx.fillText(label, labelX + 10, labelY);
  setFont(ctx, 11, 500, true);
  ctx.fillStyle = STONE;
  ctx.fillText(hotspot.sub[locale], labelX, labelY + 18);
  ctx.restore();
}

function drawNave24Overlay(ctx: CanvasRenderingContext2D, t: number, locale: Locale): void {
  const stock = 128 - Math.floor((t * 3) % 6);
  setFont(ctx, 12, 600, true);
  ctx.fillStyle = LEMON;
  ctx.fillText(locale === "es" ? `Realtime · stock ${stock}` : `Realtime · stock ${stock}`, 24, IMAGE_Y + 28);
}

function drawVeeBotPipelineOverlay(ctx: CanvasRenderingContext2D, t: number, locale: Locale): void {
  const stages = locale === "es" ? ["CV", "Parseo", "Embeddings", "Scoring", "Veredicto"] : ["Resume", "Parsing", "Embeddings", "Scoring", "Verdict"];
  const head = Math.floor((t * 0.8) % stages.length);
  const baseY = LOGICAL_HEIGHT - 56;
  const gap = (LOGICAL_WIDTH - 48) / (stages.length - 1);
  setFont(ctx, 11, 600, true);
  stages.forEach((stage, i) => {
    const x = 24 + i * gap;
    ctx.strokeStyle = i <= head ? LEMON : "#4A443B";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, baseY, 6, 0, Math.PI * 2);
    ctx.stroke();
    if (i === head) {
      ctx.fillStyle = LEMON;
      ctx.beginPath();
      ctx.arc(x, baseY, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = i <= head ? BONE : STONE;
    ctx.fillText(stage, x - 20, baseY + 22);
  });
}

export interface DrawShotParams {
  project: ProjectContent;
  shotIndex: number;
  /** Progress within this shot, 0..1 (artifact `st.l`). */
  shotProgress: number;
  t: number;
  locale: Locale;
}

export function shotScreenKey(projectId: string, shotIndex: number, shotProgress: number, hasImage: boolean, t: number, locale: Locale): string {
  return `shot|${projectId}|${shotIndex}|${Math.round(shotProgress * 200)}|${hasImage}|${Math.floor(t * 12)}|${locale}`;
}

export function drawShot(ctx: CanvasRenderingContext2D, { project, shotIndex, shotProgress: l, t, locale }: DrawShotParams): void {
  const scale = ctx.canvas.width / LOGICAL_WIDTH;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillStyle = "#0B0A09";
  ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

  const shot = project.showcase[shotIndex];
  if (!shot) return;
  const image = getShowcaseImage(shot.src, "L");

  const transitionEase = shotTransitionEaseAt(l);
  const previousShot = shotIndex > 0 ? project.showcase[shotIndex - 1] : null;
  if (transitionEase < 1 && previousShot) {
    const previousImage = getShowcaseImage(previousShot.src, "L");
    drawShotImage(ctx, previousImage, -transitionEase * LOGICAL_WIDTH * 0.35, 1 - transitionEase * 0.6, false);
  }
  drawShotImage(ctx, image, (1 - transitionEase) * LOGICAL_WIDTH, 1, true);

  drawBrowserChrome(ctx, project.liveUrl, shotIndex, project.showcase.length, Math.min(1, l / 0.2));

  const hotspots = shot.hotspots.map((h) => ({ x: h.u * LOGICAL_WIDTH, y: IMAGE_Y + h.v * IMAGE_HEIGHT }));
  const cursor = cursorPositionAt(l, hotspots);
  const cursorOpacity = cursorOpacityAt(l);
  shot.hotspots.forEach((hotspot, i) => {
    const window = i === 0 ? Math.min(1, l / 0.4) : Math.min(1, Math.max(0, (l - 0.5) / 0.26));
    drawCallout(ctx, hotspot, window * cursorOpacity, locale);
  });
  drawCursor(ctx, cursor.x, cursor.y, cursorOpacity);

  if (project.id === "nave24-stock" && shotIndex === 0) drawNave24Overlay(ctx, t, locale);
  if (project.id === "veebot-saas" && shotIndex === 2) drawVeeBotPipelineOverlay(ctx, t, locale);
}
