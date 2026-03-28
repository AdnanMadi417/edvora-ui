import React, { ReactNode } from "react";

type ButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
  icon?: ReactNode;
  text?: string;
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
  hoverTextColor?: string;
  hoverBorderColor?: string;
  className?: string;
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
                                       }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition justify-center p-2
        ${bgColor} ${textColor} ${borderColor} ${hoverTextColor} ${hoverBorderColor} transition-transform disabled:opacity-50 disabled:cursor-not-allowed
        ${className || ""}`}
    >
      {icon && <span className="flex items-center">{icon}</span>}
      {text}
    </button>
  );
};

export default Button;
