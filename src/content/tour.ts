import type { Locale } from "@/i18n/config";
import type { ProjectId } from "@/content/projects";
import { alsoUsed, education, experience, type Job } from "@/content/profile";

/**
 * Everything on the bench: a device for each project, then the papers of the
 * path at the far end (a work badge, a notebook, a degree, a certificate).
 */
export type DeviceKind = "phone" | "laptop" | "tablet" | "display" | "badge" | "notebook" | "diploma" | "certificate";
type PaperKind = Extract<DeviceKind, "badge" | "notebook" | "diploma" | "certificate">;

/**
 * One step of a stop. On a device, `screen` is what it shows while this text
 * is read; `kicker` is a step's own role and dates, when it has any.
 */
export type Beat = { screen?: string; alt?: string; kicker?: string; title: string; body: string };

export type StopCopy = { id: ProjectId; device: Exclude<DeviceKind, PaperKind>; beats: Beat[] };

/** A chapter of the path: one paper, and the tools that went with it. */
export type ChapterCopy = { id: string; device: PaperKind; kicker: string; beats: Beat[]; tools?: string[] };

export type TourCopy = {
  role: string;
  cue: string;
  hintMouse: string;
  hintTouch: string;
  caseStudy: string;
  /** Walking order along the bench: the projects, then the path. */
  stops: StopCopy[];
  path: ChapterCopy[];
  contact: { kicker: string; title: string; lead: string; copy: string; copied: string; cv: string };
  end: string;
  also: string;
};

/* ---------- The path, read from the same facts as the CV ---------- */

const [afreetech, qta, peexit] = experience;
const job = (j: Job, lang: Locale) => `${j.role[lang]}, ${j.place}, ${j.dates[lang]}`;
/** "MINT weather project: wrote the…" → a step titled by its project. */
const step = (point: string): Beat => {
  const i = point.indexOf(":");
  const body = point.slice(i + 1).trim();
  return { title: point.slice(0, i).trim(), body: body[0].toUpperCase() + body.slice(1) };
};

function path(
  lang: Locale,
  t: { afreetech: string; education: string; degree: string; languages: string; german: string },
): ChapterCopy[] {
  const [pagirn, mint, eagles] = afreetech.points[lang];
  return [
    {
      id: "afreetech",
      device: "badge",
      kicker: job(afreetech, lang),
      // The badge turns over on the last step: its back lists these
      tools: afreetech.tools,
      beats: [{ title: afreetech.org, body: `${t.afreetech} ${pagirn}` }, step(mint), step(eagles)],
    },
    {
      id: "internships",
      device: "notebook",
      kicker: job(qta, lang),
      tools: [...qta.tools, ...peexit.tools],
      beats: [
        { title: qta.org, body: qta.points[lang][0] },
        { kicker: job(peexit, lang), title: peexit.org, body: peexit.points[lang][0] },
      ],
    },
    {
      id: "education",
      device: "diploma",
      kicker: t.education,
      beats: [{ title: "Bachelor of Engineering", body: t.degree }],
    },
    {
      id: "languages",
      device: "certificate",
      kicker: t.languages,
      beats: [{ title: "Goethe-Zertifikat B2", body: t.german }],
    },
  ];
}

const s = {
  laufwort: {
    welcome: "/projects/laufwort/welcome.png",
    lesson: "/projects/laufwort/lesson.png",
    flow: "/projects/laufwort/flow.png",
    progress: "/projects/laufwort/progress.png",
  },
  redekunst: { home: "/projects/redekunst/home.png", inscription: "/projects/redekunst/inscription.png" },
  sevensets: { hero: "/projects/7sets/hero.png", programs: "/projects/7sets/programs.png", courts: "/projects/7sets/courts.png" },
  portfolioos: {
    desktop: "/projects/portfolio-os/desktop.png",
    projects: "/projects/portfolio-os/projects.png",
    about: "/projects/portfolio-os/about.png",
  },
};

export const tour: Record<Locale, TourCopy> = {
  en: {
    role: "Front-end and full-stack developer. I design the apps I build, for the web and for phones.",
    cue: "Scroll to walk along the bench",
    hintMouse: "Drag the phone to turn it",
    hintTouch: "Swipe the phone sideways to turn it",
    caseStudy: "Read the case study",
    stops: [
      {
        id: "laufwort",
        device: "phone",
        beats: [
          {
            screen: s.laufwort.welcome,
            alt: "Laufwort welcome screen with the sign-up options",
            title: "Laufwort",
            body: "Practise German while you run. Lessons are spoken aloud, you answer out loud, and the session adapts to your effort.",
          },
          {
            screen: s.laufwort.lesson,
            alt: "Lesson player: the phrase “Ich laufe jeden Morgen.”, a voice waveform and the record button",
            title: "The phrase is spoken, you answer out loud",
            body: "The lesson player reads each German phrase aloud. The microphone records your answer and plays it back.",
          },
          {
            screen: s.laufwort.flow,
            alt: "Effort flow: warm-up, build, peak and recovery, each with a duration and a target heart rate",
            title: "Breath sets the pace",
            body: "Warm-up, build, peak and recovery. At the peak you are out of breath, so each phrase gets six seconds instead of four.",
          },
          {
            screen: s.laufwort.progress,
            alt: "Progress screen with the week's stats and word mastery",
            title: "An app that answers the hand",
            body: "Cards tilt in 3D under the finger, presses spring back, counters count up. Built with Expo for iOS, Android and the web.",
          },
        ],
      },
      {
        id: "redekunst",
        device: "laptop",
        beats: [
          {
            screen: s.redekunst.home,
            alt: "Redekunst-Challenge home page, with the event title and the buttons to register or book a seat",
            title: "Redekunst-Challenge",
            body: "Registrations and live public voting for a German-language debate contest at FLCS. One QR code for the audience, one projection screen for the room.",
          },
          {
            screen: s.redekunst.inscription,
            alt: "Speaker registration form, with the payment and validation steps beside it",
            title: "Rules held by the database, not by the form",
            body: "Speakers register themselves. Row-level security in Postgres lets a visitor create a pending registration and nothing more, until the organisers confirm the 10,000 FCFA fee.",
          },
        ],
      },
      {
        id: "sevensets",
        device: "tablet",
        beats: [
          {
            screen: s.sevensets.hero,
            alt: "7SETS hero: the headline over a tennis court photo, with the summer camp card",
            title: "7SETS",
            body: "A landing page for a fictional tennis academy. A designer drew the hero; the rest of the page had to speak the same language.",
          },
          {
            screen: s.sevensets.programs,
            alt: "Programmes section: one card per programme with age range, session length, coach ratio and price",
            title: "The page plays like a match",
            body: "Seven sections, seven sets. A score rail on the right counts each one as you scroll: 0, 15, 30, 40, game.",
          },
          {
            screen: s.sevensets.courts,
            alt: "Courts section: a photo grid of the academy's hard and clay courts",
            title: "The mockup is the spec",
            body: "Every measurement was sampled from the mockup, within 5.2 px. One rule lost: white on lime read 2.0:1, so the label became ink on lime, 9.45:1.",
          },
        ],
      },
      {
        id: "portfolioos",
        device: "display",
        beats: [
          {
            screen: s.portfolioos.desktop,
            alt: "PortfolioOS desktop with the terminal and the settings window open",
            title: "PortfolioOS",
            body: "My previous portfolio, built as a desktop operating system in the browser: windows you drag and resize, a dock, a terminal that answers commands.",
          },
          {
            screen: s.portfolioos.projects,
            alt: "Projects window with Redekunst-Challenge, Laufwort and 7SETS as cards, the dock below",
            title: "A window manager without a UI library",
            body: "Drag, resize, minimise, focus order and cascading positions, all in one reducer. The dock magnifies icons under the cursor.",
          },
          {
            screen: s.portfolioos.about,
            alt: "About window with the profile, the links and the skills grouped by area",
            title: "Where the metaphor stops",
            body: "A desktop needs a pointer, so phones got their own single-column layout. This site keeps what worked, objects you handle directly, and builds it for touch first.",
          },
        ],
      },
    ],
    path: path("en", {
      afreetech: "Ten months on public-sector platforms in Cameroon.",
      education: `Education, ${education.years}`,
      degree: `Computer Science. ${education.school.en}.`,
      languages: "Languages",
      german: "German, certified in 2026. French is my native language, and my English is fluent.",
    }),
    contact: {
      kicker: "Contact",
      title: "Write to me",
      lead: "Email is the quickest way to reach me, in French, English or German.",
      copy: "Copy",
      copied: "Copied",
      cv: "Open the CV",
    },
    end: "Everything on the bench",
    also: `Also used: ${alsoUsed.join(", ")}`,
  },
  fr: {
    role: "Développeur front-end et full-stack. Je dessine les apps que je code, pour le web et pour le téléphone.",
    cue: "Défile pour parcourir l'établi",
    hintMouse: "Fais glisser le téléphone pour le tourner",
    hintTouch: "Glisse le téléphone de côté pour le tourner",
    caseStudy: "Lire l'étude de cas",
    stops: [
      {
        id: "laufwort",
        device: "phone",
        beats: [
          {
            screen: s.laufwort.welcome,
            alt: "Écran d'accueil de Laufwort avec les options d'inscription",
            title: "Laufwort",
            body: "Pratiquer l'allemand en courant. Les leçons sont dites à voix haute, tu réponds à l'oral, et la séance s'adapte à ton effort.",
          },
          {
            screen: s.laufwort.lesson,
            alt: "Lecteur de leçon : la phrase « Ich laufe jeden Morgen. », une onde de voix et le bouton d'enregistrement",
            title: "La phrase est dite, tu réponds à voix haute",
            body: "Le lecteur de leçon dit chaque phrase allemande à voix haute. Le micro enregistre ta réponse et te la fait réécouter.",
          },
          {
            screen: s.laufwort.flow,
            alt: "Flux d'effort : échauffement, montée, pic et récupération, chacun avec sa durée et son pouls cible",
            title: "Le souffle décide du rythme",
            body: "Échauffement, montée, pic et récupération. Au pic, tu es essoufflé : chaque phrase te laisse six secondes au lieu de quatre.",
          },
          {
            screen: s.laufwort.progress,
            alt: "Écran de progression avec les statistiques de la semaine et la maîtrise des mots",
            title: "Une app qui répond à la main",
            body: "Les cartes s'inclinent en 3D sous le doigt, les pressions reviennent en ressort, les compteurs défilent. Construite avec Expo pour iOS, Android et le web.",
          },
        ],
      },
      {
        id: "redekunst",
        device: "laptop",
        beats: [
          {
            screen: s.redekunst.home,
            alt: "Page d'accueil de Redekunst-Challenge, avec le titre de l'événement et les boutons pour s'inscrire ou réserver une place",
            title: "Redekunst-Challenge",
            body: "Inscriptions et vote du public en direct pour un concours de débat en allemand à la FLCS. Un seul QR code pour le public, un écran de projection pour la salle.",
          },
          {
            screen: s.redekunst.inscription,
            alt: "Formulaire d'inscription des orateurs, avec les étapes de paiement et de validation à côté",
            title: "Des règles tenues par la base, pas par le formulaire",
            body: "Les orateurs s'inscrivent eux-mêmes. La sécurité au niveau des lignes de Postgres ne laisse un visiteur créer qu'une inscription en attente, jusqu'à ce que les organisateurs confirment les 10 000 FCFA.",
          },
        ],
      },
      {
        id: "sevensets",
        device: "tablet",
        beats: [
          {
            screen: s.sevensets.hero,
            alt: "Haut de page de 7SETS : le titre sur la photo d'un court, avec la carte du stage d'été",
            title: "7SETS",
            body: "Une landing page pour une académie de tennis fictive. Un designer a dessiné le haut de page ; le reste devait parler la même langue.",
          },
          {
            screen: s.sevensets.programs,
            alt: "Section des programmes : une carte par programme avec la tranche d'âge, la durée, le ratio d'encadrement et le prix",
            title: "La page se joue comme un match",
            body: "Sept sections, sept sets. Un rail de score à droite les compte au fil du défilement : 0, 15, 30, 40, jeu.",
          },
          {
            screen: s.sevensets.courts,
            alt: "Section des courts : une grille de photos des courts en dur et en terre battue",
            title: "La maquette fait foi",
            body: "Chaque mesure a été relevée sur la maquette, à 5,2 px près. Une seule règle a cédé : le blanc sur vert citron faisait 2,0:1, le texte est passé en encre, 9,45:1.",
          },
        ],
      },
      {
        id: "portfolioos",
        device: "display",
        beats: [
          {
            screen: s.portfolioos.desktop,
            alt: "Bureau de PortfolioOS avec le terminal et la fenêtre des réglages ouverts",
            title: "PortfolioOS",
            body: "Mon ancien portfolio, pensé comme un système d'exploitation dans le navigateur : des fenêtres qu'on déplace et redimensionne, un dock, un terminal qui répond aux commandes.",
          },
          {
            screen: s.portfolioos.projects,
            alt: "Fenêtre Projets avec Redekunst-Challenge, Laufwort et 7SETS en cartes, le dock en dessous",
            title: "Un gestionnaire de fenêtres sans bibliothèque",
            body: "Déplacement, redimensionnement, réduction, ordre de focus et positions en cascade, le tout dans un seul reducer. Le dock grossit les icônes sous le curseur.",
          },
          {
            screen: s.portfolioos.about,
            alt: "Fenêtre À propos avec le profil, les liens et les compétences par domaine",
            title: "Là où la métaphore s'arrête",
            body: "Un bureau demande un pointeur : les téléphones ont donc eu leur propre mise en page en une colonne. Ce site garde ce qui marchait, des objets qu'on manipule, et le construit d'abord pour le tactile.",
          },
        ],
      },
    ],
    path: path("fr", {
      afreetech: "Dix mois sur des plateformes publiques au Cameroun.",
      education: `Formation, ${education.years}`,
      degree: `Informatique. ${education.school.fr}.`,
      languages: "Langues",
      german: "L'allemand, certifié en 2026. Le français est ma langue maternelle, et je parle couramment anglais.",
    }),
    contact: {
      kicker: "Contact",
      title: "Écris-moi",
      lead: "Le plus rapide, c'est l'e-mail, en français, en anglais ou en allemand.",
      copy: "Copier",
      copied: "Copié",
      cv: "Ouvrir le CV",
    },
    end: "Tout ce qui est sur l'établi",
    also: `Aussi utilisés : ${alsoUsed.join(", ")}`,
  },
};
