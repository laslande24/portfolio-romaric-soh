import type { Locale } from "@/i18n/config";
import type { ProjectId } from "./projects";

type Text = Record<Locale, string>;

/** Public contact only: no phone number, no date of birth (answers of 2026-11-06). */
export const contact = {
  email: "sohromaric30@gmail.com",
  linkedin: "linkedin.com/in/romaric-fogang-soh",
  github: "github.com/laslande24",
  /** Public address once deployed (phase 5). */
  site: "romaricsoh.vercel.app",
};

export const siteUrl = `https://${contact.site}`;

export const headline: Text = {
  en: "Creative front-end and full-stack developer, web and mobile",
  fr: "Développeur front-end créatif et full-stack, web et mobile",
};

export const bio: Record<Locale, string[]> = {
  en: [
    "I'm a developer based in Douala, Cameroon. I like to own a product from the first sketch to the database rules: I designed and built three of the four projects on the bench, and built 7SETS from a designer's mockup.",
    "Before them, I worked at AFREETECH on public-sector platforms in Cameroon: a React front end with map layers, a weather app in Symfony and React, and the specifications and user guides that went with them.",
  ],
  fr: [
    "Je suis développeur, basé à Douala, au Cameroun. J'aime tenir un produit de la première esquisse jusqu'aux règles de la base de données : j'ai conçu et codé trois des quatre projets de l'établi, et construit 7SETS d'après la maquette d'un designer.",
    "Avant eux, j'ai travaillé chez AFREETECH sur des plateformes publiques au Cameroun : un front React avec des couches cartographiques, une app météo en Symfony et React, et les spécifications et guides utilisateur qui allaient avec.",
  ],
};

/** The CV stands alone: no reference to the workbench. */
export const cvProfile: Text = {
  en: "Developer based in Douala, Cameroon. I design and build web and mobile apps, from the Figma prototype to the database rules, and I am at home in French, English and German. Open to remote work and to relocating.",
  fr: "Développeur basé à Douala, au Cameroun. Je conçois et code des apps web et mobiles, de la maquette Figma aux règles de la base de données, et je travaille en français, en anglais et en allemand. Ouvert au télétravail et prêt à déménager.",
};

export const location: Text = {
  en: "Douala, Cameroon. Open to remote work and to relocating.",
  fr: "Douala, Cameroun. Ouvert au télétravail et prêt à déménager.",
};

export const languages: { name: Text; level: Text }[] = [
  { name: { en: "French", fr: "Français" }, level: { en: "Native", fr: "Langue maternelle" } },
  { name: { en: "English", fr: "Anglais" }, level: { en: "Fluent", fr: "Courant" } },
  {
    name: { en: "German", fr: "Allemand" },
    level: { en: "Goethe-Zertifikat B2 (2026)", fr: "Goethe-Zertifikat B2 (2026)" },
  },
];

export const education = {
  degree: "Bachelor of Engineering, Computer Science",
  school: {
    en: "University of Buea / Institut universitaire de la Côte, Douala",
    fr: "Université de Buea / Institut universitaire de la Côte, Douala",
  } satisfies Text,
  years: "2019–2023",
};

export type Job = {
  org: string;
  role: Text;
  place: string;
  dates: Text;
  points: Record<Locale, string[]>;
  tools: string[];
};

export const experience: Job[] = [
  {
    org: "AFREETECH",
    role: { en: "Web developer", fr: "Développeur web" },
    place: "Yaoundé",
    dates: { en: "May 2024 – Feb 2025", fr: "mai 2024 – févr. 2025" },
    points: {
      en: [
        "PAGIRN-PPTIC: designed the prototype in Figma, then built the React front end with its map (GIS) features, and ran tasks and sprints with the team.",
        "MINT weather project: wrote the functional specifications and the user guide, and built new features for the OBSDATA weather app in Symfony and React and for the Cameroon Weather website in WordPress, maps included.",
        "EAGLES (MINFOPRA): assisted the project owner's team with test sessions, training and configuration.",
      ],
      fr: [
        "PAGIRN-PPTIC : prototype dans Figma, puis le front React avec ses fonctions cartographiques (SIG), et le suivi des tâches et des sprints avec l'équipe.",
        "Projet météo du MINT : spécifications fonctionnelles et guide utilisateur, nouvelles fonctions pour l'app météo OBSDATA en Symfony et React et pour le site Cameroon Weather sous WordPress, cartographie comprise.",
        "EAGLES (MINFOPRA) : assistance à la maîtrise d'ouvrage pour les sessions de tests, les formations et le paramétrage.",
      ],
    },
    tools: ["React", "Symfony", "WordPress", "Figma"],
  },
  {
    org: "QTA TECH",
    role: { en: "Software development intern", fr: "Stagiaire en développement" },
    place: "Douala",
    dates: { en: "Dec 2023 – Apr 2024", fr: "déc. 2023 – avr. 2024" },
    points: {
      en: [
        "Modelled the app in UML and designed it in Figma, then built a hybrid app for pre-financing requests with an AI integration, from analysis to delivery.",
      ],
      fr: [
        "Modélisation UML et maquettes Figma, puis développement d'une app hybride de demandes de préfinancement avec une intégration d'IA, de l'analyse à la livraison.",
      ],
    },
    tools: ["UML", "Figma"],
  },
  {
    org: "Peers Exchange (PEEXIT)",
    role: { en: "Mobile development intern", fr: "Stagiaire en développement mobile" },
    place: "Douala",
    dates: { en: "Jun – Oct 2021", fr: "juin – oct. 2021" },
    points: {
      en: ["Worked on a hybrid mobile app in React Native."],
      fr: ["Développement d'une app mobile hybride en React Native."],
    },
    tools: ["React Native"],
  },
];

/** Columns of the tools table: the projects, this site, and the jobs above. */
export type ToolColumn = ProjectId | "site" | "earlier";

export const tools: { name: Text; used: ToolColumn[] }[] = [
  { name: { en: "Interface design", fr: "Design d'interface" }, used: ["redekunst", "laufwort", "portfolioos", "site", "earlier"] },
  { name: { en: "React", fr: "React" }, used: ["redekunst", "laufwort", "sevensets", "portfolioos", "site", "earlier", "aero"] },
  { name: { en: "Next.js", fr: "Next.js" }, used: ["redekunst", "sevensets", "site"] },
  { name: { en: "TypeScript", fr: "TypeScript" }, used: ["redekunst", "laufwort", "sevensets", "portfolioos", "site", "aero"] },
  { name: { en: "Tailwind CSS", fr: "Tailwind CSS" }, used: ["redekunst", "sevensets", "portfolioos", "site", "aero"] },
  { name: { en: "Animation: GSAP, Motion, Reanimated", fr: "Animation : GSAP, Motion, Reanimated" }, used: ["redekunst", "laufwort", "sevensets", "portfolioos", "site", "aero"] },
  { name: { en: "3D: three.js, React Three Fiber", fr: "3D : three.js, React Three Fiber" }, used: ["aero", "site"] },
  { name: { en: "Accessibility, WCAG 2.2", fr: "Accessibilité, WCAG 2.2" }, used: ["sevensets", "site"] },
  { name: { en: "Expo and React Native", fr: "Expo et React Native" }, used: ["laufwort", "earlier"] },
  { name: { en: "Supabase and PostgreSQL", fr: "Supabase et PostgreSQL" }, used: ["redekunst", "portfolioos"] },
  { name: { en: "Tests: Vitest, Playwright", fr: "Tests : Vitest, Playwright" }, used: ["redekunst", "sevensets", "aero"] },
  { name: { en: "Symfony and WordPress", fr: "Symfony et WordPress" }, used: ["earlier"] },
  { name: { en: "Specifications and UML", fr: "Spécifications et UML" }, used: ["earlier"] },
];

/** Listed on the user's CV without a project here to show them. */
export const alsoUsed = ["Vue.js", "Django", "Express", "Loopback 4", "MongoDB", "MySQL"];
