"use client";

import { animate, motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Project, ProjectId } from "@/content/projects";
import { project as projectMomentum, rubberband, spring } from "@/lib/motion";
import { CropMarks } from "../CropMarks";
import { boundsFor, type Placement, type Size } from "./layouts";
import { ObjectFace } from "./ObjectFace";

type Sample = { x: number; y: number; t: number };

type Gesture = {
  pointerId: number;
  startPointer: { x: number; y: number };
  startObject: { x: number; y: number };
  moved: boolean;
  history: Sample[];
};

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

/** Past a boundary the object keeps following, with growing resistance. */
function soft(v: number, min: number, max: number, dimension: number) {
  if (v < min) return min - rubberband(min - v, dimension);
  if (v > max) return max + rubberband(v - max, dimension);
  return v;
}

/** px/s over the last ~100 ms of pointer samples, capped so a glitchy sample can't fling it away. */
const MAX_SPEED = 4000;
function velocity(history: Sample[]) {
  const first = history[0];
  const last = history[history.length - 1];
  const dt = (last.t - first.t) / 1000;
  if (dt < 0.012) return { x: 0, y: 0 };
  return {
    x: clamp((last.x - first.x) / dt, -MAX_SPEED, MAX_SPEED),
    y: clamp((last.y - first.y) / dt, -MAX_SPEED, MAX_SPEED),
  };
}

type Props = {
  project: Project;
  label: string;
  bench: Size;
  size: Size;
  placement: Placement;
  /** Changes whenever the bench re-arranges (view or bench size). */
  layoutKey: string;
  delay: number;
  z: number;
  reduce: boolean;
  hidden: boolean;
  preload: boolean;
  sizes: string;
  onLift: (id: ProjectId) => void;
  onOpen: (id: ProjectId) => void;
  /** Lets the bench find this object again (sheet origin, focus on close). */
  register: (el: HTMLButtonElement | null) => void;
};

export function BenchObject({
  project,
  label,
  bench,
  size,
  placement,
  layoutKey,
  delay,
  z,
  reduce,
  hidden,
  preload,
  sizes,
  onLift,
  onOpen,
  register,
}: Props) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(placement.scale);
  // Tilt is a target; the spring makes the object lean into the throw and settle back.
  const tilt = useMotionValue(placement.rotate);
  const rotate = useSpring(tilt, { stiffness: 247, damping: 25 }); // response 0.4 s, damping 0.8

  const gesture = useRef<Gesture | null>(null);
  const dragged = useRef(false);
  const placed = useRef(false);
  const [lifted, setLifted] = useState(false);

  // Rest position for the current view. First placement jumps; later ones glide.
  useEffect(() => {
    if (!bench.w) return;
    const tx = placement.fx * bench.w - size.w / 2;
    const ty = placement.fy * bench.h - size.h / 2;
    tilt.set(placement.rotate);

    if (!placed.current || reduce) {
      placed.current = true;
      x.jump(tx);
      y.jump(ty);
      scale.jump(placement.scale);
      rotate.jump(placement.rotate);
      return;
    }
    const t = { ...spring.settle, delay };
    const running = [animate(x, tx, t), animate(y, ty, t), animate(scale, placement.scale, t)];
    // Interrupting (a new view, a grab) stops these; the next animation starts from the live value.
    return () => running.forEach((a) => a.stop());
    // Only a new arrangement (view or bench size) moves objects; a drop keeps its place.
  }, [layoutKey, reduce]); // eslint-disable-line react-hooks/exhaustive-deps

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (reduce || e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    // Grab mid-flight: stop where it is on screen, no jump.
    x.stop();
    y.stop();
    scale.stop();
    gesture.current = {
      pointerId: e.pointerId,
      startPointer: { x: e.clientX, y: e.clientY },
      startObject: { x: x.get(), y: y.get() },
      moved: false,
      history: [{ x: e.clientX, y: e.clientY, t: e.timeStamp }],
    };
    dragged.current = false;
    onLift(project.id);
    setLifted(true);
    // Feedback on press, not on release.
    animate(scale, placement.scale * 1.03, { type: "spring", bounce: 0, duration: 0.2 });
  };

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const g = gesture.current;
    if (!g || g.pointerId !== e.pointerId) return;
    const dx = e.clientX - g.startPointer.x;
    const dy = e.clientY - g.startPointer.y;
    if (!g.moved && Math.hypot(dx, dy) < 6) return; // small threshold before it counts as a drag
    g.moved = true;
    dragged.current = true;

    // 1:1 with the pointer, offset from where it was grabbed.
    const b = boundsFor(size, bench);
    x.set(soft(g.startObject.x + dx, b.minX, b.maxX, bench.w));
    y.set(soft(g.startObject.y + dy, b.minY, b.maxY, bench.h));

    g.history.push({ x: e.clientX, y: e.clientY, t: e.timeStamp });
    while (g.history.length > 2 && e.timeStamp - g.history[0].t > 100) g.history.shift();
    tilt.set(placement.rotate + clamp(velocity(g.history).x / 140, -9, 9));
  };

  const release = (e: React.PointerEvent<HTMLButtonElement>) => {
    const g = gesture.current;
    if (!g || g.pointerId !== e.pointerId) return;
    gesture.current = null;
    setLifted(false);
    tilt.set(placement.rotate);
    animate(scale, placement.scale, spring.settle);
    if (!g.moved) return; // a tap: the click handler opens it

    g.history.push({ x: e.clientX, y: e.clientY, t: e.timeStamp });
    while (g.history.length > 2 && e.timeStamp - g.history[0].t > 100) g.history.shift();
    const v = velocity(g.history);

    // Land where the throw was heading, then keep the release velocity.
    const b = boundsFor(size, bench);
    const tx = clamp(x.get() + projectMomentum(v.x, 0.995), b.minX, b.maxX);
    const ty = clamp(y.get() + projectMomentum(v.y, 0.995), b.minY, b.maxY);
    animate(x, tx, { ...spring.throw, velocity: v.x });
    animate(y, ty, { ...spring.throw, velocity: v.y });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const step = e.shiftKey ? 96 : 24;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const move = moves[e.key];
    if (!move) return;
    e.preventDefault();
    onLift(project.id);
    const b = boundsFor(size, bench);
    const tx = clamp(x.get() + move[0], b.minX, b.maxX);
    const ty = clamp(y.get() + move[1], b.minY, b.maxY);
    if (reduce) {
      x.jump(tx);
      y.jump(ty);
    } else {
      animate(x, tx, spring.settle);
      animate(y, ty, spring.settle);
    }
  };

  return (
    <motion.button
      ref={(el) => {
        ref.current = el;
        register(el);
      }}
      type="button"
      aria-label={label}
      data-project={project.id}
      className={[
        "group absolute top-0 left-0 touch-none select-none",
        reduce ? "cursor-pointer" : "cursor-grab active:cursor-grabbing",
      ].join(" ")}
      style={{
        x,
        y,
        rotate,
        scale,
        width: size.w,
        height: size.h,
        zIndex: z,
        opacity: hidden ? 0 : 1,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
      onKeyDown={onKeyDown}
      onClick={() => {
        if (dragged.current) {
          dragged.current = false;
          return;
        }
        onOpen(project.id);
      }}
    >
      {/* Resting and lifted shadows cross-fade: only opacity animates. */}
      <span
        aria-hidden
        className="absolute inset-0 shadow-object"
        style={{ borderRadius: project.object === "phone" ? size.w * 0.17 : 18 }}
      />
      <span
        aria-hidden
        className={`absolute inset-0 shadow-lifted transition-opacity duration-200 ease-out ${lifted ? "opacity-100" : "opacity-0"}`}
        style={{ borderRadius: project.object === "phone" ? size.w * 0.17 : 18 }}
      />
      <span className="relative block h-full w-full">
        <ObjectFace project={project} size={size} sizes={sizes} preload={preload} />
      </span>
      {/* Signature: crop marks on whatever can be picked up, shown on hover, focus and grab */}
      <span
        aria-hidden
        className={`transition-opacity duration-150 ease-out ${lifted ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"}`}
      >
        <CropMarks />
      </span>
    </motion.button>
  );
}
