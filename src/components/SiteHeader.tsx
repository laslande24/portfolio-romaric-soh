import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { LanguageSwitch } from "./LanguageSwitch";
import { MobileMenu } from "./MobileMenu";

export function SiteHeader({ lang, dict }: { lang: Locale; dict: Dictionary["nav"] }) {
  const links = [
    { href: `/${lang}#work`, label: dict.work },
    { href: `/${lang}#about`, label: dict.about },
    { href: `/${lang}#contact`, label: dict.contact },
    { href: `/${lang}/cv`, label: dict.cv },
  ];

  return (
    <header className="material sticky top-0 z-40 border-b border-line print:hidden">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-6 px-6 md:px-8">
        <Link
          href={`/${lang}`}
          aria-label={dict.home}
          className="text-base font-medium text-ink"
        >
          Romaric Soh
        </Link>

        <div className="flex items-center gap-4 sm:gap-6">
          <nav aria-label={dict.main} className="hidden sm:block">
            <ul className="flex items-center gap-6 text-body text-ink-2">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition-colors duration-150 ease-out hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <LanguageSwitch current={lang} label={dict.language} />
          <MobileMenu links={links} label={dict.menu} navLabel={dict.main} />
        </div>
      </div>
    </header>
  );
}
