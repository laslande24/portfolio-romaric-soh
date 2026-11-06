/**
 * Scroll → scene bridge. ScrollTrigger writes, the 3D scene reads in its frame
 * loop. A plain mutable object on purpose: React state would re-render on every
 * scroll tick.
 */
export const tour = {
  /** 0 → 1 while the opening scrolls away: the camera dives to the phone. */
  dive: 0,
  /** 0 → 3 across the Laufwort steps: which screen the phone shows. */
  screen: 0,
  /** 0 → 1 as the closing section arrives: the camera pulls back to the bench. */
  outro: 0,
  /** Set by the scene: asks for a frame (the canvas renders on demand). */
  invalidate: () => {},
};

/** The phone can be grabbed only while the camera rests on it. */
export const atStop = () => tour.dive > 0.97 && tour.outro < 0.03;

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
