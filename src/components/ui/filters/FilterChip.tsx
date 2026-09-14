"use client";

import React from "react";
import { X } from "lucide-react";

interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

export default function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-blue-200 bg-blue-50 py-1 pl-3 pr-1.5 text-sm font-medium text-blue-700">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        className="flex h-4 w-4 items-center justify-center rounded-full text-blue-500 transition hover:bg-blue-200 hover:text-blue-800"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
