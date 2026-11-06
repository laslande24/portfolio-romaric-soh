/*
  Gesture maths for the objects the hand turns on the tour. CSS transitions
  (hover, press, colour) use the single curve `ease-out` in globals.css.
*/

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
