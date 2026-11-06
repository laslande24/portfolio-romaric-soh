"use client";

import { useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { education, experience } from "@/content/profile";
import { tour } from "./state";

/*
  The papers of the path, at the far end of the bench. Each print is drawn once
  into a canvas in the site's own faces, and only says what the text beside it
  says: names, places, years, tools. Nothing here imitates a real logo or seal.
  Built like the devices: printed face towards +z, sizes in scene units.
*/

const INK = "#1d1a16";
const INK_2 = "#4f473d";
/** Cream stock, a step darker than the mat, so a sheet's edge shows against it. */
const PAPER = "#eee5d2";
/** The badge is white plastic. */
const CARD = "#f7f4ee";
const LATERITE = "#b4441f";

type Fonts = { display: string; sans: string };
/** Draws in thousandths of a scene unit: a 0.4-unit badge is 400 wide. */
type Draw = (g: CanvasRenderingContext2D, f: Fonts) => void;

function usePrint(w: number, h: number, draw: Draw, background = PAPER) {
  const gl = useThree((s) => s.gl);
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    // Sharper than the camera ever shows them: ~1300 px per unit on the badge, ~800 on a sheet
    const ppu = Math.min(1300, 1600 / Math.max(w, h));
    c.width = Math.round(w * ppu);
    c.height = Math.round(h * ppu);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [w, h]);

  useEffect(() => {
    let live = true;
    const css = getComputedStyle(document.documentElement);
    const f = { display: css.getPropertyValue("--font-big-shoulders").trim(), sans: css.getPropertyValue("--font-hanken").trim() };
    Promise.all([document.fonts.load(`700 100px ${f.display}`), document.fonts.load(`500 40px ${f.sans}`)])
      .catch(() => [])
      .then(() => {
        if (!live) return;
        const c = texture.image as HTMLCanvasElement;
        const g = c.getContext("2d")!;
        g.setTransform(c.width / (w * 1000), 0, 0, c.height / (h * 1000), 0, 0);
        g.fillStyle = background;
        g.fillRect(0, 0, w * 1000, h * 1000);
        draw(g, f);
        // A hairline at the edge, as paper catches the light
        g.strokeStyle = "rgba(29, 26, 22, 0.14)";
        g.lineWidth = 6;
        g.strokeRect(0, 0, w * 1000, h * 1000);
        texture.needsUpdate = true;
        gl.initTexture(texture);
        tour.invalidate();
      });
    return () => {
      live = false;
    };
  }, [texture, draw, w, h, gl, background]);

  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

const type = (g: CanvasRenderingContext2D, weight: number, size: number, family: string, colour = INK) => {
  g.font = `${weight} ${size}px ${family}`;
  g.fillStyle = colour;
};

/** A sheet that does not lie quite flat: its sides lift by `curl`. */
function sheet(w: number, h: number, curl: number) {
  const g = new THREE.PlaneGeometry(w, h, 24, 1);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) p.setZ(i, curl * ((2 * p.getX(i)) / w) ** 2);
  g.computeVertexNormals();
  return g;
}

/** Front and back of one sheet: the print on the front, plain paper behind. */
function Sheet({ geometry, map }: { geometry: THREE.BufferGeometry; map: THREE.Texture }) {
  return (
    <>
      <mesh geometry={geometry} castShadow>
        <meshStandardMaterial map={map} roughness={0.9} metalness={0} />
      </mesh>
      <mesh geometry={geometry}>
        <meshStandardMaterial color={PAPER} roughness={0.9} metalness={0} side={THREE.BackSide} />
      </mesh>
    </>
  );
}

/* ---------- AFREETECH: a work badge, the tools on its back ---------- */

const [afreetech, qta, peexit] = experience;
const BADGE = { w: 0.4, h: 0.62, r: 0.03, depth: 0.006 };

const badgeFront: Draw = (g, f) => {
  g.fillStyle = INK;
  g.fillRect(0, 0, 400, 150);
  type(g, 700, 64, f.display, CARD);
  g.fillText(afreetech.org, 32, 124);
  // A monogram where a photo would go
  g.strokeStyle = INK;
  g.lineWidth = 2;
  g.strokeRect(32, 186, 132, 160);
  type(g, 700, 84, f.display);
  g.textAlign = "center";
  g.fillText("RS", 98, 298);
  g.textAlign = "start";
  type(g, 600, 42, f.sans);
  g.fillText("Romaric Soh", 32, 420);
  type(g, 400, 26, f.sans, INK_2);
  g.fillText(afreetech.place, 32, 462);
  g.fillText("2024 – 2025", 32, 496);
  // Barcode: a fixed pattern, the same on every visit
  g.fillStyle = INK;
  for (let i = 0, x = 32; x < 360; i++) {
    const bar = 2 + ((i * 7) % 5);
    if (i % 2 === 0) g.fillRect(x, 540, bar, 48);
    x += bar + 2 + ((i * 3) % 3);
  }
};

const badgeBack: Draw = (g, f) => {
  type(g, 600, 58, f.display);
  afreetech.tools.forEach((t, i) => g.fillText(t, 32, 120 + i * 70));
  type(g, 400, 24, f.sans, INK_2);
  ["PAGIRN-PPTIC", "OBSDATA", "EAGLES"].forEach((t, i) => g.fillText(t, 32, 480 + i * 34));
};

function roundedRect(w: number, h: number, r: number) {
  const x = -w / 2;
  const y = -h / 2;
  const s = new THREE.Shape();
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

export function BadgeBody() {
  const { card, face } = useMemo(() => {
    const shape = roundedRect(BADGE.w, BADGE.h, BADGE.r);
    const card = new THREE.ExtrudeGeometry(shape, { depth: BADGE.depth, bevelEnabled: false, curveSegments: 8 });
    card.translate(0, 0, -BADGE.depth / 2);
    // The print fills the rounded face: map its outline onto 0…1
    const face = new THREE.ShapeGeometry(shape, 8);
    const p = face.attributes.position;
    const uv = face.attributes.uv;
    for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / BADGE.w + 0.5, p.getY(i) / BADGE.h + 0.5);
    return { card, face };
  }, []);
  const front = usePrint(BADGE.w, BADGE.h, badgeFront, CARD);
  const back = usePrint(BADGE.w, BADGE.h, badgeBack, CARD);
  const z = BADGE.depth / 2 + 0.0005;
  return (
    <>
      <mesh geometry={card} castShadow>
        <meshStandardMaterial color={CARD} roughness={0.5} metalness={0} />
      </mesh>
      <mesh geometry={face} position={[0, 0, z]}>
        <meshStandardMaterial map={front} roughness={0.45} metalness={0} />
      </mesh>
      {/* Turned over, the back reads the right way round */}
      <mesh geometry={face} position={[0, 0, -z]} rotation={[0, Math.PI, 0]}>
        <meshStandardMaterial map={back} roughness={0.45} metalness={0} />
      </mesh>
      {/* The clip */}
      <mesh position={[0, BADGE.h / 2 - 0.01, 0]} castShadow>
        <boxGeometry args={[0.11, 0.05, 0.016]} />
        <meshStandardMaterial color="#cfcbc4" metalness={0.75} roughness={0.38} />
      </mesh>
    </>
  );
}

/* ---------- Internships: a notebook, the model on the left, the screens on the right ---------- */

const SPREAD = { w: 1.96, h: 1.38 };

const notebookSpread: Draw = (g, f) => {
  // Dot grid, broken by the binding
  g.fillStyle = "rgba(29, 26, 22, 0.16)";
  for (let x = 55; x < 1960; x += 50)
    for (let y = 40; y < 1380; y += 50) if (Math.abs(x - 980) > 50) g.fillRect(x - 2, y - 2, 4, 4);
  // The pages dip into the binding
  const gutter = g.createLinearGradient(900, 0, 1060, 0);
  gutter.addColorStop(0, "rgba(29, 26, 22, 0)");
  gutter.addColorStop(0.5, "rgba(29, 26, 22, 0.14)");
  gutter.addColorStop(1, "rgba(29, 26, 22, 0)");
  g.fillStyle = gutter;
  g.fillRect(900, 0, 160, 1380);

  const header = (x: number, name: string, years: string, tools: string) => {
    type(g, 600, 64, f.display);
    g.fillText(name, x, 150);
    type(g, 400, 30, f.sans, INK_2);
    g.fillText(years, x, 196);
    g.fillText(tools, x, 1300);
  };

  // Left: QTA TECH, the app modelled before it was built
  header(80, qta.org, "2023 – 2024", qta.tools.join(" · "));
  g.lineWidth = 3;
  g.strokeStyle = INK;
  const boxes: Record<string, [number, number, number]> = {
    Applicant: [100, 300, 3],
    Request: [520, 300, 4],
    Document: [100, 780, 2],
    Assessment: [520, 820, 3],
  };
  // Associations first, so the boxes sit on top of them
  const line = (x1: number, y1: number, x2: number, y2: number, a: string, b: string, ax: number, ay: number, bx: number, by: number) => {
    g.beginPath();
    g.moveTo(x1, y1);
    g.lineTo(x2, y2);
    g.stroke();
    type(g, 500, 28, f.sans, INK_2);
    g.fillText(a, ax, ay);
    g.fillText(b, bx, by);
  };
  line(400, 370, 520, 370, "1", "*", 412, 356, 496, 356);
  line(670, 500, 670, 820, "1", "1", 684, 534, 684, 806);
  line(520, 470, 400, 800, "1", "*", 488, 506, 418, 778);
  for (const [name, [x, y, rows]] of Object.entries(boxes)) {
    const h = 66 + rows * 36;
    g.fillStyle = PAPER;
    g.fillRect(x, y, 300, h);
    g.strokeRect(x, y, 300, h);
    g.beginPath();
    g.moveTo(x, y + 60);
    g.lineTo(x + 300, y + 60);
    g.stroke();
    type(g, 600, 30, f.sans);
    g.fillText(name, x + 20, y + 41);
    g.fillStyle = "rgba(29, 26, 22, 0.3)";
    for (let i = 0; i < rows; i++) g.fillRect(x + 20, y + 80 + i * 36, 130 + ((i * 53 + x) % 110), 10);
  }

  // Right: PEEXIT, three screens of a mobile app
  header(1060, "PEEXIT", "2021", peexit.tools.join(" · "));
  for (let i = 0; i < 3; i++) {
    const x = 1070 + i * 280;
    const y = 360;
    g.strokeStyle = INK;
    g.lineWidth = 3;
    g.beginPath();
    g.roundRect(x, y, 230, 460, 32);
    g.stroke();
    g.fillStyle = "rgba(29, 26, 22, 0.3)";
    g.fillRect(x + 24, y + 40, 90, 10);
    if (i === 0) g.fillRect(x + 24, y + 80, 182, 120);
    for (let r = 0; r < (i === 1 ? 6 : 3); r++) g.fillRect(x + 24, y + (i === 1 ? 80 : 230) + r * 46, 182 - ((r * 37) % 60), 12);
    g.beginPath();
    g.roundRect(x + 24, y + 384, 182, 44, 22);
    g.stroke();
    if (i < 2) {
      // Arrows from one screen to the next
      g.beginPath();
      g.moveTo(x + 238, y + 230);
      g.lineTo(x + 272, y + 230);
      g.moveTo(x + 262, y + 220);
      g.lineTo(x + 272, y + 230);
      g.lineTo(x + 262, y + 240);
      g.stroke();
    }
  }
};

export function NotebookBody() {
  const cover = useMemo(() => new RoundedBoxGeometry(2, 1.41, 0.02, 2, 0.008), []);
  const pages = useMemo(() => sheet(SPREAD.w, SPREAD.h, 0.012), []);
  const print = usePrint(SPREAD.w, SPREAD.h, notebookSpread);
  return (
    <>
      <mesh geometry={cover} position={[0, 0, -0.01]} castShadow>
        <meshStandardMaterial color="#2a2622" roughness={0.8} metalness={0} />
      </mesh>
      <mesh position={[0, 0, 0.007]}>
        <boxGeometry args={[SPREAD.w, SPREAD.h, 0.014]} />
        <meshStandardMaterial color={PAPER} roughness={0.9} metalness={0} />
      </mesh>
      <group position={[0, 0, 0.0145]}>
        <Sheet geometry={pages} map={print} />
      </group>
    </>
  );
}

/* ---------- The degree ---------- */

const DIPLOMA = { w: 1.98, h: 1.4 };
const [university, institute] = education.school.en.split(" / ");

const diploma: Draw = (g, f) => {
  g.strokeStyle = "rgba(29, 26, 22, 0.5)";
  g.lineWidth = 3;
  g.strokeRect(60, 60, 1860, 1280);
  g.lineWidth = 1;
  g.strokeRect(80, 80, 1820, 1240);
  g.textAlign = "center";
  type(g, 500, 44, f.sans, INK_2);
  g.fillText(university, 990, 260);
  g.fillText(institute, 990, 320);
  type(g, 700, 160, f.display);
  g.fillText(education.degree.split(", ")[0], 990, 590);
  type(g, 500, 64, f.sans);
  g.fillText(education.degree.split(", ")[1], 990, 710);
  type(g, 600, 60, f.sans);
  g.fillText("Romaric Soh", 990, 880);
  type(g, 500, 44, f.sans, INK_2);
  g.fillText(education.years.replace("–", " – "), 990, 950);
  // The one colour on the papers: a plain stamp with the year
  g.fillStyle = LATERITE;
  g.beginPath();
  g.arc(1640, 1110, 120, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = PAPER;
  g.lineWidth = 3;
  g.beginPath();
  g.arc(1640, 1110, 100, 0, Math.PI * 2);
  g.stroke();
  type(g, 700, 72, f.display, PAPER);
  g.fillText(education.years.slice(-4), 1640, 1136);
  g.textAlign = "start";
  g.strokeStyle = INK;
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(260, 1160);
  g.lineTo(700, 1160);
  g.stroke();
};

export function DiplomaBody() {
  const geometry = useMemo(() => sheet(DIPLOMA.w, DIPLOMA.h, 0.016), []);
  const print = usePrint(DIPLOMA.w, DIPLOMA.h, diploma);
  return <Sheet geometry={geometry} map={print} />;
}

/* ---------- The German certificate ---------- */

const CERTIFICATE = { w: 1.4, h: 1.98 };

const certificate: Draw = (g, f) => {
  type(g, 700, 130, f.display);
  g.fillText("Goethe-Zertifikat", 120, 330);
  type(g, 800, 560, f.display);
  g.fillText("B2", 100, 880);
  g.strokeStyle = "rgba(29, 26, 22, 0.4)";
  g.lineWidth = 2;
  for (const y of [980, 1820]) {
    g.beginPath();
    g.moveTo(120, y);
    g.lineTo(1280, y);
    g.stroke();
  }
  type(g, 600, 72, f.sans);
  g.fillText("Romaric Soh", 120, 1130);
  type(g, 500, 52, f.sans, INK_2);
  g.fillText("Deutsch", 120, 1214);
  g.fillText("2026", 120, 1290);
};

export function CertificateBody() {
  const geometry = useMemo(() => sheet(CERTIFICATE.w, CERTIFICATE.h, 0.014), []);
  const print = usePrint(CERTIFICATE.w, CERTIFICATE.h, certificate);
  return <Sheet geometry={geometry} map={print} />;
}
