import React, { ReactNode } from "react";
import { buttonBase, buttonSizes, buttonVariants, type ButtonSize, type ButtonVariant } from "components/ub/recipes";

type ButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
  text: string;
  /** Leading icon (usually an arrow) — mirrored in RTL. */
  icon?: ReactNode;
  className?: string;
  /** Defaults to "secondary". */
  variant?: ButtonVariant;
  /** Defaults to "md". */
  size?: ButtonSize;
};

const Button: React.FC<ButtonProps> = ({ onClick, disabled, text, icon, className, variant = "secondary", size = "md" }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${buttonBase} ${buttonSizes[size]} ${buttonVariants[variant]} ${className || ""}`}
    >
      {icon && <span className="flex items-center rtl:-scale-x-100">{icon}</span>}
      {text}
    </button>
  );
};

export default Button;
