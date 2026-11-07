import React, { useId } from "react";
import { ChevronDown } from "lucide-react";

import { fieldControl, fieldControlError, fieldControlHeight } from "components/ub/recipes";
import { FieldError } from "../layout/FieldChrome";

const filterSelect = `${fieldControl} ${fieldControlHeight} cursor-pointer appearance-none truncate pe-9 text-ub-body-sm`;
const optionClass = "bg-ub-surface text-ub-text-primary";

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
  const id = useId();
  return (
    <div className="flex-1 sm:flex-none">
      <div className="relative">
        {Icon && (
          <Icon
            aria-hidden="true"
            className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ub-icon"
          />
        )}

        <select
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={rest["aria-label"] ?? defaultOption}
          // appearance-none hands text layout entirely to our own CSS instead
          // of the browser's native <select> chrome — without it, Safari
          // ignores the start padding meant to clear the icon (Chrome/Firefox
          // don't), so the icon overlaps the option text. The native arrow
          // that appearance-none removes is replaced by the ChevronDown below.
          className={`${filterSelect} ${error ? fieldControlError : ""} ${
            Icon ? "ps-10" : "ps-3"
          }`}
        >
          <option value="all" className={optionClass}>
            {defaultOption}
          </option>

          {(Array.isArray(options) ? options : []).map((opt) =>
            typeof opt === "object" && opt !== null ? (
              <option
                key={opt.value ?? opt.id}
                value={opt.value ?? opt.name}
                disabled={opt.disabled}
                className={optionClass}
              >
                {opt.label ?? opt.name ?? opt.value}
              </option>
            ) : (
              <option key={opt} value={opt} className={optionClass}>
                {opt}
              </option>
            )
          )}
        </select>

        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ub-text-tertiary"
        />
      </div>
      <FieldError id={`${id}-error`}>{error}</FieldError>
    </div>
  );
}
