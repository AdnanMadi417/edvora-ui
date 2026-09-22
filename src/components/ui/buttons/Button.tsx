import React, { ReactNode } from "react";

type ButtonProps = {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  icon?: ReactNode;
  text?: string;
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

const Button: React.FC<ButtonProps> = ({
                                         onClick,
                                         disabled,
                                         icon,
                                         text,
                                         bgColor = "bg-white",
                                         textColor = "text-blue-600",
                                         borderColor = "border-blue-600",
                                         hoverTextColor = "hover:text-blue-700",
                                         hoverBorderColor = "hover:border-blue-700",
                                         className,
                                         textClassName,
                                         title,
                                         type = "button",
                                       }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex min-w-0 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition
        ${bgColor} ${textColor} ${borderColor} ${hoverTextColor} ${hoverBorderColor} disabled:cursor-not-allowed disabled:opacity-50
        ${className || ""}`}
    >
      {icon && <span className="flex shrink-0 items-center">{icon}</span>}
      {text && <span className={`truncate ${textClassName || ""}`}>{text}</span>}
    </button>
  );
};

export default Button;
