import React, { ReactNode } from "react";

type ButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
  icon?: ReactNode;
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
      className={`flex items-center justify-center border rounded-full p-2 text-sm font-medium transition 
        ${bgColor} ${textColor} ${borderColor} ${hoverTextColor} ${hoverBorderColor} disabled:opacity-50 disabled:cursor-not-allowed
        ${className || ""}`}
    >
      {icon && <span className="flex items-center">{icon}</span>}
    </button>
  );
};

export default Button;
