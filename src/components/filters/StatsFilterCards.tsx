"use client";

import React from "react";

export type CardColorScheme = "slate" | "blue" | "violet" | "emerald" | "amber" | "rose" | "cyan";

const COLOR_MAP: Record<
  CardColorScheme,
  { inactive: string; active: string; iconBgInactive: string; iconBgActive: string; iconColor: string }
> = {
  slate:   { inactive: "border-slate-200 bg-slate-50/40 hover:bg-slate-50",        active: "border-slate-400 bg-slate-100 shadow-sm",        iconBgInactive: "bg-slate-100",    iconBgActive: "bg-slate-200",    iconColor: "text-slate-600" },
  blue:    { inactive: "border-blue-100 bg-blue-50/40 hover:bg-blue-50",            active: "border-blue-300 bg-blue-50 shadow-sm",            iconBgInactive: "bg-blue-100",     iconBgActive: "bg-blue-200",     iconColor: "text-blue-600" },
  violet:  { inactive: "border-violet-100 bg-violet-50/40 hover:bg-violet-50",      active: "border-violet-300 bg-violet-50 shadow-sm",        iconBgInactive: "bg-violet-100",   iconBgActive: "bg-violet-200",   iconColor: "text-violet-600" },
  emerald: { inactive: "border-emerald-100 bg-emerald-50/40 hover:bg-emerald-50",   active: "border-emerald-300 bg-emerald-50 shadow-sm",      iconBgInactive: "bg-emerald-100",  iconBgActive: "bg-emerald-200",  iconColor: "text-emerald-600" },
  amber:   { inactive: "border-amber-100 bg-amber-50/40 hover:bg-amber-50",         active: "border-amber-300 bg-amber-50 shadow-sm",          iconBgInactive: "bg-amber-100",    iconBgActive: "bg-amber-200",    iconColor: "text-amber-600" },
  rose:    { inactive: "border-rose-100 bg-rose-50/40 hover:bg-rose-50",            active: "border-rose-300 bg-rose-50 shadow-sm",            iconBgInactive: "bg-rose-100",     iconBgActive: "bg-rose-200",     iconColor: "text-rose-600" },
  cyan:    { inactive: "border-cyan-100 bg-cyan-50/40 hover:bg-cyan-50",            active: "border-cyan-300 bg-cyan-50 shadow-sm",            iconBgInactive: "bg-cyan-100",     iconBgActive: "bg-cyan-200",     iconColor: "text-cyan-600" },
};

export interface FilterCardItem {
  id: string | null;
  label: string;
  count: number | string;
  icon: React.ElementType;
  colorScheme: CardColorScheme;
  disabled?: boolean;
}

interface StatsFilterCardsProps {
  cards: FilterCardItem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export default function StatsFilterCards({ cards, selectedId, onSelect }: StatsFilterCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const isActive = selectedId === card.id;
        const colors = COLOR_MAP[card.colorScheme];
        const Icon = card.icon;
        return (
          <button
            key={card.label}
            disabled={card.disabled}
            onClick={() => {
              if (card.disabled) return;
              onSelect(isActive && card.id !== null ? null : card.id);
            }}
            className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
              card.disabled
                ? `cursor-default opacity-50 ${colors.inactive}`
                : isActive
                ? colors.active
                : colors.inactive
            }`}
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                isActive ? colors.iconBgActive : colors.iconBgInactive
              }`}
            >
              <Icon className={`h-5 w-5 ${colors.iconColor}`} />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{card.count}</p>
              <p className="text-xs text-slate-500">{card.label}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
