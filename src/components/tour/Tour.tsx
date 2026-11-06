"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import type { TourCopy } from "@/content/tour";
import { tour } from "./state";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// The 3D bench loads after the text, on the client only.
const Scene = dynamic(() => import("./Scene"), { ssr: false });

type Next = { name: string; kind: string; href: string };
type Props = {
  copy: TourCopy;
  laufwort: { stack: string[]; live?: string; code?: string; caseStudy: string };
  next: Next[];
  labels: { live: string; code: string };
};

type Mode = "pending" | "3d" | "lite";

/** The scene uses lighter WebP copies of the screens as textures. */
const webp = (src: string) => src.replace(/\.png$/, ".webp");

/**
 * The lite tour: reduced motion, no WebGL, a low-memory phone or data saver.
 * Same text and order, the phone becomes a still image that changes screen.
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

function Arrow({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

export function Tour({ copy, laufwort, next, labels }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("pending");
  const [ready, setReady] = useState(false);
  const [beat, setBeat] = useState(0);
  const beats = copy.laufwort.beats;

  useEffect(() => {
    const m = pickMode();
    setMode(m);
    // Fetch the phone's screens alongside the 3D code, not after it
    if (m === "3d")
      for (const b of beats) {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.src = webp(b.screen);
      }
  }, [beats]);

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
      const stop = q("[data-chapter=laufwort]")[0];
      const outro = q("[data-chapter=outro]")[0];

      // 1. The opening scrolls away: the camera dives to the phone, the name thins out
      ScrollTrigger.create({
        trigger: opening,
        start: 0,
        end: "bottom top",
        scrub: true,
        onUpdate: (s) => {
          tour.dive = s.progress;
          tour.invalidate();
        },
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
        // …and the chapter's name thickens as the phone lights up
        gsap.fromTo(
          q("[data-chapter-title]"),
          { fontWeight: 200 },
          {
            fontWeight: 700,
            snap: { fontWeight: 25 },
            ease: "none",
            scrollTrigger: { trigger: stop, start: "top bottom", end: "top top", scrub: true },
          },
        );
      }

      // 2. One screen per step: step k is centred when progress is k / (n - 1)
      ScrollTrigger.create({
        trigger: stop,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (s) => {
          tour.screen = s.progress * (beats.length - 1);
          tour.invalidate();
          if (mode === "lite") setBeat(Math.round(tour.screen));
        },
      });

      // 3. The closing section arrives: the camera pulls back along the bench
      ScrollTrigger.create({
        trigger: outro,
        start: "top bottom",
        end: "top top",
        scrub: true,
        onUpdate: (s) => {
          tour.outro = s.progress;
          tour.invalidate();
        },
      });

      // Each step's text arrives with its screen
      for (const el of q("[data-beat], [data-chapter=outro]")) {
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
        tour.dive = tour.screen = tour.outro = 0;
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
            <Scene screens={beats.map((b) => webp(b.screen))} onReady={() => setReady(true)} />
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

      {/* Stop 1: Laufwort. The phone stays in the scene; the steps scroll past it */}
      <section data-chapter="laufwort" aria-labelledby="laufwort-title" className="pointer-events-none relative z-10">
        {mode === "lite" && (
          <div aria-hidden className="absolute inset-0">
            <div className="sticky top-0 mx-auto flex h-svh max-w-[1440px] items-start justify-center px-6 pt-20 md:items-center md:justify-end md:px-8 md:pt-0 lg:pr-[12%]">
              <div className="w-[min(46vw,15rem)] md:w-[min(26vw,19rem)]">
                <div className="@container">
                  <div className="bg-device shadow-lifted" style={{ borderRadius: "17cqw", padding: "4.5cqw" }}>
                    <div className="relative grid overflow-hidden bg-paper" style={{ borderRadius: "12.5cqw" }}>
                      {beats.map((b, i) => (
                        <Image
                          key={b.screen}
                          src={b.screen}
                          width={780}
                          height={1782}
                          alt=""
                          sizes="(min-width: 768px) 19rem, 15rem"
                          className="col-start-1 row-start-1 block h-auto w-full transition-opacity duration-300 ease-out"
                          style={{ opacity: beat === i ? 1 : 0 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {beats.map((b, i) => (
          <div
            key={b.screen}
            data-beat
            className="mx-auto flex min-h-svh max-w-[1440px] items-end px-4 pb-6 md:items-center md:px-8 md:pb-0"
          >
            <div className="pointer-events-auto w-full max-w-[30rem] rounded-window border border-line p-5 max-md:material md:border-0 md:p-0">
              {i === 0 ? (
                <>
                  <p data-reveal className="text-body font-medium text-accent">
                    {copy.laufwort.kicker}
                  </p>
                  <h2 id="laufwort-title" data-reveal data-chapter-title className="text-chapter mt-2">
                    {b.title}
                  </h2>
                </>
              ) : (
                <h3 data-reveal className="text-step">
                  {b.title}
                </h3>
              )}
              <p data-reveal className="text-lead mt-4 text-ink-2 md:mt-6">
                {b.body}
              </p>
              <p className="sr-only">{b.alt}</p>

              {i === 0 && mode === "3d" && (
                <p data-reveal className="text-body mt-6 flex items-center gap-2 text-ink-3 max-md:hidden">
                  <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M2.5 8a5.5 5.5 0 0 1 9.6-3.7M13.5 8a5.5 5.5 0 0 1-9.6 3.7M12.5 1.5v3h-3M3.5 14.5v-3h3" />
                  </svg>
                  <span className="pointer-coarse:hidden">{copy.laufwort.hintMouse}</span>
                  <span className="hidden pointer-coarse:inline">{copy.laufwort.hintTouch}</span>
                </p>
              )}

              {i === beats.length - 1 && (
                <>
                  <p data-reveal className="text-body mt-6 text-ink-3">
                    {laufwort.stack.join(", ")}
                  </p>
                  <div data-reveal className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                    <Link
                      href={laufwort.caseStudy}
                      className="text-body inline-flex h-11 items-center gap-2 rounded-control bg-accent px-4 font-medium text-on-accent transition-[transform,background-color] duration-150 ease-out hover:bg-accent-press active:scale-[0.97]"
                    >
                      {copy.laufwort.caseStudy}
                      <Arrow className="size-4" />
                    </Link>
                    {laufwort.live && (
                      <a href={laufwort.live} target="_blank" rel="noopener noreferrer" className="text-body inline-flex min-h-11 items-center font-medium text-ink underline decoration-line-strong underline-offset-4 transition-colors duration-150 ease-out hover:decoration-ink">
                        {labels.live}
                      </a>
                    )}
                    {laufwort.code && (
                      <a href={laufwort.code} target="_blank" rel="noopener noreferrer" className="text-body inline-flex min-h-11 items-center font-medium text-ink underline decoration-line-strong underline-offset-4 transition-colors duration-150 ease-out hover:decoration-ink">
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

      {/* Closing: the camera pulls back, the rest of the bench waits */}
      <section
        data-chapter="outro"
        aria-labelledby="next-title"
        className="pointer-events-none relative z-10 mx-auto flex min-h-svh max-w-[1440px] items-start px-6 pt-24 md:items-center md:px-8 md:pt-0"
      >
        <div className="pointer-events-auto">
          <h2 id="next-title" data-reveal className="text-body font-medium text-accent">
            {copy.next}
          </h2>
          <ul className="mt-4">
            {next.map((n) => (
              <li key={n.href} data-reveal>
                <Link href={n.href} className="group flex items-baseline gap-4 py-1">
                  <span className="text-step transition-colors duration-150 ease-out group-hover:text-accent">{n.name}</span>
                  <span className="text-body text-ink-3">{n.kind}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
