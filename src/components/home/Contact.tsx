import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { contact } from "@/content/profile";
import { Row } from "@/components/Row";
import { CopyButton } from "./CopyButton";

const quiet =
  "text-body inline-flex h-11 items-center gap-2 rounded-control border border-line-strong px-4 font-medium text-ink transition-[transform,background-color] duration-150 ease-out hover:bg-raised active:scale-[0.97]";

function Arrow({ external }: { external?: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="size-4 text-ink-3" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d={external ? "M5 11 11 5M6 5h5v5" : "M3 8h10M9 4l4 4-4 4"} />
    </svg>
  );
}

export function Contact({ lang, t }: { lang: Locale; t: Dictionary["contact"] }) {
  return (
    <Row id="contact" label={t.label}>
      <p className="text-lead text-ink-2">{t.lead}</p>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3">
        <a
          href={`mailto:${contact.email}`}
          className="text-title break-words underline decoration-line-strong decoration-1 underline-offset-[0.2em] transition-colors duration-150 ease-out hover:decoration-current"
        >
          {contact.email}
        </a>
        <CopyButton text={contact.email} copy={t.copy} copied={t.copied} />
      </div>

      <ul className="mt-10 flex flex-wrap gap-3">
        <li>
          <a href={`https://${contact.linkedin}`} target="_blank" rel="noopener noreferrer" className={quiet}>
            LinkedIn <Arrow external />
          </a>
        </li>
        <li>
          <a href={`https://${contact.github}`} target="_blank" rel="noopener noreferrer" className={quiet}>
            GitHub <Arrow external />
          </a>
        </li>
        <li>
          <Link href={`/${lang}/cv`} className={quiet}>
            {t.cv} <Arrow />
          </Link>
        </li>
      </ul>
    </Row>
  );
}
