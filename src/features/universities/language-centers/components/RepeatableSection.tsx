"use client";
import { type ReactNode } from "react";
import Button from "components/ub/core/buttons/Button";

/** Shared add/remove layout; stable IDs preserve keyboard focus during edits. */
export default function RepeatableSection<T extends { id: string }>({
  title,
  singular,
  items,
  create,
  onChange,
  children,
}: {
  title: string;
  singular: string;
  items: T[];
  create: () => T;
  onChange: (items: T[]) => void;
  children: (
    item: T,
    update: (patch: Partial<T>) => void,
    index: number
  ) => ReactNode;
}) {
  return (
    <section className="space-y-3" aria-label={title}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-ub-heading-sm text-ub-text-primary">{title}</h4>
        <Button
          size="sm"
          text={`Add ${singular}`}
          onClick={() => onChange([...items, create()])}
        />
      </div>
      {!items.length && (
        <p className="text-ub-body-sm text-ub-text-tertiary">
          No {title.toLowerCase()} added.
        </p>
      )}
      {items.map((item, index) => (
        <fieldset
          key={item.id}
          className="min-w-0 space-y-4 rounded-ub-lg border border-ub-border p-4"
        >
          <legend className="px-1 text-ub-label-sm text-ub-text-secondary">
            {singular} {index + 1}
          </legend>
          {children(
            item,
            (patch) =>
              onChange(
                items.map((row) =>
                  row.id === item.id ? { ...row, ...patch } : row
                )
              ),
            index
          )}
          <Button
            size="sm"
            variant="tertiary"
            text={`Remove ${singular} ${index + 1}`}
            onClick={() => onChange(items.filter((row) => row.id !== item.id))}
          />
        </fieldset>
      ))}
    </section>
  );
}
