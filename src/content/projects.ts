import type { Locale } from "@/i18n/config";

export type Role = "frontend" | "fullstack";
export type ProjectId = "redekunst" | "laufwort" | "sevensets" | "portfolioos" | "aero";
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
  stack: string[];
  /** Public links; Redekunst has neither (not deployed, private repository). */
  links?: { live?: string; code?: string };
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
    stack: ["Expo SDK 57", "Expo Router", "Reanimated 4", "TypeScript"],
    links: { live: "https://romaricsoh-laufwort.vercel.app", code: "https://github.com/laslande24/laufwort" },
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
    stack: ["Next.js 16", "GSAP", "Lenis", "Playwright"],
    links: { live: "https://romaricsoh-7sets.vercel.app", code: "https://github.com/laslande24/7sets" },
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
    stack: ["React 19", "Vite", "GSAP", "Supabase", "Tailwind"],
    links: { live: "https://romaricsoh-os.vercel.app", code: "https://github.com/laslande24/portfolio-os" },
  },
  {
    id: "aero",
    name: "Aéro",
    object: "window",
    label: "aero-jet-configurator",
    screen: { src: "/projects/aero/exterior.png", width: 1280, height: 800 },
    year: "2026",
    kind: { en: "Booking app", fr: "App de réservation" },
    status: { en: "Front-end demo, live", fr: "Démo front-end, en ligne" },
    summary: {
      en: "Private jet booking in 3D: compare two aircraft, walk through the cabin, pick a seat and book it. The page opens flat in 2D and loads the 3D on demand.",
      fr: "Réservation de jet privé en 3D : comparer deux appareils, visiter la cabine, choisir un siège et le réserver. La page s'ouvre à plat en 2D et charge la 3D à la demande.",
    },
    stack: ["React 19", "React Three Fiber", "GSAP", "Zustand", "Playwright"],
    links: { live: "https://romaricsoh-aero.vercel.app", code: "https://github.com/laslande24/aero-jet-configurator" },
  },
];

export const projectById = Object.fromEntries(projects.map((p) => [p.id, p])) as Record<
  ProjectId,
  Project
>;
