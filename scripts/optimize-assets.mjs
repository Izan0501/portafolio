#!/usr/bin/env node
/**
 * Image pipeline (M2 of IMPLEMENTATION_PLAN.md §3.2).
 *
 * Reads every image under `assets-src/**` (originals, never served directly)
 * and writes optimized derivatives to `public/media/**`:
 *
 *   - DOM derivatives:  AVIF q55 + WebP q78, at widths [640, 1080, 1600, 2048]
 *                       → public/media/<relPath-without-ext>-<width>.<ext>
 *   - 3D derivatives:   WebP q85 @ 2048px, only for the 15 showcase shots the
 *                       3D recorrido frames (`content/projects.ts` → `showcase[].src`)
 *                       → public/media/3d/<relPath-without-ext>.webp
 *   - OG bases:         1200×630 PNG, one per project, from its `heroImage`
 *                       → public/media/og/<projectId>.png
 *
 * Then writes `src/content/media-manifest.json`: for every source image, its
 * original public path (the one the legacy components already use), real
 * intrinsic width/height, and a tiny base64 blur placeholder — so a future
 * `next/image` integration (M3+) never has to read a file at request time to
 * avoid CLS.
 *
 * SHOWCASE_SRCS and PROJECT_HERO are copied from `src/content/projects.ts` /
 * `src/data/projects.ts` (verified by extraction while writing this file,
 * 02-11-2026) rather than imported — this script runs as plain Node (`.mjs`),
 * and the content layer is TypeScript resolved through the `@/*` tsconfig
 * alias, which plain Node doesn't understand without an extra loader the
 * plan doesn't list. Keep this list in sync with `content/projects.ts` by
 * hand if either changes.
 *
 * No GLTF/HDRI/third-party assets are read or written — procedural geometry
 * and PMREM environments (plan §0) need no texture pipeline beyond this one.
 *
 * Run: `npm run optimize-assets`
 */
import { readdir, mkdir, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC_DIR = path.join(ROOT, "assets-src");
const MEDIA_DIR = path.join(ROOT, "public", "media");
const OG_DIR = path.join(MEDIA_DIR, "og");
const THREE_D_DIR = path.join(MEDIA_DIR, "3d");
const MANIFEST_PATH = path.join(ROOT, "src", "content", "media-manifest.json");

const DOM_WIDTHS = [640, 1080, 1600, 2048];
const DOM_FORMATS = [
  { ext: "avif", quality: 55 },
  { ext: "webp", quality: 78 },
];
const THREE_D_WIDTH = 2048;
const THREE_D_QUALITY = 85;
const OG_SIZE = { width: 1200, height: 630 };
const BLUR_WIDTH = 16;

// Ported from content/projects.ts `showcase[].src` — the 3 screenshots per
// project the 3D recorrido frames and annotates with hotspots.
const SHOWCASE_SRCS = new Set([
  "/projects/nave24stock/stock-dash.png",
  "/projects/nave24stock/stock-inventory.png",
  "/projects/nave24stock/stock-sales.png",
  "/projects/veeBot/bot-dash.png",
  "/projects/veeBot/bot-DigitalTwins-1.png",
  "/projects/veeBot/bot-comparator2.png",
  "/projects/estudio/estudio-back.png",
  "/projects/estudio/estudio-areas.png",
  "/projects/estudio/estudio-contacto-2.png",
  "/projects/portafolio-mel/portafolio-back.png",
  "/projects/portafolio-mel/portafolio-hoverSlider.png",
  "/projects/portafolio-mel/portafolio-carousel-1.png",
  "/projects/consultorio/consul-back.png",
  "/projects/consultorio/consul-tratamientos.png",
  "/projects/consultorio/consul-ortInvisible.png",
]);

// Ported from data/projects.ts `PROJECTS_DATA[].heroImage` — the OG base per project.
const PROJECT_HERO = {
  "nave24-stock": "/projects/nave24stock/stock-back.png",
  "veebot-saas": "/projects/veeBot/bot-back1.png",
  "estudio-zanacchi": "/projects/estudio/estudio-back.png",
  "portafolio-mel": "/projects/portafolio-mel/portafolio-back.png",
  "consultorio-odontologico": "/projects/consultorio/consul-back.png",
};

const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp"]);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue; // .DS_Store etc.
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else if (IMAGE_EXT.has(path.extname(entry.name).toLowerCase())) {
      files.push(full);
    }
  }
  return files;
}

/** `assets-src/projects/foo/bar.png` -> `/projects/foo/bar.png` (the legacy public path). */
function toPublicPath(absSrcFile) {
  const rel = path.relative(SRC_DIR, absSrcFile); // e.g. "projects/foo/bar.png"
  return "/" + rel.split(path.sep).join("/");
}

/** `/projects/foo/bar.png` -> "projects/foo/bar" (no extension, used to build derivative paths). */
function stripExt(publicPath) {
  const ext = path.extname(publicPath);
  return publicPath.slice(1, publicPath.length - ext.length); // drop leading "/"
}

async function ensureDir(p) {
  await mkdir(p, { recursive: true });
}

async function blurDataURL(image) {
  const buf = await image
    .clone()
    .resize({ width: BLUR_WIDTH, withoutEnlargement: true })
    .webp({ quality: 40 })
    .toBuffer();
  return `data:image/webp;base64,${buf.toString("base64")}`;
}

async function processDom(absSrcFile, publicPath, meta) {
  const base = stripExt(publicPath);
  for (const width of DOM_WIDTHS) {
    if (width > meta.width) continue; // never upscale
    for (const { ext, quality } of DOM_FORMATS) {
      const outPath = path.join(MEDIA_DIR, `${base}-${width}.${ext}`);
      await ensureDir(path.dirname(outPath));
      const pipeline = sharp(absSrcFile).resize({ width, withoutEnlargement: true });
      await (ext === "avif" ? pipeline.avif({ quality }) : pipeline.webp({ quality })).toFile(outPath);
    }
  }
  // Always emit at least the native size if it's smaller than every target width.
  if (meta.width < DOM_WIDTHS[0]) {
    for (const { ext, quality } of DOM_FORMATS) {
      const outPath = path.join(MEDIA_DIR, `${base}-${meta.width}.${ext}`);
      await ensureDir(path.dirname(outPath));
      const pipeline = sharp(absSrcFile);
      await (ext === "avif" ? pipeline.avif({ quality }) : pipeline.webp({ quality })).toFile(outPath);
    }
  }
}

async function process3D(absSrcFile, publicPath) {
  const base = stripExt(publicPath);
  const outPath = path.join(THREE_D_DIR, `${base}.webp`);
  await ensureDir(path.dirname(outPath));
  await sharp(absSrcFile)
    .resize({ width: THREE_D_WIDTH, withoutEnlargement: true })
    .webp({ quality: THREE_D_QUALITY })
    .toFile(outPath);
}

async function processOgBases() {
  await ensureDir(OG_DIR);
  for (const [projectId, heroPublicPath] of Object.entries(PROJECT_HERO)) {
    const absSrcFile = path.join(SRC_DIR, heroPublicPath.slice(1));
    const outPath = path.join(OG_DIR, `${projectId}.png`);
    await sharp(absSrcFile)
      .resize({ width: OG_SIZE.width, height: OG_SIZE.height, fit: "cover", position: "attention" })
      .png()
      .toFile(outPath);
    console.log(`  OG   ${projectId}.png`);
  }
}

async function main() {
  const files = await walk(SRC_DIR);
  files.sort();
  console.log(`Found ${files.length} source images under assets-src/.\n`);

  const manifest = [];
  let domCount = 0;
  let threeDCount = 0;

  for (const absSrcFile of files) {
    const publicPath = toPublicPath(absSrcFile);
    const image = sharp(absSrcFile);
    const meta = await image.metadata();
    if (!meta.width || !meta.height) {
      console.warn(`  SKIP ${publicPath} (no dimensions read)`);
      continue;
    }

    await processDom(absSrcFile, publicPath, meta);
    domCount++;

    let wroteThreeD = false;
    if (SHOWCASE_SRCS.has(publicPath)) {
      await process3D(absSrcFile, publicPath);
      threeDCount++;
      wroteThreeD = true;
    }

    manifest.push({
      src: publicPath,
      w: meta.width,
      h: meta.height,
      blurDataURL: await blurDataURL(image),
    });

    console.log(`  DOM${wroteThreeD ? "+3D" : "   "} ${publicPath} (${meta.width}x${meta.height})`);
  }

  console.log("\nOG bases:");
  await processOgBases();

  await ensureDir(path.dirname(MANIFEST_PATH));
  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");

  console.log(`\nDone. ${domCount} images processed for DOM, ${threeDCount} also got a 3D texture, ${Object.keys(PROJECT_HERO).length} OG bases.`);
  console.log(`Manifest written to ${path.relative(ROOT, MANIFEST_PATH)} (${manifest.length} entries).`);

  // NOTE: the hero's StagePoster (plan §2.1 — "AVIF of the Mac closed, seen
  // from above, the hero's first frame") is NOT generated here. There is no
  // MacBook render to export it from yet — the procedural model doesn't
  // exist until M6. Generating a placeholder would be a fabricated asset.
  // M6 is the right place to add that export once the real geometry exists.
  console.log("\nNOTE: StagePoster (hero MacBook AVIF) not generated — no 3D model exists yet (M6). See M2 report.");
}

async function assertSourceDirExists() {
  try {
    await stat(SRC_DIR);
  } catch {
    console.error(`assets-src/ not found at ${SRC_DIR}. Nothing to process.`);
    process.exit(1);
  }
}

await assertSourceDirExists();
await main();
