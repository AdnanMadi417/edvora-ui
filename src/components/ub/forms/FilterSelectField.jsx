import React from "react";
import { ChevronDown } from "lucide-react";

// Filter select (brief §4.2/§5): 40px tall, radius 8, control border, with
// a leading icon. Logical padding so the icon sits at the start in RTL.
const filterSelect =
  "h-10 w-full cursor-pointer appearance-none truncate rounded-ub-md border border-ub-border-control bg-ub-surface pe-9 text-ub-body-sm text-ub-text-primary " +
  "transition-[border-color,box-shadow] duration-ub-fast ease-ub-standard hover:border-ub-border-control-hover " +
  "focus:border-ub-border-focus focus:outline-none focus:ring-1 focus:ring-ub-border-focus " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ub-border-focus";
const optionClass = "bg-ub-surface text-ub-text-primary";

export default function FilterSelectField({
  value,
  onChange,
  options = [],
  icon: Icon = null,
  defaultOption = "Select ...",
  ...rest
}) {
  return (
    <div className="relative flex-1 sm:flex-none">
      {Icon && (
        <Icon
          aria-hidden="true"
          className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ub-icon"
        />
      )}

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={rest["aria-label"] ?? defaultOption}
        // appearance-none hands text layout entirely to our own CSS instead
        // of the browser's native <select> chrome — without it, Safari
        // ignores the start padding meant to clear the icon (Chrome/Firefox
        // don't), so the icon overlaps the option text. The native arrow
        // that appearance-none removes is replaced by the ChevronDown below.
        className={`${filterSelect} ${Icon ? "ps-10" : "ps-3"}`}
      >
        <option value="all" className={optionClass}>
          {defaultOption}
        </option>

        {(Array.isArray(options) ? options : []).map((opt) =>
          typeof opt === "object" && opt !== null ? (
            <option key={opt.value ?? opt.id} value={opt.value ?? opt.name} className={optionClass}>
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
  );
}
