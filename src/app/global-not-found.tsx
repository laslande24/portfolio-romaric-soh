import type { Metadata } from "next";
import { fontVars } from "./fonts";
import "./globals.css";

// Rendered outside [lang]/layout, so the language is unknown: English first, French beside it.
export const metadata: Metadata = {
  title: "Page not found, Romaric Soh",
  robots: { index: false },
};

const button =
  "inline-flex h-12 items-center rounded-control px-5 text-body font-medium transition-[transform,background-color] duration-150 ease-out active:scale-[0.97]";

export default function GlobalNotFound() {
  return (
    <html lang="en" className={fontVars}>
      <body className="min-h-svh bg-paper text-ink">
        <main className="mx-auto flex min-h-svh max-w-[1440px] flex-col justify-center px-6 py-16 md:px-8">
          <a href="/en" className="text-body font-medium">
            Romaric Soh
          </a>
          <p className="text-meta mt-16 text-ink-3">404</p>
          <h1 className="text-display mt-3 max-w-[14ch]">Nothing on the bench here</h1>
          <p className="text-lead mt-6 max-w-[36rem] text-ink-2">This page does not exist, or it has moved.</p>
          <p lang="fr" className="text-body mt-2 max-w-[36rem] text-ink-3">
            {"Rien sur l'établi ici : cette page n'existe pas, ou elle a changé de place."}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href="/en" className={`${button} bg-accent text-on-accent hover:bg-accent-press`}>
              Back to the workbench
            </a>
            <a href="/fr" lang="fr" className={`${button} border border-line-strong text-ink hover:bg-raised`}>
              {"Retour à l'établi"}
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
