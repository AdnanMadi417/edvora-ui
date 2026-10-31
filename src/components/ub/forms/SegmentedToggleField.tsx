"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";
import { focusRing } from "components/ub/recipes";

interface SegmentedToggleFieldProps {
  field: string;
  /** Shown first (start side); selecting it sets the field to false. */
  leftText: string;
  /** Shown second (end side); selecting it sets the field to true. */
  rightText: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  formData: Record<string, any>;
  updateFormData: (field: string, value: boolean) => void;
}

// A two-option segmented pill (like a tab bar, not an on/off switch) for
// toggling a form between two modes -- e.g. "pick from a list" vs "enter it
// manually". Distinct from ToggleInput.jsx/SettingToggleInput.jsx, which
// are full switch cards for a single boolean setting. The sliding highlight
// is a plain CSS transform so it mirrors in RTL and stops animating under
// prefers-reduced-motion.
const segment = (active: boolean) =>
  `relative z-10 flex h-8 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-ub-full px-3 text-ub-label-sm transition-colors duration-ub-fast ease-ub-standard motion-reduce:transition-none ${focusRing} ${
    active ? "text-ub-text-primary" : "text-ub-text-secondary hover:text-ub-text-primary"
  }`;

export default function SegmentedToggleField({
  field,
  leftText,
  rightText,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  formData,
  updateFormData,
}: SegmentedToggleFieldProps) {
  const active = Boolean(formData[field]);

  return (
    <div
      role="group"
      className="relative inline-flex rounded-ub-full border border-ub-border bg-ub-disabled p-1"
      data-field={field}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-y-1 start-1 w-[calc(50%-4px)] rounded-ub-full border border-ub-border bg-ub-surface-raised shadow-ub-xs transition-transform duration-ub-base ease-ub-standard motion-reduce:transition-none ${
          active ? "translate-x-full rtl:-translate-x-full" : "translate-x-0"
        }`}
      />
      <button type="button" aria-pressed={!active} onClick={() => updateFormData(field, false)} className={segment(!active)}>
        {LeftIcon && <LeftIcon aria-hidden="true" strokeWidth={1.75} className="h-4 w-4" />}
        {leftText}
      </button>
      <button type="button" aria-pressed={active} onClick={() => updateFormData(field, true)} className={segment(active)}>
        {RightIcon && <RightIcon aria-hidden="true" strokeWidth={1.75} className="h-4 w-4" />}
        {rightText}
      </button>
    </div>
  );
}
