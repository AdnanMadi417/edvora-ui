import Link from 'next/link';
import { ReactNode } from 'react';

type IconLinkBtnProps = {
  href: string;
  icon: ReactNode;
  label?: string;
  title?: string;
  className?: string;
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
  hoverTextColor?: string;
  hoverBorderColor?: string;
};

const LinkBtn = ({
                   href,
                   icon,
                   label,
                   title,
                   className,
                   bgColor = 'bg-transparent',
                   textColor = 'text-blue-600',
                   borderColor = 'border border-blue-600',
                   hoverTextColor = 'hover:text-blue-700',
                   hoverBorderColor = 'hover:border-blue-700',
                 }: IconLinkBtnProps) => {
  return (
    <Link
      href={href}
      title={title || label}
      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition justify-center p-2
        ${bgColor} ${textColor} ${borderColor} ${hoverTextColor} ${hoverBorderColor} disabled:opacity-50 transition-transform
        ${className || ''}`}
    >
      {icon}

      {label && (
        <span className="text-sm font-medium whitespace-nowrap ">
          {label}
        </span>
      )}
    </Link>
  );
};

export default LinkBtn;
