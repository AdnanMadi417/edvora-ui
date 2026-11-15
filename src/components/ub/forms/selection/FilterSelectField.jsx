"use client";
import { fieldControlHeight } from "components/ub/recipes";
import React from "react";
import Combobox from "./Combobox";
import { normalizeSelectOptions } from "./normalizeSelectOptions";

export default function FilterSelectField({
  value,
  onChange,
  options = [],
  icon: Icon = null,
  defaultOption = "Select ...",
  disabled = false,
  error = undefined,
  ...rest
}) {
  return (
    <div className="flex-1 sm:flex-none">
      <Combobox
        compact
        ariaLabel={rest["aria-label"] ?? defaultOption}
        value={value == null ? "all" : String(value)}
        onChange={(next) => onChange(next ?? "all")}
        options={[
          { value: "all", label: defaultOption },
          ...normalizeSelectOptions(Array.isArray(options) ? options : []),
        ]}
        disabled={disabled}
        error={error}
        leadingIcon={
          Icon ? (
            <Icon
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-ub-icon"
            />
          ) : undefined
        }
        triggerClassName={fieldControlHeight}
      />
    </div>
  );
}
