import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { hasLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { projects } from "@/content/projects";
import { caseStudies } from "@/content/case-studies";
import {
  alsoUsed,
  contact,
  cvProfile,
  education,
  experience,
  headline,
  languages,
  tools,
} from "@/content/profile";
import { CropMarks } from "@/components/CropMarks";
import { PrintButton } from "@/components/PrintButton";

type Params = Promise<{ lang: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return {
    // Also the file name Chrome suggests when saving as PDF
    title: "Romaric Soh, CV",
    description: headline[lang],
    alternates: { languages: Object.fromEntries(locales.map((l) => [l, `/${l}/cv`])) },
  };
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-2 border-t border-line pt-4 print:pt-3 sm:grid-cols-[8rem_1fr] sm:gap-6 print:grid-cols-[8rem_1fr] print:gap-6">
      <h2 className="text-body font-medium text-ink-2">{title}</h2>
      <div className="space-y-4 print:space-y-3">{children}</div>
    </section>
  );
}

function Entry({ title, meta, children }: { title: string; meta: string; children?: ReactNode }) {
  return (
    <div className="break-inside-avoid">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <h3 className="text-body font-medium">{title}</h3>
        <p className="text-meta text-ink-3">{meta}</p>
      </div>
      {children}
    </div>
  );
}

export default async function CvPage({ params }: { params: Params }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const { cv: t } = await getDictionary(lang);

  return (
    <main className="px-4 py-8 sm:px-8 sm:py-12 print:p-0">
      <div className="mx-auto max-w-[210mm]">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 print:hidden">
          <Link
            href={`/${lang}#contact`}
            className="text-body inline-flex min-h-11 items-center gap-2 text-ink-3 transition-colors duration-150 ease-out hover:text-ink"
          >
            <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M13 8H3M7 4 3 8l4 4" />
            </svg>
            {t.back}
          </Link>
          <PrintButton label={t.print} />
        </div>

        {/* The sheet: a real page, so the crop marks are where a printer would put them */}
        <article className="relative space-y-6 bg-card p-6 shadow-object sm:p-12 print:space-y-3 print:p-0 print:shadow-none">
          <span className="print:hidden">
            <CropMarks />
          </span>

          <header>
            <h1 className="text-step">Romaric Soh</h1>
            <p className="text-lead mt-1 text-ink-2">{headline[lang]}</p>
            <ul className="text-meta mt-4 flex flex-wrap gap-x-4 text-ink-2 [&_a]:inline-flex [&_a]:min-h-6 [&_a]:items-center print:[&_a]:min-h-0">
              <li>
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </li>
              <li>
                <a href={`https://${contact.linkedin}`}>{contact.linkedin}</a>
              </li>
              <li>
                <a href={`https://${contact.github}`}>{contact.github}</a>
              </li>
              <li>
                <a href={`https://${contact.site}/${lang}`}>{contact.site}</a>
              </li>
            </ul>
          </header>

          <Section title={t.profile}>
            <p className="text-body">{cvProfile[lang]}</p>
          </Section>

          <Section title={t.projects}>
            {projects.map((p) => {
              const path = `${contact.site}/${lang}/work/${caseStudies[p.id].slug}`;
              return (
                <Entry key={p.id} title={`${p.name}, ${p.kind[lang].toLowerCase()}`} meta={`${p.year} · ${p.status[lang]}`}>
                  <p className="text-body text-ink-2">{p.summary[lang]}</p>
                  <p className="text-meta mt-1 text-ink-3">
                    {p.stack.join(" · ")} · <a href={`https://${path}`}>{path}</a>
                  </p>
                </Entry>
              );
            })}
          </Section>

          <Section title={t.experience}>
            {experience.map((job) => (
              <Entry key={job.org} title={`${job.role[lang]}, ${job.org}, ${job.place}`} meta={job.dates[lang]}>
                <ul className="mt-1 space-y-1">
                  {job.points[lang].map((point) => (
                    <li key={point} className="text-body text-ink-2">
                      {point}
                    </li>
                  ))}
                </ul>
              </Entry>
            ))}
          </Section>

          <Section title={t.education}>
            <Entry title={education.degree} meta={education.years}>
              <p className="text-body text-ink-2">{education.school[lang]}</p>
            </Entry>
          </Section>

          <Section title={t.languages}>
            <ul className="text-body flex flex-wrap gap-x-6 gap-y-1">
              {languages.map((l) => (
                <li key={l.name.en}>
                  {l.name[lang]} <span className="text-ink-2">· {l.level[lang]}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title={t.tools}>
            <p className="text-body">{tools.map((tool) => tool.name[lang]).join(" · ")}</p>
            <p className="text-body text-ink-2">
              {t.also}
              {lang === "fr" ? " : " : ": "}
              {alsoUsed.join(", ")}
            </p>
          </Section>
        </article>
      </div>
    </main>
  );
}
