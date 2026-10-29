import React, { ReactNode } from "react";
import { buttonBase, iconButtonSizes, type ButtonSize, type ButtonVariant } from "components/ub/recipes";
import { resolveButtonColors } from "components/ub/core/Button";

type ButtonProps = {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  icon?: ReactNode;
  /** Design-system variant (brief §4.1). Defaults to "secondary" when no legacy colour props are passed. */
  variant?: ButtonVariant;
  /** Circle diameter: sm 32 · md 40 (default) · lg 48. */
  size?: ButtonSize;
  /** Legacy colour overrides — still honoured when passed. Prefer `variant`. */
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
  hoverTextColor?: string;
  hoverBorderColor?: string;
  className?: string;
  title?: string;
  type?: "button" | "submit" | "reset";
  "aria-label"?: string;
};

/** Circular icon button. Always pass `aria-label` (or `title`, used as the label). */
const Button: React.FC<ButtonProps> = ({
  onClick,
  disabled,
  icon,
  variant,
  size = "md",
  bgColor,
  textColor,
  borderColor,
  hoverTextColor,
  hoverBorderColor,
  className,
  title,
  type,
  "aria-label": ariaLabel,
}) => {
  const colors = resolveButtonColors(variant, { bgColor, textColor, borderColor, hoverTextColor, hoverBorderColor });
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel ?? title}
      className={`${buttonBase} ${iconButtonSizes[size]} shrink-0 p-0 ${colors} ${className || ""}`}
    >
      {icon && <span className="flex items-center">{icon}</span>}
    </button>
  );
};

export default Button;
