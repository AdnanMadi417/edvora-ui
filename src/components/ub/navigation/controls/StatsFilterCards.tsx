"use client";

import Tag from "components/ub/data/badges/Tag";
import type { TagTone } from "components/ub/recipes";
import type React from "react";
import StatTile from "components/ub/dashboard/cards/StatTile";
import type { IconTileTone } from "components/ub/dashboard/shared/IconTile";
import type { IconComponent } from "components/ub/dashboard/types";

export type CardColorScheme = "slate" | "blue" | "violet" | "emerald" | "amber" | "rose" | "cyan";

// The old colour names map onto the kit's icon tones: green for good, red for a
// problem, amber for waiting, brand for the rest (no extra hues on a page).
const TONE: Record<CardColorScheme, IconTileTone> = {
  slate: "neutral",
  blue: "brand",
  violet: "brand",
  cyan: "brand",
  emerald: "success",
  amber: "warning",
  rose: "danger",
};

export interface FilterCardItem {
  id: string | null;
  label: string;
  count: number | string;
  icon: React.ElementType;
  colorScheme: CardColorScheme;
  disabled?: boolean;
  /** Small tag in the footer, e.g. "Your move" (attention) or "Payout" (success). */
  badge?: { label: string; tone: TagTone };
  /** Share of the whole (0–100), shown in the footer. */
  progress?: number;
  /** Noun for the share, e.g. "of advisors" (default "of the total"). */
  shareOf?: string;
}

interface StatsFilterCardsProps {
  cards: FilterCardItem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  /** Layout only, e.g. grid columns for six stages. */
  className?: string;
}

/**
 * Stat cards that filter the list under them, drawn as StatTiles (the same
 * card as the home KPIs). Press a card to show only those records; press it
 * again to clear. The footer gives the card's share of the whole when known.
 */
export default function StatsFilterCards({ cards, selectedId, onSelect, className }: StatsFilterCardsProps) {
  return (
    <div className={className ?? "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"}>
      {cards.map((card) => {
        const isActive = selectedId === card.id;
        const share = typeof card.progress === "number" ? Math.round(card.progress) : null;
        const hint = card.disabled ? "Nothing to show" : isActive ? "Showing only these" : "Show only these";
        return (
          <StatTile
            key={card.label}
            className="h-full"
            label={card.label}
            value={typeof card.count === "number" ? card.count.toLocaleString() : card.count}
            icon={card.icon as IconComponent}
            iconTone={TONE[card.colorScheme] ?? "neutral"}
            footer={{
              value: share != null ? `${share}%` : undefined,
              text: (
                <>
                  {share != null ? card.shareOf ?? "of the total" : hint}
                  {card.badge && (
                    <Tag tone={card.badge.tone} size="sm" className="ms-2 align-middle">
                      {card.badge.label}
                    </Tag>
                  )}
                </>
              ),
            }}
            onClick={() => onSelect(isActive && card.id !== null ? null : card.id)}
            pressed={isActive}
            disabled={card.disabled}
            ariaLabel={`${card.label}: ${card.count}${share != null ? `, ${share}% ${card.shareOf ?? "of the total"}` : ""}${card.badge ? `, ${card.badge.label}` : ""}`}
          />
        );
      })}
    </div>
  );
}
