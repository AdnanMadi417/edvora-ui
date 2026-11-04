// Shared label / helper / error chrome for the form field components
// (docs/unibexs-frontend-redesign-brief.md §4.2). Composes the recipes in
// components/ui/ub/recipes.ts so every field reads the same in light and dark.
import React from "react";
import { Check, ChevronDown, CircleAlert } from "lucide-react";
import { fieldError, fieldHelper, fieldLabel, fieldOptional, focusRing } from "components/ub/recipes";

/** Native <select> on top of the field recipe: our own chevron, room for it at the end. */
export const selectControl = "cursor-pointer appearance-none pe-10 [&>option]:text-ub-text-primary [&>option]:bg-ub-surface";

/** Focus ring drawn on a visual control when its visually hidden peer input has keyboard focus. */
export const peerFocusRing =
  "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ub-border-focus";

/** Same ring for a card wrapping a hidden input (focus-within + keyboard only). */
export const focusWithinRing =
  "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ub-border-focus";

export { focusRing };

/** Join ids for aria-describedby, dropping empty ones. */
export const describedBy = (...ids: Array<string | false | null | undefined>) => ids.filter(Boolean).join(" ") || undefined;

interface FieldLabelProps {
  children?: React.ReactNode;
  htmlFor?: string;
  id?: string;
  /** Required fields carry no visual mark; optional ones get "(optional)". */
  required?: boolean;
  /** Hide the "(optional)" marker (e.g. toggles, which always hold a value). */
  hideOptional?: boolean;
  className?: string;
  as?: "label" | "span" | "legend";
}

export function FieldLabel({ children, htmlFor, id, required = true, hideOptional = false, className = "", as = "label" }: FieldLabelProps) {
  if (children === undefined || children === null || children === "") return null;
  const Tag = as as React.ElementType;
  return (
    <Tag id={id} htmlFor={as === "label" ? htmlFor : undefined} className={`${fieldLabel} ${className}`}>
      {children}
      {!required && !hideOptional && <span className={fieldOptional}> (optional)</span>}
    </Tag>
  );
}

export function FieldError({ id, children, className = "" }: { id?: string; children?: React.ReactNode; className?: string }) {
  if (!children) return null;
  return (
    <p id={id} className={`${fieldError} ${className}`}>
      <CircleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
      <span>{children}</span>
    </p>
  );
}

export function FieldHelper({ id, children, className = "" }: { id?: string; children?: React.ReactNode; className?: string }) {
  if (!children) return null;
  return (
    <p id={id} className={`${fieldHelper} ${className}`}>
      {children}
    </p>
  );
}

/** 20px chevron at the inline end of a native select. Not mirrored: it points down. */
export function SelectChevron() {
  return (
    <ChevronDown
      aria-hidden="true"
      strokeWidth={1.75}
      className="pointer-events-none absolute end-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ub-icon-default"
    />
  );
}

/**
 * 20px radio with a 6px dot (brief §4.2). Render it right after a
 * `peer sr-only` radio input so the input keeps native keyboard behaviour.
 */
export function RadioMark({ checked, invalid = false }: { checked: boolean; invalid?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`grid h-5 w-5 shrink-0 place-items-center rounded-ub-full border transition-colors duration-ub-fast ease-ub-standard motion-reduce:transition-none ${peerFocusRing} ${
        checked
          ? "border-ub-action-primary bg-ub-action-primary"
          : `bg-ub-surface ${invalid ? "border-ub-danger-500" : "border-ub-border-control"}`
      }`}
    >
      {checked && <span className="h-1.5 w-1.5 rounded-ub-full bg-ub-action-primary-text" />}
    </span>
  );
}

/** Check glyph drawn over the `checkbox` recipe (the recipe only paints the fill). */
export function CheckboxMark({ checked }: { checked: boolean }) {
  if (!checked) return null;
  return (
    <Check
      aria-hidden="true"
      strokeWidth={3}
      className="pointer-events-none absolute inset-0 m-auto h-3.5 w-3.5 text-ub-action-primary-text"
    />
  );
}
