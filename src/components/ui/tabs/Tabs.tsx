"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { EASE, MICRO_DURATION } from "components/ui/FadeIn";

export interface TabItem<T extends string = string> {
  key: T;
  label: string;
}

interface TabsProps<T extends string> {
  tabs: TabItem<T>[];
  active: T;
  onChange: (key: T) => void;
  className?: string;
}

export default function Tabs<T extends string>({ tabs, active, onChange, className }: TabsProps<T>) {
  // Scoped per instance — a fixed layoutId would make the indicator jump
  // between separate <Tabs> if more than one is ever rendered on the same
  // page at once.
  const layoutId = `tabs-indicator-${useId()}`;

  return (
    <div className={`relative flex items-center gap-6 border-b border-slate-200 px-6 ${className ?? ""}`}>
      {tabs.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`relative py-3 text-sm font-medium transition-colors duration-200 ${
            active === key ? "text-blue-700" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {label}
          {active === key && (
            <motion.span
              layoutId={layoutId}
              className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-blue-600"
              transition={{ duration: MICRO_DURATION, ease: EASE }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
