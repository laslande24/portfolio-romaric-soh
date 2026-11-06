"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useLoader, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { project, rubberband } from "@/lib/motion";
import { atStop, smoothstep, tour } from "./state";

// Real proportions: the captures are 780 × 1782, the body adds a thin bezel.
export const PHONE = { w: 0.76, h: 1.66, depth: 0.06, radius: 0.11 };
const SCREEN = { w: 0.7, h: 1.6, radius: 0.09 };

/** Rounded slab with softened edges, centred on its own origin. */
function useBodyGeometry() {
  return useMemo(() => {
    const { w, h, radius: r, depth } = PHONE;
    const bevel = 0.014;
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
}

/*
  The screen: one quad, one shader.
  - Rounded corners and the camera island are signed distances, no extra mesh.
  - Moving to the next screen is a push, like the app's own navigation:
    the new screen slides in from the right, the old one drifts left and dims.
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
  varying vec2 vUv;

  float roundedBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  void main() {
    vec2 p = (vUv - 0.5) * size;
    float edge = roundedBox(p, size * 0.5, radius);
    float aa = fwidth(edge);
    float alpha = 1.0 - smoothstep(-aa, aa, edge);
    if (alpha <= 0.0) discard;

    vec3 colour;
    if (vUv.x > 1.0 - push) {
      colour = texture2D(tB, vec2(vUv.x - (1.0 - push), vUv.y)).rgb;
    } else {
      colour = texture2D(tA, vec2(vUv.x + push * 0.3, vUv.y)).rgb * (1.0 - 0.25 * push);
    }

    // Camera island, drawn over whatever screen is showing
    vec2 islandP = p - vec2(0.0, size.y * 0.5 - 0.042);
    float island = roundedBox(islandP, vec2(0.07, 0.019), 0.019);
    colour = mix(vec3(0.0), colour, smoothstep(-aa, aa, island));

    vec3 glass = vec3(0.012, 0.012, 0.011);
    gl_FragColor = vec4(mix(glass, colour, power), alpha);
    #include <colorspace_fragment>
  }
`;

type Props = { screens: string[]; restPosition: [number, number, number] };

const PITCH_LIMIT = 0.35;

/** Rest on the mat, screen up → standing in front of the camera. */
const RAISED = new THREE.Vector3(0, 1.05, 0.15);

export function Phone({ screens, restPosition }: Props) {
  const root = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const body = useBodyGeometry();
  const textures = useLoader(THREE.TextureLoader, screens);
  const gl = useThree((s) => s.gl);

  // Send every screen to the GPU now, not on the frame it first appears,
  // which would stall the scroll right as the screen slides in
  useEffect(() => {
    for (const t of textures) {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
      t.needsUpdate = true;
      gl.initTexture(t);
    }
  }, [textures, gl]);

  const material = useMemo(
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
          size: { value: new THREE.Vector2(SCREEN.w, SCREEN.h) },
          radius: { value: SCREEN.radius },
        },
      }),
    [],
  );

  const rest = useMemo(() => new THREE.Vector3(...restPosition), [restPosition]);
  const raised = useMemo(() => rest.clone().add(RAISED), [rest]);

  /*
    Turning the phone in the hand (Apple, "Designing Fluid Interfaces"):
    1:1 while held, then the release velocity is projected forward and the phone
    settles on the nearest whole turn, so a flick spins it and a nudge comes back.
    Spring: damping 0.8, response 0.4, the values Apple ships for rotation.
  */
  const turn = useRef({
    held: false,
    yaw: 0,
    pitch: 0,
    vYaw: 0,
    vPitch: 0,
    targetYaw: 0,
    history: [] as { t: number; yaw: number; pitch: number }[],
  });

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (!atStop()) return;
    e.stopPropagation();
    const s = turn.current;
    const x0 = e.nativeEvent.clientX;
    const y0 = e.nativeEvent.clientY;
    const yaw0 = s.yaw; // start from what is on screen, even mid-spin
    const pitch0 = s.pitch;
    const touch = e.nativeEvent.pointerType === "touch";
    s.held = true;
    s.vYaw = s.vPitch = 0;
    s.history = [{ t: performance.now(), yaw: yaw0, pitch: pitch0 }];
    document.documentElement.style.cursor = "grabbing";

    const move = (ev: PointerEvent) => {
      // 320 px of drag is half a turn
      s.yaw = yaw0 + ((ev.clientX - x0) / 320) * Math.PI;
      // Touch keeps vertical moves for scrolling; a mouse can tip the phone too,
      // 1:1 up to 20°, then with growing resistance
      const raw = pitch0 + ((ev.clientY - y0) / 640) * Math.PI;
      const over = Math.abs(raw) - PITCH_LIMIT;
      s.pitch = touch ? 0 : over > 0 ? Math.sign(raw) * (PITCH_LIMIT + rubberband(over, 1)) : raw;
      s.history.push({ t: performance.now(), yaw: s.yaw, pitch: s.pitch });
      if (s.history.length > 6) s.history.shift();
      tour.invalidate();
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      document.documentElement.style.cursor = "";
      s.held = false;
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

  useFrame((_, delta) => {
    const g = root.current;
    const sp = spin.current;
    if (!g || !sp) return;

    // Rise with the dive, lie back down as the camera pulls away
    const up = smoothstep(0.2, 0.9, tour.dive) * (1 - smoothstep(0.1, 0.8, tour.outro));
    g.position.lerpVectors(rest, raised, up);
    g.rotation.set(-Math.PI / 2 * (1 - up), -0.32 * up, 0);

    // Screens: hold each one while its text is read, push to the next in between
    const i = Math.min(Math.floor(tour.screen), textures.length - 1);
    const u = material.uniforms;
    u.tA.value = textures[i];
    u.tB.value = textures[Math.min(i + 1, textures.length - 1)];
    u.push.value = smoothstep(0.35, 0.65, tour.screen - i);
    u.power.value = smoothstep(0.55, 1, tour.dive) * (1 - smoothstep(0.3, 0.9, tour.outro));

    // Rotation spring, integrated in small steps so it stays stable at 30 fps
    const s = turn.current;
    let moving = s.held;
    if (!s.held) {
      const k = (2 * Math.PI / 0.4) ** 2;
      const c = (4 * Math.PI * 0.8) / 0.4;
      const steps = Math.ceil(Math.min(delta, 1 / 20) / (1 / 240));
      const dt = Math.min(delta, 1 / 20) / steps;
      for (let n = 0; n < steps; n++) {
        s.vYaw += (-k * (s.yaw - s.targetYaw) - c * s.vYaw) * dt;
        s.yaw += s.vYaw * dt;
        s.vPitch += (-k * s.pitch - c * s.vPitch) * dt;
        s.pitch += s.vPitch * dt;
      }
      const resting =
        Math.abs(s.yaw - s.targetYaw) < 1e-4 && Math.abs(s.vYaw) < 1e-3 &&
        Math.abs(s.pitch) < 1e-4 && Math.abs(s.vPitch) < 1e-3;
      if (resting) {
        s.yaw = s.targetYaw = 0; // whole turns are invisible, drop them
        s.pitch = s.vYaw = s.vPitch = 0;
      } else moving = true;
    }
    sp.rotation.set(s.pitch, s.yaw, 0);
    if (moving) tour.invalidate();
  });

  return (
    <group ref={root}>
      <group ref={spin}>
        <mesh
          geometry={body}
          castShadow
          onPointerDown={onPointerDown}
          onPointerOver={() => atStop() && (document.documentElement.style.cursor ||= "grab")}
          onPointerOut={() => !turn.current.held && (document.documentElement.style.cursor = "")}
        >
          <meshStandardMaterial color="#1b1a18" metalness={0.65} roughness={0.32} />
        </mesh>
        <mesh position={[0, 0, PHONE.depth / 2 + 0.0015]} material={material}>
          <planeGeometry args={[SCREEN.w, SCREEN.h]} />
        </mesh>
      </group>
    </group>
  );
}
