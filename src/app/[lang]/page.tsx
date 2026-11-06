import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { projectById } from "@/content/projects";
import { caseStudies } from "@/content/case-studies";
import { contact, location } from "@/content/profile";
import { tour } from "@/content/tour";
import { Tour, type Stop } from "@/components/tour/Tour";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const { work } = await getDictionary(lang);
  const copy = tour[lang];

  const projects: Stop[] = copy.stops.map(({ id, device, beats }) => {
    const p = projectById[id];
    return {
      id,
      device,
      beats,
      name: p.name,
      kicker: `${p.kind[lang]}, ${p.year}`,
      status: p.status[lang],
      stack: p.stack,
      ...p.links,
      caseStudy: `/${lang}/work/${caseStudies[id].slug}`,
    };
  });
  // The path follows the projects down the bench; the header's "About" lands on its first paper
  const path: Stop[] = copy.path.map(({ tools, ...c }, i) => ({
    ...c,
    name: c.beats[0].title,
    stack: tools,
    anchor: i === 0 ? "about" : undefined,
  }));

  return (
    <main>
      <Tour
        copy={copy}
        stops={[...projects, ...path]}
        labels={{ live: work.live, code: work.code }}
        reach={{ ...contact, cv: `/${lang}/cv`, location: location[lang] }}
      />
    </main>
  );
}
