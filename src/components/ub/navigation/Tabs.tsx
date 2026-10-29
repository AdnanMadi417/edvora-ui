"use client";

import { useRef, type KeyboardEvent } from "react";
import { tab, tabList } from "components/ub/recipes";

export interface TabItem<T extends string = string> {
  key: T;
  label: string;
}

interface TabsProps<T extends string> {
  tabs: TabItem<T>[];
  active: T;
  onChange: (key: T) => void;
  className?: string;
  /** Accessible name for the tab list. */
  "aria-label"?: string;
}

/**
 * Underline tabs (brief §4.7): 44px high, 2px blue underline on the active tab.
 * Roving tab index — Left/Right (mirrored in RTL), Home and End move between
 * tabs and activate them (brief §9).
 */
export default function Tabs<T extends string>({ tabs, active, onChange, className, "aria-label": ariaLabel }: TabsProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (index: number) => {
    const count = tabs.length;
    if (!count) return;
    const i = ((index % count) + count) % count;
    refs.current[i]?.focus();
    onChange(tabs[i].key);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const current = tabs.findIndex((t) => t.key === active);
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const next = rtl ? "ArrowLeft" : "ArrowRight";
    const prev = rtl ? "ArrowRight" : "ArrowLeft";
    if (e.key === next) select(current + 1);
    else if (e.key === prev) select(current - 1);
    else if (e.key === "Home") select(0);
    else if (e.key === "End") select(tabs.length - 1);
    else return;
    e.preventDefault();
  };

  return (
    <div role="tablist" aria-label={ariaLabel} onKeyDown={onKeyDown} className={`${tabList} px-6 ${className ?? ""}`}>
      {tabs.map(({ key, label }, i) => {
        const selected = active === key;
        return (
          <button
            key={key}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(key)}
            className={`${tab(selected)} whitespace-nowrap motion-reduce:transition-none`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
