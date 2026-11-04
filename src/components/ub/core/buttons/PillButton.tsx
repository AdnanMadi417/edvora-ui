import React, { ReactNode } from "react";
import { buttonBase, buttonSizes, type ButtonSize, type ButtonVariant } from "components/ub/recipes";
import { resolveButtonColors } from "components/ub/core/buttons/Button";

type PillButtonProps = {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  icon?: ReactNode;
  text?: string;
  /** Design-system variant (brief §4.1). Defaults to "secondary" when no legacy colour props are passed. */
  variant?: ButtonVariant;
  /** Defaults to "lg" (48px), the marketing-CTA size this component has always had. */
  size?: ButtonSize;
  /** Legacy colour overrides — still honoured when passed. Prefer `variant`. */
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
  hoverBgColor?: string;
  hoverTextColor?: string;
  hoverBorderColor?: string;
  className?: string;
  title?: string;
  type?: "button" | "submit" | "reset";
};

// Every button in the design system is a pill now (brief §4.1), so this is
// Button at size lg by default, sharing the same recipes.
const PillButton: React.FC<PillButtonProps> = ({
  onClick,
  disabled,
  icon,
  text,
  variant,
  size = "lg",
  bgColor,
  textColor,
  borderColor,
  hoverBgColor,
  hoverTextColor,
  hoverBorderColor,
  className,
  title,
  type = "button",
}) => {
  const colors = resolveButtonColors(variant, {
    bgColor,
    textColor,
    borderColor,
    hoverBgColor,
    hoverTextColor,
    hoverBorderColor,
  });
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${buttonBase} ${buttonSizes[size]} ${colors} ${className || ""}`}
    >
      {icon && <span className="flex shrink-0 items-center">{icon}</span>}
      {text && <span className="truncate">{text}</span>}
    </button>
  );
};

export default PillButton;
