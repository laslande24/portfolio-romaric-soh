import type { Locale } from "@/i18n/config";
import type { ProjectId, Role } from "./projects";

type Text = Record<Locale, string>;

/** A screen shown in the case study, in the frame of the device it runs on. */
export type Media = {
  src: string;
  width: number;
  height: number;
  device: "window" | "phone";
  /** Window title-bar label. */
  label?: string;
  alt: Text;
  caption: Text;
};

type Copy = {
  /** What Romaric did on the project. */
  role: string;
  brief: string[];
  angles: Record<Role, { title: string; points: string[] }>;
  /** One decision or bug worth telling in full. */
  story: { title: string; body: string[] };
  now: string[];
  credit?: string;
};

export type CaseStudy = {
  /** URL segment: /[lang]/work/[slug] */
  slug: string;
  /** Alt text for the hero capture (the project's bench screen). */
  heroAlt: Text;
  /** Screens after the hero capture. */
  media: Media[];
  copy: Record<Locale, Copy>;
};

export const caseStudies: Record<ProjectId, CaseStudy> = {
  redekunst: {
    slug: "redekunst-challenge",
    heroAlt: {
      en: "Redekunst-Challenge home page, with the event title and the buttons to register or book a seat",
      fr: "Accueil de Redekunst-Challenge, avec le titre de l'événement et les boutons pour s'inscrire ou réserver une place",
    },
    media: [],
    copy: {
      en: {
        role: "Design and development",
        brief: [
          "FLCS, a language centre, runs Redekunst-Challenge: a national debate contest in German at B2 level, fought in knockout duels between a PRO and a CONTRA speaker.",
          "The organisers asked for two things. Learners register themselves and stay pending until the team confirms the 10,000 FCFA fee paid in person. And the audience votes for its favourite speaker, with the result on the big screen as votes come in. There was no budget, so everything runs on free tiers.",
        ],
        angles: {
          frontend: {
            title: "A projection screen the room can read from the back",
            points: [
              "The live screen is a dark full-screen view: the current duel, two bars that grow with each vote, the vote count and the QR code to scan.",
              "One QR code for the whole event. It always opens the duel being voted on, and changes by itself when the organisers open the next vote. Nobody reloads.",
              "The bracket is drawn as a tree, first round on the left and final on the right, scrolling sideways on phones.",
              "Light and dark themes, loading skeletons, and the reduced-motion setting honoured across the site.",
            ],
          },
          fullstack: {
            title: "Rules held by the database, not by the form",
            points: [
              "Row-level security in Postgres: a visitor can only create a registration marked pending, and a vote is accepted only while its duel is open, checked inside the policy.",
              "Public pages read from views that expose names and themes, never an email address or a phone number.",
              "Supabase Realtime pushes votes and duel changes. The live screen also re-syncs from the vote totals on every reconnection and every 8 seconds, so a dropped connection cannot leave a wrong count on screen.",
              "The bracket builds itself: validated speakers are drawn at random, byes are added when the count is not a power of two, winners move up by formula. Covered by tests from 2 to 40 speakers.",
              "Two admin roles, CSV export of registrations, spam traps on the public forms.",
            ],
          },
        },
        story: {
          title: "One room, one IP address",
          body: [
            "The first rate limit on voting was keyed on IP address and browser: five votes per fifteen minutes. In a venue, the whole audience goes out through one public IP, often on the same phone models. The sixth person in the room would have been told they had voted too often.",
            "A second flaw sat underneath. A new device ID was generated on every vote, so the database rule of one vote per device per duel could never trigger.",
            "The fix gives each phone a stable, signed device ID in an httpOnly cookie, limits votes per device instead of per IP, and lets the unique constraint in Postgres catch double taps and replays.",
          ],
        },
        now: [
          "The platform is complete and builds cleanly, but it was never put online.",
          "Before a real event it would need a jury scoring sheet, automatic emails, and stronger vote integrity for a final: today a determined voter can vote again from another browser.",
        ],
      },
      fr: {
        role: "Conception et développement",
        brief: [
          "La FLCS, un centre de langues, organise le Redekunst-Challenge : un concours national de débat en allemand de niveau B2, en duels à élimination directe entre un orateur PRO et un orateur CONTRA.",
          "Les organisateurs voulaient deux choses. Que les apprenants s'inscrivent eux-mêmes et restent en attente jusqu'à ce que l'équipe confirme les 10 000 FCFA payés sur place. Et que le public vote pour son orateur préféré, avec le résultat sur grand écran au fil des votes. Sans budget, tout tourne sur des offres gratuites.",
        ],
        angles: {
          frontend: {
            title: "Un écran de projection lisible du fond de la salle",
            points: [
              "L'écran live est une vue sombre en plein écran : le duel en cours, deux barres qui montent à chaque vote, le nombre de voix et le QR code à scanner.",
              "Un seul QR code pour tout l'événement. Il ouvre toujours le duel en cours de vote et change tout seul quand les organisateurs ouvrent le vote suivant. Personne ne recharge la page.",
              "Le tableau du tournoi est dessiné en arbre, premier tour à gauche et finale à droite, avec un défilement horizontal sur téléphone.",
              "Thèmes clair et sombre, squelettes de chargement, et le réglage « réduire les animations » respecté sur tout le site.",
            ],
          },
          fullstack: {
            title: "Des règles tenues par la base, pas par le formulaire",
            points: [
              "Sécurité au niveau des lignes dans Postgres : un visiteur ne peut créer qu'une inscription en attente, et un vote n'est accepté que si son duel est ouvert, vérifié dans la règle elle-même.",
              "Les pages publiques lisent des vues qui montrent les noms et les thèmes, jamais une adresse e-mail ni un numéro de téléphone.",
              "Supabase Realtime transmet les votes et les changements de duel. L'écran live se recale aussi sur les totaux à chaque reconnexion et toutes les 8 secondes : une connexion coupée ne peut pas laisser un faux score à l'écran.",
              "Le tableau se construit tout seul : tirage au sort des orateurs validés, exempts ajoutés quand le nombre n'est pas une puissance de 2, vainqueurs qui montent par formule. Couvert par des tests de 2 à 40 orateurs.",
              "Deux rôles d'administration, export CSV des inscriptions, pièges à robots sur les formulaires publics.",
            ],
          },
        },
        story: {
          title: "Une salle, une seule adresse IP",
          body: [
            "La première limite sur le vote se basait sur l'adresse IP et le navigateur : cinq votes par quart d'heure. Dans une salle, tout le public sort par la même adresse IP publique, souvent avec les mêmes modèles de téléphone. La sixième personne aurait lu qu'elle avait trop voté.",
            "Un deuxième défaut se cachait dessous. Un nouvel identifiant d'appareil était créé à chaque vote, donc la règle « un vote par appareil et par duel » ne pouvait jamais se déclencher.",
            "La correction donne à chaque téléphone un identifiant stable et signé dans un cookie httpOnly, limite les votes par appareil au lieu de l'IP, et laisse la contrainte d'unicité de Postgres arrêter les doubles appuis et les rejeux.",
          ],
        },
        now: [
          "La plateforme est terminée et le build passe, mais elle n'a jamais été mise en ligne.",
          "Avant un vrai événement, il lui faudrait une grille de notation du jury, des e-mails automatiques et un vote mieux protégé pour une finale : aujourd'hui, un votant décidé peut revoter depuis un autre navigateur.",
        ],
      },
    },
  },

  laufwort: {
    slug: "laufwort",
    heroAlt: {
      en: "Laufwort home screen, with today's session and the phrases of the day",
      fr: "Écran d'accueil de Laufwort, avec la séance du jour et les phrases du jour",
    },
    media: [
      {
        src: "/projects/laufwort/lesson.png",
        width: 780,
        height: 1782,
        device: "phone",
        alt: {
          en: "Laufwort lesson player: the German phrase \"Ich laufe jeden Morgen.\" with its translation, a voice waveform, cadence, heart rate and the record button",
          fr: "Lecteur de leçon de Laufwort : la phrase allemande « Ich laufe jeden Morgen. » avec sa traduction, une onde de voix, la cadence, le pouls et le bouton d'enregistrement",
        },
        caption: { en: "Lesson player", fr: "Lecteur de leçon" },
      },
      {
        src: "/projects/laufwort/flow.png",
        width: 780,
        height: 1782,
        device: "phone",
        alt: {
          en: "Laufwort effort flow: warm-up, build, peak and recovery, each with its duration and target heart rate",
          fr: "Flux d'effort de Laufwort : échauffement, montée, pic et récupération, chacun avec sa durée et son pouls cible",
        },
        caption: { en: "Effort flow", fr: "Flux d'effort" },
      },
      {
        src: "/projects/laufwort/welcome.png",
        width: 780,
        height: 1782,
        device: "phone",
        alt: { en: "Laufwort welcome screen with the sign-up options", fr: "Écran d'accueil de Laufwort avec les options d'inscription" },
        caption: { en: "Welcome and sign-up", fr: "Accueil et inscription" },
      },
      {
        src: "/projects/laufwort/progress.png",
        width: 780,
        height: 1782,
        device: "phone",
        alt: { en: "Laufwort progress screen with weekly stats and phrase mastery", fr: "Écran de progression de Laufwort avec les statistiques de la semaine et la maîtrise des phrases" },
        caption: { en: "Progress", fr: "Progression" },
      },
    ],
    copy: {
      en: {
        role: "Design and development",
        brief: [
          "Laufwort is a German practice app for runners. Phrases are spoken aloud while you run, you repeat them out loud, and the session follows your effort.",
          "This first phase is the interface: five screens with real speech and recording, and simulated running data, to judge the feel before building the backend.",
        ],
        angles: {
          frontend: {
            title: "An app that answers the hand",
            points: [
              "Five screens: welcome and sign-up, today's session, progress, the lesson player and the effort flow.",
              "Reanimated 4 and Gesture Handler: cards that tilt in 3D under the finger, presses that spring back, counters that count up.",
              "Haptic feedback on the moments that matter, and a waveform while you speak.",
            ],
          },
          fullstack: {
            title: "The voice first, the data next",
            points: [
              "German speech synthesis reads every phrase aloud.",
              "The microphone records your answer and plays it back.",
              "Next: Supabase for accounts and lessons, heart rate from HealthKit and Health Connect, and scoring of the spoken answer.",
            ],
          },
        },
        story: {
          title: "Breath sets the pace",
          body: [
            "A session runs in four phases: warm-up, build, peak and recovery, each with a target cadence and heart rate.",
            "At the peak you are out of breath, so the app leaves you more time to repeat each phrase: six seconds instead of four. The lesson adapts to the run, not the other way round.",
            "In the demo every phase lasts seconds instead of minutes, so the whole session can be judged in four minutes.",
          ],
        },
        now: [
          "The interface is built with Expo for iOS, Android and the web. Running data, accounts and statistics are simulated for now.",
          "Heart rate needs a development build rather than Expo Go; that comes with the backend.",
        ],
        credit: "Visual inspiration: a running app concept by Emote Agency on Dribbble.",
      },
      fr: {
        role: "Conception et développement",
        brief: [
          "Laufwort est une app pour pratiquer l'allemand en courant. Les phrases sont dites à voix haute pendant la course, tu les répètes à l'oral, et la séance suit ton effort.",
          "Cette première phase, c'est l'interface : cinq écrans avec une vraie voix et un vrai enregistrement, et des données de course simulées, pour juger la sensation avant de construire le backend.",
        ],
        angles: {
          frontend: {
            title: "Une app qui répond à la main",
            points: [
              "Cinq écrans : accueil et inscription, séance du jour, progression, lecteur de leçon et flux d'effort.",
              "Reanimated 4 et Gesture Handler : des cartes qui s'inclinent en 3D sous le doigt, des pressions qui reviennent en ressort, des compteurs qui défilent.",
              "Des retours haptiques aux moments qui comptent, et une onde sonore pendant que tu parles.",
            ],
          },
          fullstack: {
            title: "La voix d'abord, les données ensuite",
            points: [
              "La synthèse vocale allemande lit chaque phrase à voix haute.",
              "Le micro enregistre ta réponse et te la fait réécouter.",
              "Ensuite : Supabase pour les comptes et les leçons, la fréquence cardiaque via HealthKit et Health Connect, et l'évaluation de la réponse orale.",
            ],
          },
        },
        story: {
          title: "Le souffle décide du rythme",
          body: [
            "Une séance compte quatre phases : échauffement, montée, pic et récupération, chacune avec une cadence et une fréquence cardiaque cibles.",
            "Au pic, tu es essoufflé : l'app te laisse donc plus de temps pour répéter chaque phrase, six secondes au lieu de quatre. La leçon s'adapte à la course, pas l'inverse.",
            "Dans la démo, chaque phase dure des secondes au lieu de minutes : on juge une séance entière en quatre minutes.",
          ],
        },
        now: [
          "L'interface est construite avec Expo pour iOS, Android et le web. Les données de course, les comptes et les statistiques sont simulés pour l'instant.",
          "La fréquence cardiaque demande une build de développement plutôt qu'Expo Go ; elle arrivera avec le backend.",
        ],
        credit: "Inspiration visuelle : un concept d'app de course par Emote Agency sur Dribbble.",
      },
    },
  },

  sevensets: {
    slug: "7sets",
    heroAlt: {
      en: "7SETS hero: the headline over a tennis court photo, with the summer camp card",
      fr: "Haut de page de 7SETS : le titre sur une photo de court de tennis, avec la carte du stage d'été",
    },
    media: [
      {
        src: "/projects/7sets/programs.png",
        width: 1440,
        height: 900,
        device: "window",
        label: "7sets",
        alt: {
          en: "7SETS programmes section: one card per programme with age range, session length, coach ratio, frequency and price",
          fr: "Section programmes de 7SETS : une carte par programme avec la tranche d'âge, la durée de séance, le ratio d'encadrement, la fréquence et le prix",
        },
        caption: { en: "Set 03, the programmes", fr: "Set 03, les programmes" },
      },
      {
        src: "/projects/7sets/courts.png",
        width: 1440,
        height: 900,
        device: "window",
        label: "7sets",
        alt: {
          en: "7SETS courts section: a photo grid of the academy's hard and clay courts",
          fr: "Section courts de 7SETS : une grille de photos des courts en dur et en terre battue",
        },
        caption: { en: "Set 06, the courts", fr: "Set 06, les courts" },
      },
      {
        src: "/projects/7sets/hero-phone.png",
        width: 346,
        height: 846,
        device: "phone",
        alt: { en: "7SETS hero on a phone, with the headline over the tennis court photo", fr: "Le haut de page de 7SETS sur téléphone, titre posé sur la photo du court" },
        caption: { en: "The hero on a phone", fr: "Le haut de page sur téléphone" },
      },
    ],
    copy: {
      en: {
        role: "Front-end development from a designer's mockup",
        brief: [
          "7SETS is a fictional tennis academy. A designer drew the hero; the rest of the page had to be built in the same language.",
          "The page plays like a match. Its seven sections are seven sets, and a score rail on the right counts each one: 0, 15, 30, 40, game.",
        ],
        angles: {
          frontend: {
            title: "The mockup is the spec",
            points: [
              "Every measurement was sampled from the mockup with a pixel script, then checked in the browser. The largest gap left in the hero is 5.2 px on an 812 px plate.",
              "GSAP and Lenis run the scroll choreography. Durations and curves are read from the same CSS tokens as the transitions, so changing a token moves both.",
              "Only transform and opacity are animated, with one documented exception. Under reduced motion every element lands in its final state, never hidden.",
              "No UI library, and a 130 kB budget for the initial JavaScript.",
            ],
          },
          fullstack: {
            title: "A page you can trust to keep working",
            points: [
              "A booking form validated with Zod.",
              "Playwright tests for the user journey, the score rail and visual snapshots, plus an axe accessibility audit.",
              "TypeScript in strict mode, no any and no ts-ignore.",
            ],
          },
        },
        story: {
          title: "The one time the mockup lost",
          body: [
            "The mockup set the main button's label in white on lime. Measured, that is 2.0:1, far below the 4.5:1 WCAG asks for text.",
            "Every other rule on the project said the mockup wins. This one did not: the label is ink on lime, 9.45:1, and the decision is written in the design notes so nobody puts the white back.",
          ],
        },
        now: [
          "Phases 0 to 6 of a 9-phase plan are done: design system, hero, full page, scroll engine, signature animations, booking form, accessibility audit and tests.",
          "Next come the final passes and a public README with Lighthouse scores.",
        ],
        credit: "Hero design: mockup by the original designer. Photos from Unsplash.",
      },
      fr: {
        role: "Intégration front-end d'après la maquette d'un designer",
        brief: [
          "7SETS est une académie de tennis fictive. Un designer a dessiné le haut de page ; le reste devait être construit dans le même langage.",
          "La page se joue comme un match. Ses sept sections sont sept sets, et un rail de score à droite compte chacun d'eux : 0, 15, 30, 40, jeu.",
        ],
        angles: {
          frontend: {
            title: "La maquette fait foi",
            points: [
              "Chaque mesure a été relevée sur la maquette avec un script de pixels, puis vérifiée dans le navigateur. Le plus grand écart restant dans le haut de page est de 5,2 px sur une plaque de 812 px.",
              "GSAP et Lenis pilotent la chorégraphie au scroll. Durées et courbes sont lues dans les mêmes jetons CSS que les transitions : changer un jeton fait bouger les deux.",
              "Seuls transform et opacity sont animés, avec une exception documentée. Avec « réduire les animations », chaque élément arrive directement à sa place, jamais caché.",
              "Aucune bibliothèque d'interface, et un budget de 130 Ko pour le JavaScript initial.",
            ],
          },
          fullstack: {
            title: "Une page qui continue de marcher",
            points: [
              "Un formulaire de réservation validé avec Zod.",
              "Des tests Playwright sur le parcours, le rail de score et des captures de référence, plus un audit d'accessibilité axe.",
              "TypeScript en mode strict, sans any ni ts-ignore.",
            ],
          },
        },
        story: {
          title: "La seule fois où la maquette a perdu",
          body: [
            "La maquette écrivait le bouton principal en blanc sur vert citron. Mesuré, ça donne 2,0:1, loin des 4,5:1 que les WCAG demandent pour du texte.",
            "Sur ce projet, la maquette gagnait toujours. Pas cette fois : le texte est en encre sur vert citron, 9,45:1, et la décision est écrite dans les notes de design pour que personne ne remette le blanc.",
          ],
        },
        now: [
          "Les phases 0 à 6 d'un plan en 9 phases sont faites : système de design, haut de page, page complète, moteur de scroll, animations signature, formulaire de réservation, audit d'accessibilité et tests.",
          "Restent les dernières passes et un README public avec les scores Lighthouse.",
        ],
        credit: "Design du haut de page : maquette du designer d'origine. Photos Unsplash.",
      },
    },
  },

  portfolioos: {
    slug: "portfolio-os",
    heroAlt: {
      en: "PortfolioOS desktop with the terminal and the settings window open",
      fr: "Bureau de PortfolioOS avec le terminal et la fenêtre des réglages ouverts",
    },
    media: [],
    copy: {
      en: {
        role: "Design and development",
        brief: [
          "Before this site, my portfolio was a desktop operating system in the browser: a boot screen, a menu bar with a clock, desktop icons, a dock, and five apps in windows: About, Projects, Terminal, Contact and Settings.",
        ],
        angles: {
          frontend: {
            title: "A window manager without a UI library",
            points: [
              "Drag, resize, minimise, maximise, focus order and cascading positions, all in one reducer.",
              "GSAP for the boot sequence and the window transitions. The dock magnifies icons under the cursor with gsap.quickTo.",
              "A terminal with command history on the arrow keys: help, whoami, skills, projects, open.",
            ],
          },
          fullstack: {
            title: "A small backend that cannot leak",
            points: [
              "Contact messages are stored in Postgres through Supabase. Row-level security allows anonymous inserts only, so nobody can read the messages without the service key.",
              "Anonymous page views are logged the same way.",
              "Without a backend configured, the contact form falls back to the visitor's email app.",
            ],
          },
        },
        story: {
          title: "Where the metaphor stops",
          body: [
            "An operating system needs a pointer: windows to drag, icons to double-click. On a phone none of that works, so phones got their own single-column layout instead of a shrunken desktop.",
            "This site keeps what worked, objects you handle directly, and builds it for touch first.",
          ],
        },
        now: ["Replaced by this site. The code stays as a reference."],
      },
      fr: {
        role: "Conception et développement",
        brief: [
          "Avant ce site, mon portfolio était un système d'exploitation dans le navigateur : un écran de démarrage, une barre de menu avec l'heure, des icônes de bureau, un dock, et cinq apps en fenêtres : À propos, Projets, Terminal, Contact et Réglages.",
        ],
        angles: {
          frontend: {
            title: "Un gestionnaire de fenêtres sans bibliothèque",
            points: [
              "Déplacement, redimensionnement, réduction, plein écran, ordre de focus et positions en cascade, le tout dans un seul reducer.",
              "GSAP pour le démarrage et les transitions de fenêtres. Le dock grossit les icônes sous le curseur avec gsap.quickTo.",
              "Un terminal avec l'historique des commandes sur les flèches : help, whoami, skills, projects, open.",
            ],
          },
          fullstack: {
            title: "Un petit backend qui ne peut pas fuiter",
            points: [
              "Les messages de contact sont enregistrés dans Postgres via Supabase. La sécurité au niveau des lignes n'autorise que l'écriture anonyme : personne ne peut lire les messages sans la clé de service.",
              "Les visites anonymes sont enregistrées de la même façon.",
              "Sans backend configuré, le formulaire de contact passe par l'app e-mail du visiteur.",
            ],
          },
        },
        story: {
          title: "Là où la métaphore s'arrête",
          body: [
            "Un système d'exploitation demande une souris : des fenêtres à déplacer, des icônes à double-cliquer. Sur téléphone, rien de tout ça ne marche, donc les téléphones avaient leur propre mise en page sur une colonne au lieu d'un bureau rétréci.",
            "Ce site garde ce qui marchait, des objets qu'on prend en main, et le construit d'abord pour le toucher.",
          ],
        },
        now: ["Remplacé par ce site. Le code reste comme référence."],
      },
    },
  },

  aero: {
    slug: "aero",
    heroAlt: {
      en: "Aéro's exterior view: the Bombardier Global 6000 in flat side profile, door open and cabin cut away, above the cabin plan",
      fr: "Vue extérieure d'Aéro : le Bombardier Global 6000 de profil, à plat, porte ouverte et cabine découpée, au-dessus du plan de cabine",
    },
    media: [
      {
        src: "/projects/aero/exterior-3d.png",
        width: 1280,
        height: 800,
        device: "window",
        label: "aero-jet-configurator",
        alt: {
          en: "The same jet as a 3D model you can orbit, stairs down and cabin cut away",
          fr: "Le même jet en modèle 3D qu'on fait tourner, escalier déployé et cabine découpée",
        },
        caption: { en: "The same jet, in 3D", fr: "Le même jet, en 3D" },
      },
      {
        src: "/projects/aero/cabin.png",
        width: 1280,
        height: 800,
        device: "window",
        label: "aero-jet-configurator",
        alt: {
          en: "Inside the cabin in 3D, the cabin plan below it with seat ML3 selected",
          fr: "L'intérieur de la cabine en 3D, le plan de cabine en dessous avec le siège ML3 sélectionné",
        },
        caption: { en: "The cabin, and seat ML3 picked on the plan", fr: "La cabine, et le siège ML3 choisi sur le plan" },
      },
      {
        src: "/projects/aero/booking.png",
        width: 1280,
        height: 800,
        device: "window",
        label: "aero-jet-configurator",
        alt: {
          en: "Booking summary: route, passenger details and the price for seat ML3",
          fr: "Récapitulatif de réservation : trajet, coordonnées du passager et prix du siège ML3",
        },
        caption: { en: "The booking summary", fr: "Le récapitulatif de réservation" },
      },
      {
        src: "/projects/aero/confirmed.png",
        width: 1280,
        height: 800,
        device: "window",
        label: "aero-jet-configurator",
        alt: {
          en: "Booking confirmed: the route, date, aircraft, seat and total paid, with the booking reference",
          fr: "Réservation confirmée : trajet, date, appareil, siège et total réglé, avec la référence de réservation",
        },
        caption: { en: "The confirmation", fr: "La confirmation" },
      },
    ],
    copy: {
      en: {
        role: "Front-end and 3D development from a Figma mockup",
        brief: [
          "Aéro is a booking site for private jets: compare the aircraft, walk through the cabin in 3D, pick a seat on the cabin plan, book the flight. It is a complete front-end demo, with fictional prices and no real payment.",
          "A Figma mockup set the direction: a lavender-grey backdrop, a warm panel, black pills for the active step, a steel-blue aircraft card. The build had to stay that calm while the 3D, the cabin and the booking went on top.",
        ],
        angles: {
          frontend: {
            title: "A 3D jet built in code",
            points: [
              "The jet is procedural: a fuselage turned from a profile, swept wings, a T-tail, rear engines, deployed stairs, a gold cheatline and the registration on the fin. No model file is downloaded.",
              "The cabin cut-away is a real hole in the hull. The fuselage is built in three parts, the middle one missing the angle of the opening, so the seats inside show through.",
              "The page opens on a flat 2D view, about 100 kB of JavaScript. three.js arrives in its own chunk only when the visitor asks for the 3D or enters the cabin.",
              "A 3D visit in four zones, each with its own furniture, materials and light. GSAP moves the camera between them, and with reduced motion each view appears without the flight.",
            ],
          },
          fullstack: {
            title: "One state for the scene, the plan and the booking",
            points: [
              "Zustand holds the aircraft, the seat and the booking step. The 3D scene and the 2D cabin plan read and write the same store, so a seat picked in one lights up in the other.",
              "Each aircraft keeps its own seat when you switch, and the booking draft survives a trip back to the cabin.",
              "Client-side validation that says what is wrong and how to fix it, and a price built from the charter rate, the seat and 12% taxes.",
              "A Playwright test walks the whole journey with 21 checks. Continuous integration replays lint, types, build and that journey on every push.",
            ],
          },
        },
        story: {
          title: "The confirmation nobody could see",
          body: [
            "The booking ends on a confirmation that animates in with GSAP. The end-to-end test kept failing there: the screen was mounted, and nothing on it was visible.",
            "In development, React's Strict Mode mounts each component twice. The first mount's gsap.from had already put the elements at their starting point, invisible, and the second mount took that as the place to end. It animated from invisible to invisible.",
            "Each animation now runs inside a gsap.context that the cleanup reverts, so the second mount starts from the real page.",
          ],
        },
        now: [
          "The front-end is complete, tested and published under the MIT licence.",
          "It is live at romaricsoh-aero.vercel.app, with an image for link previews.",
        ],
        credit: "Visual direction: a Figma mockup of a jet configurator.",
      },
      fr: {
        role: "Développement front-end et 3D d'après une maquette Figma",
        brief: [
          "Aéro est un site de réservation de jets privés : comparer les appareils, visiter la cabine en 3D, choisir un siège sur le plan de cabine, réserver le vol. C'est une démo front-end complète, avec des prix fictifs et sans paiement réel.",
          "Une maquette Figma donnait la direction : un fond gris lavande, un panneau chaud, des pastilles noires pour l'étape active, une carte avion bleu acier. Le site devait rester aussi calme une fois la 3D, la cabine et la réservation posées dessus.",
        ],
        angles: {
          frontend: {
            title: "Un jet en 3D construit en code",
            points: [
              "Le jet est procédural : un fuselage tourné à partir d'un profil, des ailes en flèche, un empennage en T, des moteurs arrière, l'escalier déployé, un liseré doré et l'immatriculation sur la dérive. Aucun fichier de modèle n'est téléchargé.",
              "La découpe de la cabine est un vrai trou dans la coque. Le fuselage est construit en trois parties, celle du milieu privée de l'angle de l'ouverture, pour qu'on voie les sièges à l'intérieur.",
              "La page s'ouvre sur une vue 2D à plat, environ 100 Ko de JavaScript. three.js arrive dans son propre morceau, seulement quand le visiteur demande la 3D ou entre dans la cabine.",
              "Une visite 3D en quatre zones, chacune avec son mobilier, ses matières et sa lumière. GSAP déplace la caméra de l'une à l'autre ; avec « réduire les animations », chaque vue apparaît sans le trajet.",
            ],
          },
          fullstack: {
            title: "Un seul état pour la scène, le plan et la réservation",
            points: [
              "Zustand garde l'appareil, le siège et l'étape de réservation. La scène 3D et le plan de cabine 2D lisent et écrivent le même store : un siège choisi dans l'un s'allume dans l'autre.",
              "Chaque appareil garde son siège quand on change d'avion, et le brouillon de réservation survit à un retour dans la cabine.",
              "Une validation côté client qui dit ce qui ne va pas et comment le corriger, et un prix calculé à partir de l'affrètement, du siège et de 12 % de taxes.",
              "Un test Playwright parcourt tout le trajet avec 21 vérifications. L'intégration continue rejoue lint, types, build et ce parcours à chaque push.",
            ],
          },
        },
        story: {
          title: "La confirmation que personne ne voyait",
          body: [
            "La réservation se termine sur une confirmation animée avec GSAP. Le test de bout en bout échouait toujours à cet endroit : l'écran était monté, et rien n'y était visible.",
            "En développement, le Strict Mode de React monte chaque composant deux fois. Le gsap.from du premier montage avait déjà placé les éléments à leur point de départ, invisibles, et le second montage l'a pris pour le point d'arrivée. L'animation allait d'invisible à invisible.",
            "Chaque animation tourne maintenant dans un gsap.context que le nettoyage annule, pour que le second montage parte de la vraie page.",
          ],
        },
        now: [
          "Le front-end est terminé, testé et publié sous licence MIT.",
          "Il est en ligne sur romaricsoh-aero.vercel.app, avec une image pour les aperçus de liens.",
        ],
        credit: "Direction visuelle : une maquette Figma de configurateur de jet.",
      },
    },
  },
};

export const caseStudyBySlug = Object.fromEntries(
  (Object.entries(caseStudies) as [ProjectId, CaseStudy][]).map(([id, cs]) => [cs.slug, id]),
) as Record<string, ProjectId>;
