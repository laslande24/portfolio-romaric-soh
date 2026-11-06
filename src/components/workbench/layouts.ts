import type { ProjectId, Role } from "@/content/projects";

export type View = "all" | Role;

/** Where an object rests: centre as a fraction of the bench, rotation, scale. */
export type Placement = { fx: number; fy: number; rotate: number; scale: number };

export type Size = { w: number; h: number };

/** Compact = narrow bench (phones, small tablets). */
export const isCompact = (bench: Size) => bench.w < 560;

/** Object width as a share of the bench width. Phones are tall, windows wide. */
const widthShare: Record<ProjectId, { wide: number; compact: number }> = {
  redekunst: { wide: 0.56, compact: 0.8 },
  sevensets: { wide: 0.5, compact: 0.74 },
  portfolioos: { wide: 0.4, compact: 0.62 },
  laufwort: { wide: 0.2, compact: 0.34 },
};

export function objectWidth(id: ProjectId, bench: Size) {
  const share = widthShare[id][isCompact(bench) ? "compact" : "wide"];
  // Never let an object outgrow the bench height on short, wide benches.
  return Math.min(bench.w * share, bench.h * (id === "laufwort" ? 0.42 : 1.1));
}

/** "All work": a working bench, things put down where they were last used. */
const scattered: Record<"wide" | "compact", Record<ProjectId, Placement>> = {
  wide: {
    redekunst: { fx: 0.4, fy: 0.32, rotate: -3, scale: 1 },
    sevensets: { fx: 0.6, fy: 0.68, rotate: 4, scale: 1 },
    portfolioos: { fx: 0.24, fy: 0.76, rotate: -6, scale: 1 },
    laufwort: { fx: 0.83, fy: 0.38, rotate: 7, scale: 1 },
  },
  compact: {
    redekunst: { fx: 0.46, fy: 0.2, rotate: -3, scale: 1 },
    sevensets: { fx: 0.52, fy: 0.5, rotate: 4, scale: 1 },
    portfolioos: { fx: 0.4, fy: 0.8, rotate: -5, scale: 1 },
    laufwort: { fx: 0.78, fy: 0.64, rotate: 8, scale: 1 },
  },
};

/** For a role, the bench tidies itself: what matters comes forward, the rest goes back. */
export const order: Record<Role, ProjectId[]> = {
  frontend: ["sevensets", "laufwort", "portfolioos", "redekunst"],
  fullstack: ["redekunst", "laufwort", "portfolioos", "sevensets"],
};

const ranked: Record<"wide" | "compact", Placement[]> = {
  wide: [
    { fx: 0.4, fy: 0.42, rotate: 0, scale: 1.08 },
    { fx: 0.84, fy: 0.46, rotate: 0, scale: 1.08 },
    { fx: 0.22, fy: 0.84, rotate: -2, scale: 0.7 },
    { fx: 0.58, fy: 0.87, rotate: 2, scale: 0.62 },
  ],
  compact: [
    { fx: 0.46, fy: 0.3, rotate: 0, scale: 1.04 },
    { fx: 0.8, fy: 0.62, rotate: 0, scale: 1.04 },
    { fx: 0.32, fy: 0.78, rotate: -2, scale: 0.72 },
    { fx: 0.4, fy: 0.95, rotate: 2, scale: 0.6 },
  ],
};

export function placementFor(view: View, id: ProjectId, bench: Size): Placement {
  const mode = isCompact(bench) ? "compact" : "wide";
  if (view === "all") return scattered[mode][id];
  return ranked[mode][order[view].indexOf(id)];
}

/** Stacking order for a view, bottom first. */
export function stackFor(view: View): ProjectId[] {
  if (view === "all") return ["portfolioos", "redekunst", "sevensets", "laufwort"];
  return [...order[view]].reverse();
}

/** Objects may hang over the edge of the bench, but never more than a quarter. */
export function boundsFor(size: Size, bench: Size) {
  return {
    minX: -size.w * 0.25,
    maxX: bench.w - size.w * 0.75,
    minY: -size.h * 0.2,
    maxY: bench.h - size.h * 0.8,
  };
}
