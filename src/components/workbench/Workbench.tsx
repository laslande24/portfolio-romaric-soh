"use client";

import { useReducedMotion } from "motion/react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { projectById, projects, type ProjectId, type Role } from "@/content/projects";
import type { Locale } from "@/i18n/config";
import { BenchObject } from "./BenchObject";
import { objectSize } from "./ObjectFace";
import { ProjectSheet, type Origin, type SheetLabels } from "./ProjectSheet";
import { RolePicker } from "./RolePicker";
import {
  isCompact,
  objectWidth,
  order,
  placementFor,
  stackFor,
  type Size,
  type View,
} from "./layouts";

export type BenchLabels = SheetLabels & {
  region: string;
  hiringFor: string;
  views: Record<View, string>;
  hint: Record<View, string>;
  objectHint: string;
};

export function Workbench({ lang, labels }: { lang: Locale; labels: BenchLabels }) {
  const reduce = useReducedMotion() ?? false;
  const benchRef = useRef<HTMLDivElement>(null);
  const objects = useRef<Partial<Record<ProjectId, HTMLButtonElement>>>({});
  const [bench, setBench] = useState<Size>({ w: 0, h: 0 });
  const [view, setView] = useState<View>("all");
  const [stack, setStack] = useState<ProjectId[]>(() => stackFor("all"));
  const [openId, setOpenId] = useState<ProjectId | null>(null);

  useLayoutEffect(() => {
    const el = benchRef.current;
    if (!el) return;
    const measure = () => setBench({ w: Math.round(el.clientWidth), h: Math.round(el.clientHeight) });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const changeView = (next: View) => {
    if (next === view) return;
    setView(next);
    setStack(stackFor(next));
  };

  // Whatever you pick up comes to the top of the pile.
  const lift = useCallback((id: ProjectId) => {
    setStack((s) => (s[s.length - 1] === id ? s : [...s.filter((p) => p !== id), id]));
  }, []);

  const open = useCallback((id: ProjectId) => setOpenId(id), []);

  const getOrigin = useCallback((): Origin | null => {
    if (!openId) return null;
    const el = objects.current[openId];
    if (!el) return null;
    const r = el.getBoundingClientRect(); // rotation keeps the centre where it is
    const style = getComputedStyle(el);
    const matrix = new DOMMatrixReadOnly(style.transform === "none" ? undefined : style.transform);
    const rotate = (Math.atan2(matrix.b, matrix.a) * 180) / Math.PI;
    const scale = Math.hypot(matrix.a, matrix.b);
    return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, w: el.offsetWidth * scale, rotate };
  }, [openId]);

  const closed = useCallback(() => {
    const id = openId;
    setOpenId(null);
    if (id) objects.current[id]?.focus({ preventScroll: true });
  }, [openId]);

  const layoutKey = `${view}:${bench.w}x${bench.h}`;
  const compact = isCompact(bench);
  const rankOf = (id: ProjectId) => (view === "all" ? projects.findIndex((p) => p.id === id) : order[view as Role].indexOf(id));

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="text-body text-ink-3">{labels.hiringFor}</span>
        <RolePicker
          value={view}
          label={labels.hiringFor}
          reduce={reduce}
          onChange={changeView}
          options={(["all", "frontend", "fullstack"] as View[]).map((v) => ({ value: v, label: labels.views[v] }))}
        />
      </div>

      <div
        ref={benchRef}
        role="region"
        aria-label={labels.region}
        className="mat relative h-[30rem] overflow-hidden rounded-window border border-line sm:h-[clamp(26rem,62svh,42rem)]"
      >
        {bench.w > 0 &&
          projects.map((project) => {
            const size = objectSize(project, objectWidth(project.id, bench));
            return (
              <BenchObject
                key={project.id}
                project={project}
                label={`${project.name}, ${project.kind[lang]}. ${labels.objectHint}`}
                bench={bench}
                size={size}
                placement={placementFor(view, project.id, bench)}
                layoutKey={layoutKey}
                delay={rankOf(project.id) * 0.04}
                z={stack.indexOf(project.id) + 1}
                reduce={reduce}
                hidden={openId === project.id}
                preload={project.id === "redekunst"}
                sizes={project.object === "phone" ? (compact ? "34vw" : "200px") : compact ? "80vw" : "540px"}
                onLift={lift}
                onOpen={open}
                register={(el) => {
                  objects.current[project.id] = el ?? undefined;
                }}
              />
            );
          })}
      </div>

      <p className="text-meta mt-4 text-ink-3" aria-live="polite">
        {labels.hint[view]}
      </p>

      {openId && (
        <ProjectSheet
          key={openId}
          project={projectById[openId]}
          lang={lang}
          view={view}
          labels={labels}
          reduce={reduce}
          getOrigin={getOrigin}
          onClosed={closed}
        />
      )}
    </div>
  );
}
