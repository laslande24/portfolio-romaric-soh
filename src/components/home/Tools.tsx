import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { projects } from "@/content/projects";
import { caseStudies } from "@/content/case-studies";
import { alsoUsed, tools, type ToolColumn } from "@/content/profile";
import { Row } from "@/components/Row";

/**
 * Tools against the places they were used: each project column opens its case
 * study, so every dot is a claim the recruiter can check.
 */
export function Tools({ lang, t }: { lang: Locale; t: Dictionary["about"] }) {
  const columns: { id: ToolColumn; label: string; full: string; href?: string }[] = [
    ...projects.map((p) => ({
      id: p.id,
      label: p.name.split("-")[0],
      full: p.name,
      href: `/${lang}/work/${caseStudies[p.id].slug}`,
    })),
    { id: "site", label: t.thisSite, full: t.thisSite },
    { id: "earlier", label: t.earlierShort, full: t.earlier },
  ];

  return (
    <Row label={t.tools}>
      <p className="text-lead max-w-[48ch] text-ink-2">{t.toolsLead}</p>

      <table className="mt-8 hidden w-full table-fixed border-collapse md:table">
        <caption className="sr-only">{t.toolsCaption}</caption>
        <colgroup>
          <col />
          {columns.map((c) => (
            <col key={c.id} className="w-[11%]" />
          ))}
        </colgroup>
        <thead>
          <tr>
            <td />
            {columns.map((c) => (
              <th key={c.id} scope="col" className="text-meta pb-3 text-center font-normal text-ink-3">
                {c.href ? (
                  <Link
                    href={c.href}
                    className="underline-offset-4 transition-colors duration-150 ease-out hover:text-ink hover:underline"
                  >
                    {c.label}
                  </Link>
                ) : (
                  <span title={c.full}>{c.label}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tools.map((tool) => (
            <tr
              key={tool.name.en}
              className="border-t border-line transition-colors duration-150 ease-out hover:bg-raised"
            >
              <th scope="row" className="text-body py-3 pr-4 text-left font-normal">
                {tool.name[lang]}
              </th>
              {columns.map((c) => (
                <td key={c.id} className="text-center">
                  {tool.used.includes(c.id) && (
                    <>
                      <span aria-hidden className="inline-block size-2 rounded-full bg-ink align-middle" />
                      <span className="sr-only">{t.used}</span>
                    </>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Below md the table becomes a list: each tool, then where it was used */}
      <ul className="mt-8 divide-y divide-line border-y border-line md:hidden">
        {tools.map((tool) => (
          <li key={tool.name.en} className="py-3">
            <p className="text-body">{tool.name[lang]}</p>
            <p className="text-meta mt-1 text-ink-3">
              {columns
                .filter((c) => tool.used.includes(c.id))
                .map((c) => c.full)
                .join(" · ")}
            </p>
          </li>
        ))}
      </ul>

      <p className="text-meta mt-6 text-ink-3">
        {t.also}
        {lang === "fr" ? " : " : ": "}
        {alsoUsed.join(", ")}
      </p>
    </Row>
  );
}
