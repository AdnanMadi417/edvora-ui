"use client";

import React, { useId } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { EASE, MICRO_DURATION } from "components/ui/FadeIn";

interface SegmentedToggleFieldProps {
  field: string;
  /** Shown on the left; selecting it sets the field to false. */
  leftText: string;
  /** Shown on the right; selecting it sets the field to true. */
  rightText: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  formData: Record<string, any>;
  updateFormData: (field: string, value: boolean) => void;
}

// A two-option segmented pill (like a tab bar, not an on/off switch) for
// toggling a form between two modes -- e.g. "pick from a list" vs "enter it
// manually". Distinct from ToggleInput.jsx/SettingToggleInput.jsx, which
// are full switch cards for a single boolean setting. The sliding
// highlight uses the same EASE/MICRO_DURATION and layoutId pattern as the
// tab indicator in components/ui/tabs/Tabs.tsx, scoped per instance for
// the same reason: a fixed id would make the indicator jump between
// separate toggles mounted on the same page.
export default function SegmentedToggleField({
  field,
  leftText,
  rightText,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  formData,
  updateFormData,
}: SegmentedToggleFieldProps) {
  const layoutId = `segmented-toggle-${useId()}`;
  const active = Boolean(formData[field]);

  return (
    <div
      className="relative inline-flex rounded-full border border-slate-200 bg-slate-100 p-1"
      data-field={field}
    >
      <button
        type="button"
        onClick={() => updateFormData(field, false)}
        className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
          !active ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
        }`}
      >
        {LeftIcon && <LeftIcon className="h-3.5 w-3.5" />}
        {leftText}
      </button>
      <button
        type="button"
        onClick={() => updateFormData(field, true)}
        className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
          active ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
        }`}
      >
        {RightIcon && <RightIcon className="h-3.5 w-3.5" />}
        {rightText}
      </button>

      <motion.div
        layoutId={layoutId}
        animate={{ x: active ? "100%" : "0%" }}
        transition={{ duration: MICRO_DURATION, ease: EASE }}
        className="absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-white shadow-sm"
      />
    </div>
  );
}
