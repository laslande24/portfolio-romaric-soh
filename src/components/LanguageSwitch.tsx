"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";

export function LanguageSwitch({ current, label }: { current: Locale; label: string }) {
  const pathname = usePathname() ?? `/${current}`;

  const hrefFor = (locale: Locale) => {
    const rest = pathname.split("/").slice(2).join("/");
    return `/${locale}${rest ? `/${rest}` : ""}`;
  };

  return (
    <nav aria-label={label} className="flex items-center gap-1 text-meta">
      {locales.map((locale) => {
        const active = locale === current;
        return (
          <Link
            key={locale}
            href={hrefFor(locale)}
            hrefLang={locale}
            lang={locale}
            aria-current={active ? "true" : undefined}
            className={[
              "inline-flex h-8 min-w-8 items-center justify-center rounded-tag px-2",
              "transition-colors duration-150 ease-out",
              active ? "bg-raised text-ink" : "text-ink-3 hover:text-ink",
            ].join(" ")}
          >
            {locale.toUpperCase()}
          </Link>
        );
      })}
    </nav>
  );
}
