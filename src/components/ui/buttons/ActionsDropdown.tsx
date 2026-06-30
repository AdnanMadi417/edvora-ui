"use client";

import React, { useEffect, useRef, useState } from "react";
import { LucideIcon, MoreVertical } from "lucide-react";

type ItemColor = "amber" | "blue" | "red" | "green";

const COLOR: Record<ItemColor, { row: string; icon: string }> = {
  amber: { row: "hover:border-amber-200 hover:bg-amber-50",  icon: "bg-amber-100 text-amber-600 group-hover:bg-amber-200" },
  blue:  { row: "hover:border-blue-200 hover:bg-blue-50",    icon: "bg-blue-100 text-blue-600 group-hover:bg-blue-200" },
  red:   { row: "hover:border-red-200 hover:bg-red-50",      icon: "bg-red-100 text-red-600 group-hover:bg-red-200" },
  green: { row: "hover:border-green-200 hover:bg-green-50",  icon: "bg-green-100 text-green-600 group-hover:bg-green-200" },
};

export interface DropdownItem {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  color?: ItemColor;
}

interface ActionsDropdownProps {
  items: DropdownItem[];
  label?: string;
}

export default function ActionsDropdown({ items, label = "Actions" }: ActionsDropdownProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const close = () => setOpen(false);

  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", onMouse);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouse);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const handleOpen = () => {
    setMounted(true);
    setOpen(true);
  };

  const handleItemClick = (onClick: () => void) => {
    close();
    onClick();
  };

  return (
    <div className="relative" ref={ref} onMouseEnter={handleOpen} onMouseLeave={close}>
      {/* Trigger */}
      <button
        onClick={handleOpen}
        aria-expanded={open}
        aria-haspopup="true"
        className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all duration-150 ${
          open
            ? "border-slate-300 bg-slate-100 text-slate-800 shadow-inner"
            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
        }`}
      >
        {label}
        <MoreVertical
          className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-90" : "rotate-0"}`}
        />
      </button>

      {/* Panel */}
      {mounted && (
        <div
          className={`absolute right-0 top-full z-50 mt-2 w-52 origin-top-right overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl ring-1 ring-slate-100 transition-all duration-200 ${
            open
              ? "translate-y-0 scale-100 opacity-100"
              : "pointer-events-none -translate-y-1 scale-95 opacity-0"
          }`}
          onTransitionEnd={() => { if (!open) setMounted(false); }}
          role="menu"
        >
          <div className="p-1.5">
            {items.map((item, i) => {
              const c = COLOR[item.color ?? "blue"];
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  role="menuitem"
                  onClick={() => handleItemClick(item.onClick)}
                  className={`group flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-left text-sm transition-all duration-150 ${c.row}`}
                  style={{ transitionDelay: open ? `${i * 30}ms` : "0ms" }}
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-150 ${c.icon}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-slate-900">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
