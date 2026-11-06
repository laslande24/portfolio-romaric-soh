import type { Locale } from "./config";

const dictionaries = {
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  fr: () => import("./dictionaries/fr.json").then((m) => m.default),
};

export type Dictionary = Awaited<ReturnType<typeof dictionaries.en>>;

// Compile-time guard: fr.json must have exactly the keys of en.json.
type FrDictionary = Awaited<ReturnType<typeof dictionaries.fr>>;
type SameShape<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
const frMatchesEn: SameShape<FrDictionary, Dictionary> = true;
void frMatchesEn;

export function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}
