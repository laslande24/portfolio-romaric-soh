import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { projectById, projects } from "@/content/projects";
import { caseStudies } from "@/content/case-studies";
import { tour } from "@/content/tour";
import { Tour } from "@/components/tour/Tour";
import { About } from "@/components/home/About";
import { Tools } from "@/components/home/Tools";
import { Contact } from "@/components/home/Contact";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const { work, about, contact } = await getDictionary(lang);
  const laufwort = projectById.laufwort;
  const href = (id: keyof typeof caseStudies) => `/${lang}/work/${caseStudies[id].slug}`;

  return (
    <main>
      <Tour
        copy={tour[lang]}
        laufwort={{ stack: laufwort.stack, ...laufwort.links, caseStudy: href("laufwort") }}
        next={projects
          .filter((p) => p.id !== "laufwort")
          .map((p) => ({ name: p.name, kind: p.kind[lang], href: href(p.id) }))}
        labels={{ live: work.live, code: work.code }}
      />

      {/* ponytail: phase C turns these into chapters of the tour */}
      <div className="relative z-10 bg-paper">
        <div className="mx-auto max-w-[1440px] px-6 pb-16 md:px-8">
          <About lang={lang} t={about} />
          <Tools lang={lang} t={about} />
          <Contact lang={lang} t={contact} />
        </div>
      </div>
    </main>
  );
}
