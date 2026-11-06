"use client";

import Link from "next/link";
import { useRef } from "react";

type NavLink = { href: string; label: string };

/**
 * Below `sm` the header links move into a native popover: top layer, Escape and
 * outside-tap to close, focus order after the button, no JavaScript beyond
 * closing it when a link is followed. Styles live in globals.css (.menu-panel).
 */
export function MobileMenu({ links, label, navLabel }: { links: NavLink[]; label: string; navLabel: string }) {
  const panel = useRef<HTMLDivElement>(null);
  const close = () => panel.current?.hidePopover();

  return (
    <div className="sm:hidden">
      <button
        type="button"
        popoverTarget="site-menu"
        aria-label={label}
        className="-mr-2 grid size-10 place-items-center rounded-control text-ink transition-colors duration-150 ease-out hover:bg-raised"
      >
        <span aria-hidden className="relative block h-3 w-4">
          <span className="menu-line absolute inset-x-0 top-0 h-px bg-current" />
          <span className="menu-line absolute inset-x-0 bottom-0 h-px bg-current" />
        </span>
      </button>

      <div ref={panel} id="site-menu" popover="auto" className="menu-panel">
        <nav aria-label={navLabel}>
          <ul>
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={close}
                  className="text-lead flex h-12 items-center rounded-control px-3 text-ink transition-colors duration-150 ease-out hover:bg-raised"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
