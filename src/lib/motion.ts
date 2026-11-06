import type { Transition } from "motion/react";

/**
 * Motion vocabulary for the whole site.
 *
 * CSS transitions (hover, press, colour) use the single curve `ease-out`
 * defined in globals.css. Anything a finger or a pointer can move uses a
 * spring, so it can be grabbed mid-flight and keeps the gesture's velocity.
 */

export const ease = [0.22, 1, 0.36, 1] as const;

export const spring = {
  /** Default: critically damped, no overshoot. Repositioning, layout changes. */
  settle: { type: "spring", bounce: 0, duration: 0.4 },
  /** Only after a gesture that carried momentum (a throw, a flick). */
  throw: { type: "spring", bounce: 0.2, duration: 0.4 },
  /** Rotation of a picked-up object. */
  rotate: { type: "spring", bounce: 0.2, duration: 0.4 },
  /** Sheets and panels that open from their trigger. */
  sheet: { type: "spring", bounce: 0.2, duration: 0.3 },
} satisfies Record<string, Transition>;

/**
 * Where a flick is heading. Apple's projection from "Designing Fluid
 * Interfaces": exponential decay, not v²/2a.
 * @param velocity px/s at release
 * @param deceleration 0.998 normal, 0.99 snappier
 */
export function project(velocity: number, deceleration = 0.998): number {
  return ((velocity / 1000) * deceleration) / (1 - deceleration);
}

/** Progressive resistance past a boundary instead of a hard stop. */
export function rubberband(overshoot: number, dimension: number, constant = 0.55): number {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}
