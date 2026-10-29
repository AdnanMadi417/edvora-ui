"use client";

// 40×24 switch (brief §4.2) for settings that apply instantly — no Save button.
// For choices submitted with a form, use Checkbox instead.
import React, { forwardRef, useId } from "react";
import { toggleThumb, toggleTrack } from "components/ub/recipes";

export type ToggleProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "type"> & {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  /** Put the switch at the inline end of the row (settings lists). Default: start. */
  switchPosition?: "start" | "end";
  className?: string;
};

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(function Toggle(
  { checked, onChange, label, description, switchPosition = "start", id: idProp, className = "", disabled, ...rest },
  ref,
) {
  const autoId = useId();
  const id = idProp ?? `ub-toggle-${autoId}`;
  const labelId = label ? `${id}-label` : undefined;
  const descId = description ? `${id}-desc` : undefined;

  const control = (
    <button
      ref={ref}
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelId}
      aria-describedby={descId}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      {...rest}
      // The 40×24 track is already a ≥24px target.
      className={`${toggleTrack(checked)} cursor-pointer motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-50`}
    >
      <span aria-hidden="true" className={`${toggleThumb(checked)} motion-reduce:transition-none`} />
    </button>
  );

  if (!label && !description) return <span className={className}>{control}</span>;

  return (
    <div className={`flex items-start gap-3 ${switchPosition === "end" ? "justify-between" : ""} ${className}`}>
      {switchPosition === "start" && control}
      <div className="min-w-0 pt-0.5">
        {label && (
          // A <label> names the switch and clicking it toggles, like a native checkbox.
          <label
            id={labelId}
            htmlFor={id}
            className={`block text-ub-label-md ${disabled ? "cursor-not-allowed text-ub-text-disabled" : "cursor-pointer text-ub-text-primary"}`}
          >
            {label}
          </label>
        )}
        {description && (
          <p id={descId} className="mt-0.5 text-ub-body-sm text-ub-text-tertiary">
            {description}
          </p>
        )}
      </div>
      {switchPosition === "end" && control}
    </div>
  );
});

export default Toggle;
