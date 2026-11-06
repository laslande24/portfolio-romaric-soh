"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { SPECS } from "./Device";

export type Palette = { paper: string; card: string; ink: string; ink3: string };

/**
 * The cutting mat: a fine grid with a heavier line every fourth cell, drawn once
 * into a canvas and tiled. One cell is 0.25 scene units.
 */
function useMatTexture(p: Palette) {
  return useMemo(() => {
    const px = 512;
    const cells = 8;
    const c = document.createElement("canvas");
    c.width = c.height = px;
    const g = c.getContext("2d")!;
    g.fillStyle = p.card;
    g.fillRect(0, 0, px, px);
    g.strokeStyle = p.ink;
    for (let i = 0; i <= cells; i++) {
      const major = i % 4 === 0;
      g.globalAlpha = major ? 0.1 : 0.055;
      g.lineWidth = major ? 3 : 2;
      const at = (i / cells) * px;
      g.beginPath();
      g.moveTo(at, 0);
      g.lineTo(at, px);
      g.moveTo(0, at);
      g.lineTo(px, at);
      g.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 8;
    const size = 80;
    t.repeat.set(size / 2, size / 2); // the canvas covers 2 × 2 units
    return { texture: t, size };
  }, [p.card, p.ink]);
}

/**
 * Crop marks, the site's signature: two short strokes at each corner of every
 * device's place on the mat. All of them are one mesh, so one draw call.
 */
function CropMarks({ colour }: { colour: string }) {
  const geometry = useMemo(() => {
    const gap = 0.08;
    const len = 0.16;
    const parts: THREE.BufferGeometry[] = [];
    for (const { rest, footprint } of Object.values(SPECS)) {
      const [w, d] = footprint.size;
      const place = new THREE.Matrix4()
        .makeTranslation(rest.at[0], 0.002, rest.at[2] + (footprint.offset ?? 0))
        .multiply(new THREE.Matrix4().makeRotationY(rest.y));
      for (const sx of [-1, 1])
        for (const sz of [-1, 1])
          // One stroke along x beyond the side, one along z beyond the end
          for (const [x, z, long] of [
            [sx * (w / 2 + gap + len / 2), sz * (d / 2), true],
            [sx * (w / 2), sz * (d / 2 + gap + len / 2), false],
          ] as const) {
            const g = new THREE.PlaneGeometry(long ? len : 0.012, long ? 0.012 : len);
            g.rotateX(-Math.PI / 2).translate(x, 0, z).applyMatrix4(place);
            parts.push(g);
          }
    }
    return mergeGeometries(parts);
  }, []);
  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial color={colour} toneMapped={false} />
    </mesh>
  );
}

export function Bench({ palette }: { palette: Palette }) {
  const mat = useMatTexture(palette);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[mat.size, mat.size]} />
        <meshStandardMaterial map={mat.texture} roughness={0.92} metalness={0} />
      </mesh>
      {/* Each device's place stays marked while it is out meeting the camera */}
      <CropMarks colour={palette.ink3} />
    </group>
  );
}
