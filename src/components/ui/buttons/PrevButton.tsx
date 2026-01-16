import React, { ReactNode } from "react";

type ButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
  text: string;
  icon?: ReactNode;
  className?: string;
};

const Button: React.FC<ButtonProps> = ({ onClick, disabled, text, icon, className }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 rounded-full border border-gray-600 text-gray-600 px-4 py-2 text-sm font-medium transition hover:border-gray-700 hover:text-gray-700 disabled:opacity-50 ${className || ""}`}
    >
      {icon && <span className="flex items-center">{icon}</span>}
      {text}
    </button>
  );
};

export default Button;
