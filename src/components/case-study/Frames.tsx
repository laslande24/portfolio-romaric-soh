import Image from "next/image";

type Shot = {
  src: string;
  width: number;
  height: number;
  alt: string;
  sizes: string;
  preload?: boolean;
};

/** A browser window, as on the workbench: hairline title bar, the real capture below. */
export function WindowFrame({ label, ...shot }: Shot & { label?: string }) {
  return (
    <div className="overflow-hidden rounded-window border border-line bg-card shadow-object">
      <div className="flex h-7 items-center gap-2 border-b border-line px-3">
        <span className="flex gap-1" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-2 rounded-full border border-line-strong" />
          ))}
        </span>
        {label && <span className="text-meta truncate text-ink-3">{label}</span>}
      </div>
      <Image
        src={shot.src}
        width={shot.width}
        height={shot.height}
        alt={shot.alt}
        sizes={shot.sizes}
        preload={shot.preload}
        className="block h-auto w-full"
      />
    </div>
  );
}

/**
 * A phone, as on the workbench. Frame, radius and camera island are in container
 * units, so the device keeps its proportions at any width.
 */
export function PhoneFrame(shot: Shot) {
  return (
    <div className="@container">
      <div className="bg-device shadow-object" style={{ borderRadius: "17cqw", padding: "4.5cqw" }}>
        <div className="relative overflow-hidden bg-paper" style={{ borderRadius: "12.5cqw" }}>
          <Image
            src={shot.src}
            width={shot.width}
            height={shot.height}
            alt={shot.alt}
            sizes={shot.sizes}
            preload={shot.preload}
            className="block h-auto w-full"
          />
          <span
            aria-hidden
            className="absolute left-1/2 -translate-x-1/2 rounded-full bg-device"
            style={{ top: "4cqw", width: "28cqw", height: "7.5cqw" }}
          />
        </div>
      </div>
    </div>
  );
}
