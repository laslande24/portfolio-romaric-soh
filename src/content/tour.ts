import type { Locale } from "@/i18n/config";

/** One step of the Laufwort stop: the phone shows `screen` while this text is read. */
export type Beat = { screen: string; alt: string; title: string; body: string };

export type TourCopy = {
  role: string;
  cue: string;
  laufwort: {
    kicker: string;
    hintMouse: string;
    hintTouch: string;
    beats: Beat[];
    caseStudy: string;
  };
  next: string;
};

const screens = {
  welcome: "/projects/laufwort/welcome.png",
  lesson: "/projects/laufwort/lesson.png",
  flow: "/projects/laufwort/flow.png",
  progress: "/projects/laufwort/progress.png",
};

export const tour: Record<Locale, TourCopy> = {
  en: {
    role: "Front-end and full-stack developer. I design the apps I build, for the web and for phones.",
    cue: "Scroll to walk along the bench",
    laufwort: {
      kicker: "Mobile app, 2026",
      hintMouse: "Drag the phone to turn it",
      hintTouch: "Swipe the phone sideways to turn it",
      beats: [
        {
          screen: screens.welcome,
          alt: "Laufwort welcome screen with the sign-up options",
          title: "Laufwort",
          body: "Practise German while you run. Lessons are spoken aloud, you answer out loud, and the session adapts to your effort.",
        },
        {
          screen: screens.lesson,
          alt: "Lesson player: the phrase “Ich laufe jeden Morgen.”, a voice waveform and the record button",
          title: "The phrase is spoken, you answer out loud",
          body: "The lesson player reads each German phrase aloud. The microphone records your answer and plays it back.",
        },
        {
          screen: screens.flow,
          alt: "Effort flow: warm-up, build, peak and recovery, each with a duration and a target heart rate",
          title: "Breath sets the pace",
          body: "Warm-up, build, peak and recovery. At the peak you are out of breath, so each phrase gets six seconds instead of four.",
        },
        {
          screen: screens.progress,
          alt: "Progress screen with the week's stats and word mastery",
          title: "An app that answers the hand",
          body: "Cards tilt in 3D under the finger, presses spring back, counters count up. Built with Expo for iOS, Android and the web.",
        },
      ],
      caseStudy: "Read the case study",
    },
    next: "Next on the bench",
  },
  fr: {
    role: "Développeur front-end et full-stack. Je dessine les apps que je code, pour le web et pour le téléphone.",
    cue: "Défile pour parcourir l'établi",
    laufwort: {
      kicker: "App mobile, 2026",
      hintMouse: "Fais glisser le téléphone pour le tourner",
      hintTouch: "Glisse le téléphone de côté pour le tourner",
      beats: [
        {
          screen: screens.welcome,
          alt: "Écran d'accueil de Laufwort avec les options d'inscription",
          title: "Laufwort",
          body: "Pratiquer l'allemand en courant. Les leçons sont dites à voix haute, tu réponds à l'oral, et la séance s'adapte à ton effort.",
        },
        {
          screen: screens.lesson,
          alt: "Lecteur de leçon : la phrase « Ich laufe jeden Morgen. », une onde de voix et le bouton d'enregistrement",
          title: "La phrase est dite, tu réponds à voix haute",
          body: "Le lecteur de leçon dit chaque phrase allemande à voix haute. Le micro enregistre ta réponse et te la fait réécouter.",
        },
        {
          screen: screens.flow,
          alt: "Flux d'effort : échauffement, montée, pic et récupération, chacun avec sa durée et son pouls cible",
          title: "Le souffle décide du rythme",
          body: "Échauffement, montée, pic et récupération. Au pic, tu es essoufflé : chaque phrase te laisse six secondes au lieu de quatre.",
        },
        {
          screen: screens.progress,
          alt: "Écran de progression avec les statistiques de la semaine et la maîtrise des mots",
          title: "Une app qui répond à la main",
          body: "Les cartes s'inclinent en 3D sous le doigt, les pressions reviennent en ressort, les compteurs défilent. Construite avec Expo pour iOS, Android et le web.",
        },
      ],
      caseStudy: "Lire l'étude de cas",
    },
    next: "Sur l'établi ensuite",
  },
};
