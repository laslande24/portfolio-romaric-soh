"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { INK, INK_2, PAPER, sheet, usePrint, type Draw } from "./Papers";
import { presence, smoothstep, tour } from "./state";

/*
  Aéro's stop: the app opens on a flat drawing of the jet and turns 3D on
  demand, so here the jet is first a drawing on a sheet, then, from the second
  step, the model comes up out of the paper. Both are built from the same
  numbers as the app's procedural Bombardier Global 6000, in the app's units
  (7.4 long), so the model leaves the sheet exactly over its own drawing.
*/

const L = 7.4;
const R = 0.56;
/** Fuselage silhouette from the app: (position along the length, radius factor). */
const PROFILE: [number, number][] = [
  [0, 0.012], [0.02, 0.3], [0.05, 0.55], [0.09, 0.75], [0.14, 0.9], [0.21, 0.98], [0.3, 1],
  [0.58, 1], [0.7, 0.94], [0.82, 0.72], [0.91, 0.45], [0.97, 0.22], [1, 0.09],
];
const WING = { x: 0.15, y: -R * 0.8, span: 7.6, sweep: 1.6, root: 1.7, tip: 0.4, dihedral: 0.06 };
const WING_RISE = (WING.span / 2) * Math.sin(WING.dihedral);
const TAIL_X = L / 2 - 1.4;
const FIN = { y: R * 0.4, h: 1.5, sweep: 0.95, root: 1.3, tip: 0.55 };
const STAB = { x: TAIL_X + 0.8, y: FIN.y + FIN.h, span: 2.9, sweep: 0.8, root: 0.72, tip: 0.34 };
const ENGINE = { x: TAIL_X - 0.5, y: R * 0.6, z: R + 0.32, r: 0.23, len: 0.75 };
const WINDOWS = { n: 11, from: -L * 0.22, to: L * 0.2, y: R * 0.34 };
const GOLD = "#b8933f";

/** The sheet, and where the jet sits on it: 2 units nose to tail, axis a little low under the fin. */
const SHEET = { w: 2.5, h: 1.15 };
const S = 2 / L;
const AXIS = -0.07;

const radiusAt = (x: number) => {
  const t = x / L + 0.5;
  for (let i = 1; i < PROFILE.length; i++) {
    const [t1, k1] = PROFILE[i];
    if (t <= t1) {
      const [t0, k0] = PROFILE[i - 1];
      return R * (k0 + ((t - t0) / (t1 - t0)) * (k1 - k0));
    }
  }
  return R * PROFILE[PROFILE.length - 1][1];
};
/** The gold cheatline climbs from under the windows at the nose to above them at the tail. */
const cheatAngle = (x: number) => -0.35 + 0.85 * ((x / L + 0.5 - 0.14) / 0.78);
const CHEAT = { from: -L * 0.36, to: L * 0.42 };

/** A swept surface: chord along x, span along the shape's y (negative `span` for the other side). */
function blade(span: number, sweep: number, root: number, tip: number) {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(sweep, span);
  s.lineTo(sweep + tip, span);
  s.lineTo(root, 0);
  s.closePath();
  return s;
}

/* ---------- The drawing: the side elevation, in the papers' ink ---------- */

/** App units → thousandths of a scene unit on the sheet's canvas. */
const px = (x: number) => (SHEET.w / 2 + x * S) * 1000;
const py = (y: number) => (SHEET.h / 2 - (AXIS + y * S)) * 1000;

const elevation: Draw = (g, f) => {
  g.lineJoin = "round";
  // A drafting frame and the fuselage's centre line
  g.strokeStyle = "rgba(29, 26, 22, 0.35)";
  g.lineWidth = 2;
  g.strokeRect(50, 50, SHEET.w * 1000 - 100, SHEET.h * 1000 - 100);
  g.setLineDash([44, 12, 6, 12]);
  g.beginPath();
  g.moveTo(px(-L / 2 - 0.4), py(0));
  g.lineTo(px(L / 2 + 0.4), py(0));
  g.stroke();
  g.setLineDash([]);

  g.strokeStyle = INK;
  g.lineWidth = 4;
  const poly = (pts: [number, number][]) => {
    g.beginPath();
    pts.forEach(([x, y], i) => (i ? g.lineTo(px(x), py(y)) : g.moveTo(px(x), py(y))));
    g.closePath();
    g.stroke();
  };
  // Fin and tailplane behind the fuselage, wing below it
  poly([[TAIL_X, FIN.y], [TAIL_X + FIN.sweep, FIN.y + FIN.h], [TAIL_X + FIN.sweep + FIN.tip, FIN.y + FIN.h], [TAIL_X + FIN.root, FIN.y]]);
  poly([[STAB.x, STAB.y + 0.04], [STAB.x + STAB.sweep + STAB.tip, STAB.y + 0.1], [STAB.x + STAB.root, STAB.y - 0.03]]);

  // Fuselage, filled so it hides what passes behind it
  g.beginPath();
  for (let i = 0; i <= 80; i++) {
    const x = -L / 2 + (L * i) / 80;
    const y = radiusAt(x);
    if (i) g.lineTo(px(x), py(y));
    else g.moveTo(px(x), py(y));
  }
  for (let i = 80; i >= 0; i--) {
    const x = -L / 2 + (L * i) / 80;
    g.lineTo(px(x), py(-radiusAt(x)));
  }
  g.closePath();
  g.fillStyle = PAPER;
  g.fill();
  g.stroke();
  // The wing hides behind the fuselage: dashed, as a drawing shows hidden edges
  g.lineWidth = 3;
  g.setLineDash([18, 12]);
  poly([[WING.x, WING.y], [WING.x + WING.sweep, WING.y + WING_RISE], [WING.x + WING.sweep + WING.tip, WING.y + WING_RISE], [WING.x + WING.root, WING.y]]);
  g.setLineDash([]);
  g.lineWidth = 4;

  // Cockpit, cabin windows, the engine on its pylon
  poly([[-L * 0.405 - 0.3, R * 0.28], [-L * 0.405 + 0.06, R * 0.62], [-L * 0.405 + 0.3, R * 0.6], [-L * 0.405 + 0.3, R * 0.28]]);
  for (let i = 0; i < WINDOWS.n; i++) {
    const x = WINDOWS.from + ((WINDOWS.to - WINDOWS.from) * i) / (WINDOWS.n - 1);
    g.beginPath();
    g.roundRect(px(x - 0.075), py(WINDOWS.y + 0.095), 0.15 * S * 1000, 0.19 * S * 1000, 0.05 * S * 1000);
    g.stroke();
  }
  g.fillStyle = PAPER;
  g.beginPath();
  g.roundRect(px(ENGINE.x - ENGINE.len / 2 - ENGINE.r), py(ENGINE.y + ENGINE.r), (ENGINE.len + 2 * ENGINE.r) * S * 1000, 2 * ENGINE.r * S * 1000, ENGINE.r * S * 1000);
  g.fill();
  g.stroke();

  // The one colour: the livery's gold line
  g.strokeStyle = GOLD;
  g.lineWidth = 6;
  g.beginPath();
  for (let i = 0; i <= 40; i++) {
    const x = CHEAT.from + ((CHEAT.to - CHEAT.from) * i) / 40;
    const y = radiusAt(x) * Math.sin(cheatAngle(x));
    if (i) g.lineTo(px(x), py(y));
    else g.moveTo(px(x), py(y));
  }
  g.stroke();

  g.font = `700 110px ${f.display}`;
  g.fillStyle = INK;
  g.fillText("Aéro", 110, 190);
  g.font = `500 32px ${f.sans}`;
  g.fillStyle = INK_2;
  g.fillText("Bombardier Global 6000", 114, 244);
};

/* ---------- The model ---------- */

function useJetGeometry() {
  return useMemo(() => {
    // Hull: the profile turned about the length, nose towards -x
    const points = PROFILE.map(([t, k]) => new THREE.Vector2(k * R, t * L));
    // (non-indexed, like the extruded surfaces it is merged with)
    const hull = new THREE.LatheGeometry(points, 40).toNonIndexed();
    hull.rotateZ(-Math.PI / 2).translate(-L / 2, 0, 0);

    const surface = (shape: THREE.Shape, depth: number) => {
      const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.03, bevelSegments: 1 });
      g.translate(0, 0, -depth / 2);
      return g;
    };
    // Wings and tailplane lie flat (span along z), the wings tipped up a little; the fin stands up
    const halves = [-1, 1].flatMap((side) => [
      surface(blade(side * (WING.span / 2), WING.sweep, WING.root, WING.tip), 0.05)
        .rotateX(Math.PI / 2)
        .rotateX(-side * WING.dihedral)
        .translate(WING.x, WING.y, 0),
      surface(blade(side * (STAB.span / 2), STAB.sweep, STAB.root, STAB.tip), 0.05)
        .rotateX(Math.PI / 2)
        .translate(STAB.x, STAB.y, 0),
    ]);
    const fin = surface(blade(FIN.h, FIN.sweep, FIN.root, FIN.tip), 0.06).translate(TAIL_X, FIN.y, 0);
    const paint = mergeGeometries([hull, ...halves, fin]);

    const nacelles: THREE.BufferGeometry[] = [];
    const dark: THREE.BufferGeometry[] = [];
    for (const side of [-1, 1]) {
      const z = side * ENGINE.z;
      nacelles.push(new THREE.CapsuleGeometry(ENGINE.r, ENGINE.len, 6, 20).rotateZ(Math.PI / 2).translate(ENGINE.x, ENGINE.y, z));
      nacelles.push(new THREE.BoxGeometry(0.62, 0.14, 0.34).translate(ENGINE.x, ENGINE.y - 0.05, z - side * 0.3));
      dark.push(new THREE.CylinderGeometry(0.19, 0.19, 0.06, 20).rotateZ(Math.PI / 2).translate(ENGINE.x - ENGINE.len / 2 - 0.12, ENGINE.y, z));
      // Cabin windows, flattened ovals on the flank
      for (let i = 0; i < WINDOWS.n; i++) {
        const x = WINDOWS.from + ((WINDOWS.to - WINDOWS.from) * i) / (WINDOWS.n - 1);
        const r = radiusAt(x);
        const zw = side * Math.sqrt(r * r - WINDOWS.y * WINDOWS.y);
        dark.push(new THREE.SphereGeometry(0.075, 10, 8).scale(1, 1.25, 0.3).translate(x, WINDOWS.y, zw));
      }
      // Cockpit side window: a dark lens laid on the nose, swept back
      const xc = -L * 0.4;
      const yc = R * 0.4;
      const rc = radiusAt(xc);
      dark.push(
        new THREE.SphereGeometry(0.1, 12, 8)
          .scale(2.6, 0.8, 0.3)
          .rotateZ(-0.22)
          .rotateX(-side * Math.asin(yc / rc))
          .translate(xc, yc, side * Math.sqrt(rc * rc - yc * yc)),
      );
    }

    const cheat: THREE.BufferGeometry[] = [];
    for (const side of [-1, 1]) {
      const curve = new THREE.CatmullRomCurve3(
        Array.from({ length: 12 }, (_, i) => {
          const x = CHEAT.from + ((CHEAT.to - CHEAT.from) * i) / 11;
          const r = radiusAt(x) * 1.006;
          const a = cheatAngle(x);
          return new THREE.Vector3(x, r * Math.sin(a), side * r * Math.cos(a));
        }),
      );
      cheat.push(new THREE.TubeGeometry(curve, 48, 0.016, 5));
    }

    return {
      paint,
      steel: mergeGeometries(nacelles),
      dark: mergeGeometries(dark),
      gold: mergeGeometries(cheat),
    };
  }, []);
}

/** The model's far points: they decide how far it must stand off the paper. */
const EXTREMES = [
  [-L / 2, 0, 0],
  [L / 2, 0, 0],
  ...[-1, 1].flatMap((s) => [
    [WING.x + WING.sweep + WING.tip, WING.y + WING_RISE, (s * WING.span) / 2],
    [STAB.x + STAB.sweep + STAB.tip, STAB.y, (s * STAB.span) / 2],
    [ENGINE.x + ENGINE.len / 2 + ENGINE.r, ENGINE.y, s * (ENGINE.z + ENGINE.r)],
  ]),
].map((p) => new THREE.Vector3(...p));
const probe = new THREE.Vector3();

export function JetBody({ index, load }: { index: number; load: boolean }) {
  const geometry = useMemo(() => sheet(SHEET.w, SHEET.h, 0.01), []);
  const print = usePrint(SHEET.w, SHEET.h, elevation, load);
  const jet = useJetGeometry();
  const model = useRef<THREE.Group>(null);

  useFrame(() => {
    const m = model.current;
    if (!m) return;
    // Flat while the first step is read, out of the paper from the second, back in as the camera walks on
    const d = smoothstep(0.15, 0.85, tour.screen[index]) * presence(index);
    m.visible = d > 0.004;
    if (!m.visible) return;
    // Squashed to nothing across its span it is its own drawing; it grows, turns its nose out and shows its top,
    // a little smaller and to the left, as it comes nearer the lens and its tail swings right
    const k = S * (1 - 0.14 * d);
    m.scale.set(k, k, k * Math.max(d, 0.004));
    m.rotation.set(0.32 * d, 0.42 * d, 0);
    m.position.set(-0.2 * d, AXIS, 0);
    m.updateMatrix();
    let back = 0;
    for (const p of EXTREMES) back = Math.min(back, probe.copy(p).applyMatrix4(m.matrix).z);
    m.position.z = 0.012 - back;
  });

  return (
    <>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial map={print} roughness={0.9} metalness={0} />
      </mesh>
      <mesh geometry={geometry}>
        <meshStandardMaterial color={PAPER} roughness={0.9} metalness={0} side={THREE.BackSide} />
      </mesh>
      <group ref={model} visible={false}>
        <mesh geometry={jet.paint} castShadow>
          <meshStandardMaterial color="#f4f2ee" roughness={0.32} metalness={0.05} />
        </mesh>
        <mesh geometry={jet.steel} castShadow>
          <meshStandardMaterial color="#c6ced6" roughness={0.3} metalness={0.55} />
        </mesh>
        <mesh geometry={jet.dark}>
          <meshStandardMaterial color="#1b1d21" roughness={0.2} metalness={0.4} />
        </mesh>
        <mesh geometry={jet.gold}>
          <meshStandardMaterial color={GOLD} roughness={0.3} metalness={0.7} />
        </mesh>
      </group>
    </>
  );
}
