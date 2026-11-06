import type { ReactNode } from "react";

/** One section of a long page: a label in the left column, the reading column on the right. */
export function Row({ id, label, children }: { id?: string; label: string; children: ReactNode }) {
  return (
    <section
      id={id}
      className="grid scroll-mt-16 gap-4 border-t border-line py-12 lg:grid-cols-12 lg:gap-12 lg:py-16"
    >
      <h2 className="text-body font-medium text-ink-2 lg:col-span-4">{label}</h2>
      <div className="lg:col-span-8 xl:col-span-7">{children}</div>
    </section>
  );
}
