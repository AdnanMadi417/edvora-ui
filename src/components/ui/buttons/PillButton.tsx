import React, { ReactNode } from "react";

type PillButtonProps = {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  icon?: ReactNode;
  text?: string;
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

// Shaped after the "Login" button on unibexs.com — verified live via
// Playwright (screenshot + computed styles), not guessed: a full pill,
// ~1.5px border, brand-blue border/text on a transparent fill, generous
// px-6/h-12 sizing, regular (not bold) weight. Defaults to that outline
// look; bgColor/hoverBgColor let a caller go solid (a filled brand-blue
// or other primary CTA) while keeping the same pill shape and sizing —
// use this instead of Button (which hardcodes a rounded-lg box) anywhere
// a pill-shaped button is wanted.
//
// !rounded-full, not plain rounded-full: this project's custom
// borderRadius scale (--radius-lg: 16px vs --radius-full: 9999px, in
// tailwind.config.js) happens to emit .rounded-lg after .rounded-full in
// the compiled CSS, so a plain rounded-full on a bordered box can lose
// that cascade fight — !important doesn't.
//
// transition-all duration-200 (not the bare `transition` Button uses) plus
// a subtle hover/active scale, matching SiteFooter's CTA — deliberately
// smoother than Button's default, since a pill this prominent benefits
// from feeling tactile.
const PillButton: React.FC<PillButtonProps> = ({
  onClick,
  disabled,
  icon,
  text,
  bgColor = "bg-transparent",
  textColor = "text-blue-700",
  borderColor = "border-blue-700",
  hoverBgColor = "hover:bg-blue-50",
  hoverTextColor = "hover:text-blue-800",
  hoverBorderColor = "hover:border-blue-800",
  className,
  title,
  type = "button",
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex h-12 min-w-0 items-center justify-center gap-2 !rounded-full border px-6 text-[15px] font-normal
        transition-all duration-200 motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.97]
        ${bgColor} ${textColor} ${borderColor} ${hoverBgColor} ${hoverTextColor} ${hoverBorderColor} disabled:cursor-not-allowed disabled:opacity-50
        ${className || ""}`}
    >
      {icon && <span className="flex shrink-0 items-center">{icon}</span>}
      {text && <span className="truncate">{text}</span>}
    </button>
  );
};

export default PillButton;
