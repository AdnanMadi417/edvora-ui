"use client";

import React from "react";
import { X } from "lucide-react";
import { focusRing, tagBase, tagTones } from "components/ub/recipes";

interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

/** Applied-filter chip: brand-tinted tag (radius 6) with a remove button. */
export default function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <span className={`${tagBase} ${tagTones.brand} pe-0.5`}>
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        className={`flex h-5 w-5 items-center justify-center rounded-ub-xs text-ub-tone-brand-text transition-colors duration-ub-fast ease-ub-standard hover:bg-ub-tone-brand-border ${focusRing}`}
      >
        <X className="h-3.5 w-3.5" aria-hidden />
      </button>
    </span>
  );
}
