/**
 * Scroll → scene bridge. ScrollTrigger writes, the 3D scene reads in its frame
 * loop. A plain mutable object on purpose: React state would re-render on every
 * scroll tick.
 */
export const STOPS = 4;

export const tour = {
  /**
   * travel[k], 0 → 1: the camera walks to stop k (k = 0 is the dive from the
   * opening). travel[STOPS] is the walk back to the whole bench at the end.
   */
  travel: new Array<number>(STOPS + 1).fill(0),
  /** screen[k], 0 → n - 1 across stop k's steps: which screen its device shows. */
  screen: new Array<number>(STOPS).fill(0),
  /** Set by the scene: asks for a frame (the canvas renders on demand). */
  invalidate: () => {},
};

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** How far stop k's device has come out to meet the camera, 0 → 1 → 0. */
export const presence = (k: number, a = 0.2, b = 0.9, c = 0.05, d = 0.6) =>
  smoothstep(a, b, tour.travel[k]) * (1 - smoothstep(c, d, tour.travel[k + 1]));

/** A device can be grabbed only while the camera rests on it. */
export const atStop = (k: number) => tour.travel[k] > 0.97 && tour.travel[k + 1] < 0.03;
