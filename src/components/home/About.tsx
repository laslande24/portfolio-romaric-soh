import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { bio, education, experience, languages, location } from "@/content/profile";
import { Row } from "@/components/Row";

export function About({ lang, t }: { lang: Locale; t: Dictionary["about"] }) {
  return (
    <>
      <Row id="about" label={t.label}>
        <div className="max-w-[64ch] space-y-5">
          {bio[lang].map((p) => (
            <p key={p} className="text-lead">
              {p}
            </p>
          ))}
        </div>

        <dl className="mt-10 grid gap-x-8 gap-y-4 sm:grid-cols-[auto_1fr]">
          <dt className="text-meta pt-1 text-ink-3">{t.based}</dt>
          <dd className="text-body">{location[lang]}</dd>

          <dt className="text-meta pt-1 text-ink-3">{t.languages}</dt>
          <dd>
            <ul className="text-body space-y-1">
              {languages.map((l) => (
                <li key={l.name.en}>
                  {l.name[lang]} <span className="text-ink-2">· {l.level[lang]}</span>
                </li>
              ))}
            </ul>
          </dd>

          <dt className="text-meta pt-1 text-ink-3">{t.education}</dt>
          <dd className="text-body">
            {education.degree}
            <span className="block text-ink-2">
              {education.school[lang]}, {education.years}
            </span>
          </dd>
        </dl>
      </Row>

      <Row label={t.experience}>
        <ol className="space-y-12">
          {experience.map((job) => (
            <li key={job.org} className="grid gap-2 sm:grid-cols-[11rem_1fr] sm:gap-8">
              <p className="text-meta pt-1 text-ink-3">{job.dates[lang]}</p>
              <div>
                <h3 className="text-lead font-medium">
                  {job.role[lang]}, {job.org}
                </h3>
                <p className="text-meta mt-1 text-ink-3">{job.place}</p>
                <ul className="mt-4 max-w-[64ch] space-y-3">
                  {job.points[lang].map((point) => (
                    <li key={point} className="text-body flex gap-4 text-ink-2">
                      {/* hairline dash, centred on the first line (22px leading) */}
                      <span aria-hidden className="mt-[11px] h-px w-3 shrink-0 bg-ink-3" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-meta mt-4 text-ink-3">{job.tools.join(" · ")}</p>
              </div>
            </li>
          ))}
        </ol>
      </Row>
    </>
  );
}
