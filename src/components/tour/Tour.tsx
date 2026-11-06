"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import type { Beat, DeviceKind, TourCopy } from "@/content/tour";
import { STOPS, tour } from "./state";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// The 3D bench loads after the text, on the client only.
const Scene = dynamic(() => import("./Scene"), { ssr: false });

export type Stop = {
  id: string;
  device: DeviceKind;
  name: string;
  kicker: string;
  status: string;
  stack: string[];
  live?: string;
  code?: string;
  caseStudy: string;
  beats: Beat[];
};
type Props = { copy: TourCopy; stops: Stop[]; labels: { live: string; code: string } };

type Mode = "pending" | "3d" | "lite";

/** The scene uses lighter WebP copies of the screens as textures. */
const webp = (src: string) => src.replace(/\.png$/, ".webp");

/**
 * The lite tour: reduced motion, no WebGL, a low-memory phone or data saver.
 * Same text and order, each device becomes a still image that changes screen.
 * `?tour=lite` and `?tour=3d` force either one for testing.
 */
function pickMode(): Mode {
  const force = new URLSearchParams(location.search).get("tour");
  if (force === "lite" || force === "3d") return force;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return "lite";
  if (nav.connection?.saveData) return "lite";
  if ((nav.deviceMemory ?? 8) <= 2 || (nav.hardwareConcurrency ?? 8) <= 2) return "lite";
  try {
    if (!document.createElement("canvas").getContext("webgl2")) return "lite";
  } catch {
    return "lite";
  }
  return "3d";
}

/**
 * Big Shoulders at weight 700 runs about 0.45 em per capital. A long name
 * ("PortfolioOS") shrinks to fit its column instead of running under the device.
 */
function fitTitle(title: string) {
  const longest = Math.max(...title.split(/\s|(?<=-)/).map((w) => w.length));
  return { fontSize: `min(clamp(4rem, 2rem + 8vw, 9rem), ${(100 / (longest * 0.45)).toFixed(1)}cqi)` };
}

function Arrow({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

/** Lite mode: the stop's device as a still, sticky beside the text. */
function StillDevice({ stop, beat }: { stop: Stop; beat: number }) {
  const phone = stop.device === "phone";
  return (
    <div aria-hidden className="absolute inset-0">
      <div
        className={`sticky top-0 mx-auto flex h-svh max-w-[1440px] items-start justify-center px-6 pt-20 wide:items-center wide:justify-end wide:px-8 wide:pt-0 ${phone ? "lg:pr-[12%]" : "lg:pr-[4%]"}`}
      >
        <div className={phone ? "w-[min(46vw,15rem)] wide:w-[min(26vw,19rem)]" : "w-full max-w-[26rem] wide:w-[min(44vw,44rem)] wide:max-w-none"}>
          <div className="@container">
            <div
              className="bg-device shadow-lifted"
              style={phone ? { borderRadius: "17cqw", padding: "4.5cqw" } : { borderRadius: "2.4cqw", padding: "1.6cqw" }}
            >
              <div className="relative grid overflow-hidden bg-paper" style={{ borderRadius: phone ? "12.5cqw" : "1cqw" }}>
                {stop.beats.map((b, i) => (
                  <Image
                    key={b.screen}
                    src={b.screen}
                    width={phone ? 780 : 1280}
                    height={phone ? 1782 : 800}
                    alt=""
                    sizes={phone ? "(min-width: 768px) 19rem, 15rem" : "(min-width: 768px) 44vw, 26rem"}
                    className={`col-start-1 row-start-1 block w-full transition-opacity duration-300 ease-out ${phone ? "h-auto" : "aspect-[16/10] h-auto object-cover object-top"}`}
                    style={{ opacity: beat === i ? 1 : 0 }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Tour({ copy, stops, labels }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("pending");
  const [ready, setReady] = useState(false);
  const [shown, setShown] = useState(() => stops.map(() => 0));
  const scene = useMemo(() => stops.map((s) => ({ device: s.device, screens: s.beats.map((b) => webp(b.screen)) })), [stops]);

  useEffect(() => {
    const m = pickMode();
    setMode(m);
    // Fetch the phone's screens alongside the 3D code, not after it
    if (m === "3d")
      for (const src of scene[0].screens) {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.src = src;
      }
  }, [scene]);

  useGSAP(
    () => {
      if (mode === "pending") return;
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const q = gsap.utils.selector(root);

      // Smooth wheel scrolling; touch keeps the platform's own scroll
      let lenis: Lenis | undefined;
      const raf = (time: number) => lenis?.raf(time * 1000);
      if (!reduce) {
        lenis = new Lenis({ autoRaf: false });
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add(raf);
        gsap.ticker.lagSmoothing(0);
      }

      const opening = q("[data-chapter=opening]")[0];
      const sections = q("[data-stop]");
      const end = q("[data-chapter=end]")[0];

      // The camera walks to stop k while section k rises into view; the first
      // walk is the dive from the opening, the last one the pull back at the end
      const walk = (k: number, trigger: Element, start: string | number) =>
        ScrollTrigger.create({
          trigger,
          start,
          end: k === 0 ? "bottom top" : "top top",
          onUpdate: (s) => {
            tour.travel[k] = s.progress;
            tour.invalidate();
          },
        });
      walk(0, opening, 0);
      sections.slice(1).forEach((el, i) => walk(i + 1, el, "top bottom"));
      walk(STOPS, end, "top bottom");

      // One screen per step: step i is centred when progress is i / (n - 1)
      sections.forEach((el, k) => {
        const n = stops[k].beats.length;
        ScrollTrigger.create({
          trigger: el,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (s) => {
            tour.screen[k] = s.progress * (n - 1);
            tour.invalidate();
            if (mode !== "lite") return;
            const r = Math.round(tour.screen[k]);
            setShown((prev) => (prev[k] === r ? prev : prev.map((v, j) => (j === k ? r : v))));
          },
        });
      });

      // Weight changes re-rasterise the giant glyphs on every frame: worth it on a
      // desktop, too costly on a phone CPU. Steps of 25 let the glyph cache help.
      if (!reduce && matchMedia("(min-width: 768px) and (pointer: fine)").matches) {
        gsap.to(q("[data-poster]"), {
          fontWeight: 300,
          snap: { fontWeight: 25 },
          ease: "none",
          scrollTrigger: { trigger: opening, start: 0, end: "bottom top", scrub: true },
        });
        // …and each stop's name thickens as its device wakes up
        for (const el of sections)
          gsap.fromTo(
            el.querySelector("[data-chapter-title]"),
            { fontWeight: 200 },
            {
              fontWeight: 700,
              snap: { fontWeight: 25 },
              ease: "none",
              scrollTrigger: { trigger: el, start: "top bottom", end: "top top", scrub: true },
            },
          );
      }

      // Each step's text arrives with its screen
      for (const el of q("[data-beat], [data-chapter=end]")) {
        gsap.from(el.querySelectorAll("[data-reveal]"), {
          y: reduce ? 0 : 28,
          opacity: 0,
          duration: reduce ? 0.2 : 0.7,
          ease: "power3.out",
          stagger: reduce ? 0 : 0.07,
          scrollTrigger: { trigger: el, start: "top 62%", toggleActions: "play none none reverse" },
        });
      }

      return () => {
        gsap.ticker.remove(raf);
        lenis?.destroy();
        tour.travel.fill(0);
        tour.screen.fill(0);
      };
    },
    { scope: root, dependencies: [mode] },
  );

  return (
    <div ref={root}>
      {/* The bench: CSS mat first, the 3D scene fades in over it once drawn */}
      <div aria-hidden className="mat fixed inset-0 z-0">
        {mode === "3d" && (
          <div className="absolute inset-0 transition-opacity duration-700 ease-out" style={{ opacity: ready ? 1 : 0 }}>
            <Scene stops={scene} onReady={() => setReady(true)} />
          </div>
        )}
      </div>

      {/* Opening: the name, on calm paper beside the bench */}
      <section
        id="work"
        data-chapter="opening"
        className="pointer-events-none relative z-10 mx-auto flex min-h-[calc(100svh-4rem)] max-w-[1440px] flex-col gap-6 px-6 pt-6 pb-10 md:justify-between md:gap-12 md:px-8 md:pt-10 md:pb-12"
      >
        <h1 data-poster className="text-poster">
          <span className="block">Romaric</span>
          <span className="block">Soh</span>
        </h1>
        <div className="pointer-events-auto max-w-[32rem]">
          <p className="text-lead text-ink-2">{copy.role}</p>
          <p className="text-body mt-6 flex items-center gap-2 text-ink-3">
            <Arrow className="size-4 rotate-90" />
            {copy.cue}
          </p>
        </div>
      </section>

      {/* One stop per project. The device stays in the scene; the steps scroll past it */}
      {stops.map((stop, k) => (
        <section key={stop.id} data-stop aria-labelledby={`${stop.id}-title`} className="pointer-events-none relative z-10">
          {mode === "lite" && <StillDevice stop={stop} beat={shown[k]} />}

          {stop.beats.map((b, i) => (
            <div
              key={b.screen}
              data-beat
              className="mx-auto flex min-h-svh max-w-[1440px] items-end px-4 pb-6 wide:items-center wide:px-8 wide:pb-0"
            >
              <div className="pointer-events-auto w-full max-w-[30rem] rounded-window border border-line p-5 @container narrow:material wide:max-w-[min(30rem,44vw)] wide:border-0 wide:p-0">
                {i === 0 ? (
                  <>
                    <p data-reveal className="text-body font-medium text-accent">
                      {stop.kicker}
                    </p>
                    <h2 id={`${stop.id}-title`} data-reveal data-chapter-title className="text-chapter mt-2" style={fitTitle(b.title)}>
                      {b.title}
                    </h2>
                  </>
                ) : (
                  <h3 data-reveal className="text-step">
                    {b.title}
                  </h3>
                )}
                <p data-reveal className="text-lead mt-4 text-ink-2 wide:mt-6">
                  {b.body}
                </p>
                <p className="sr-only">{b.alt}</p>

                {k === 0 && i === 0 && mode === "3d" && (
                  <p data-reveal className="text-body mt-6 flex items-center gap-2 text-ink-3 narrow:hidden">
                    <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M2.5 8a5.5 5.5 0 0 1 9.6-3.7M13.5 8a5.5 5.5 0 0 1-9.6 3.7M12.5 1.5v3h-3M3.5 14.5v-3h3" />
                    </svg>
                    <span className="pointer-coarse:hidden">{copy.hintMouse}</span>
                    <span className="hidden pointer-coarse:inline">{copy.hintTouch}</span>
                  </p>
                )}

                {i === stop.beats.length - 1 && (
                  <>
                    <p data-reveal className="text-body mt-6 text-ink-2">
                      {stop.status}
                    </p>
                    <p data-reveal className="text-body mt-1 text-ink-3">
                      {stop.stack.join(", ")}
                    </p>
                    <div data-reveal className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                      <Link
                        href={stop.caseStudy}
                        className="text-body inline-flex h-11 items-center gap-2 rounded-control bg-accent px-4 font-medium text-on-accent transition-[transform,background-color] duration-150 ease-out hover:bg-accent-press active:scale-[0.97]"
                      >
                        {copy.caseStudy}
                        <Arrow className="size-4" />
                      </Link>
                      {stop.live && (
                        <a href={stop.live} target="_blank" rel="noopener noreferrer" className="text-body inline-flex min-h-11 items-center font-medium text-ink underline decoration-line-strong underline-offset-4 transition-colors duration-150 ease-out hover:decoration-ink">
                          {labels.live}
                        </a>
                      )}
                      {stop.code && (
                        <a href={stop.code} target="_blank" rel="noopener noreferrer" className="text-body inline-flex min-h-11 items-center font-medium text-ink underline decoration-line-strong underline-offset-4 transition-colors duration-150 ease-out hover:decoration-ink">
                          {labels.code}
                        </a>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </section>
      ))}

      {/* The end: the camera pulls back over the whole bench, every project one click away */}
      <section
        data-chapter="end"
        aria-labelledby="bench-title"
        className="pointer-events-none relative z-10 mx-auto flex min-h-svh max-w-[1440px] items-start px-6 pt-24 wide:items-center wide:px-8 wide:pt-0"
      >
        <div className="pointer-events-auto">
          <h2 id="bench-title" data-reveal className="text-body font-medium text-accent">
            {copy.end}
          </h2>
          <ul className="mt-4">
            {stops.map((s) => (
              <li key={s.id} data-reveal>
                <Link href={s.caseStudy} className="group flex items-baseline gap-4 py-1">
                  <span className="text-step transition-colors duration-150 ease-out group-hover:text-accent">{s.name}</span>
                  <span className="text-body text-ink-3">{s.kicker}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
