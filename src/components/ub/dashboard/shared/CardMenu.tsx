"use client";

import { Download, EyeOff, ListChecks, type LucideIcon } from "lucide-react";
import ActionsDropdown from "components/ub/navigation/menus/ActionsDropdown";

export interface CardMenuProps {
  onViewAll?: () => void;
  onExport?: () => void;
  onHide?: () => void;
  /** Extra items after the defaults. */
  extraItems?: { label: string; icon: LucideIcon; onClick: () => void }[];
  /** Accessible name, e.g. "Applications options". Default "Card options". */
  label?: string;
}

/** "⋯" overflow menu for a card: View all, Export and Hide (each only when its handler is set). */
export default function CardMenu({ onViewAll, onExport, onHide, extraItems = [], label = "Card options" }: CardMenuProps) {
  const items = [
    ...(onViewAll ? [{ label: "View all", icon: ListChecks, onClick: onViewAll }] : []),
    ...(onExport ? [{ label: "Export", icon: Download, onClick: onExport }] : []),
    ...extraItems,
    ...(onHide ? [{ label: "Hide this card", icon: EyeOff, onClick: onHide }] : []),
  ];
  if (!items.length) return null;
  return <ActionsDropdown iconOnly label={label} items={items.map((i) => ({ ...i, color: "blue" as const }))} />;
}
