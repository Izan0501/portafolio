"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getMaterialRegistry } from "@/components/three/materials/materialRegistry";
import { getCredentialTexture, subscribeCredentialImage } from "@/components/three/textures/credentialImages";
import type { MacBookHandle } from "@/components/macbook/MacBook";
import type { BriefcaseHandle } from "./Briefcase";
import { CREDENTIALS } from "@/content/credentials";
import { CH } from "@/config/chapters";
import { chapterIndexAt, chapterProgressAt } from "@/features/scroll/chapterMath";
import { scrollStore } from "@/features/scroll/scrollStore";
import { certFlightState, certLocalProgress, certRectToLidLocal, certScreenRect, certRectWorldWidth, formationProgress, type CertFlightPoints } from "@/features/chapters/certFlight";

/**
 * The 5 real certificate plates — ported 1:1 from the artifact's cert-plate
 * construction (`_buildCerts`, lines 825-846) and the flight choreography
 * in `_certs` (`certFlight.ts` owns the pure math; this file supplies the
 * real world-space anchor points — the briefcase's own local space for
 * "stack"/"up", the Mac lid's for "show"/"screen" — `certFlight.ts` never
 * touches a `THREE.Object3D` directly).
 *
 * Each plate shows the real image (`getCredentialTexture`) on a `card`
 * backing, not a `CanvasTexture` — matches the artifact's own direct
 * `Texture` assignment. One ref per mutable piece per plate (group,
 * face material, scan mesh) — no searching children by name in the
 * frame loop.
 */

const CREDENTIAL_COUNT = CREDENTIALS.length;
const DEFAULT_ASPECT = 1037 / 1600; // height/width placeholder until each image decodes
const STACK_LOCAL_BASE: readonly [number, number] = [0, 0.02];
const UP_LOCAL: readonly [number, number, number] = [-0.1, 0.95, 0.1];

export interface CertPlatesProps {
  macRef: React.RefObject<MacBookHandle | null>;
  briefcaseRef: React.RefObject<BriefcaseHandle | null>;
}

export function CertPlates({ macRef, briefcaseRef }: CertPlatesProps) {
  const mat = getMaterialRegistry();
  const plateRefs = useRef<Array<THREE.Group | null>>(Array(CREDENTIAL_COUNT).fill(null));
  const faceRefs = useRef<Array<THREE.Mesh | null>>(Array(CREDENTIAL_COUNT).fill(null));
  const scanRefs = useRef<Array<THREE.Mesh | null>>(Array(CREDENTIAL_COUNT).fill(null));

  // Each credential image loads asynchronously; once it decodes, this
  // forces one re-render so the JSX below picks up the real texture/aspect
  // ratio (`getCredentialTexture` itself is a plain synchronous read, not
  // reactive on its own).
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const unsubscribes = CREDENTIALS.map((credential) => subscribeCredentialImage(credential.id, () => forceUpdate((n) => n + 1)));
    return () => unsubscribes.forEach((unsub) => unsub());
  }, []);

  const backGeometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const faceGeometry = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const scanGeometry = useMemo(() => new THREE.PlaneGeometry(1.5, 0.04), []);
  useEffect(() => {
    return () => {
      backGeometry.dispose();
      faceGeometry.dispose();
      scanGeometry.dispose();
    };
  }, [backGeometry, faceGeometry, scanGeometry]);

  const scanMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ color: 0xe6d84a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }),
    [],
  );
  useEffect(() => () => scanMaterial.dispose(), [scanMaterial]);

  useFrame(() => {
    const mac = macRef.current;
    const briefcase = briefcaseRef.current;
    if (!mac || !briefcase) return;

    const p = scrollStore.p;
    const chapter = CH[chapterIndexAt(p, CH)];
    const live = chapter.id === "cert" && p > 3.1 && p < 6.85;

    for (let i = 0; i < CREDENTIAL_COUNT; i++) {
      const plate = plateRefs.current[i];
      if (!plate) continue;
      if (!live) {
        plate.visible = false;
        continue;
      }

      const credential = CREDENTIALS[i];
      const texEntry = getCredentialTexture(credential);
      const aspectRatio = texEntry ? texEntry.aspect : DEFAULT_ASPECT; // height/width

      const k = chapterProgressAt(p, chapter);
      const cf = formationProgress(k);
      const u = certLocalProgress(cf, i);

      const rect = certScreenRect(1 / aspectRatio);
      const stackLocal = new THREE.Vector3(STACK_LOCAL_BASE[0], STACK_LOCAL_BASE[1] + (4 - i) * 0.017, 0.02);
      const points: CertFlightPoints = {
        stack: briefcase.group.localToWorld(stackLocal),
        up: briefcase.group.localToWorld(new THREE.Vector3(...UP_LOCAL)),
        show: mac.lidGroup.localToWorld(certRectToLidLocal(rect, 0.62)),
        screen: mac.lidGroup.localToWorld(certRectToLidLocal(rect, 0.03)),
        screenWorldWidth: certRectWorldWidth(rect),
      };

      const state = certFlightState(u, points, scrollStore.t, scrollStore.reduced);
      plate.visible = state.visible;
      if (!state.visible) continue;

      plate.position.copy(state.position);
      plate.scale.setScalar(state.scale);

      const screenQuaternion = mac.lidGroup.getWorldQuaternion(new THREE.Quaternion());
      plate.quaternion.identity().slerp(screenQuaternion, state.orientationBlend);
      plate.rotateY(state.spin);

      const face = faceRefs.current[i];
      if (face) {
        const material = face.material as THREE.MeshStandardMaterial;
        if (texEntry && material.map !== texEntry.texture) {
          material.map = texEntry.texture;
          material.emissiveMap = texEntry.texture;
          material.needsUpdate = true;
        }
        material.emissiveIntensity = 0.1 + state.frameFlash * 0.2;
        face.scale.set(1.5, 1.5 * aspectRatio, 1);
      }

      const scan = scanRefs.current[i];
      if (scan) {
        scan.visible = state.scanProgress > 0;
        scan.position.y = 0.5 - state.scanProgress;
        (scan.material as THREE.MeshBasicMaterial).opacity = state.scanProgress > 0 ? 0.6 : 0;
      }
    }
  });

  return (
    <>
      {CREDENTIALS.map((credential, i) => (
        <group key={credential.id} ref={(el) => { plateRefs.current[i] = el; }} visible={false}>
          <mesh geometry={backGeometry} material={mat.card} scale={[1.56, 1.0, 0.014]} />
          <mesh ref={(el) => { faceRefs.current[i] = el; }} geometry={faceGeometry} position={[0, 0, 0.008]}>
            <meshStandardMaterial emissive={0xffffff} emissiveIntensity={0.1} roughness={0.5} metalness={0} toneMapped={false} />
          </mesh>
          <mesh ref={(el) => { scanRefs.current[i] = el; }} geometry={scanGeometry} material={scanMaterial} position={[0, 0.5, 0.01]} visible={false} />
        </group>
      ))}
    </>
  );
}

export default CertPlates;
