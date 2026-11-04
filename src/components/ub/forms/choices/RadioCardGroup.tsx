"use client";

import React, { useRef } from "react";
import type { LucideIcon } from "lucide-react";
import { focusRing, optionCard, optionCardSelected } from "components/ub/recipes";

export interface RadioCardOption<T extends string> {
  value: T;
  label: string;
  hint: string;
  icon: LucideIcon;
}

interface RadioCardGroupProps<T extends string> {
  ariaLabel: string;
  options: RadioCardOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** A row of selectable cards acting as a single-choice radio group (e.g. "Transfer vs Share").
 *  Roving tabindex: Tab reaches the checked card, arrow keys move and select (brief §9). */
export default function RadioCardGroup<T extends string>({
  ariaLabel,
  options,
  value,
  onChange,
}: RadioCardGroupProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const checkedIndex = options.findIndex((o) => o.value === value);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const forward = ["ArrowDown", rtl ? "ArrowLeft" : "ArrowRight"];
    const back = ["ArrowUp", rtl ? "ArrowRight" : "ArrowLeft"];
    let next: number | null = null;
    if (forward.includes(e.key)) next = (index + 1) % options.length;
    else if (back.includes(e.key)) next = (index - 1 + options.length) % options.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = options.length - 1;
    if (next === null) return;
    e.preventDefault();
    onChange(options[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div role="radiogroup" aria-label={ariaLabel} className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {options.map(({ value: optionValue, label, hint, icon: Icon }, index) => {
        const active = value === optionValue;
        const tabbable = active || (checkedIndex === -1 && index === 0);
        return (
          <button
            key={optionValue}
            ref={(el) => { refs.current[index] = el; }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={tabbable ? 0 : -1}
            onClick={() => onChange(optionValue)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`flex items-start gap-3 text-start ${optionCard} ${focusRing} ${
              active ? `${optionCardSelected} px-[15px] py-[11px]` : "px-4 py-3 hover:bg-ub-surface-subtle"
            }`}
          >
            <Icon aria-hidden="true" strokeWidth={1.75} className={`mt-0.5 h-5 w-5 shrink-0 ${active ? "text-ub-icon-interactive" : "text-ub-icon-default"}`} />
            <span>
              <span className="block text-ub-label-md text-ub-text-primary">{label}</span>
              <span className="block text-ub-body-sm text-ub-text-secondary">{hint}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
