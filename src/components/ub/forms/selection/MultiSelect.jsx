"use client";

import React, { useId, useMemo, useRef, useState, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";
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
} from "../layout/FieldChrome";

/** Searchable multi-select: arrows move, Enter/Space select, Escape returns focus. */
export default function MultiSelect({
  label,
  field,
  options = [],
  required = true,
  formData,
  errors,
  updateFormData,
  placeholder = "Select...",
  disabledOptions = [],
  disabled = false,
  hint = undefined,
}) {
  const id = useId();
  const root = useRef(null);
  const trigger = useRef(null);
  const search = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(-1);
  const values =
    field
      .split(/[.[\]]/)
      .filter(Boolean)
      .reduce((data, key) => data?.[key], formData) ?? [];
  const error = errors?.[field];
  const results = useMemo(
    () =>
      options.filter((option) =>
        String(option.label).toLowerCase().includes(query.toLowerCase())
      ),
    [options, query]
  );
  const isDisabled = (option) =>
    option.disabled || disabledOptions.includes(option.value);
  const labels = values.map(
    (value) =>
      options.find((option) => option.value === value)?.label ?? String(value)
  );
  const close = (restore = false) => {
    setOpen(false);
    setQuery("");
    setActive(-1);
    if (restore) trigger.current?.focus();
  };
  const toggle = (option) => {
    if (disabled || isDisabled(option)) return;
    updateFormData(
      field,
      values.includes(option.value)
        ? values.filter((value) => value !== option.value)
        : [...values, option.value]
    );
  };
  const move = (direction) => {
    for (let offset = 1; offset <= results.length; offset += 1) {
      const start = active < 0 ? (direction === 1 ? -1 : 0) : active;
      const index =
        (start + direction * offset + results.length) % results.length;
      if (!isDisabled(results[index])) {
        setActive(index);
        return;
      }
    }
  };
  useEffect(() => {
    if (open) search.current?.focus();
  }, [open]);
  useEffect(() => {
    if (active >= 0)
      document
        .getElementById(`${id}-option-${active}`)
        ?.scrollIntoView?.({ block: "nearest" });
  }, [active, id]);
  useEffect(() => {
    const outside = (event) => {
      if (root.current && !root.current.contains(event.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);
  return (
    <div
      ref={root}
      data-field={field}
      className={`relative ${fieldWrapper}`}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) close();
      }}
    >
      <FieldLabel htmlFor={`${id}-trigger`} required={required}>
        {label}
      </FieldLabel>
      <button
        ref={trigger}
        id={`${id}-trigger`}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-describedby={describedBy(
          error && `${id}-error`,
          hint && `${id}-hint`
        )}
        onClick={() => {
          if (open) close();
          else setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className={`${fieldControl} ${fieldControlHeight} flex items-center justify-between gap-2 text-start ${
          error ? fieldControlError : ""
        }`}
      >
        <span
          className={`min-w-0 flex-1 truncate ${
            labels.length ? "text-ub-text-primary" : "text-ub-text-tertiary"
          }`}
        >
          {labels.length ? labels.join(", ") : placeholder}
        </span>
        <ChevronDown
          aria-hidden="true"
          className="h-5 w-5 shrink-0 text-ub-icon-default"
        />
      </button>
      {open && !disabled && (
        <div className={`${popover} absolute inset-x-0 top-full z-50 mt-1 p-2`}>
          <input
            ref={search}
            role="combobox"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            aria-label={`Search ${label || "options"}`}
            aria-expanded={open}
            aria-controls={`${id}-list`}
            aria-autocomplete="list"
            aria-activedescendant={
              active >= 0 && results[active]
                ? `${id}-option-${active}`
                : undefined
            }
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(-1);
            }}
            placeholder="Search options"
            className={`${fieldControl} h-10`}
            onKeyDown={(event) => {
              if (["ArrowDown", "ArrowUp"].includes(event.key)) {
                event.preventDefault();
                move(event.key === "ArrowDown" ? 1 : -1);
              }
              if (event.key === "Home" || event.key === "End") {
                event.preventDefault();
                const indices = results
                  .map((_, i) => i)
                  .filter((i) => !isDisabled(results[i]));
                setActive(
                  (event.key === "Home"
                    ? indices[0]
                    : indices[indices.length - 1]) ?? -1
                );
              }
              if (event.key === "Enter" || (event.key === " " && active >= 0)) {
                event.preventDefault();
                if (results[active]) toggle(results[active]);
              }
              if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                close(true);
              }
            }}
          />
          <ul
            id={`${id}-list`}
            role="listbox"
            aria-label={label}
            aria-multiselectable="true"
            className="mt-2 max-h-60 overflow-y-auto overscroll-contain"
          >
            {results.map((option, index) => (
              <li
                id={`${id}-option-${index}`}
                key={option.value}
                role="option"
                aria-selected={values.includes(option.value)}
                aria-disabled={isDisabled(option) || undefined}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => toggle(option)}
                onMouseEnter={() => !isDisabled(option) && setActive(index)}
                className={`flex min-h-10 cursor-pointer items-center gap-2 rounded-ub-md px-3 py-2 text-ub-body-sm ${
                  isDisabled(option)
                    ? "cursor-not-allowed text-ub-text-disabled"
                    : values.includes(option.value)
                    ? "bg-ub-selected text-ub-text-primary"
                    : active === index
                    ? "bg-ub-surface-subtle text-ub-text-primary"
                    : "text-ub-text-primary hover:bg-ub-surface-subtle"
                }`}
              >
                <span className="min-w-0 flex-1">{option.label}</span>
                {values.includes(option.value) && (
                  <Check
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-ub-text-link"
                  />
                )}
              </li>
            ))}
          </ul>
          {!results.length && (
            <p
              role="status"
              className="p-3 text-ub-body-sm text-ub-text-secondary"
            >
              No results found.
            </p>
          )}
          <p
            aria-live="polite"
            className="mt-2 text-ub-caption text-ub-text-secondary"
          >
            {values.length} selected
          </p>
        </div>
      )}
      <FieldError id={`${id}-error`}>{error}</FieldError>
      <FieldHelper id={`${id}-hint`}>{hint}</FieldHelper>
    </div>
  );
}
