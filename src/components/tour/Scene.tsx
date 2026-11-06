"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { DeviceKind } from "@/content/tour";
import { Bench, type Palette } from "./Bench";
import { Device, SPECS, focusOf } from "./Device";
import { smoothstep, tour } from "./state";

/** Read the theme's paper and ink from the CSS tokens, follow light/dark. */
function usePalette(): Palette {
  const read = (): Palette => {
    const css = getComputedStyle(document.documentElement);
    const v = (name: string) => css.getPropertyValue(name).trim();
    return { paper: v("--paper"), card: v("--card"), ink: v("--ink"), ink3: v("--ink-3") };
  };
  const [palette, setPalette] = useState(read);
  useEffect(() => {
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const update = () => setPalette(read());
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return palette;
}

/* ---------- Camera: poses blended by scroll, then followed with damping ---------- */

type Pose = {
  target: THREE.Vector3;
  /** From the target towards the camera. */
  dir: THREE.Vector3;
  /** Area that must stay in frame at the target, in scene units. */
  fit: [number, number];
  /** Lens shift, as a fraction of the viewport: positive moves the picture right / down. */
  shift: THREE.Vector2;
};

/** The whole bench, then each stop in walking order, then the whole bench again. */
function poses(portrait: boolean, kinds: DeviceKind[]): Pose[] {
  const pick = (f: { portrait: [number, number]; wide: [number, number] }) => (portrait ? f.portrait : f.wide);
  return [
    // From above, pushed right (desktop) or down (phone) to leave calm paper for the title
    {
      // (lower on a phone, so the column is shorter than the space under the name)
      target: new THREE.Vector3(0.3, 0, -0.55),
      dir: new THREE.Vector3(...(portrait ? [-0.1, 0.55, 0.83] : [0.3, 0.8, 0.52])).normalize(),
      fit: portrait ? [4.4, 6.8] : [13, 8.2],
      shift: new THREE.Vector2(...(portrait ? [0, 0.24] : [0.22, 0])),
    },
    // Face to face with each device, pushed right (desktop) or up (phone) beside its text
    ...kinds.map((k) => {
      const { view } = SPECS[k];
      return {
        target: focusOf(k),
        dir: new THREE.Vector3(...view.dir).normalize(),
        fit: pick(view.fit),
        shift: new THREE.Vector2(...pick(view.shift)),
      };
    }),
    // Pull back and look down the whole bench
    {
      target: new THREE.Vector3(0.3, 0, -0.6),
      dir: new THREE.Vector3(0.4, 0.66, 0.62).normalize(),
      fit: portrait ? [4.4, 7.4] : [11, 6.8],
      shift: new THREE.Vector2(...(portrait ? [0, 0.26] : [0.24, 0.04])),
    },
  ];
}

function CameraRig({ kinds }: { kinds: DeviceKind[] }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const scene = useThree((s) => s.scene);
  const size = useThree((s) => s.size);
  // Same test as the `wide` CSS variant, so text and framing always agree
  const portrait = !(size.width >= 768 && size.width / size.height >= 0.9);
  const p = useMemo(() => poses(portrait, kinds), [portrait, kinds]);

  // A narrow screen needs a wider lens, or the camera backs off too far
  useEffect(() => {
    camera.fov = portrait ? 44 : 32;
    camera.updateProjectionMatrix();
  }, [camera, portrait]);

  // What the camera shows now, followed towards the scroll's pose each frame
  const now = useMemo(
    () => ({ target: new THREE.Vector3(), dir: new THREE.Vector3(), dist: 0, shift: new THREE.Vector2(), ready: false }),
    [],
  );
  const scratch = useMemo(() => ({ target: new THREE.Vector3(), dir: new THREE.Vector3(), shift: new THREE.Vector2() }), []);

  useFrame((_, delta) => {
    const vfov = THREE.MathUtils.degToRad(camera.fov);
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect);
    const distFor = (fit: [number, number]) =>
      Math.max(fit[1] / 2 / Math.tan(vfov / 2), fit[0] / 2 / Math.tan(hfov / 2));

    // Walk from pose to pose: each leg only moves once the previous one is done
    const { target, dir, shift } = scratch;
    target.copy(p[0].target);
    dir.copy(p[0].dir);
    shift.copy(p[0].shift);
    let dist = distFor(p[0].fit);
    for (let k = 1; k < p.length; k++) {
      const t = smoothstep(0, 1, tour.travel[k - 1]);
      target.lerp(p[k].target, t);
      dir.lerp(p[k].dir, t);
      shift.lerp(p[k].shift, t);
      dist += (distFor(p[k].fit) - dist) * t;
    }
    dir.normalize();

    // Critically damped follow: scroll already eases, this only removes steps
    const k = now.ready ? 1 - Math.exp(-10 * Math.min(delta, 0.1)) : 1;
    now.ready = true;
    now.target.lerp(target, k);
    now.dir.lerp(dir, k).normalize();
    now.dist += (dist - now.dist) * k;
    now.shift.lerp(shift, k);

    camera.position.copy(now.target).addScaledVector(now.dir, now.dist);
    // The mat's far edge melts into the paper, whatever the distance
    if (scene.fog instanceof THREE.Fog) {
      scene.fog.near = now.dist * 1.4;
      scene.fog.far = now.dist * 3.2;
    }
    camera.lookAt(now.target);
    const { width: w, height: h } = size;
    camera.setViewOffset(w, h, -now.shift.x * w, -now.shift.y * h, w, h);

    const settled =
      now.target.distanceToSquared(target) < 1e-8 && Math.abs(now.dist - dist) < 1e-4 && now.shift.distanceToSquared(shift) < 1e-8;
    if (!settled) tour.invalidate();
  });
  return null;
}

/* ---------- Light: soft daylight from the upper left, a warm room for reflections ---------- */

function Daylight({ palette, shadowMap }: { palette: Palette; shadowMap: number }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const dark = useMemo(() => new THREE.Color(palette.paper).getHSL({ h: 0, s: 0, l: 0 }).l < 0.3, [palette.paper]);

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = dark ? 0.18 : 0.4;
    return () => {
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene, dark]);

  useEffect(() => {
    const c = new THREE.Color(palette.paper);
    scene.background = c;
    scene.fog = new THREE.Fog(c, 12, 30); // near / far follow the camera (CameraRig)
  }, [scene, palette.paper]);

  return (
    <>
      <hemisphereLight args={[dark ? "#c8c0b4" : "#fffaf1", palette.paper, dark ? 0.45 : 1.35]} />
      <directionalLight
        position={[-3.5, 7, 4]}
        intensity={dark ? 1.1 : 2.1}
        color={dark ? "#ffd9b8" : "#fff3e2"}
        castShadow
        shadow-mapSize={[shadowMap, shadowMap]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-radius={6}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-camera-near={1}
        shadow-camera-far={20}
      />
    </>
  );
}

function Bridge() {
  const invalidate = useThree((s) => s.invalidate);
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    // Compile every shader up front so the first scroll does not hitch
    gl.compile(scene, camera);
    tour.invalidate = invalidate;
    return () => {
      tour.invalidate = () => {};
    };
  }, [invalidate, gl, scene, camera]);
  return null;
}

export default function Scene({
  stops,
  onReady,
}: {
  stops: { device: DeviceKind; screens: string[] }[];
  onReady: () => void;
}) {
  const palette = usePalette();
  const kinds = useMemo(() => stops.map((s) => s.device), [stops]);
  // A phone's GPU gets fewer pixels and a smaller shadow map
  const coarse = useMemo(() => matchMedia("(pointer: coarse)").matches, []);
  // Screens arrive device by device, in walking order
  const [loaded, setLoaded] = useState(0);
  const next = useCallback(() => setLoaded((n) => n + 1), []);
  return (
    <Canvas
      frameloop="demand"
      shadows="percentage"
      dpr={[1, coarse ? 1.5 : 1.75]}
      camera={{ fov: 32, near: 0.1, far: 120, position: [0, 6, 6] }}
      gl={{ antialias: true, toneMapping: THREE.NeutralToneMapping, powerPreference: "high-performance" }}
      // Vertical swipes scroll the page; horizontal ones can turn a device
      style={{ touchAction: "pan-y" }}
      onCreated={() => requestAnimationFrame(onReady)}
    >
      <Bridge />
      <Daylight palette={palette} shadowMap={coarse ? 1024 : 2048} />
      <CameraRig kinds={kinds} />
      <Bench palette={palette} />
      {stops.map((s, i) => (
        <Device key={s.device} kind={s.device} index={i} screens={s.screens} load={i <= loaded} onLoaded={next} />
      ))}
    </Canvas>
  );
}
