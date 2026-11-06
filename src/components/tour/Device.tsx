"use client";

import { Suspense, useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame, useLoader, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { project, rubberband } from "@/lib/motion";
import type { DeviceKind } from "@/content/tour";
import { atStop, presence, smoothstep, tour } from "./state";

/* ---------- Where each device lies, and how it comes out to meet the camera ---------- */

type Place = { at: [number, number, number]; x: number; y: number };
type Framing = { portrait: [number, number]; wide: [number, number] };
type Spec = {
  screen: { w: number; h: number; radius: number; island?: boolean };
  /** Waiting on the mat. */
  rest: Place;
  /** At its stop, facing the camera. Rotations are applied yaw first (Euler YXZ). */
  shown: Place;
  /** Screen centre in the device's own frame, once shown. */
  focus: [number, number, number];
  /** How far a mouse can tip it, in radians; 0 turns it about its upright axis only. */
  tip: number;
  /** Footprint on the mat for the crop marks: size, and offset from `rest.at`. */
  footprint: { size: [number, number]; offset?: number };
  /** The camera at this stop: from the screen towards the lens, area kept in frame, lens shift. */
  view: { dir: [number, number, number]; fit: Framing; shift: Framing };
};

// The laptop lid: nearly shut while it waits, opened to 107° at its stop
const LID = { rest: 1.2, open: -0.3, hinge: [0, 0.07, -0.66] as const, half: 0.66 };
const lidFocus: [number, number, number] = [
  0,
  LID.hinge[1] + LID.half * Math.cos(LID.open) - 0.021 * Math.sin(LID.open),
  LID.hinge[2] + LID.half * Math.sin(LID.open) + 0.021 * Math.cos(LID.open),
];

/*
  The devices stand in a loose column, front to back in walking order. Facing
  one, the camera has the previous ones under its lens and the next ones behind
  the device, so the paper on the left stays free for the text.
  Small devices rise into the hand, desk devices wake up where they are.
*/
export const SPECS: Record<DeviceKind, Spec> = {
  phone: {
    screen: { w: 0.7, h: 1.6, radius: 0.09, island: true },
    rest: { at: [0.1, 0.03, 2.45], x: -Math.PI / 2, y: 0.12 },
    shown: { at: [0.1, 1.08, 2.6], x: 0, y: -0.32 },
    focus: [0, 0, 0],
    tip: 0.35,
    footprint: { size: [0.76, 1.66] },
    view: {
      dir: [0.05, 0.16, 1],
      fit: { portrait: [1.5, 1.66 * 2.5], wide: [1.4, 1.66 * 1.4] },
      shift: { portrait: [0, -0.17], wide: [0.2, 0] },
    },
  },
  laptop: {
    screen: { w: 1.86, h: 1.18, radius: 0.03 },
    rest: { at: [0.45, 0, 0.3], x: 0, y: -0.12 },
    shown: { at: [0.45, 0, 0.3], x: 0, y: 0 },
    focus: lidFocus,
    tip: 0,
    footprint: { size: [2, 1.36] },
    view: {
      dir: [0.04, 0.42, 1],
      fit: { portrait: [2.7, 5.4], wide: [5.4, 3.3] },
      shift: { portrait: [0, -0.22], wide: [0.2, -0.04] },
    },
  },
  tablet: {
    screen: { w: 1.76, h: 1.18, radius: 0.05 },
    rest: { at: [0, 0.025, -1.75], x: -Math.PI / 2, y: 0.2 },
    // Held up and tipped back, as you would read it
    shown: { at: [0, 0.97, -1.55], x: -0.5, y: 0 },
    focus: [0, 0, 0],
    tip: 0.35,
    footprint: { size: [1.9, 1.32] },
    view: {
      dir: [0.04, 0.5, 0.87],
      fit: { portrait: [2.2, 4.4], wide: [3.9, 2.4] },
      shift: { portrait: [0, -0.19], wide: [0.2, 0.02] },
    },
  },
  display: {
    screen: { w: 1.9, h: 1.15, radius: 0.02 },
    rest: { at: [0.5, 0, -3.7], x: 0, y: -0.25 },
    shown: { at: [0.5, 0, -3.7], x: 0, y: -0.04 },
    focus: [0, 0.9 + 0.031 * Math.sin(0.08), 0.05 + 0.031 * Math.cos(0.08)],
    tip: 0,
    footprint: { size: [0.7, 0.5], offset: 0.05 },
    view: {
      dir: [0.03, 0.12, 1],
      fit: { portrait: [2.3, 4.6], wide: [4.1, 2.5] },
      shift: { portrait: [0, -0.19], wide: [0.2, 0.02] },
    },
  },
};

/** World point the camera looks at when this device is shown. */
export function focusOf(kind: DeviceKind) {
  const { shown, focus } = SPECS[kind];
  return new THREE.Vector3(...focus)
    .applyEuler(new THREE.Euler(shown.x, shown.y, 0, "YXZ"))
    .add(new THREE.Vector3(...shown.at));
}

/* ---------- The screen: one quad, one shader ---------- */

/*
  - Rounded corners and the phone's camera island are signed distances, no extra mesh.
  - Moving to the next screen is a push, like an app's own navigation:
    the new screen slides in from the right, the old one drifts left and dims.
  - Captures are cropped to the panel like `object-fit: cover`, kept from the top.
  - `power` lights the panel up from black glass.
  Colours stay exact: no tone mapping in this shader.
*/
const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const fragment = /* glsl */ `
  uniform sampler2D tA;
  uniform sampler2D tB;
  uniform float push;
  uniform float power;
  uniform vec2 size;
  uniform float radius;
  uniform float island;
  uniform vec2 crop;
  varying vec2 vUv;

  float roundedBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }
  vec2 cover(vec2 uv) {
    return vec2(0.5 + (uv.x - 0.5) * crop.x, 1.0 - (1.0 - uv.y) * crop.y);
  }

  void main() {
    vec2 p = (vUv - 0.5) * size;
    float edge = roundedBox(p, size * 0.5, radius);
    float aa = fwidth(edge);
    float alpha = 1.0 - smoothstep(-aa, aa, edge);
    if (alpha <= 0.0) discard;

    vec3 colour;
    if (vUv.x > 1.0 - push) {
      colour = texture2D(tB, cover(vec2(vUv.x - (1.0 - push), vUv.y))).rgb;
    } else {
      colour = texture2D(tA, cover(vec2(vUv.x + push * 0.3, vUv.y))).rgb * (1.0 - 0.25 * push);
    }

    if (island > 0.5) {
      vec2 islandP = p - vec2(0.0, size.y * 0.5 - 0.042);
      float d = roundedBox(islandP, vec2(0.07, 0.019), 0.019);
      colour = mix(vec3(0.0), colour, smoothstep(-aa, aa, d));
    }

    // Switched-off glass, with the faint sheen of the room on it
    vec3 glass = vec3(0.012) + 0.022 * smoothstep(0.3, 1.0, 0.35 * vUv.x + 0.65 * vUv.y);
    gl_FragColor = vec4(mix(glass, colour, power), alpha);
    #include <colorspace_fragment>
  }
`;

function useScreenMaterial(screen: Spec["screen"]) {
  return useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true,
        uniforms: {
          tA: { value: null },
          tB: { value: null },
          push: { value: 0 },
          power: { value: 0 },
          size: { value: new THREE.Vector2(screen.w, screen.h) },
          radius: { value: screen.radius },
          island: { value: screen.island ? 1 : 0 },
          crop: { value: new THREE.Vector2(1, 1) },
        },
      }),
    [screen],
  );
}

/**
 * Loads a device's screens; the device shows black glass until they arrive.
 * ImageBitmaps decode off the main thread, so arriving screens do not stall the
 * scroll; devices load one after the other (`onLoaded`), the first stop first.
 */
function Feed({
  srcs,
  into,
  material,
  screen,
  onLoaded,
}: {
  srcs: string[];
  into: RefObject<THREE.Texture[]>;
  material: THREE.ShaderMaterial;
  screen: Spec["screen"];
  onLoaded: () => void;
}) {
  const bitmaps = useLoader(THREE.ImageBitmapLoader, srcs, (l) => l.setOptions({ imageOrientation: "flipY" }));
  const gl = useThree((s) => s.gl);

  useEffect(() => {
    const textures = bitmaps.map((b) => {
      const t = new THREE.Texture(b);
      t.flipY = false; // already flipped while decoding
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
      t.needsUpdate = true;
      // Upload now, not on the frame the screen first appears
      gl.initTexture(t);
      return t;
    });
    const tex = bitmaps[0].width / bitmaps[0].height;
    const panel = screen.w / screen.h;
    (material.uniforms.crop.value as THREE.Vector2).set(tex > panel ? panel / tex : 1, tex > panel ? 1 : tex / panel);
    into.current = textures;
    tour.invalidate();
    onLoaded();
    return () => textures.forEach((t) => t.dispose());
  }, [bitmaps, gl, into, material, screen, onLoaded]);
  return null;
}

/* ---------- Turning a device in the hand ---------- */

/*
  Apple, "Designing Fluid Interfaces": 1:1 while held, then the release velocity
  is projected forward and the device settles on the nearest whole turn, so a
  flick spins it and a nudge comes back. Spring: damping 0.8, response 0.4,
  the values Apple ships for rotation.
*/
const SPRING = { k: ((2 * Math.PI) / 0.4) ** 2, c: (4 * Math.PI * 0.8) / 0.4 };

/** One hand: while any device is held, no other one may reset the cursor. */
let holding = false;

function useTurn(index: number, tip: number) {
  const s = useRef({
    held: false,
    yaw: 0,
    pitch: 0,
    vYaw: 0,
    vPitch: 0,
    targetYaw: 0,
    history: [] as { t: number; yaw: number; pitch: number }[],
  }).current;

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (!atStop(index)) return;
    e.stopPropagation();
    const x0 = e.nativeEvent.clientX;
    const y0 = e.nativeEvent.clientY;
    const yaw0 = s.yaw; // start from what is on screen, even mid-spin
    const pitch0 = s.pitch;
    // Touch keeps vertical moves for scrolling
    const canTip = tip > 0 && e.nativeEvent.pointerType !== "touch";
    s.held = holding = true;
    s.vYaw = s.vPitch = 0;
    s.history = [{ t: performance.now(), yaw: yaw0, pitch: pitch0 }];
    document.documentElement.style.cursor = "grabbing";

    const move = (ev: PointerEvent) => {
      // 320 px of drag is half a turn
      s.yaw = yaw0 + ((ev.clientX - x0) / 320) * Math.PI;
      // A mouse can tip it too, 1:1 up to the limit, then with growing resistance
      const raw = pitch0 + ((ev.clientY - y0) / 640) * Math.PI;
      const over = Math.abs(raw) - tip;
      s.pitch = !canTip ? 0 : over > 0 ? Math.sign(raw) * (tip + rubberband(over, 1)) : raw;
      s.history.push({ t: performance.now(), yaw: s.yaw, pitch: s.pitch });
      if (s.history.length > 6) s.history.shift();
      tour.invalidate();
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      document.documentElement.style.cursor = "";
      s.held = holding = false;
      const h = s.history;
      const first = h[0];
      const last = h[h.length - 1];
      const dt = (last.t - first.t) / 1000;
      if (dt > 0 && performance.now() - last.t < 80) {
        s.vYaw = (last.yaw - first.yaw) / dt;
        s.vPitch = (last.pitch - first.pitch) / dt;
      }
      const full = Math.PI * 2;
      s.targetYaw = Math.round((s.yaw + project(s.vYaw)) / full) * full;
      tour.invalidate();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  /** Integrates the spring; true while anything still moves. */
  const step = (delta: number) => {
    if (s.held) return true;
    // Small steps keep the spring stable at 30 fps
    const span = Math.min(delta, 1 / 20);
    const steps = Math.ceil(span / (1 / 240));
    const dt = span / steps;
    for (let n = 0; n < steps; n++) {
      s.vYaw += (-SPRING.k * (s.yaw - s.targetYaw) - SPRING.c * s.vYaw) * dt;
      s.yaw += s.vYaw * dt;
      s.vPitch += (-SPRING.k * s.pitch - SPRING.c * s.vPitch) * dt;
      s.pitch += s.vPitch * dt;
    }
    const resting =
      Math.abs(s.yaw - s.targetYaw) < 1e-4 && Math.abs(s.vYaw) < 1e-3 && Math.abs(s.pitch) < 1e-4 && Math.abs(s.vPitch) < 1e-3;
    if (!resting) return true;
    s.yaw = s.targetYaw = 0; // whole turns are invisible, drop them
    s.pitch = s.vYaw = s.vPitch = 0;
    return false;
  };

  const onPointerOver = () => {
    if (atStop(index)) document.documentElement.style.cursor ||= "grab";
  };
  const onPointerOut = () => {
    if (!holding) document.documentElement.style.cursor = "";
  };

  return { s, step, handlers: { onPointerDown, onPointerOver, onPointerOut } };
}

/* ---------- Bodies, each built with its screen facing +z ---------- */

// Aluminium for the desk devices: light on paper, so the dark phone leads
const aluminium = { color: "#cfcbc4", metalness: 0.75, roughness: 0.38 } as const;

type BodyProps = { material: THREE.ShaderMaterial; index: number };

function PhoneBody({ material }: BodyProps) {
  const geometry = useMemo(() => {
    const w = 0.76, h = 1.66, r = 0.11, depth = 0.06, bevel = 0.014;
    const x = -w / 2 + bevel;
    const y = -h / 2 + bevel;
    const iw = w - bevel * 2;
    const ih = h - bevel * 2;
    const ir = r - bevel;
    const s = new THREE.Shape();
    s.moveTo(x + ir, y);
    s.lineTo(x + iw - ir, y);
    s.quadraticCurveTo(x + iw, y, x + iw, y + ir);
    s.lineTo(x + iw, y + ih - ir);
    s.quadraticCurveTo(x + iw, y + ih, x + iw - ir, y + ih);
    s.lineTo(x + ir, y + ih);
    s.quadraticCurveTo(x, y + ih, x, y + ih - ir);
    s.lineTo(x, y + ir);
    s.quadraticCurveTo(x, y, x + ir, y);
    const g = new THREE.ExtrudeGeometry(s, {
      depth: depth - bevel * 2,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 4,
      curveSegments: 12,
    });
    g.translate(0, 0, -(depth - bevel * 2) / 2);
    return g;
  }, []);
  return (
    <>
      <mesh geometry={geometry} castShadow>
        <meshStandardMaterial color="#1b1a18" metalness={0.65} roughness={0.32} />
      </mesh>
      <mesh position={[0, 0, 0.0315]} material={material}>
        <planeGeometry args={[0.7, 1.6]} />
      </mesh>
    </>
  );
}

function TabletBody({ material }: BodyProps) {
  const slab = useMemo(() => new RoundedBoxGeometry(1.9, 1.32, 0.05, 3, 0.022), []);
  return (
    <>
      <mesh geometry={slab} castShadow receiveShadow>
        <meshStandardMaterial {...aluminium} />
      </mesh>
      <mesh position={[0, 0, 0.026]} material={material}>
        <planeGeometry args={[1.76, 1.18]} />
      </mesh>
    </>
  );
}

/** Open laptop, base on the mat; the lid opens as the camera arrives. */
function LaptopBody({ material, index }: BodyProps) {
  const base = useMemo(() => new RoundedBoxGeometry(2, 0.07, 1.36, 3, 0.03), []);
  const lidGeometry = useMemo(() => new RoundedBoxGeometry(2, 1.32, 0.04, 3, 0.02), []);
  const lid = useRef<THREE.Group>(null);
  useFrame(() => {
    if (lid.current) lid.current.rotation.x = THREE.MathUtils.lerp(LID.rest, LID.open, presence(index));
  });
  return (
    <>
      <mesh geometry={base} position={[0, 0.035, 0]} castShadow receiveShadow>
        <meshStandardMaterial {...aluminium} />
      </mesh>
      {/* Keyboard deck and trackpad */}
      <mesh position={[0, 0.0705, -0.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.76, 0.6]} />
        <meshStandardMaterial color="#2b2926" metalness={0.2} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.0705, 0.34]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.66, 0.4]} />
        <meshStandardMaterial color="#c4c0b9" metalness={0.6} roughness={0.3} />
      </mesh>
      <group ref={lid} position={LID.hinge} rotation={[LID.rest, 0, 0]}>
        <mesh geometry={lidGeometry} position={[0, LID.half, 0]} castShadow>
          <meshStandardMaterial {...aluminium} />
        </mesh>
        <mesh position={[0, LID.half, 0.021]} material={material}>
          <planeGeometry args={[1.86, 1.18]} />
        </mesh>
      </group>
    </>
  );
}

/** A display on a foot, at the back of the bench. */
function DisplayBody({ material }: BodyProps) {
  const panel = useMemo(() => new RoundedBoxGeometry(2, 1.25, 0.05, 3, 0.022), []);
  return (
    <>
      <mesh position={[0, 0.015, 0.05]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.03, 0.5]} />
        <meshStandardMaterial {...aluminium} />
      </mesh>
      <mesh position={[0, 0.32, -0.02]} rotation={[-0.12, 0, 0]} castShadow>
        <boxGeometry args={[0.12, 0.64, 0.05]} />
        <meshStandardMaterial {...aluminium} />
      </mesh>
      <group position={[0, 0.9, 0.05]} rotation={[-0.08, 0, 0]}>
        <mesh geometry={panel} castShadow>
          <meshStandardMaterial {...aluminium} />
        </mesh>
        <mesh position={[0, 0, 0.031]} material={material}>
          <planeGeometry args={[1.9, 1.15]} />
        </mesh>
      </group>
    </>
  );
}

const BODIES: Record<DeviceKind, (p: BodyProps) => React.JSX.Element> = {
  phone: PhoneBody,
  laptop: LaptopBody,
  tablet: TabletBody,
  display: DisplayBody,
};

/* ---------- One stop's device ---------- */

export function Device({
  kind,
  index,
  screens,
  load,
  onLoaded,
}: {
  kind: DeviceKind;
  index: number;
  screens: string[];
  /** Start fetching this device's screens. */
  load: boolean;
  onLoaded: () => void;
}) {
  const spec = SPECS[kind];
  const root = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const feed = useRef<THREE.Texture[]>([]);
  const material = useScreenMaterial(spec.screen);
  const turn = useTurn(index, spec.tip);
  const rest = useMemo(() => new THREE.Vector3(...spec.rest.at), [spec]);
  const shown = useMemo(() => new THREE.Vector3(...spec.shown.at), [spec]);

  useFrame((_, delta) => {
    const g = root.current;
    const sp = spin.current;
    if (!g || !sp) return;

    // Come out with the camera's arrival, go back as it walks on
    const up = presence(index);
    g.position.lerpVectors(rest, shown, up);
    g.rotation.set(
      THREE.MathUtils.lerp(spec.rest.x, spec.shown.x, up),
      THREE.MathUtils.lerp(spec.rest.y, spec.shown.y, up),
      0,
    );

    // Screens: hold each one while its text is read, push to the next in between
    const u = material.uniforms;
    const tex = feed.current;
    if (tex.length) {
      const at = tour.screen[index];
      const i = Math.min(Math.floor(at), tex.length - 1);
      u.tA.value = tex[i];
      u.tB.value = tex[Math.min(i + 1, tex.length - 1)];
      u.push.value = smoothstep(0.35, 0.65, at - i);
    }
    u.power.value = presence(index, 0.55, 1, 0.05, 0.45);

    const moving = turn.step(delta);
    sp.rotation.set(turn.s.pitch, turn.s.yaw, 0);
    if (moving) tour.invalidate();
  });

  const Body = BODIES[kind];
  return (
    <group ref={root} rotation-order="YXZ">
      <group ref={spin} {...turn.handlers}>
        <Body material={material} index={index} />
      </group>
      {load && (
        <Suspense fallback={null}>
          <Feed srcs={screens} into={feed} material={material} screen={spec.screen} onLoaded={onLoaded} />
        </Suspense>
      )}
    </group>
  );
}
