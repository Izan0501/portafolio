"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

/**
 * Procedural PMREM environment — softboxes, no HDRI file (plan DESIGN.md §4
 * "Luz y materiales 3D": "softboxes procedurales PMREM con panel cenital
 * suave para la vista desde arriba"; plan §0 confirms: "Entorno PMREM con
 * softboxes procedurales... Sin HDRI externo").
 *
 * A small scene of emissive planes (never rendered directly — only baked
 * into the PMREM map) standing in for studio softboxes: four around the
 * sides for the aluminum's specular highlights, plus one directly overhead
 * and dim — the "panel cenital suave" that keeps the lid's silver finish
 * from blowing out white in the hero's straight-down opening shot.
 *
 * No geometry here reads a pose yet (there's no MacBook until M6) — this
 * environment map only has to exist and look like a believable studio once
 * real aluminum reflects it, which it already will.
 */
export function Environment() {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);

  const softboxScene = useMemo(() => {
    const s = new THREE.Scene();
    const panel = (size: number, intensity: number, position: [number, number, number], rotation: [number, number, number]) => {
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffffff).multiplyScalar(intensity), side: THREE.DoubleSide }));
      mesh.position.set(...position);
      mesh.rotation.set(...rotation);
      s.add(mesh);
      return mesh;
    };

    // Soft ambient fill so nothing fully unlit reads as pure black.
    s.add(new THREE.Mesh(new THREE.SphereGeometry(20, 16, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(0x14120f), side: THREE.BackSide })));

    // Four side softboxes around the bench, at working-height.
    const half = Math.PI / 2;
    panel(6, 1.1, [8, 3, 0], [0, -half, 0]);
    panel(6, 0.9, [-8, 3, 0], [0, half, 0]);
    panel(6, 0.85, [0, 3, 8], [0, Math.PI, 0]);
    panel(6, 0.7, [0, 3, -8], [0, 0, 0]);

    // The cenital panel — overhead, dim on purpose: this is what the hero's
    // top-down opening shot sees reflected in the lid, so it has to stay
    // soft or the aluminum blows out white at the one moment it's framed
    // dead flat toward the camera.
    panel(10, 0.45, [0, 12, 0], [half, 0, 0]);

    return s;
  }, []);

  const pmrem = useMemo(() => new THREE.PMREMGenerator(gl), [gl]);

  const envTexture = useMemo(() => {
    const target = pmrem.fromScene(softboxScene, 0.04);
    return target.texture;
  }, [pmrem, softboxScene]);

  useEffect(() => {
    scene.environment = envTexture;
    return () => {
      if (scene.environment === envTexture) scene.environment = null;
    };
  }, [scene, envTexture]);

  // Disposal (plan §2.3 "Limpieza"): the PMREM generator's own internal
  // render targets/materials, the baked environment texture, and the
  // never-rendered softbox scene's own geometries/materials.
  useEffect(() => {
    return () => {
      pmrem.dispose();
      envTexture.dispose();
      softboxScene.traverse((node) => {
        const mesh = node as THREE.Mesh;
        mesh.geometry?.dispose();
        const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(material)) material.forEach((m) => m.dispose());
        else material?.dispose();
      });
    };
  }, [pmrem, envTexture, softboxScene]);

  return null;
}
