"use client";

export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex h-11 items-center rounded-control bg-accent px-4 text-body font-medium text-on-accent transition-[transform,background-color] duration-150 ease-out hover:bg-accent-press active:scale-[0.97]"
    >
      {label}
    </button>
  );
}
