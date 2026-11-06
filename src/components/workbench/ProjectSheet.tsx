"use client";

import Image from "next/image";
import Link from "next/link";
import { caseStudies } from "@/content/case-studies";
import { animate, motion, useMotionValue } from "motion/react";
import { useCallback, useEffect, useId, useLayoutEffect, useRef } from "react";
import type { Project, Role } from "@/content/projects";
import type { Locale } from "@/i18n/config";
import { ease, spring } from "@/lib/motion";
import type { View } from "./layouts";
import { ObjectFace, objectSize } from "./ObjectFace";

/** Where the object sits on screen right now: centre, rendered width, tilt. */
export type Origin = { cx: number; cy: number; w: number; rotate: number };

export type SheetLabels = {
  close: string;
  forRole: Record<Role, string>;
  stack: string;
  caseStudy: string;
};

const PHONE_W = 200;

/**
 * The object becomes the page: the sheet starts exactly over the object
 * (same centre, width and tilt), grows into place, and goes back to the
 * object when closed. Enter and exit follow the same path.
 */
export function ProjectSheet({
  project,
  lang,
  view,
  labels,
  reduce,
  getOrigin,
  onClosed,
}: {
  project: Project;
  lang: Locale;
  view: View;
  labels: SheetLabels;
  reduce: boolean;
  getOrigin: () => Origin | null;
  onClosed: () => void;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const closing = useRef(false);
  const media = useRef({ cx: 0, cy: 0, w: 1 });

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  const rotate = useMotionValue(0);
  const scrim = useMotionValue(0);
  const surface = useMotionValue(0);
  const content = useMotionValue(0);

  // Open: measure the resting layout, jump onto the object, then grow into place.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    const m = mediaRef.current;
    if (!panel || !m) return;
    const pr = panel.getBoundingClientRect();
    const mr = m.getBoundingClientRect();
    media.current = { cx: mr.left + mr.width / 2, cy: mr.top + mr.height / 2, w: mr.width };
    panel.style.transformOrigin = `${media.current.cx - pr.left}px ${media.current.cy - pr.top}px`;

    const fade = { duration: 0.2, ease };
    animate(scrim, 1, { duration: 0.3, ease });
    closeRef.current?.focus({ preventScroll: true });

    const o = getOrigin();
    if (reduce || !o) {
      animate(surface, 1, fade);
      animate(content, 1, fade);
      return;
    }
    x.jump(o.cx - media.current.cx);
    y.jump(o.cy - media.current.cy);
    scale.jump(o.w / media.current.w);
    rotate.jump(o.rotate);
    animate(x, 0, spring.sheet);
    animate(y, 0, spring.sheet);
    animate(scale, 1, spring.sheet);
    animate(rotate, 0, spring.sheet);
    animate(surface, 1, fade);
    animate(content, 1, { duration: 0.25, delay: 0.12, ease });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    const fade = { duration: 0.15, ease };
    animate(content, 0, fade);
    animate(scrim, 0, { duration: 0.3, ease });

    const o = getOrigin();
    if (reduce || !o) {
      animate(surface, 0, fade).then(onClosed);
      return;
    }
    animate(surface, 0, { duration: 0.2, delay: 0.05, ease });
    animate(rotate, o.rotate, spring.sheet);
    animate(scale, o.w / media.current.w, spring.sheet);
    animate(x, o.cx - media.current.cx, spring.sheet);
    animate(y, o.cy - media.current.cy, spring.sheet).then(onClosed);
  }, [content, getOrigin, onClosed, reduce, rotate, scale, scrim, surface, x, y]);

  // Escape closes, Tab stays inside, the page behind does not scroll.
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [close]);

  const roles: Role[] = view === "fullstack" ? ["fullstack", "frontend"] : ["frontend", "fullstack"];
  const phoneSize = objectSize(project, PHONE_W);

  return (
    <div className="fixed inset-0 z-50">
      <motion.div aria-hidden className="absolute inset-0 bg-device/50" style={{ opacity: scrim }} onClick={close} />
      <div className="pointer-events-none absolute inset-0 grid place-items-center p-4 md:p-8">
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="pointer-events-auto relative w-full max-w-[960px]"
          style={{ x, y, scale, rotate }}
        >
          <motion.div
            aria-hidden
            className="absolute inset-0 rounded-window bg-card shadow-lifted"
            style={{ opacity: surface }}
          />
          <div className="relative grid max-h-[calc(100svh-2rem)] gap-8 overflow-y-auto p-5 md:max-h-[calc(100svh-4rem)] md:grid-cols-[1.3fr_1fr] md:items-center md:p-8">
            {/* Media first: this is what the object turns into */}
            {project.object === "phone" ? (
              <div className="flex justify-center md:py-4">
                <div ref={mediaRef} style={{ width: phoneSize.w, height: phoneSize.h }}>
                  <ObjectFace project={project} size={phoneSize} sizes={`${PHONE_W}px`} />
                </div>
              </div>
            ) : (
              <div
                ref={mediaRef}
                className="relative w-full overflow-hidden rounded-card border border-line bg-paper"
                style={{ aspectRatio: `${project.screen.width} / ${project.screen.height}` }}
              >
                <Image
                  src={project.screen.src}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 540px, 100vw"
                  className="object-cover object-top"
                />
              </div>
            )}

            <motion.div style={{ opacity: content }} className="md:pr-6">
              <p className="text-meta text-ink-3">
                {project.kind[lang]} · {project.year}
              </p>
              <h2 id={titleId} className="text-title mt-2">
                {project.name}
              </h2>
              <p className="text-meta mt-2 text-ink-2">{project.status[lang]}</p>
              <p className="text-body mt-5 text-ink-2">{project.summary[lang]}</p>

              <div className="mt-6 space-y-4">
                {roles.map((role, i) => (
                  <div key={role}>
                    <h3 className={`text-body font-medium ${view !== "all" && i > 0 ? "text-ink-3" : "text-ink"}`}>
                      {labels.forRole[role]}
                    </h3>
                    <p className={`text-body mt-1 ${view !== "all" && i > 0 ? "text-ink-3" : "text-ink-2"}`}>
                      {project.angle[role][lang]}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <p className="text-meta text-ink-3">{labels.stack}</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {project.stack.map((tech) => (
                    <li key={tech} className="text-meta inline-flex h-6 items-center rounded-tag border border-line px-2 text-ink-2">
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href={`/${lang}/work/${caseStudies[project.id].slug}${view === "all" ? "" : `?role=${view}`}`}
                className="mt-8 inline-flex h-11 items-center gap-2 rounded-control bg-accent px-4 text-body font-medium text-on-accent transition-[transform,background-color] duration-150 ease-out hover:bg-accent-press active:scale-[0.97]"
              >
                {labels.caseStudy}
                <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </Link>
            </motion.div>
          </div>

          <motion.button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label={labels.close}
            style={{ opacity: content }}
            className="absolute top-3 right-3 grid size-10 place-items-center rounded-control text-ink-2 transition-[color,background-color,transform] duration-150 ease-out hover:bg-raised hover:text-ink active:scale-[0.97]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
              <path d="M3.5 3.5l9 9m0-9l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
