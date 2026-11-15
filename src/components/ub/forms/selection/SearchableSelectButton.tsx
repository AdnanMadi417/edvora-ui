"use client";

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search, X } from "lucide-react";
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

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  logo?: string | React.ReactNode;
  meta?: React.ReactNode;
  disabled?: boolean;
}
interface BaseProps {
  label?: React.ReactNode;
  ariaLabel?: string;
  options: SelectOption[];
  placeholder?: string;
  helperText?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  emptyMessage?: (query: string) => React.ReactNode;
  filter?: (option: SelectOption, query: string) => boolean;
  clearable?: boolean;
  id?: string;
  name?: string;
  className?: string;
  triggerClassName?: string;
  leadingIcon?: React.ReactNode;
  compact?: boolean;
  onBlur?: () => void;
  actions?: React.ReactNode;
  searchValue?: string;
  onSearchChange?: (query: string) => void;
  serverResults?: boolean;
  resultsVisible?: boolean;
  loading?: boolean;
  loadingMessage?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  "aria-controls"?: string;
}
export interface SingleSelectProps extends BaseProps {
  multiple?: false;
  value: string | null;
  onChange: (value: string | null, option: SelectOption | null) => void;
}
export interface MultipleSelectProps extends BaseProps {
  multiple: true;
  value: string[];
  onChange: (value: string[], option: SelectOption | null) => void;
}
export type SearchableSelectButtonProps =
  | SingleSelectProps
  | MultipleSelectProps;

const match = (option: SelectOption, query: string) =>
  `${option.label} ${option.description ?? ""}`
    .toLowerCase()
    .includes(query.trim().toLowerCase());
const empty = (query: string) =>
  query.trim()
    ? `No results for "${query.trim()}". Check the spelling or try a shorter search.`
    : "No options available yet.";

function Logo({
  logo,
  small = false,
}: {
  logo?: SelectOption["logo"];
  small?: boolean;
}) {
  if (!logo) return null;
  const size = small ? "h-5 w-5" : "h-8 w-8";
  // eslint-disable-next-line @next/next/no-img-element -- supplied remote logos have unknown dimensions
  return typeof logo === "string" ? (
    <img
      src={logo}
      alt=""
      className={`${size} shrink-0 rounded-ub-xs object-contain`}
    />
  ) : (
    <span
      className={`${size} grid shrink-0 place-items-center overflow-hidden`}
    >
      {logo}
    </span>
  );
}

/** Search lives in the popup; the trigger always shows the saved selection. */
export const SearchableSelectButton = forwardRef<
  HTMLButtonElement,
  SearchableSelectButtonProps
>(function SearchableSelectButton(props, ref) {
  const {
    label,
    ariaLabel,
    options,
    placeholder = "Select...",
    helperText,
    error,
    required = false,
    disabled = false,
    emptyMessage = empty,
    filter = match,
    clearable = false,
    name,
    className = "",
    triggerClassName = "",
    leadingIcon,
    compact = false,
    onBlur,
    actions,
    searchValue,
    onSearchChange,
    serverResults = false,
    resultsVisible = true,
    loading = false,
    loadingMessage = "Searching...",
  } = props;
  const generated = useId();
  const id = props.id ?? `select-${generated}`;
  const listId = `${id}-options`;
  const searchId = `${id}-search`;
  const trigger = useRef<HTMLButtonElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const cachedSelection = useRef<SelectOption | null>(null);
  useImperativeHandle(ref, () => trigger.current as HTMLButtonElement);
  const [open, setOpen] = useState(false);
  const [localQuery, setQuery] = useState("");
  const [active, setActive] = useState(-1);
  const [placement, setPlacement] = useState<{
    left: number;
    top: number;
    width: number;
    maxHeight: number;
    direction: "ltr" | "rtl";
  } | null>(null);
  const placed = placement !== null;
  const query = searchValue ?? localQuery;
  const accessibleName =
    ariaLabel || (typeof label === "string" ? label : undefined) || placeholder;
  const selectedValues = props.multiple
    ? props.value
    : props.value == null
    ? []
    : [props.value];
  const selected = !props.multiple
    ? options.find((option) => option.value === props.value) ??
      (cachedSelection.current?.value === props.value
        ? cachedSelection.current
        : null)
    : null;
  useEffect(() => {
    if (selected) cachedSelection.current = selected;
  }, [selected]);
  const results = useMemo(
    () =>
      serverResults
        ? options
        : options.filter((option) => filter(option, query)),
    [options, query, filter, serverResults]
  );
  const helperId = helperText ? `${id}-helper` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const descriptionId = describedBy(
    errorId,
    helperId,
    props["aria-describedby"]
  );

  const close = useCallback((restore = false) => {
    setOpen(false);
    setQuery("");
    setActive(-1);
    setPlacement(null);
    if (restore) trigger.current?.focus({ preventScroll: true });
  }, []);
  const enabledIndex = (from: number, direction: 1 | -1 = 1) => {
    for (let offset = 0; offset < results.length; offset++) {
      const index =
        (from + direction * offset + results.length) % results.length;
      if (!results[index]?.disabled) return index;
    }
    return -1;
  };
  const openList = (last = false) => {
    if (disabled) return;
    setOpen(true);
    const selectedIndex = results.findIndex(
      (option) => selectedValues.includes(option.value) && !option.disabled
    );
    setActive(
      last
        ? enabledIndex(results.length - 1, -1)
        : selectedIndex >= 0
        ? selectedIndex
        : enabledIndex(0)
    );
  };
  const choose = (option: SelectOption) => {
    if (disabled || option.disabled || loading) return;
    if (props.multiple === true)
      props.onChange(
        props.value.includes(option.value)
          ? props.value.filter((value) => value !== option.value)
          : [...props.value, option.value],
        option
      );
    else {
      cachedSelection.current = option;
      props.onChange(option.value, option);
      close(true);
    }
  };
  const move = (direction: 1 | -1) =>
    setActive(
      enabledIndex(
        active < 0
          ? direction === 1
            ? 0
            : results.length - 1
          : active + direction,
        direction
      )
    );
  const inside = useCallback(
    (target: EventTarget | null) =>
      target instanceof Node &&
      (root.current?.contains(target) || popup.current?.contains(target)),
    []
  );

  // A fixed body portal escapes modal footers, overflow containers and transformed panels.
  useLayoutEffect(() => {
    if (!open || disabled) return;
    const place = () => {
      const anchor = trigger.current?.getBoundingClientRect();
      if (!anchor || !popup.current) return;
      const viewport = window.visualViewport;
      const viewportTop = viewport?.offsetTop ?? 0;
      const viewportHeight = viewport?.height ?? window.innerHeight;
      const viewportWidth = viewport?.width ?? window.innerWidth;
      const below = viewportTop + viewportHeight - anchor.bottom - 12;
      const above = anchor.top - viewportTop - 12;
      const aboveField = below < 220 && above > below;
      const maxHeight = Math.max(80, Math.min(360, aboveField ? above : below));
      const width = Math.min(Math.max(anchor.width, 240), viewportWidth - 24);
      const direction =
        getComputedStyle(trigger.current).direction === "rtl" ? "rtl" : "ltr";
      const left = Math.max(
        12,
        Math.min(
          direction === "rtl" ? anchor.right - width : anchor.left,
          viewportWidth - width - 12
        )
      );
      const height = Math.min(
        popup.current.getBoundingClientRect().height,
        maxHeight
      );
      const top = Math.max(
        viewportTop + 8,
        aboveField ? anchor.top - height - 6 : anchor.bottom + 6
      );
      const next = { left, top, width, maxHeight, direction } as const;
      setPlacement((previous) =>
        previous &&
        Object.keys(next).every((key) => previous[key] === next[key])
          ? previous
          : next
      );
    };
    place();
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(place);
    if (popup.current) observer?.observe(popup.current);
    if (trigger.current) observer?.observe(trigger.current);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    window.visualViewport?.addEventListener("resize", place);
    window.visualViewport?.addEventListener("scroll", place);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      window.visualViewport?.removeEventListener("resize", place);
      window.visualViewport?.removeEventListener("scroll", place);
    };
  }, [open, disabled]);
  useEffect(() => {
    if (!open || disabled) return;
    const outside = (event: PointerEvent) => {
      if (!inside(event.target)) close();
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open, disabled, inside, close]);
  useEffect(() => {
    if (open && placed) search.current?.focus({ preventScroll: true });
  }, [open, placed]);
  useEffect(() => {
    if (open && active >= 0)
      document
        .getElementById(`${id}-option-${active}`)
        ?.scrollIntoView?.({ block: "nearest" });
  }, [active, open, id]);
  useEffect(() => {
    if (disabled) close();
  }, [disabled, close]);
  useEffect(() => {
    if (
      open &&
      resultsVisible &&
      !loading &&
      query.trim() &&
      (active < 0 || active >= results.length)
    ) {
      const index = results.findIndex((option) => !option.disabled);
      if (index !== active) setActive(index);
    }
  }, [open, resultsVisible, loading, query, results, active]);

  const onSearchKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      move(event.key === "ArrowDown" ? 1 : -1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (resultsVisible && !loading && results[active])
        choose(results[active]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close(true);
    } else if (event.key === "Tab") {
      event.stopPropagation();
      close(true);
    }
  };
  const selectedText =
    props.multiple === true
      ? props.value
          .map(
            (value) =>
              options.find((option) => option.value === value)?.label ?? value
          )
          .join(", ")
      : selected?.label ??
        (props.value
          ? serverResults
            ? String(props.value)
            : `${props.value} (not an available option)`
          : "");

  return (
    <div
      ref={root}
      className={`${compact ? "" : fieldWrapper} ${className}`}
      onBlur={(event) => {
        if (!inside(event.relatedTarget)) {
          close();
          onBlur?.();
        }
      }}
    >
      <FieldLabel htmlFor={id} id={`${id}-label`} required={required}>
        {label}
      </FieldLabel>
      <div className="relative">
        <button
          ref={trigger}
          id={id}
          type="button"
          role="combobox"
          disabled={disabled}
          value={props.multiple ? props.value.join(",") : props.value ?? ""}
          aria-label={ariaLabel || (!label ? accessibleName : undefined)}
          aria-haspopup="listbox"
          aria-expanded={open && !disabled}
          aria-controls={describedBy(
            open && resultsVisible ? listId : undefined,
            props["aria-controls"]
          )}
          aria-required={required || undefined}
          aria-invalid={error ? true : props["aria-invalid"]}
          aria-describedby={descriptionId}
          onClick={() => (open ? close() : openList())}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              openList(event.key === "ArrowUp");
            } else if (event.key === "Escape" && open) {
              event.preventDefault();
              event.stopPropagation();
              close(true);
            } else if (
              event.key.length === 1 &&
              event.key !== " " &&
              !event.ctrlKey &&
              !event.metaKey &&
              !event.altKey
            ) {
              event.preventDefault();
              setQuery(event.key);
              onSearchChange?.(event.key);
              openList();
            }
          }}
          className={`${fieldControl} ${
            compact ? "h-10" : fieldControlHeight
          } flex items-center gap-2 text-start ${
            clearable && selectedValues.length ? "pe-20" : "pe-10"
          } ${error ? fieldControlError : ""} ${triggerClassName}`}
        >
          {leadingIcon ||
            (!props.multiple && <Logo logo={selected?.logo} small />)}
          <span
            className={`min-w-0 flex-1 truncate ${
              selectedText ? "" : "text-ub-text-tertiary"
            }`}
            title={selectedText || undefined}
          >
            {selectedText || placeholder}
          </span>
          <ChevronDown
            aria-hidden="true"
            className={`absolute end-3 h-4 w-4 shrink-0 text-ub-icon ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
        {clearable &&
          selectedValues.some((value) => value !== "") &&
          !disabled && (
            <button
              type="button"
              aria-label="Clear selection"
              className="absolute end-9 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-ub-full text-ub-icon hover:bg-ub-surface-subtle"
              onClick={() => {
                if (props.multiple === true) props.onChange([], null);
                else props.onChange(null, null);
                trigger.current?.focus();
              }}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        {name &&
          (props.multiple ? (
            props.value.map((value) => (
              <input key={value} type="hidden" name={name} value={value} />
            ))
          ) : (
            <input type="hidden" name={name} value={props.value ?? ""} />
          ))}
      </div>
      {open &&
        !disabled &&
        createPortal(
          <div
            ref={popup}
            data-select-popup
            dir={placement?.direction}
            className={`${popover} fixed z-[1200] flex flex-col overflow-hidden`}
            style={{
              left: placement?.left ?? 12,
              top: placement?.top ?? 12,
              width: placement?.width ?? 240,
              maxHeight: placement?.maxHeight ?? 360,
              visibility: placement ? "visible" : "hidden",
            }}
          >
            <div className="relative shrink-0 border-b border-ub-border p-2">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute start-5 top-1/2 h-4 w-4 -translate-y-1/2 text-ub-icon"
              />
              <input
                ref={search}
                id={searchId}
                type="search"
                role="searchbox"
                aria-label={`Search ${accessibleName}`}
                aria-controls={resultsVisible ? listId : undefined}
                aria-activedescendant={
                  resultsVisible && active >= 0 && results[active] && !loading
                    ? `${id}-option-${active}`
                    : undefined
                }
                autoComplete="off"
                value={query}
                onKeyDown={onSearchKey}
                onChange={(event) => {
                  setQuery(event.target.value);
                  onSearchChange?.(event.target.value);
                  setActive(-1);
                }}
                placeholder="Search options..."
                className={`${fieldControl} h-10 ps-9 text-base sm:text-sm`}
              />
            </div>
            {resultsVisible && (
              <ul
                id={listId}
                role="listbox"
                aria-label={accessibleName}
                aria-multiselectable={props.multiple || undefined}
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1"
              >
                {!loading &&
                  results.map((option, index) => (
                    <li
                      key={`${option.value}-${index}`}
                      id={`${id}-option-${index}`}
                      role="option"
                      aria-selected={selectedValues.includes(option.value)}
                      aria-disabled={option.disabled || undefined}
                      data-value={option.value}
                      onMouseDown={(event) => event.preventDefault()}
                      onMouseEnter={() => !option.disabled && setActive(index)}
                      onClick={() => choose(option)}
                      className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-ub-md px-3 py-2 text-start text-ub-body-sm ${
                        option.disabled
                          ? "cursor-not-allowed text-ub-text-disabled"
                          : selectedValues.includes(option.value)
                          ? "bg-ub-selected text-ub-text-primary"
                          : index === active
                          ? "bg-ub-surface-subtle text-ub-text-primary"
                          : "text-ub-text-primary hover:bg-ub-surface-subtle"
                      }`}
                    >
                      <Logo logo={option.logo} />
                      <span className="min-w-0 flex-1">
                        <span className="block break-words">
                          {option.label}
                        </span>
                        {option.description && (
                          <span className="block break-words text-ub-caption text-ub-text-tertiary">
                            {option.description}
                          </span>
                        )}
                      </span>
                      {option.meta && (
                        <span className="shrink-0 text-ub-caption text-ub-text-tertiary">
                          {option.meta}
                        </span>
                      )}
                      {selectedValues.includes(option.value) && (
                        <Check
                          aria-hidden="true"
                          className="h-4 w-4 shrink-0 text-ub-text-link"
                        />
                      )}
                    </li>
                  ))}
              </ul>
            )}
            {loading ? (
              <p
                role="status"
                className="p-3 text-ub-body-sm text-ub-text-secondary"
              >
                {loadingMessage}
              </p>
            ) : !resultsVisible ? (
              <p className="p-3 text-ub-body-sm text-ub-text-secondary">
                Type to search for options.
              </p>
            ) : !results.length ? (
              <p
                role="status"
                className="p-3 text-ub-body-sm text-ub-text-secondary"
              >
                {emptyMessage(query)}
              </p>
            ) : null}
            {props.multiple && (
              <p
                role="status"
                className="shrink-0 border-t border-ub-border px-3 py-2 text-ub-caption text-ub-text-secondary"
              >
                {selectedValues.length} selected
              </p>
            )}
            {!loading && !results.length && actions}
            <span className="sr-only" aria-live="polite">
              {resultsVisible && !loading
                ? `${results.length} results available.`
                : ""}
            </span>
          </div>,
          document.body
        )}
      <FieldError id={errorId}>{error}</FieldError>
      <FieldHelper id={helperId}>{helperText}</FieldHelper>
    </div>
  );
});
export default SearchableSelectButton;
