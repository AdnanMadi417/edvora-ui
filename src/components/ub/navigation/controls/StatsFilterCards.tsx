"use client";

import Tag from "components/ub/data/badges/Tag";
import ProgressBar from "components/ub/feedback/states/ProgressBar";
import type { TagTone } from "components/ub/recipes";
import React from "react";
import { card as cardBase, cardInteractive, focusRing, iconTints } from "components/ub/recipes";

export type CardColorScheme = "slate" | "blue" | "violet" | "emerald" | "amber" | "rose" | "cyan";

// Each scheme maps to a theme-aware icon tint (recipes.iconTints), so the
// cards read correctly on navy as well as white.
const ICON_TINT: Record<CardColorScheme, string> = {
  slate: iconTints.slate,
  blue: iconTints.blue,
  violet: iconTints.violet,
  emerald: iconTints.emerald,
  amber: iconTints.amber,
  rose: iconTints.rose,
  cyan: iconTints.cyan,
};

export interface FilterCardItem {
  id: string | null;
  label: string;
  count: number | string;
  icon: React.ElementType;
  colorScheme: CardColorScheme;
  disabled?: boolean;
  /** Small tag at the card's end, e.g. "Your move" (attention) or "Payout" (success). */
  badge?: { label: string; tone: TagTone };
  /** Share of the whole (0–100), shown as a thin bar under the count. */
  progress?: number;
}

interface StatsFilterCardsProps {
  cards: FilterCardItem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  /** Layout only, e.g. grid columns for six stages. */
  className?: string;
}

export default function StatsFilterCards({ cards, selectedId, onSelect, className }: StatsFilterCardsProps) {
  return (
    <div className={className ?? "grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"}>
      {cards.map((card) => {
        const isActive = selectedId === card.id;
        const Icon = card.icon;
        return (
          <button
            key={card.label}
            type="button"
            disabled={card.disabled}
            aria-pressed={isActive}
            onClick={() => {
              if (card.disabled) return;
              onSelect(isActive && card.id !== null ? null : card.id);
            }}
            className={`flex items-center gap-3 p-4 text-start ${cardBase} ${focusRing} ${
              card.disabled
                ? "cursor-not-allowed opacity-60"
                : isActive
                  ? // Selected (brief §4.4): 2px brand edge drawn as border + inset ring so the card doesn't shift.
                    "border-ub-action-primary bg-ub-selected ring-1 ring-inset ring-ub-action-primary"
                  : cardInteractive
            }`}
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-ub-md ${ICON_TINT[card.colorScheme] ?? iconTints.slate}`}>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-ub-label-md text-ub-text-secondary">{card.label}</p>
              <p className="ub-tabular text-ub-data-lg text-ub-text-primary">{card.count}</p>
              {typeof card.progress === "number" && <ProgressBar value={card.progress} showValue={false} aria-label={`${card.label}: ${card.progress}% of the total`} className="mt-2" />}
            </div>
            {card.badge && (
              <Tag tone={card.badge.tone} size="sm" className="self-start">
                {card.badge.label}
              </Tag>
            )}
          </button>
        );
      })}
    </div>
  );
}
