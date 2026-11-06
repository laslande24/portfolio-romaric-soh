"use client";

import { motion } from "motion/react";
import { useRef } from "react";
import { spring } from "@/lib/motion";
import type { View } from "./layouts";

type Option = { value: View; label: string };

/** Segmented control. Arrow keys move between options (roving tab stop). */
export function RolePicker({
  value,
  options,
  label,
  reduce,
  onChange,
}: {
  value: View;
  options: Option[];
  label: string;
  reduce: boolean;
  onChange: (v: View) => void;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const delta = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (index + delta + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex rounded-control border border-line bg-card p-1"
    >
      {options.map((option, i) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={[
              "relative h-8 rounded-tag px-3 text-body whitespace-nowrap",
              "transition-[color,transform] duration-150 ease-out active:scale-[0.97]",
              active ? "text-ink" : "text-ink-2 hover:text-ink",
            ].join(" ")}
          >
            {active && (
              <motion.span
                layoutId="role-picker-selection"
                className="absolute inset-0 rounded-tag bg-raised"
                transition={reduce ? { duration: 0 } : spring.settle}
              />
            )}
            <span className="relative">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
