"use client";

// Single-select combobox (brief §4.2, ARIA 1.2 combobox + listbox pattern).
// Type to filter, Arrow Up/Down to move, Enter to choose, Esc to close (and
// again to clear the search). Options can carry a logo, a description and
// end-aligned meta, which covers "Institution combobox shows logo, city and
// country". The list opens below the field, or above it when there is no room,
// and positions inside any scroll container.
import React, {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  fieldControl,
  fieldControlError,
  fieldControlHeight,
  fieldWrapper,
  popover,
} from "components/ub/recipes";
import {
  FieldError,
  FieldHelper,
  FieldLabel,
  describedBy,
} from "components/ub/forms/layout/FieldChrome";
import { Icon } from "components/ub/icons/Icon";

export type ComboboxOption = {
  value: string;
  label: string;
  /** Second line, e.g. "Bandar Sunway, Malaysia". Also searched. */
  description?: string;
  /** Image URL or a node (e.g. an avatar). Rendered at 32px in the list, 20px in the field. */
  logo?: string | React.ReactNode;
  /** End-aligned detail, e.g. "12 programs". */
  meta?: React.ReactNode;
  disabled?: boolean;
};

export type ComboboxProps = {
  label: React.ReactNode;
  options: ComboboxOption[];
  value: string | null;
  onChange: (value: string | null, option: ComboboxOption | null) => void;
  placeholder?: string;
  helperText?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  /** Shown when nothing matches. Receives the current search text. */
  emptyMessage?: (query: string) => React.ReactNode;
  /** Custom matcher. Default: case-insensitive match on label and description. */
  filter?: (option: ComboboxOption, query: string) => boolean;
  /** Show a clear button once something is selected. */
  clearable?: boolean;
  id?: string;
  name?: string;
  className?: string;
  compact?: boolean;
  onBlur?: () => void;
  actions?: React.ReactNode;
};

const defaultFilter = (o: ComboboxOption, q: string) => {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return (
    o.label.toLowerCase().includes(needle) ||
    (o.description?.toLowerCase().includes(needle) ?? false)
  );
};

const defaultEmpty = (q: string) =>
  q.trim()
    ? `No results for "${q.trim()}". Check the spelling or try a shorter search.`
    : "No options available yet.";

// Local recipes: option row in the listbox (active = keyboard/hover highlight).
const optionRow =
  "flex min-h-10 w-full cursor-pointer items-center gap-3 rounded-ub-md px-3 py-2 text-start text-ub-body-sm text-ub-text-primary " +
  "transition-colors duration-ub-fast ease-ub-standard motion-reduce:transition-none";
const optionActive = "bg-ub-surface-subtle";
const optionDisabled = "cursor-not-allowed text-ub-text-disabled";
const listMaxHeight = 320;

function Logo({ logo, size }: { logo: ComboboxOption["logo"]; size: 20 | 32 }) {
  if (!logo) return null;
  const box = size === 32 ? "h-8 w-8 rounded-ub-md" : "h-5 w-5 rounded-ub-xs";
  if (typeof logo === "string") {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote logos of unknown size
      <img
        src={logo}
        alt=""
        className={`${box} shrink-0 border border-ub-border bg-ub-surface object-contain`}
      />
    );
  }
  return (
    <span className={`${box} grid shrink-0 place-items-center overflow-hidden`}>
      {logo}
    </span>
  );
}

export const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(
  function Combobox(
    {
      label,
      options,
      value,
      onChange,
      placeholder = "Search",
      helperText,
      error,
      required = false,
      disabled = false,
      emptyMessage = defaultEmpty,
      filter = defaultFilter,
      clearable = false,
      id: idProp,
      name,
      className = "",
      compact = false,
      onBlur,
      actions,
    },
    ref
  ) {
    const autoId = useId();
    const id = idProp ?? `ub-combobox-${autoId}`;
    const listId = `${id}-listbox`;
    const helperId = helperText ? `${id}-helper` : undefined;
    const errorId = error ? `${id}-error` : undefined;
    const optionId = (i: number) => `${id}-option-${i}`;

    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const selected = options.find((o) => o.value === value) ?? null;
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [typing, setTyping] = useState(false);
    const [active, setActive] = useState(-1);
    const [placeAbove, setPlaceAbove] = useState(false);

    // Only filter once the user has typed; opening shows every option.
    const results = useMemo(
      () => (typing ? options.filter((o) => filter(o, query)) : options),
      [options, filter, query, typing]
    );

    const firstEnabled = (
      list: ComboboxOption[],
      from = 0,
      dir: 1 | -1 = 1
    ) => {
      for (
        let k = 0, i = from;
        k < list.length;
        k++, i = (i + dir + list.length) % list.length
      ) {
        if (!list[i].disabled) return i;
      }
      return -1;
    };

    // Flip above when the viewport has no room below. Measured on open, so it
    // stays right wherever a scroll container has moved the field.
    const place = () => {
      const rect = inputRef.current?.getBoundingClientRect();
      if (rect && typeof window !== "undefined") {
        const below = window.innerHeight - rect.bottom;
        setPlaceAbove(below < listMaxHeight && rect.top > below);
      }
    };

    const openList = (highlight?: "selected" | "first" | "last") => {
      if (disabled) return;
      place();
      setOpen(true);
      const sel = results.findIndex((o) => o.value === value);
      if (highlight === "last")
        setActive(firstEnabled(results, results.length - 1, -1));
      else if (highlight === "first" || sel < 0)
        setActive(firstEnabled(results));
      else setActive(sel);
    };

    const close = () => {
      setOpen(false);
      setTyping(false);
      setQuery("");
      setActive(-1);
    };

    const choose = (o: ComboboxOption) => {
      if (disabled || inputRef.current?.matches(":disabled") || o.disabled)
        return;
      onChange(o.value, o);
      close();
    };

    // Keep the highlighted option in view while arrowing through a long list.
    useEffect(() => {
      if (!open || active < 0) return;
      const el = document.getElementById(optionId(active));
      el?.scrollIntoView?.({ block: "nearest" });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active, open]);

    const move = (dir: 1 | -1) => {
      if (!results.length) return;
      const start =
        active < 0
          ? dir === 1
            ? 0
            : results.length - 1
          : (active + dir + results.length) % results.length;
      setActive(firstEnabled(results, start, dir));
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          if (!open) openList(e.altKey ? "selected" : undefined);
          else move(1);
          break;
        case "ArrowUp":
          e.preventDefault();
          if (!open) openList("last");
          else move(-1);
          break;
        case "Enter":
          if (open) {
            e.preventDefault();
          }
          if (open && active >= 0 && results[active]) {
            e.preventDefault();
            choose(results[active]);
          }
          break;
        case "Escape":
          if (open) {
            e.preventDefault();
            e.stopPropagation(); // don't also close a surrounding modal
            close();
          } else if (clearable && value) {
            e.preventDefault();
            onChange(null, null);
          }
          break;
        case "Tab":
          break;
      }
    };

    const shown = open || typing ? query : selected?.label ?? value ?? "";
    const statusText = open
      ? results.length
        ? `${results.length} ${
            results.length === 1 ? "result" : "results"
          } available.`
        : "No results."
      : "";

    return (
      <div
        ref={containerRef}
        className={`${compact ? "" : fieldWrapper} ${className}`}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            close();
            onBlur?.();
          }
        }}
      >
        <FieldLabel htmlFor={id} id={`${id}-label`} required={required}>
          {label}
        </FieldLabel>
        <div className="relative">
          {selected?.logo && !(open || typing) && (
            <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2">
              <Logo logo={selected.logo} size={20} />
            </span>
          )}
          <input
            ref={inputRef}
            id={id}
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={
              open && active >= 0 && results[active]
                ? optionId(active)
                : undefined
            }
            aria-invalid={error ? true : undefined}
            aria-required={required || undefined}
            aria-describedby={describedBy(errorId, helperId)}
            autoComplete="off"
            disabled={disabled}
            placeholder={selected && open ? selected.label : placeholder}
            value={shown}
            onChange={(e) => {
              const q = e.target.value;
              setQuery(q);
              setTyping(true);
              if (!open) place();
              setOpen(true);
              setActive(firstEnabled(options.filter((o) => filter(o, q))));
            }}
            onClick={() => (open ? undefined : openList())}
            onKeyDown={onKeyDown}
            className={[
              fieldControl,
              compact ? "h-10" : fieldControlHeight,
              error && fieldControlError,
              selected?.logo && !(open || typing) ? "ps-10" : "",
              clearable && value ? "pe-20" : "pe-10",
            ]
              .filter(Boolean)
              .join(" ")}
          />
          {name && <input type="hidden" name={name} value={value ?? ""} />}
          <span className="absolute end-1 top-1/2 flex -translate-y-1/2 items-center">
            {clearable && value && !disabled && (
              <button
                type="button"
                tabIndex={-1}
                aria-label="Clear selection"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(null, null);
                  inputRef.current?.focus();
                }}
                className="grid h-8 w-8 place-items-center rounded-ub-full text-ub-icon-default hover:bg-ub-surface-subtle"
              >
                <Icon name="close" size={16} />
              </button>
            )}
            <button
              type="button"
              tabIndex={-1}
              aria-label={open ? "Hide options" : "Show options"}
              disabled={disabled}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                if (open) close();
                else openList();
                inputRef.current?.focus();
              }}
              className="grid h-8 w-8 place-items-center rounded-ub-full text-ub-icon-default disabled:text-ub-text-disabled"
            >
              <Icon
                name="chevron-down"
                size={20}
                className={`transition-transform duration-ub-fast ease-ub-standard motion-reduce:transition-none ${
                  open ? "rotate-180" : ""
                }`}
              />
            </button>
          </span>

          {open && (
            <div
              className={`${popover} absolute inset-x-0 z-50 overflow-hidden ${
                placeAbove ? "bottom-full mb-1" : "top-full mt-1"
              }`}
              // Clicks inside the list must not blur the input before they land.
              onMouseDown={(e) => e.preventDefault()}
            >
              <ul
                id={listId}
                role="listbox"
                aria-labelledby={`${id}-label`}
                className="overflow-y-auto overscroll-contain p-1"
                style={{ maxHeight: listMaxHeight }}
              >
                {results.map((o, i) => {
                  const isSelected = o.value === value;
                  return (
                    <li
                      key={o.value}
                      id={optionId(i)}
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={o.disabled || undefined}
                      onMouseEnter={() => !o.disabled && setActive(i)}
                      onClick={() => choose(o)}
                      className={`${optionRow} ${
                        o.disabled
                          ? optionDisabled
                          : isSelected
                          ? "bg-ub-selected"
                          : i === active
                          ? optionActive
                          : "hover:bg-ub-surface-subtle"
                      }`}
                    >
                      <Logo logo={o.logo} size={32} />
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block truncate ${
                            isSelected ? "font-medium" : ""
                          }`}
                        >
                          {o.label}
                        </span>
                        {o.description && (
                          <span className="block truncate text-ub-caption text-ub-text-tertiary">
                            {o.description}
                          </span>
                        )}
                      </span>
                      {o.meta && (
                        <span className="shrink-0 text-ub-caption text-ub-text-tertiary ub-tabular">
                          {o.meta}
                        </span>
                      )}
                      {isSelected && (
                        <Icon
                          name="check"
                          size={16}
                          className="text-ub-icon-interactive"
                        />
                      )}
                    </li>
                  );
                })}
              </ul>
              {!results.length && (
                <>
                  <p className="px-4 py-3 text-ub-body-sm text-ub-text-secondary">
                    {emptyMessage(query)}
                  </p>
                  {actions}
                </>
              )}
            </div>
          )}
          <span className="sr-only" aria-live="polite">
            {statusText}
          </span>
        </div>
        <FieldError id={errorId}>{error}</FieldError>
        <FieldHelper id={helperId}>{helperText}</FieldHelper>
      </div>
    );
  }
);

export default Combobox;
