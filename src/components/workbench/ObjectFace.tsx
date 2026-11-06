import Image from "next/image";
import type { Project } from "@/content/projects";
import type { Size } from "./layouts";

const TITLE_BAR = 28;

/** Physical size of an object for a given width: windows get a title bar, phones a frame. */
export function objectSize(project: Project, w: number): Size {
  const ratio = project.screen.height / project.screen.width;
  if (project.object === "phone") {
    const pad = w * 0.045;
    return { w, h: (w - pad * 2) * ratio + pad * 2 };
  }
  return { w, h: TITLE_BAR + w * ratio };
}

/** The visible object: real capture of the product inside a phone or a window. */
export function ObjectFace({
  project,
  size,
  sizes,
  preload = false,
}: {
  project: Project;
  size: Size;
  sizes: string;
  preload?: boolean;
}) {
  if (project.object === "phone") {
    const pad = size.w * 0.045;
    const radius = size.w * 0.17;
    return (
      <span
        className="block h-full w-full bg-device"
        style={{ borderRadius: radius, padding: pad }}
      >
        <span
          className="relative block h-full w-full overflow-hidden bg-paper"
          style={{ borderRadius: Math.max(radius - pad, 4) }}
        >
          <Image
            src={project.screen.src}
            alt=""
            fill
            sizes={sizes}
            preload={preload}
            draggable={false}
            className="object-cover object-top"
          />
          {/* camera island */}
          <span
            className="absolute left-1/2 -translate-x-1/2 rounded-full bg-device"
            style={{ top: pad * 0.9, width: size.w * 0.28, height: size.w * 0.075 }}
          />
        </span>
      </span>
    );
  }

  return (
    <span className="flex h-full w-full flex-col overflow-hidden rounded-window border border-line bg-card">
      <span
        className="flex shrink-0 items-center gap-2 border-b border-line px-3"
        style={{ height: TITLE_BAR }}
      >
        <span className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-2 rounded-full border border-line-strong" />
          ))}
        </span>
        <span className="text-meta truncate text-ink-3">{project.label}</span>
      </span>
      <span className="relative block flex-1 overflow-hidden">
        <Image
          src={project.screen.src}
          alt=""
          fill
          sizes={sizes}
          preload={preload}
          draggable={false}
          className="object-cover object-top"
        />
      </span>
    </span>
  );
}
