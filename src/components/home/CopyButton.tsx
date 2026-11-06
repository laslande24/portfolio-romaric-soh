"use client";

import { useEffect, useState } from "react";

export function CopyButton({ text, copy, copied }: { text: string; copy: string; copied: string }) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!done) return;
    const timer = setTimeout(() => setDone(false), 2000);
    return () => clearTimeout(timer);
  }, [done]);

  return (
    <button
      type="button"
      onClick={() => navigator.clipboard?.writeText(text).then(() => setDone(true), () => {})}
      className="text-body inline-flex h-11 items-center rounded-control border border-line-strong px-3 text-ink-2 transition-[transform,background-color] duration-150 ease-out hover:bg-raised active:scale-[0.97]"
    >
      <span aria-live="polite">{done ? copied : copy}</span>
    </button>
  );
}
