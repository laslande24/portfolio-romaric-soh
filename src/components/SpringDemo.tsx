"use client";

import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { spring } from "@/lib/motion";
import { CropMarks } from "./CropMarks";

/**
 * Feel test for phase 2: grab the card, throw it, it springs home carrying
 * the release velocity. Tilt follows horizontal speed. Grab it again
 * mid-flight and it stays under the pointer (springs start from the live value).
 */
export function SpringDemo({ label }: { label: string }) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-240, 0, 240], [-6, 0, 6]);

  return (
    <div className="relative grid h-72 place-items-center rounded-card border border-line bg-paper">
      <motion.div
        drag
        dragMomentum={false}
        style={{ x, y, rotate: reduce ? 0 : rotate }}
        whileDrag={{ scale: reduce ? 1 : 1.03, cursor: "grabbing" }}
        onDragEnd={(_, info) => {
          const base = reduce ? { duration: 0 } : spring.throw;
          animate(x, 0, { ...base, velocity: info.velocity.x });
          animate(y, 0, { ...base, velocity: info.velocity.y });
        }}
        className="relative h-28 w-44 cursor-grab touch-none rounded-card bg-card p-4 shadow-object select-none"
      >
        <span className="text-meta text-ink-3">{label}</span>
        <CropMarks />
      </motion.div>
    </div>
  );
}
