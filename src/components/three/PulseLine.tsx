"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { MacBookHandle } from "@/components/macbook/MacBook";
import type { IPhoneProHandle } from "@/components/iphone-island/IPhonePro";
import { scrollStore } from "@/features/scroll/scrollStore";
import { win } from "@/lib/math/ease";

/**
 * "Pulso al iPhone" — ported from the artifact's shared pulse system
 * (`this.line`/`this.pulses`, referenced around lines 1341-1351), **not**
 * a Formación-specific mechanism: the artifact activates the same
 * curve+particles from several chapters (`wE`/`wN`/`wP`/`wV` for
 * Estudio/Nave24/Perfil/VeeBot, none built yet). This file only wires up
 * Formación's own branch (`wC`'s window, already known from M8's
 * cameraFit) — M11 should add the other chapters' branches to the same
 * `active`/`origin` computation below, not redesign this component.
 *
 * The exact tube/particle geometry wasn't fully citable from the research
 * pass (flagged explicitly as not investigated) — this is a reasonable
 * reconstruction (a thin line along a quadratic Bézier, 3 lemon particles
 * looping along it with staggered phase), not a line-for-line port like
 * the rest of this module.
 */

const PARTICLE_COUNT = 3;
const CURVE_LIFT = 0.6;
const CURVE_SEGMENTS = 32;

export interface PulseLineProps {
  macRef: React.RefObject<MacBookHandle | null>;
  phoneRef: React.RefObject<IPhoneProHandle | null>;
}

export function PulseLine({ macRef, phoneRef }: PulseLineProps) {
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
  const destination = useMemo(() => new THREE.Vector3(), []);
  const lineObject = useMemo(() => new THREE.Line(lineGeometry, lineMaterial), [lineGeometry, lineMaterial]);

  useFrame(() => {
    const mac = macRef.current;
    const phone = phoneRef.current;
    const line = lineRef.current;
    if (!mac || !phone || !line) return;

    const p = scrollStore.p;
    // Formación's own weight — the same window M8's cameraFit already uses for the briefcase's weighted camera point.
    const formationWeight = win(p, 3.45, 6.45, 0.2);
    const active = formationWeight > 0.01;

    line.visible = active;
    particleRefs.current.forEach((particle) => {
      if (particle) particle.visible = active;
    });
    if (!active) return;

    const origin = mac.lidGroup.localToWorld(new THREE.Vector3(0.6, 0.6, 0.02));
    phone.group.getWorldPosition(destination);
    control.copy(origin).add(destination).multiplyScalar(0.5);
    control.y += CURVE_LIFT;

    const curve = new THREE.QuadraticBezierCurve3(origin, control, destination);
    const positions = line.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i <= CURVE_SEGMENTS; i++) {
      const point = curve.getPoint(i / CURVE_SEGMENTS);
      positions.setXYZ(i, point.x, point.y, point.z);
    }
    positions.needsUpdate = true;
    (line.material as THREE.LineBasicMaterial).opacity = 0.25 * formationWeight;

    const t = scrollStore.t;
    particleRefs.current.forEach((particle, i) => {
      if (!particle) return;
      const phase = (t * 0.4 + i / PARTICLE_COUNT) % 1;
      const point = curve.getPoint(phase);
      particle.position.copy(point);
      (particle.material as THREE.MeshBasicMaterial).opacity = formationWeight * (1 - Math.abs(phase - 0.5) * 1.2);
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
