"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

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

/** Crop marks: the site's signature, drawn on the mat around a footprint. */
export function CropMarks({
  at,
  size,
  angle = 0,
  colour,
}: {
  at: [number, number];
  size: [number, number];
  angle?: number;
  colour: string;
}) {
  const marks = useMemo(() => {
    const [w, d] = size;
    const gap = 0.08;
    const len = 0.16;
    const out: { x: number; z: number; long: "x" | "z" }[] = [];
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) {
        // Each corner: one mark along x beyond the side, one along z beyond the end
        out.push({ x: sx * (w / 2 + gap + len / 2), z: sz * (d / 2), long: "x" });
        out.push({ x: sx * (w / 2), z: sz * (d / 2 + gap + len / 2), long: "z" });
      }
    return { out, len };
  }, [size]);

  return (
    <group position={[at[0], 0.002, at[1]]} rotation={[0, angle, 0]}>
      {marks.out.map((m, i) => (
        <mesh key={i} position={[m.x, 0, m.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={m.long === "x" ? [marks.len, 0.012] : [0.012, marks.len]} />
          <meshBasicMaterial color={colour} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

// Aluminium for the waiting devices: light on paper, so the dark phone leads
const body = { color: "#cfcbc4", metalness: 0.75, roughness: 0.38 } as const;
const glass = { color: "#060605", metalness: 0.1, roughness: 0.12 } as const;

/** Redekunst sits here in phase B: an open laptop, screen still off. */
function Laptop({ at, angle }: { at: [number, number]; angle: number }) {
  const base = useMemo(() => new RoundedBoxGeometry(2, 0.07, 1.36, 3, 0.03), []);
  const lid = useMemo(() => new RoundedBoxGeometry(2, 1.32, 0.04, 3, 0.02), []);
  return (
    <group position={[at[0], 0, at[1]]} rotation={[0, angle, 0]}>
      <mesh geometry={base} position={[0, 0.035, 0]} castShadow receiveShadow>
        <meshStandardMaterial {...body} />
      </mesh>
      {/* Hinge at the back edge, lid opened to 110° */}
      <group position={[0, 0.07, -0.66]} rotation={[-0.35, 0, 0]}>
        <mesh geometry={lid} position={[0, 0.66, 0]} castShadow>
          <meshStandardMaterial {...body} />
        </mesh>
        <mesh position={[0, 0.66, 0.021]}>
          <planeGeometry args={[1.86, 1.18]} />
          <meshStandardMaterial {...glass} />
        </mesh>
      </group>
    </group>
  );
}

/** A tablet lying on the mat (7SETS in phase B). */
function Tablet({ at, angle }: { at: [number, number]; angle: number }) {
  const slab = useMemo(() => new RoundedBoxGeometry(1.9, 0.05, 1.32, 3, 0.022), []);
  return (
    <group position={[at[0], 0.025, at[1]]} rotation={[0, angle, 0]}>
      <mesh geometry={slab} castShadow receiveShadow>
        <meshStandardMaterial {...body} />
      </mesh>
      <mesh position={[0, 0.026, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.76, 1.18]} />
        <meshStandardMaterial {...glass} />
      </mesh>
    </group>
  );
}

/** A display on a foot, at the back of the bench (PortfolioOS in phase B). */
function Display({ at, angle }: { at: [number, number]; angle: number }) {
  const panel = useMemo(() => new RoundedBoxGeometry(2, 1.25, 0.05, 3, 0.022), []);
  return (
    <group position={[at[0], 0, at[1]]} rotation={[0, angle, 0]}>
      <mesh position={[0, 0.015, 0.05]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.03, 0.5]} />
        <meshStandardMaterial {...body} />
      </mesh>
      <mesh position={[0, 0.32, -0.02]} rotation={[-0.12, 0, 0]} castShadow>
        <boxGeometry args={[0.12, 0.64, 0.05]} />
        <meshStandardMaterial {...body} />
      </mesh>
      <group position={[0, 0.9, 0.05]} rotation={[-0.08, 0, 0]}>
        <mesh geometry={panel} castShadow>
          <meshStandardMaterial {...body} />
        </mesh>
        <mesh position={[0, 0, 0.031]}>
          <planeGeometry args={[1.9, 1.15]} />
          <meshStandardMaterial {...glass} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Where everything lies on the mat. The phone is front left, so when the camera
 * faces it the paper on its left stays empty for the text; the others wait on
 * its right. The phone itself is placed by the scene.
 */
export const LAYOUT = {
  phone: [-1.5, 1.0] as [number, number],
  laptop: { at: [0.55, -0.45] as [number, number], angle: -0.12 },
  tablet: { at: [2.75, 0.75] as [number, number], angle: -0.28 },
  display: { at: [2.45, -1.95] as [number, number], angle: -0.32 },
};

export function Bench({ palette }: { palette: Palette }) {
  const mat = useMatTexture(palette);
  const { laptop, tablet, display, phone } = LAYOUT;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[mat.size, mat.size]} />
        <meshStandardMaterial map={mat.texture} roughness={0.92} metalness={0} />
      </mesh>

      <CropMarks at={phone} size={[0.76, 1.66]} colour={palette.ink3} />
      <CropMarks at={laptop.at} size={[2, 1.36]} angle={laptop.angle} colour={palette.ink3} />
      <CropMarks at={tablet.at} size={[1.9, 1.32]} angle={tablet.angle} colour={palette.ink3} />
      <CropMarks at={[display.at[0], display.at[1] + 0.05]} size={[0.7, 0.5]} angle={display.angle} colour={palette.ink3} />

      <Laptop {...laptop} />
      <Tablet {...tablet} />
      <Display {...display} />
    </group>
  );
}
