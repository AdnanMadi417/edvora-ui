"use client";

// Generic controlled text field (brief §4.2). Label above in label-md,
// "(optional)" when not required, helper text below, and an error message that
// says what happened and how to fix it. Height 48 on mobile, 40 from md up.
import React, { forwardRef, useId } from "react";
import { fieldControl, fieldControlError, fieldControlHeight, fieldWrapper } from "components/ub/recipes";
import { FieldError, FieldHelper, FieldLabel, describedBy } from "components/ub/forms/FieldChrome";
import { Icon, type IconName } from "components/ub/icons/Icon";

export type InputSize = "md" | "lg";

export type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "size" | "prefix"> & {
  label?: React.ReactNode;
  value: string;
  onChange: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  helperText?: React.ReactNode;
  /** What happened and how to fix it, e.g. "Enter the passport number exactly as printed." */
  error?: React.ReactNode;
  leadingIcon?: IconName;
  trailingIcon?: IconName;
  /** Short text before the value, e.g. "RM" or "+60". Switches the value to tabular numerals. */
  prefix?: string;
  /** Short text after the value, e.g. "%" or "months". */
  suffix?: string;
  /** Reference IDs and passport numbers: .ub-ref and auto-uppercase. */
  reference?: boolean;
  /** md: 48 mobile / 40 desktop (default). lg: 48 everywhere. */
  size?: InputSize;
  /** Hide the label visually but keep it for screen readers. */
  hideLabel?: boolean;
  wrapperClassName?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    value,
    onChange,
    helperText,
    error,
    leadingIcon,
    trailingIcon,
    prefix,
    suffix,
    reference = false,
    size = "md",
    hideLabel = false,
    required = false,
    id: idProp,
    className = "",
    wrapperClassName = fieldWrapper,
    disabled,
    "aria-describedby": ariaDescribedBy,
    autoCapitalize,
    spellCheck,
    ...rest
  },
  ref,
) {
  const autoId = useId();
  const id = idProp ?? `ub-input-${autoId}`;
  const helperId = helperText ? `${id}-helper` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const hasStart = Boolean(leadingIcon || prefix);
  const hasEnd = Boolean(trailingIcon || suffix);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (reference) {
      // Uppercase in place and keep the caret where the user is typing.
      const el = e.target;
      const { selectionStart, selectionEnd } = el;
      const upper = el.value.toUpperCase();
      if (upper !== el.value) {
        el.value = upper;
        if (selectionStart !== null && selectionEnd !== null) el.setSelectionRange(selectionStart, selectionEnd);
      }
    }
    onChange(e.target.value, e);
  };

  const adornment = "pointer-events-none absolute top-1/2 flex -translate-y-1/2 items-center text-ub-icon-default";
  const affix = "text-ub-body-md text-ub-text-tertiary ub-tabular";

  return (
    <div className={wrapperClassName}>
      <FieldLabel htmlFor={id} required={required} className={hideLabel ? "sr-only" : ""}>
        {label}
      </FieldLabel>
      <div className="relative">
        {hasStart && (
          <span className={`${adornment} start-3 gap-2`}>
            {leadingIcon && <Icon name={leadingIcon} size={20} />}
            {prefix && <span className={affix}>{prefix}</span>}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          value={value}
          onChange={handleChange}
          aria-required={required || undefined}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(errorId, helperId, ariaDescribedBy)}
          autoCapitalize={reference ? "characters" : autoCapitalize}
          spellCheck={reference ? false : spellCheck}
          {...rest}
          className={[
            fieldControl,
            size === "lg" ? "h-12" : fieldControlHeight,
            error && fieldControlError,
            (prefix || reference) && "ub-tabular",
            reference && "ub-ref uppercase placeholder:normal-case",
            // Room for adornments: 12px edge + content + 8px gap.
            hasStart && (prefix && leadingIcon ? "ps-[4.5rem]" : prefix ? (prefix.length > 2 ? "ps-14" : "ps-11") : "ps-10"),
            hasEnd && (suffix && suffix.length > 2 ? "pe-20" : "pe-10"),
            className,
          ]
            .filter(Boolean)
            .join(" ")}
        />
        {hasEnd && (
          <span className={`${adornment} end-3 gap-2`}>
            {suffix && <span className={affix}>{suffix}</span>}
            {trailingIcon && <Icon name={trailingIcon} size={20} />}
          </span>
        )}
      </div>
      <FieldError id={errorId}>{error}</FieldError>
      <FieldHelper id={helperId}>{helperText}</FieldHelper>
    </div>
  );
});

export default Input;
