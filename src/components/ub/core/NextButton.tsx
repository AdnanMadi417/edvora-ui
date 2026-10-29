import React, { ReactNode } from "react";
import { buttonBase, buttonSizes, buttonVariants, type ButtonSize, type ButtonVariant } from "components/ub/recipes";

type ButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
  text: string;
  /** Trailing icon (usually an arrow) — mirrored in RTL. */
  icon?: ReactNode;
  className?: string;
  /** Defaults to "primary". */
  variant?: ButtonVariant;
  /** Defaults to "md". */
  size?: ButtonSize;
};

const Button: React.FC<ButtonProps> = ({ onClick, disabled, text, icon, className, variant = "primary", size = "md" }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${buttonBase} ${buttonSizes[size]} ${buttonVariants[variant]} ${className || ""}`}
    >
      {text}
      {icon && <span className="flex items-center rtl:-scale-x-100">{icon}</span>}
    </button>
  );
};

export default Button;
