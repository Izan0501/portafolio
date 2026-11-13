"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { MacBookHandle } from "@/components/macbook/MacBook";
import type { IPhoneProHandle } from "@/components/iphone-island/IPhonePro";
import type { VeeLayersHandle } from "./VeeLayers";
import { CH } from "@/config/chapters";
import { chapterIndexAt, chapterProgressAt } from "@/features/scroll/chapterMath";
import { scrollStore } from "@/features/scroll/scrollStore";
import { certLocalProgress, formationProgress } from "@/features/chapters/certFlight";
import { win } from "@/lib/math/ease";

/**
 * "Pulso al iPhone" — ported from the artifact's shared pulse system
 * (`_extras`, lines ~1329-1351). **Corrected in M11** from M10's own
 * mistake: M10 assumed Formación activated this via `wC` from `_fitCam`
 * (the camera-weight window) — confirmed wrong by further research.
 * `_extras` has its *own* `wC`/`wP` with completely different windows
 * (Consultorio / Garantías, not Formación/Perfil) — letters are reused
 * with different meanings between the two systems. Formación's real
 * pulse branch is `wK` (the certificate actively being verified), a
 * separate window with its own origin, not Formación's camera-fit weight
 * at all.
 *
 * Real branches, in priority order (mutually exclusive, first match wins
 * — artifact's own `if`/`else if` chain, line 1338-1343):
 *  1. `wK` — a certificate actively verifying (Formación/`cert`).
 *  2. `wN` — Nave24.
 *  3. `wE` / `wC` — Estudio / Consultorio (same priority slot).
 *  4. `wV` — VeeBot, with a **different destination**: the `VeeLayers`
 *     plates, not the iPhone (`lift=0`, no arc).
 *  5. `wP` (Garantías) — not wired up; `pipe` has no geometry until M12.
 *
 * The exact tube/particle geometry wasn't fully citable from the research
 * pass — this is a reasonable reconstruction (a thin line along a
 * quadratic Bézier, 3 lemon particles looping along it), not a
 * line-for-line port like the rest of this module.
 */

const PARTICLE_COUNT = 3;
const CURVE_LIFT = 0.6;
const CURVE_SEGMENTS = 32;

/** Shared Mac-side anchor for every branch except the certificate one (artifact `mA`, local to the lid). */
const MAC_ANCHOR_LOCAL: readonly [number, number, number] = [0.85, 0.75, 0.02];
/** The certificate branch's own distinct origin (artifact line ~1337, local to the lid — the badge/credential area, not `mA`). */
const CERTIFICATE_ANCHOR_LOCAL: readonly [number, number, number] = [-0.36, 1.06, 0.02];
/** Phone-side anchor (artifact `pA`, local to the phone group). */
const PHONE_ANCHOR_LOCAL: readonly [number, number, number] = [0, 0.1, 0.06];

interface PulseTarget {
  origin: THREE.Vector3;
  destination: THREE.Vector3;
  weight: number;
  lift: number;
}

export interface PulseLineProps {
  macRef: React.RefObject<MacBookHandle | null>;
  phoneRef: React.RefObject<IPhoneProHandle | null>;
  veeLayersRef: React.RefObject<VeeLayersHandle | null>;
}

export function PulseLine({ macRef, phoneRef, veeLayersRef }: PulseLineProps) {
  const lineRef = useRef<THREE.Line>(null);
  const particleRefs = useRef<Array<THREE.Mesh | null>>(Array(PARTICLE_COUNT).fill(null));

  // Fixed-size position buffer, updated in place every frame — recreating
  // real geometry 60×/s to follow a moving curve would be pure GC/GPU
  // churn for a thin decorative line.
  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array((CURVE_SEGMENTS + 1) * 3), 3));
    return geometry;
  }, []);
  const lineMaterial = useMemo(
    () => new THREE.LineBasicMaterial({ color: 0xe6d84a, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }),
    [],
  );
  const particleGeometry = useMemo(() => new THREE.SphereGeometry(0.018, 10, 10), []);
  const particleMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ color: 0xe6d84a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }),
    [],
  );
  useEffect(() => {
    return () => {
      lineGeometry.dispose();
      lineMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
    };
  }, [lineGeometry, lineMaterial, particleGeometry, particleMaterial]);

  const control = useMemo(() => new THREE.Vector3(), []);
  const lineObject = useMemo(() => new THREE.Line(lineGeometry, lineMaterial), [lineGeometry, lineMaterial]);

  /** Resolves which branch (if any) is active this frame, with its real origin/destination/weight — the `if`/`else if` priority chain. */
  function resolvePulseTarget(): PulseTarget | null {
    const mac = macRef.current;
    const phone = phoneRef.current;
    if (!mac) return null;
    const p = scrollStore.p;

    const chapter = CH[chapterIndexAt(p, CH)];
    if (chapter.id === "cert") {
      const k = chapterProgressAt(p, chapter);
      const cf = formationProgress(k);
      const activeIndex = Math.floor(cf - 0.8);
      if (activeIndex >= 0 && activeIndex < 5) {
        const localProgress = certLocalProgress(cf, activeIndex);
        const wK = win(localProgress, 0.85, 1.45, 0.08);
        if (wK > 0.01 && phone) {
          return {
            origin: mac.lidGroup.localToWorld(new THREE.Vector3(...CERTIFICATE_ANCHOR_LOCAL)),
            destination: phone.group.localToWorld(new THREE.Vector3(...PHONE_ANCHOR_LOCAL)),
            weight: wK,
            lift: CURVE_LIFT,
          };
        }
      }
    }

    const wN = win(p, 7.25, 8.5, 0.12);
    if (wN > 0.01 && phone) {
      return {
        origin: mac.lidGroup.localToWorld(new THREE.Vector3(...MAC_ANCHOR_LOCAL)),
        destination: phone.group.localToWorld(new THREE.Vector3(...PHONE_ANCHOR_LOCAL)),
        weight: wN,
        lift: CURVE_LIFT,
      };
    }

    const wE = win(p, 11.15, 11.55, 0.1);
    const wC = win(p, 13.65, 14.55, 0.12);
    const wEorC = Math.max(wE, wC);
    if (wEorC > 0.01 && phone) {
      return {
        origin: mac.lidGroup.localToWorld(new THREE.Vector3(...MAC_ANCHOR_LOCAL)),
        destination: phone.group.localToWorld(new THREE.Vector3(...PHONE_ANCHOR_LOCAL)),
        weight: wEorC,
        lift: CURVE_LIFT,
      };
    }

    const wV = win(p, 9.65, 10.05, 0.12);
    const veeLayers = veeLayersRef.current;
    if (wV > 0.01 && veeLayers) {
      return {
        origin: mac.lidGroup.localToWorld(new THREE.Vector3(...MAC_ANCHOR_LOCAL)),
        destination: veeLayers.group.getWorldPosition(new THREE.Vector3()),
        weight: wV,
        lift: 0,
      };
    }

    return null;
  }

  useFrame(() => {
    const line = lineRef.current;
    if (!line) return;

    const target = resolvePulseTarget();
    const active = target !== null;
    line.visible = active;
    particleRefs.current.forEach((particle) => {
      if (particle) particle.visible = active;
    });
    if (!target) return;

    const { origin, destination, weight, lift } = target;
    control.copy(origin).add(destination).multiplyScalar(0.5);
    control.y += lift;

    const curve = new THREE.QuadraticBezierCurve3(origin, control, destination);
    const positions = line.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i <= CURVE_SEGMENTS; i++) {
      const point = curve.getPoint(i / CURVE_SEGMENTS);
      positions.setXYZ(i, point.x, point.y, point.z);
    }
    positions.needsUpdate = true;
    (line.material as THREE.LineBasicMaterial).opacity = 0.25 * weight;

    const t = scrollStore.t;
    particleRefs.current.forEach((particle, i) => {
      if (!particle) return;
      const phase = (t * 0.4 + i / PARTICLE_COUNT) % 1;
      const point = curve.getPoint(phase);
      particle.position.copy(point);
      (particle.material as THREE.MeshBasicMaterial).opacity = weight * (1 - Math.abs(phase - 0.5) * 1.2);
    });
  });

  return (
    <>
      <primitive object={lineObject} ref={lineRef} visible={false} />
      {Array.from({ length: PARTICLE_COUNT }, (_, i) => (
        <mesh key={i} ref={(el) => { particleRefs.current[i] = el; }} geometry={particleGeometry} material={particleMaterial} visible={false} />
      ))}
    </>
  );
}

export default PulseLine;
