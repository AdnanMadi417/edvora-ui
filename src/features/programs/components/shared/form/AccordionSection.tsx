"use client";

import React from "react";
import { ChevronDown, AlertCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface AccordionSectionProps {
  icon: LucideIcon;
  title: string;
  /** One-line summary shown next to the title when the section is collapsed. */
  summary?: string;
  hasError?: boolean;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export default function AccordionSection({
  icon: Icon,
  title,
  summary,
  hasError = false,
  open,
  onToggle,
  children,
}: AccordionSectionProps) {
  return (
    <div className={`overflow-hidden rounded-lg border bg-white transition-colors ${hasError ? "border-red-300" : "border-slate-200"}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-6 py-4 text-left transition hover:bg-slate-50"
      >
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${hasError ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-700"}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {!open && summary && (
            <p className="mt-0.5 truncate text-xs text-slate-500">{summary}</p>
          )}
        </div>
        {hasError && !open && (
          <span className="flex items-center gap-1 text-xs font-medium text-red-600">
            <AlertCircle className="h-3.5 w-3.5" />
            Needs attention
          </span>
        )}
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="space-y-4 border-t border-slate-100 px-6 py-6">
          {children}
        </div>
      )}
    </div>
  );
}
