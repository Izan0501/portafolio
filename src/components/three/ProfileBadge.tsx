"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getMaterialRegistry } from "@/components/three/materials/materialRegistry";
import { roundedRectShape } from "@/components/three/geometry/roundedRectShape";
import { useCanvasTexture } from "@/components/three/textures/useCanvasTexture";
import { getProfileImage, subscribeProfileImage } from "@/components/three/textures/profileImage";
import { CH } from "@/config/chapters";
import { chapterIndexAt, chapterProgressAt } from "@/features/scroll/chapterMath";
import { scrollStore } from "@/features/scroll/scrollStore";
import { poseAt } from "@/features/choreography/keyframes";
import { SPRING, createSpring, stepSpring } from "@/features/choreography/springs";
import { clamp, mix, smoothstep } from "@/lib/math/ease";
import { viewportStore } from "@/hooks/useViewportProfile";

/**
 * The hanging ID badge — ported 1:1 from the artifact's `_buildBadge`
 * (lines 958-983), `_drawBadge` (984-1021) and the per-frame choreography
 * in `_profile` (1453-1465, the badge-only portion — `StackTiles.tsx`
 * owns the rest of that function). Visible across a slightly wider scroll
 * window (1.72-3.55 screens) than the `prof` chapter itself (1.8-3.4), so
 * it's already dropped by the time the chapter officially starts and
 * already retracted before the next one does — the quality gate's "ningún
 * módulo queda en cuadro al cambiar de capítulo".
 *
 * Three independent springs, not one: `SPRING.badge` (vertical drop),
 * `SPRING.badgeSway` (pendulum swing, target tracks scroll lean), and
 * `SPRING.badgeFlip` (the 180° turn, triggered late in the chapter at
 * 68-80% local progress — not continuous with scroll).
 *
 * The strap/lanyard's exact geometry wasn't fully citable from the
 * artifact (summarized by the research pass rather than quoted verbatim)
 * — this is a reasonable reconstruction from its description (two narrow
 * planes from the neck down to the clip, repeated-texture lanyard text),
 * not a line-for-line port like the rest of this file.
 */

const CARD_WIDTH = 0.66;
const CARD_HEIGHT = 0.96;
const HANG_LENGTH = 2.35;
const STRAP_HALF_SPREAD = 0.04;

const BONE = "#EEE9DF";
const STONE = "#A39C8F";
const LEMON = "#E6D84A";

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

/** Deterministic LCG, same seed the artifact uses (`sd=3`) — a decorative barcode that looks random but never changes between redraws. */
function drawBarcode(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  let seed = 3;
  const next = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  let cursor = x;
  while (cursor < x + w) {
    const barWidth = 1 + next() * 3;
    if (next() > 0.5) {
      ctx.fillRect(cursor, y, barWidth, h);
    }
    cursor += barWidth + 1;
  }
}

function drawBadgeFace(ctx: CanvasRenderingContext2D, width: number, height: number, front: boolean): void {
  const scale = width / 528;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.fillStyle = "#171512";
  ctx.fillRect(0, 0, 528, 768);

  if (front) {
    ctx.fillStyle = LEMON;
    ctx.fillRect(0, 0, 528, 96);
    setFont(ctx, 32, 800);
    ctx.fillStyle = "#0D0C0A";
    ctx.fillText("IZ", 24, 64);
    setFont(ctx, 13, 700, true);
    ctx.textAlign = "right";
    ctx.fillText("ACCESO · EQUIPO", 504, 60);
    ctx.textAlign = "left";

    ctx.save();
    roundedRectPath(ctx, 114, 128, 300, 300, 16);
    ctx.clip();
    const photo = getProfileImage();
    if (photo) ctx.drawImage(photo, 114, 128, 300, 300);
    else {
      ctx.fillStyle = "#2E2A24";
      ctx.fillRect(114, 128, 300, 300);
    }
    ctx.restore();

    const rows: readonly [string, string][] = [
      ["ROL", "Full-Stack Developer"],
      ["BASE", "Tucumán, AR"],
      ["MÉTODO", "SDD + Agile"],
    ];
    let y = 470;
    for (const [label, value] of rows) {
      setFont(ctx, 11, 600, true);
      ctx.fillStyle = STONE;
      ctx.fillText(label, 24, y);
      setFont(ctx, 15, 600);
      ctx.fillStyle = BONE;
      ctx.fillText(value, 24, y + 20);
      y += 44;
    }

    setFont(ctx, 30, 800);
    ctx.fillStyle = BONE;
    ctx.fillText("Ivo", 24, y + 36);
    ctx.fillText("Zanacchi", 24, y + 70);

    ctx.fillStyle = LEMON;
    ctx.beginPath();
    ctx.arc(24, y + 96, 5, 0, Math.PI * 2);
    ctx.fill();
    setFont(ctx, 11.5, 600, true);
    ctx.fillText("DISPONIBLE PARA EQUIPOS", 36, y + 100);

    ctx.strokeStyle = "#2E2A24";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(24, y + 120);
    ctx.lineTo(504, y + 120);
    ctx.stroke();

    setFont(ctx, 10.5, 500, true);
    ctx.fillStyle = STONE;
    ctx.fillText("ivozanacchi501@gmail.com · github.com/Izan0501", 24, y + 144);

    ctx.fillStyle = BONE;
    drawBarcode(ctx, 24, 728, 480, 24);
  } else {
    setFont(ctx, 16, 700, true);
    ctx.fillStyle = LEMON;
    ctx.fillText("FORMACIÓN", 24, 48);

    const schools: readonly [string, string, string][] = [
      ["UTN FR Tucumán", "Técnico en Programación", "abr 2024 – feb 2027"],
      ["UGR", "Tecnicatura en Ciberseguridad", "mar 2026 – en curso"],
    ];
    let y = 84;
    for (const [institution, title, period] of schools) {
      ctx.fillStyle = "#1E1C14";
      roundedRectPath(ctx, 24, y, 480, 92, 14);
      ctx.fill();
      setFont(ctx, 15, 700);
      ctx.fillStyle = BONE;
      ctx.fillText(institution, 40, y + 30);
      setFont(ctx, 13, 500);
      ctx.fillStyle = "#C9C2B5";
      ctx.fillText(title, 40, y + 54);
      setFont(ctx, 11, 500, true);
      ctx.fillStyle = STONE;
      ctx.fillText(period, 40, y + 76);
      y += 108;
    }

    setFont(ctx, 16, 700, true);
    ctx.fillStyle = LEMON;
    ctx.fillText("MÉTODO", 24, y + 24);
    setFont(ctx, 14, 600);
    ctx.fillStyle = BONE;
    ctx.fillText("Spec-Driven Development", 24, y + 50);
    setFont(ctx, 12, 500, true);
    ctx.fillStyle = STONE;
    ctx.fillText("Claude · MCP · Skills", 24, y + 70);
    setFont(ctx, 11.5, 500, true);
    ctx.fillStyle = STONE;
    ctx.fillText("sprint planning · dailies · backlog", 24, y + 94);
    ctx.fillText("retrospectivas · trabajo asíncrono", 24, y + 112);

    ctx.strokeStyle = "#2E2A24";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(24, y + 134);
    ctx.lineTo(504, y + 134);
    ctx.stroke();

    setFont(ctx, 11, 600, true);
    ctx.fillStyle = STONE;
    ctx.fillText("CÓDIGO LIMPIO · ARQ. ESCALABLE · SDD · CERO REGRESIONES", 24, y + 160);
  }
}

function drawStrapTexture(ctx: CanvasRenderingContext2D): void {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#0B0A09";
  ctx.fillRect(0, 0, w, h);
  ctx.save();
  ctx.translate(w / 2, 0);
  ctx.rotate(Math.PI / 2);
  setFont(ctx, 22, 700, true);
  ctx.fillStyle = LEMON;
  ctx.textBaseline = "middle";
  ctx.fillText("IZAN0501 · IZAN0501 · IZAN0501 · ", 8, 0);
  ctx.restore();
}

export function ProfileBadge() {
  const mat = getMaterialRegistry();
  const badgeRef = useRef<THREE.Group>(null);
  const cardRef = useRef<THREE.Group>(null);

  const dropSpring = useRef(createSpring(6.2));
  const swaySpring = useRef(createSpring(0));
  const flipSpring = useRef(createSpring(0));

  const bodyGeometry = useMemo(() => {
    const geometry = new THREE.ExtrudeGeometry(roundedRectShape(CARD_WIDTH, CARD_HEIGHT, 0.05), {
      depth: 0.012,
      bevelEnabled: true,
      bevelThickness: 0.003,
      bevelSize: 0.003,
      bevelSegments: 2,
      curveSegments: 10,
    });
    geometry.translate(0, -CARD_HEIGHT / 2, -0.006);
    return geometry;
  }, []);
  const faceGeometry = useMemo(() => new THREE.PlaneGeometry(CARD_WIDTH - 0.012, CARD_HEIGHT - 0.012), []);
  const clipGeometry = useMemo(() => new THREE.BoxGeometry(0.1, 0.07, 0.028), []);
  const ringGeometry = useMemo(() => new THREE.TorusGeometry(0.032, 0.007, 10, 28), []);
  const strapGeometry = useMemo(() => new THREE.PlaneGeometry(0.05, HANG_LENGTH - 0.1), []);

  useEffect(() => {
    return () => {
      bodyGeometry.dispose();
      faceGeometry.dispose();
      clipGeometry.dispose();
      ringGeometry.dispose();
      strapGeometry.dispose();
    };
  }, [bodyGeometry, faceGeometry, clipGeometry, ringGeometry, strapGeometry]);

  const front = useCanvasTexture({ width: 528, height: 768 });
  const back = useCanvasTexture({ width: 528, height: 768 });
  const strap = useCanvasTexture({ width: 64, height: 1024 });

  const frontMaterial = useMemo(() => new THREE.MeshBasicMaterial({ map: front.texture, toneMapped: false }), [front.texture]);
  const backMaterial = useMemo(() => new THREE.MeshBasicMaterial({ map: back.texture, toneMapped: false }), [back.texture]);
  const strapMaterial = useMemo(() => new THREE.MeshStandardMaterial({ map: strap.texture, roughness: 0.7, side: THREE.DoubleSide }), [strap.texture]);
  useEffect(() => {
    return () => {
      frontMaterial.dispose();
      backMaterial.dispose();
      strapMaterial.dispose();
    };
  }, [frontMaterial, backMaterial, strapMaterial]);

  useEffect(() => {
    strap.texture.wrapT = THREE.RepeatWrapping;
    strap.texture.repeat.set(1, 1.6);
    strap.redrawIfKeyChanged("strap", drawStrapTexture);
  }, [strap]);

  useEffect(() => {
    function redrawFaces() {
      const hasPhoto = getProfileImage() !== null;
      front.redrawIfKeyChanged(`front|${hasPhoto}`, (ctx) => drawBadgeFace(ctx, ctx.canvas.width, ctx.canvas.height, true));
      back.redrawIfKeyChanged(`back|${hasPhoto}`, (ctx) => drawBadgeFace(ctx, ctx.canvas.width, ctx.canvas.height, false));
    }
    redrawFaces();
    return subscribeProfileImage(redrawFaces);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `front`/`back`'s `redrawIfKeyChanged` identity is stable (useCallback inside useCanvasTexture); re-running on every render isn't needed.
  }, []);

  useFrame((_state, delta) => {
    const badge = badgeRef.current;
    const card = cardRef.current;
    if (!badge || !card) return;

    const reduced = scrollStore.reduced;
    const t = scrollStore.t;
    const p = scrollStore.p;
    const chapter = CH[chapterIndexAt(p, CH)];
    const visible = p > 1.72 && p < 3.55;
    badge.visible = visible;
    if (!visible) {
      dropSpring.current.x = 6.2;
      dropSpring.current.v = 0;
      return;
    }

    const k = chapter.id === "prof" ? chapterProgressAt(p, chapter) : p < 1.8 ? 0 : 1;
    // Artifact line 1455: `ss(0.02,0.16,k) * (1-ss(0.86,0.98,k))` — asymmetric
    // in/out feathers, not `win(...)`'s single symmetric one.
    const dropWindow = smoothstep(0.02, 0.16, k) * (1 - smoothstep(0.86, 0.98, k));

    const y = stepSpring(dropSpring.current, mix(6.2, 3.62, dropWindow), SPRING.badge.K, SPRING.badge.C, delta, reduced);
    const lean = clamp(scrollStore.vel, -2.5, 2.5);
    const sway = stepSpring(swaySpring.current, clamp(-lean * 0.09 + dropSpring.current.v * 0.012, -0.35, 0.35), SPRING.badgeSway.K, SPRING.badgeSway.C, delta, reduced);
    const flipTarget = Math.PI * smoothstep(0.68, 0.8, k);
    const flip = stepSpring(flipSpring.current, flipTarget, SPRING.badgeFlip.K, SPRING.badgeFlip.C, delta, reduced);

    if (viewportStore.compact) badge.position.set(poseAt(p).mac[0] + 1.95, y, 1.0);
    else badge.position.set(2.05, y, 1.65);
    badge.rotation.set(0, -0.18, sway + (reduced ? 0 : Math.sin(t * 0.7) * 0.012));
    card.rotation.set(0, flip + (reduced ? 0 : Math.sin(t * 0.55) * 0.07), 0);
  });

  return (
    <group ref={badgeRef} visible={false}>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          geometry={strapGeometry}
          material={strapMaterial}
          position={[side * STRAP_HALF_SPREAD, -HANG_LENGTH / 2 + 0.05, -0.01]}
          rotation={[0, 0, -side * 0.02]}
        />
      ))}
      <group ref={cardRef} position={[0, -HANG_LENGTH, 0]}>
        <mesh geometry={bodyGeometry} material={mat.card} />
        <mesh geometry={faceGeometry} material={frontMaterial} position={[0, -CARD_HEIGHT / 2, 0.0095]} />
        <mesh geometry={faceGeometry} material={backMaterial} position={[0, -CARD_HEIGHT / 2, -0.0095]} rotation={[0, Math.PI, 0]} />
        <mesh geometry={clipGeometry} material={mat.alu} position={[0, 0.02, 0]} />
        <mesh geometry={ringGeometry} material={mat.alu} position={[0, 0.085, 0]} />
      </group>
    </group>
  );
}

export default ProfileBadge;
