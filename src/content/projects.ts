import type { Locale } from "@/i18n/config";

export type Role = "frontend" | "fullstack";
export type ProjectId = "redekunst" | "laufwort" | "sevensets" | "portfolioos";
type Text = Record<Locale, string>;

export type Project = {
  id: ProjectId;
  name: string;
  /** What the object on the bench is: a browser window or a phone. */
  object: "window" | "phone";
  /** Title-bar label for windows (the project slug, not a URL). */
  label: string;
  /** Real capture of the product. */
  screen: { src: string; width: number; height: number };
  year: string;
  kind: Text;
  status: Text;
  summary: Text;
  angle: Record<Role, Text>;
  stack: string[];
};

export const projects: Project[] = [
  {
    id: "redekunst",
    name: "Redekunst-Challenge",
    object: "window",
    label: "redekunst-challenge",
    screen: { src: "/projects/redekunst/home.png", width: 1280, height: 800 },
    year: "2026",
    kind: { en: "Web platform", fr: "Plateforme web" },
    status: { en: "Complete, not deployed", fr: "Terminée, pas mise en ligne" },
    summary: {
      en: "Registrations and live public voting for a German-language debate contest at FLCS. One QR code for the audience, one projection screen for the room.",
      fr: "Inscriptions et vote du public en direct pour un concours de débat en allemand à la FLCS. Un seul QR code pour le public, un écran de projection pour la salle.",
    },
    angle: {
      frontend: {
        en: "A full event identity, light and dark themes, a projection screen that updates as votes arrive.",
        fr: "Une identité d'événement complète, thèmes clair et sombre, un écran de projection qui bouge au rythme des votes.",
      },
      fullstack: {
        en: "Postgres with row-level security, registrations validated by organisers, live voting over Supabase Realtime, free hosting.",
        fr: "Postgres avec sécurité au niveau des lignes, inscriptions validées par les organisateurs, vote en direct avec Supabase Realtime, hébergement gratuit.",
      },
    },
    stack: ["Next.js 16", "Supabase", "Realtime", "Tailwind", "Vercel"],
  },
  {
    id: "laufwort",
    name: "Laufwort",
    object: "phone",
    label: "laufwort",
    screen: { src: "/projects/laufwort/home.png", width: 780, height: 1782 },
    year: "2026",
    kind: { en: "Mobile app", fr: "App mobile" },
    status: { en: "Interface done, backend next", fr: "Interface terminée, backend à venir" },
    summary: {
      en: "Practise German while you run. Lessons are spoken aloud, you answer out loud, and the session adapts to your effort.",
      fr: "Pratiquer l'allemand en courant. Les leçons sont dites à voix haute, tu réponds à l'oral, et la séance s'adapte à ton effort.",
    },
    angle: {
      frontend: {
        en: "A very animated native interface: 3D tilt cards, spring presses, haptics, a lesson player.",
        fr: "Une interface native très animée : cartes inclinables en 3D, pressions à ressort, retours haptiques, lecteur de leçon.",
      },
      fullstack: {
        en: "Native German speech synthesis and voice recording today; Supabase auth and heart rate are next.",
        fr: "Synthèse vocale allemande et enregistrement de la voix déjà en place ; authentification Supabase et fréquence cardiaque ensuite.",
      },
    },
    stack: ["Expo SDK 57", "Expo Router", "Reanimated 4", "TypeScript"],
  },
  {
    id: "sevensets",
    name: "7SETS",
    object: "window",
    label: "7sets",
    screen: { src: "/projects/7sets/hero.png", width: 1274, height: 812 },
    year: "2026",
    kind: { en: "Landing page", fr: "Landing page" },
    status: { en: "Concept, fictional academy", fr: "Concept, académie fictive" },
    summary: {
      en: "A landing page for a tennis academy, built from a designer's mockup. The page scrolls like a match: seven sets and a live scoreboard.",
      fr: "Une landing page pour une académie de tennis, construite d'après la maquette d'un designer. La page défile comme un match : sept sets et un tableau de score.",
    },
    angle: {
      frontend: {
        en: "True to the mockup, GSAP scroll choreography, WCAG 2.2 AA, a 130 kB JavaScript budget, Playwright visual tests.",
        fr: "Fidèle à la maquette, chorégraphie de scroll GSAP, WCAG 2.2 AA, budget JavaScript de 130 Ko, tests visuels Playwright.",
      },
      fullstack: {
        en: "A booking form validated end to end with Zod, and an automated test suite run against the production build.",
        fr: "Un formulaire de réservation validé de bout en bout avec Zod, et des tests automatisés lancés sur le build de production.",
      },
    },
    stack: ["Next.js 16", "GSAP", "Lenis", "Playwright"],
  },
  {
    id: "portfolioos",
    name: "PortfolioOS",
    object: "window",
    label: "portfolio-os",
    screen: { src: "/projects/portfolio-os/desktop.png", width: 1280, height: 800 },
    year: "2026",
    kind: { en: "Interactive portfolio", fr: "Portfolio interactif" },
    status: { en: "Previous version, replaced by this site", fr: "Version précédente, remplacée par ce site" },
    summary: {
      en: "My previous portfolio, built as a desktop operating system in the browser: windows you drag and resize, a dock, a terminal that answers commands.",
      fr: "Mon ancien portfolio, pensé comme un système d'exploitation dans le navigateur : des fenêtres qu'on déplace et redimensionne, un dock, un terminal qui répond aux commandes.",
    },
    angle: {
      frontend: {
        en: "A window manager written without a UI library: drag, resize, minimise, focus order. GSAP boot sequence and dock magnification.",
        fr: "Un gestionnaire de fenêtres écrit sans bibliothèque d'interface : déplacement, redimensionnement, réduction, ordre de focus. Démarrage et loupe du dock animés avec GSAP.",
      },
      fullstack: {
        en: "Contact messages stored in Postgres through Supabase, insert-only row-level security, anonymous page views, email fallback without a backend.",
        fr: "Messages de contact enregistrés dans Postgres via Supabase, sécurité au niveau des lignes en écriture seule, visites anonymes, repli sur l'e-mail sans backend.",
      },
    },
    stack: ["React 19", "Vite", "GSAP", "Supabase", "Tailwind"],
  },
];

export const projectById = Object.fromEntries(projects.map((p) => [p.id, p])) as Record<
  ProjectId,
  Project
>;
