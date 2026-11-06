/**
 * Signature detail: printer's crop marks outside the four corners of a box.
 * Used only around things that can be picked up (workbench objects, case
 * study media). The parent must be `position: relative`.
 */

type Corner = { x: "left" | "right"; y: "top" | "bottom" };

const corners: Corner[] = [
  { x: "left", y: "top" },
  { x: "right", y: "top" },
  { x: "left", y: "bottom" },
  { x: "right", y: "bottom" },
];

export function CropMarks({ gap = 8, length = 12 }: { gap?: number; length?: number }) {
  const offset = -(gap + length);
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0">
      {corners.map(({ x, y }) => (
        <span key={`${x}-${y}`}>
          {/* horizontal mark, on the edge line, outside the box */}
          <span
            className="absolute h-px bg-ink-3"
            style={{ [y]: 0, [x]: offset, width: length }}
          />
          {/* vertical mark, on the edge line, outside the box */}
          <span
            className="absolute w-px bg-ink-3"
            style={{ [x]: 0, [y]: offset, height: length }}
          />
        </span>
      ))}
    </span>
  );
}
