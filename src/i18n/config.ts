export const locales = ["en", "fr"] as const;

export type Locale = (typeof locales)[number];

// Recruiters worldwide: English unless the browser asks for French.
export const defaultLocale: Locale = "en";

export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
