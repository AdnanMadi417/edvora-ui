"use client";

import React, { useEffect, useRef, useState } from "react";

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
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  useEffect(() => {
    const el = buttonRefs.current[active];
    if (el) {
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, [active, tabs]);

  return (
    <div className={`relative flex items-center gap-6 border-b border-slate-200 px-6 ${className ?? ""}`}>
      {tabs.map(({ key, label }) => (
        <button
          key={key}
          ref={(el) => { buttonRefs.current[key] = el; }}
          type="button"
          onClick={() => onChange(key)}
          className={`py-3 text-sm font-medium transition-colors duration-200 ${
            active === key ? "text-blue-700" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {label}
        </button>
      ))}
      {indicator && (
        <span
          className="absolute bottom-0 h-0.5 rounded-full bg-blue-600 transition-all duration-300 ease-out"
          style={{ left: indicator.left, width: indicator.width }}
        />
      )}
    </div>
  );
}
