import React, { ReactNode } from "react";
import { buttonBase, buttonSizes, buttonVariants, type ButtonSize, type ButtonVariant } from "components/ub/recipes";

type ButtonProps = {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  icon?: ReactNode;
  text?: string;
  /** Design-system variant (brief §4.1). Defaults to "secondary" when no legacy colour props are passed. */
  variant?: ButtonVariant;
  /** sm 32 · md 40 (default) · lg 48. */
  size?: ButtonSize;
  /** Legacy colour overrides — still honoured when passed. Prefer `variant`. */
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
  hoverTextColor?: string;
  hoverBorderColor?: string;
  className?: string;
  /** Extra classes for the label span, e.g. "hidden sm:inline" for icon-only on mobile. */
  textClassName?: string;
  title?: string;
  type?: "button" | "submit" | "reset";
};

export type LegacyColorProps = {
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
  hoverBgColor?: string;
  hoverTextColor?: string;
  hoverBorderColor?: string;
};

/**
 * Resolves the colour classes for a button: an explicit `variant` wins; else,
 * if the caller passed any legacy colour class, those are used (missing ones
 * fall back to the secondary look); else the `fallback` variant.
 */
export function resolveButtonColors(
  variant: ButtonVariant | undefined,
  legacy: LegacyColorProps,
  fallback: ButtonVariant = "secondary",
): string {
  const { bgColor, textColor, borderColor, hoverBgColor, hoverTextColor, hoverBorderColor } = legacy;
  const hasLegacy = [bgColor, textColor, borderColor, hoverBgColor, hoverTextColor, hoverBorderColor].some(
    (c) => c !== undefined,
  );
  if (variant || !hasLegacy) {
    // Legacy classes passed alongside a variant are appended as overrides.
    return [buttonVariants[variant ?? fallback], hasLegacy && Object.values(legacy).filter(Boolean).join(" ")]
      .filter(Boolean)
      .join(" ");
  }
  return [
    "border-ub-strong",
    bgColor ?? "bg-ub-surface",
    textColor ?? "text-ub-action-secondary-text",
    borderColor ?? "border-ub-action-secondary",
    hoverBgColor ?? (bgColor === undefined ? "hover:bg-ub-action-secondary-hover" : ""),
    hoverTextColor ?? "",
    hoverBorderColor ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  disabled,
  icon,
  text,
  variant,
  size = "md",
  bgColor,
  textColor,
  borderColor,
  hoverTextColor,
  hoverBorderColor,
  className,
  textClassName,
  title,
  type = "button",
}) => {
  const colors = resolveButtonColors(variant, { bgColor, textColor, borderColor, hoverTextColor, hoverBorderColor });
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${buttonBase} ${buttonSizes[size]} ${colors} ${className || ""}`}
    >
      {icon && <span className="flex shrink-0 items-center">{icon}</span>}
      {text && <span className={`truncate ${textClassName || ""}`}>{text}</span>}
    </button>
  );
};

export default Button;
