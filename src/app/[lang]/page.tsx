import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { Workbench } from "@/components/workbench/Workbench";
import { About } from "@/components/home/About";
import { Tools } from "@/components/home/Tools";
import { Contact } from "@/components/home/Contact";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const { hero, bench, about, contact } = await getDictionary(lang);

  return (
    <main>
      <section id="work" className="mx-auto grid min-h-[calc(100svh-4rem)] scroll-mt-16 max-w-[1440px] items-center gap-12 px-6 py-12 md:px-8 lg:grid-cols-12 lg:gap-12 lg:py-16">
        {/* Text sits on the calm side; the workbench takes the larger share */}
        <div className="lg:col-span-5 xl:col-span-4">
          <h1 className="text-display max-w-[12ch]">{hero.title}</h1>
          <p className="text-lead mt-6 max-w-[36rem] text-ink-2">{hero.lead}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href="#work"
              className="inline-flex h-12 items-center rounded-control bg-accent px-5 text-body font-medium text-on-accent transition-[transform,background-color] duration-150 ease-out hover:bg-accent-press active:scale-[0.97]"
            >
              {hero.primary}
            </a>
            <a
              href="#contact"
              className="inline-flex h-12 items-center rounded-control border border-line-strong px-5 text-body font-medium text-ink transition-[transform,background-color] duration-150 ease-out hover:bg-raised active:scale-[0.97]"
            >
              {hero.secondary}
            </a>
          </div>
        </div>

        <div className="lg:col-span-7 xl:col-span-8">
          <Workbench lang={lang} labels={bench} />
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-6 pb-16 md:px-8">
        <About lang={lang} t={about} />
        <Tools lang={lang} t={about} />
        <Contact lang={lang} t={contact} />
      </div>
    </main>
  );
}
