"use client";

import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { getMaterialRegistry } from "@/components/three/materials/materialRegistry";
import { BASE_THICKNESS, KEYBOARD_ROWS, KEYBOARD_WIDTH, KEYBOARD_Z_START, KEY_COUNT, KEY_GAP } from "./dimensions";

/**
 * The keyboard: two `InstancedMesh`es (keycaps + per-key backlight glow),
 * one instance per key, ported 1:1 from the artifact (`_buildMac`, lines
 * 667-695). Matrices are static — built once, in a `useLayoutEffect` — only
 * the glow's per-instance *color* changes every frame, written directly by
 * `MacBook.tsx` through the `glow`/`keyRow` handle this exposes.
 */

export interface KeyboardHandle {
  /** The backlight `InstancedMesh` — `MacBook.tsx` calls `setColorAt` on this every frame, keyed by `keyRow`. */
  glow: THREE.InstancedMesh;
  /** Which of the 6 rows each instance belongs to (0 = function row ... 5 = space row), for the artifact's row-by-row backlight sweep. */
  keyRow: Uint8Array;
}

export const Keyboard = forwardRef<KeyboardHandle>(function Keyboard(_props, ref) {
  const mat = getMaterialRegistry();
  const keysRef = useRef<THREE.InstancedMesh>(null);
  const glowRef = useRef<THREE.InstancedMesh>(null);
  const keyRow = useMemo(() => new Uint8Array(KEY_COUNT), []);

  const keysGeometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const glowGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(1, 1);
    geometry.rotateX(-Math.PI / 2);
    return geometry;
  }, []);
  const glowMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  );
  useEffect(() => {
    return () => {
      keysGeometry.dispose();
      glowGeometry.dispose();
      glowMaterial.dispose();
    };
  }, [keysGeometry, glowGeometry, glowMaterial]);

  useLayoutEffect(() => {
    const keys = keysRef.current;
    const glow = glowRef.current;
    if (!keys || !glow) return;

    const m4 = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    const black = new THREE.Color(0, 0, 0);

    let z = KEYBOARD_Z_START;
    let idx = 0;
    KEYBOARD_ROWS.forEach((row, rowIndex) => {
      const units = row.u.reduce((sum, u) => sum + u, 0);
      const unit = (KEYBOARD_WIDTH - KEY_GAP * (row.u.length - 1)) / units;
      let x = -KEYBOARD_WIDTH / 2;
      row.u.forEach((u) => {
        const w = u * unit;

        position.set(x + w / 2, BASE_THICKNESS + 0.007, z + row.d / 2);
        scale.set(w, 0.012, row.d);
        m4.compose(position, quaternion, scale);
        keys.setMatrixAt(idx, m4);

        position.y = BASE_THICKNESS + 0.0136;
        scale.set(Math.min(w * 0.5, 0.09), 1, row.d * 0.28);
        m4.compose(position, quaternion, scale);
        glow.setMatrixAt(idx, m4);
        glow.setColorAt(idx, black);

        keyRow[idx] = rowIndex;
        idx++;
        x += w + KEY_GAP;
      });
      z += row.d + KEY_GAP;
    });

    keys.instanceMatrix.needsUpdate = true;
    glow.instanceMatrix.needsUpdate = true;
    if (glow.instanceColor) glow.instanceColor.needsUpdate = true;
  }, [keyRow]);

  useImperativeHandle(
    ref,
    () => ({
      // Safe to read `.current` here (not inside render): by the time this
      // factory runs, React has already committed `glowRef` on the child
      // `<instancedMesh>` below — same ordering `useLayoutEffect` above
      // relies on. The mesh itself never remounts, so this value never goes stale.
      glow: glowRef.current as THREE.InstancedMesh,
      keyRow,
    }),
    [keyRow],
  );

  return (
    <>
      <instancedMesh ref={keysRef} args={[keysGeometry, mat.key, KEY_COUNT]} />
      <instancedMesh ref={glowRef} args={[glowGeometry, glowMaterial, KEY_COUNT]} />
    </>
  );
});
