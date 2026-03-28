import Link from "next/link";
import { ReactNode } from "react";

type IconLinkBtnProps = {
  href: string;
  icon: ReactNode;
  title?: string;
  className?: string;
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
  hoverTextColor?: string;
  hoverBorderColor?: string;
};

const IconLinkBtn = ({
                       href,
                       icon,
                       title,
                       className,
                       bgColor = "bg-transparent",
                       textColor = "text-blue-600",
                       borderColor = "border border-blue-600",
                       hoverTextColor = "hover:text-blue-700",
                       hoverBorderColor = "hover:border-blue-700",
                     }: IconLinkBtnProps) => {
  return (
    <Link
      href={href}
      title={title}
      className={`
        inline-flex items-center justify-center rounded-full p-2 transition
        ${bgColor} ${textColor} ${borderColor}
        ${hoverTextColor} ${hoverBorderColor}
        ${className || ""}
      `}
    >
      {icon}
    </Link>
  );
};

export default IconLinkBtn;
