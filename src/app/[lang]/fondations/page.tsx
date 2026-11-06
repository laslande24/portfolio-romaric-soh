import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { CropMarks } from "@/components/CropMarks";
import { SpringDemo } from "@/components/SpringDemo";

// Internal page to validate the foundations (phase 1). Not linked, not indexed.
export const metadata: Metadata = {
  title: "Fondations · Romaric Soh",
  robots: { index: false, follow: false },
};

const colors = [
  { name: "Papier", role: "Fond de page", token: "bg-paper", light: "#F1ECE2", night: "#161513" },
  { name: "Feuille", role: "Surface posée", token: "bg-card", light: "#FBF8F2", night: "#1C1A18" },
  { name: "Relief", role: "Survol, élément actif", token: "bg-raised", light: "#E8E1D4", night: "#262421" },
  { name: "Encre", role: "Texte principal", token: "bg-ink", light: "#16130F", night: "#EFE9DE" },
  { name: "Encre 2", role: "Texte secondaire", token: "bg-ink-2", light: "#5A5146", night: "#AAA398" },
  { name: "Encre 3", role: "Méta, légendes", token: "bg-ink-3", light: "#736A5E", night: "#8A847A" },
  { name: "Latérite", role: "Accent, une action", token: "bg-accent", light: "#B4441F", night: "#E07A52" },
];

const typeScale = [
  { cls: "text-display", spec: "Display · 40 → 72 px · 500 · −0.03em", sample: "Je dessine les apps que je code" },
  { cls: "text-title", spec: "Titre · 28 → 36 px · 500 · −0.02em", sample: "Redekunst-Challenge" },
  { cls: "text-lead", spec: "Chapeau · 18 / 26 px · 400", sample: "Inscriptions et vote en direct pour un concours de débat en allemand." },
  { cls: "text-body", spec: "Texte · 15 / 22 px · 400", sample: "Next.js 16, Supabase, temps réel. Le vote s'affiche sur l'écran de la salle." },
  { cls: "text-meta", spec: "Méta · Geist Mono 12 / 16 px", sample: "2026 · Full-stack · 4 semaines" },
];

const spacing = [4, 8, 12, 16, 24, 32, 48, 64, 96, 128];

const radii = [
  { name: "Étiquette", value: 6, cls: "rounded-tag" },
  { name: "Contrôle", value: 10, cls: "rounded-control" },
  { name: "Carte", value: 14, cls: "rounded-card" },
  { name: "Fenêtre", value: 18, cls: "rounded-window" },
];

function Section({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line py-16 lg:grid lg:grid-cols-12 lg:gap-8">
      <div className="lg:col-span-3">
        <h2 className="text-lead font-medium">{title}</h2>
        <p className="text-body mt-2 max-w-[28ch] text-ink-3">{note}</p>
      </div>
      <div className="mt-8 lg:col-span-9 lg:mt-0">{children}</div>
    </section>
  );
}

export default async function Fondations({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  return (
    <main lang="fr" className="mx-auto max-w-[1440px] px-6 pb-32 md:px-8">
      <header className="py-16 lg:py-24">
        <p className="text-meta text-ink-3">Phase 1 sur 5</p>
        <h1 className="text-title mt-4 max-w-[20ch]">Fondations du portfolio</h1>
        <p className="text-lead mt-4 max-w-[36rem] text-ink-2">
          Couleurs, typographie, espacements et mouvement. Tout le site sera construit avec ces
          seules valeurs. Passe ton ordinateur en mode sombre pour voir l&apos;atelier de nuit.
        </p>
      </header>

      <Section title="Couleurs" note="Une rampe papier et encre, un seul accent. La couleur vive vit dans les projets, pas dans l'interface.">
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {colors.map((c) => (
            <li key={c.name} className="rounded-card border border-line bg-card p-2">
              {/* nested radius: card 14 − padding 8 = 6 */}
              <div className={`h-24 rounded-tag border border-line ${c.token}`} />
              <div className="px-2 pt-3 pb-2">
                <p className="text-body font-medium">{c.name}</p>
                <p className="text-body text-ink-2">{c.role}</p>
                <p className="text-meta mt-2 text-ink-3">
                  {c.light} · nuit {c.night}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Typographie" note="Bricolage Grotesque, avec taille optique : les lettres se resserrent en grand et s'ouvrent en petit. Geist Mono pour les dates et repères.">
        <div className="space-y-10">
          {typeScale.map((t) => (
            <div key={t.cls}>
              <p className="text-meta text-ink-3">{t.spec}</p>
              <p className={`${t.cls} mt-3`}>{t.sample}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Espacements" note="Grille de 4 px. Aucune valeur improvisée : chaque marge vient de cette échelle.">
        <ul className="space-y-3">
          {spacing.map((s) => (
            <li key={s} className="flex items-center gap-4">
              <span className="text-meta w-12 text-right text-ink-3">{s}</span>
              <span className="h-3 rounded-[2px] bg-ink-2" style={{ width: s * 2 }} />
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Rayons" note="Le rayon grandit avec la taille de l'objet. Intérieur = extérieur moins la marge.">
        <ul className="flex flex-wrap items-end gap-6">
          {radii.map((r) => (
            <li key={r.name}>
              <div className={`h-20 w-28 border border-line-strong bg-card ${r.cls}`} />
              <p className="text-body mt-3">{r.name}</p>
              <p className="text-meta text-ink-3">{r.value} px</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Mouvement" note="Survols et pressions : une seule courbe, 150 ms. Tout ce qu'on attrape : des ressorts qui gardent la vitesse du geste.">
        <div className="grid gap-6 xl:grid-cols-2">
          <SpringDemo label="Attrape-moi et lance" />
          <div className="rounded-card border border-line bg-card p-6">
            <dl className="text-body grid grid-cols-[auto_1fr] gap-x-6 gap-y-3">
              <dt className="text-ink-3">Courbe CSS</dt>
              <dd className="text-meta self-center">cubic-bezier(0.22, 1, 0.36, 1)</dd>
              <dt className="text-ink-3">Survol, pression</dt>
              <dd className="text-meta self-center">150 ms · échelle 0,97</dd>
              <dt className="text-ink-3">Ressort par défaut</dt>
              <dd className="text-meta self-center">amorti 1,0 · réponse 0,4 s</dd>
              <dt className="text-ink-3">Après un lancer</dt>
              <dd className="text-meta self-center">amorti 0,8 · réponse 0,4 s</dd>
              <dt className="text-ink-3">Animations réduites</dt>
              <dd className="text-meta self-center">objets immobiles, tout reste cliquable</dd>
            </dl>
            <div className="mt-8 flex gap-3">
              <button
                type="button"
                className="inline-flex h-12 items-center rounded-control bg-accent px-5 text-body font-medium text-on-accent transition-[transform,background-color] duration-150 ease-out hover:bg-accent-press active:scale-[0.97]"
              >
                Action principale
              </button>
              <button
                type="button"
                className="inline-flex h-12 items-center rounded-control border border-line-strong px-5 text-body font-medium transition-[transform,background-color] duration-150 ease-out hover:bg-raised active:scale-[0.97]"
              >
                Secondaire
              </button>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Signature" note="Des traits de coupe d'imprimeur autour de tout ce qui peut se prendre en main. Rien d'autre ne les porte.">
        <div className="flex flex-wrap gap-12 p-6">
          <div className="relative h-36 w-56 rounded-card bg-card shadow-object">
            <CropMarks />
          </div>
          <div className="relative h-56 w-28 rounded-[22px] bg-ink shadow-object">
            <CropMarks />
          </div>
        </div>
      </Section>
    </main>
  );
}
