import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Row } from "@/components/Row";
import { hasLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { projectById, projects } from "@/content/projects";
import { caseStudies, caseStudyBySlug } from "@/content/case-studies";
import { PhoneFrame, WindowFrame } from "@/components/case-study/Frames";
import { RoleLink, RoleOrder } from "@/components/case-study/RoleAware";

type Params = Promise<{ lang: string; slug: string }>;

// Unknown locales and slugs fall through to app/global-not-found.tsx.
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((lang) => Object.values(caseStudies).map(({ slug }) => ({ lang, slug })));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, slug } = await params;
  const id = caseStudyBySlug[slug];
  if (!hasLocale(lang) || !id) return {};
  const project = projectById[id];
  return {
    title: `${project.name} · Romaric Soh`,
    description: project.summary[lang],
    alternates: {
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}/work/${slug}`])),
    },
  };
}

function Points({ items }: { items: string[] }) {
  return (
    <ul className="mt-6 space-y-4">
      {items.map((item) => (
        <li key={item} className="text-lead flex max-w-[64ch] gap-4">
          {/* hairline dash, centred on the first line (26px leading) */}
          <span aria-hidden className="mt-[13px] h-px w-4 shrink-0 bg-ink-3" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Paragraphs({ items }: { items: string[] }) {
  return (
    <div className="max-w-[64ch] space-y-5">
      {items.map((p) => (
        <p key={p} className="text-lead">
          {p}
        </p>
      ))}
    </div>
  );
}

export default async function CaseStudyPage({ params }: { params: Params }) {
  const { lang, slug } = await params;
  const id = caseStudyBySlug[slug];
  if (!hasLocale(lang) || !id) notFound();

  const { work: t, bench } = await getDictionary(lang);
  const project = projectById[id];
  const study = caseStudies[id];
  const c = study.copy[lang];
  const next = projects[(projects.indexOf(project) + 1) % projects.length];
  const nextHref = `/${lang}/work/${caseStudies[next.id].slug}`;

  const angle = (role: "frontend" | "fullstack") => (
    <Row key={role} label={bench.forRole[role]}>
      <h3 className="text-title">{c.angles[role].title}</h3>
      <Points items={c.angles[role].points} />
    </Row>
  );

  const nextLink = (
    <>
      <span>
        <span className="text-meta block text-ink-3">{t.next}</span>
        <span className="text-display mt-3 block transition-colors duration-150 ease-out group-hover:text-accent">
          {next.name}
        </span>
      </span>
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="mb-3 size-8 shrink-0 text-ink-3 transition-transform duration-150 ease-out group-hover:translate-x-1"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path d="M4 12h15M13 6l6 6-6 6" />
      </svg>
    </>
  );
  const nextClass =
    "group mx-auto flex max-w-[1440px] items-end justify-between gap-6 px-6 py-16 md:px-8 lg:py-24";

  return (
    <main>
      <article>
        <header className="mx-auto grid max-w-[1440px] gap-12 px-6 pt-8 pb-16 md:px-8 lg:grid-cols-12 lg:pt-12 lg:pb-24">
          <div className="lg:col-span-5 lg:self-center xl:col-span-4">
            <Link
              href={`/${lang}#work`}
              className="text-meta inline-flex items-center gap-2 text-ink-3 transition-colors duration-150 ease-out hover:text-ink"
            >
              <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path d="M13 8H3M7 4 3 8l4 4" />
              </svg>
              {t.back}
            </Link>
            <p className="text-meta mt-10 text-ink-3">
              {project.kind[lang]} · {project.year}
            </p>
            <h1 className="text-display mt-3">{project.name}</h1>
            <p className="text-lead mt-6 max-w-[36rem] text-ink-2">{project.summary[lang]}</p>

            <dl className="mt-10 grid grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-3">
              <dt className="text-meta text-ink-3">{t.role}</dt>
              <dd className="text-body">{c.role}</dd>
              <dt className="text-meta text-ink-3">{t.state}</dt>
              <dd className="text-body">{project.status[lang]}</dd>
              <dt className="text-meta text-ink-3">{t.stack}</dt>
              <dd>
                <ul className="flex flex-wrap gap-2">
                  {project.stack.map((tech) => (
                    <li
                      key={tech}
                      className="text-meta inline-flex h-6 items-center rounded-tag border border-line px-2 text-ink-2"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
              </dd>
            </dl>

            {project.links && (
              <ul className="mt-10 flex flex-wrap gap-3">
                {(["live", "code"] as const).map((kind) => {
                  const href = project.links?.[kind];
                  if (!href) return null;
                  return (
                    <li key={kind}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-body inline-flex h-11 items-center gap-2 rounded-control border border-line-strong px-4 font-medium text-ink transition-[transform,background-color] duration-150 ease-out hover:bg-raised active:scale-[0.97]"
                      >
                        {t[kind]}
                        <svg aria-hidden viewBox="0 0 16 16" className="size-4 text-ink-3" fill="none" stroke="currentColor" strokeWidth={1.5}>
                          <path d="M5 11 11 5M6 5h5v5" />
                        </svg>
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* The moment: the object from the workbench, on the same cutting mat */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="mat grid place-items-center rounded-window border border-line p-6 sm:p-10 lg:p-12">
              {project.object === "phone" ? (
                <div className="w-full max-w-72">
                  <PhoneFrame {...project.screen} alt={study.heroAlt[lang]} sizes="288px" preload />
                </div>
              ) : (
                <div className="w-full">
                  <WindowFrame
                    {...project.screen}
                    label={project.label}
                    alt={study.heroAlt[lang]}
                    sizes="(min-width: 1024px) 60vw, 100vw"
                    preload
                  />
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1440px] px-6 md:px-8">
          <Row label={t.brief}>
            <Paragraphs items={c.brief} />
          </Row>

          <Suspense fallback={<>{[angle("frontend"), angle("fullstack")]}</>}>
            <RoleOrder frontend={angle("frontend")} fullstack={angle("fullstack")} />
          </Suspense>

          <Row label={t.story}>
            <h3 className="text-title">{c.story.title}</h3>
            <div className="mt-6">
              <Paragraphs items={c.story.body} />
            </div>
          </Row>

          {study.media.length > 0 && (
            <Row label={t.screens}>
              <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
                {study.media.map((m) => (
                  <figure key={m.src} className={m.device === "window" ? "col-span-full" : "max-w-60"}>
                    {m.device === "phone" ? (
                      <PhoneFrame {...m} alt={m.alt[lang]} sizes="240px" />
                    ) : (
                      <WindowFrame {...m} alt={m.alt[lang]} sizes="(min-width: 1024px) 55vw, 100vw" />
                    )}
                    <figcaption className="text-meta mt-3 text-ink-3">{m.caption[lang]}</figcaption>
                  </figure>
                ))}
              </div>
            </Row>
          )}

          <Row label={t.now}>
            <Paragraphs items={c.now} />
            {c.credit && <p className="text-meta mt-8 max-w-[64ch] text-ink-3">{c.credit}</p>}
          </Row>
        </div>

        <nav aria-label={t.next} className="border-t border-line">
          <Suspense
            fallback={
              <Link href={nextHref} className={nextClass}>
                {nextLink}
              </Link>
            }
          >
            <RoleLink href={nextHref} className={nextClass}>
              {nextLink}
            </RoleLink>
          </Suspense>
        </nav>
      </article>
    </main>
  );
}
