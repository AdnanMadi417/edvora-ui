"use client";

import { useState } from "react";
import { SearchX } from "lucide-react";
import Input from "components/ub/forms/text/Input";
import Toggle from "./Toggle";

export interface RequirementOption {
  id: string;
  label: string;
}

export interface RequirementSelectorProps {
  fields: RequirementOption[];
  value: Record<string, boolean>;
  onChange: (id: string, required: boolean) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
  label?: string;
}

/** Search changes the visible fields only; requirement choices remain controlled by the caller. */
export default function RequirementSelector({
  fields,
  value,
  onChange,
  errors = {},
  disabled = false,
  label = "Field requirements",
}: RequirementSelectorProps) {
  const [query, setQuery] = useState("");
  const visible = fields.filter((field) =>
    field.label.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())
  );
  return (
    <fieldset disabled={disabled} className="min-w-0 space-y-4">
      <legend className="sr-only">{label}</legend>
      <Input
        label="Search application fields"
        hideLabel
        leadingIcon="search"
        placeholder="Find a field…"
        value={query}
        onChange={setQuery}
        disabled={disabled}
        wrapperClassName=""
      />
      <p role="status" className="text-ub-caption text-ub-text-tertiary">
        {query.trim()
          ? `${visible.length} of ${fields.length} fields shown`
          : `${fields.length} fields available`}{" "}
        · Turn on a field to make it required.
      </p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {visible.map((field) => (
          <li
            key={field.id}
            data-field={`required_fields_map.${field.id}`}
            className={`min-w-0 rounded-ub-md border p-4 transition-colors duration-ub-fast motion-reduce:transition-none ${
              value[field.id]
                ? "border-ub-tone-brand-border bg-ub-tone-brand-bg"
                : "border-ub-border bg-ub-surface"
            }`}
          >
            <Toggle
              label={field.label}
              description={
                value[field.id] ? "Required for submission" : "Optional"
              }
              checked={!!value[field.id]}
              onChange={(required) => onChange(field.id, required)}
              error={errors[field.id]}
              disabled={disabled}
              switchPosition="end"
            />
          </li>
        ))}
      </ul>
      {!visible.length && (
        <div className="rounded-ub-md bg-ub-surface-subtle p-6 text-center">
          <SearchX
            aria-hidden="true"
            className="mx-auto mb-2 h-6 w-6 text-ub-icon-default"
          />
          <p className="text-ub-label-md text-ub-text-primary">
            No matching fields
          </p>
          <p className="mt-1 text-ub-body-sm text-ub-text-secondary">
            Try a different search. Your requirement selections are kept.
          </p>
        </div>
      )}
    </fieldset>
  );
}
