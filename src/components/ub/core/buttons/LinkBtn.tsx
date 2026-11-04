import Link from 'next/link';
import { AnchorHTMLAttributes, ReactNode } from 'react';
import { buttonBase, buttonSizes, iconButtonSizes, type ButtonSize, type ButtonVariant } from 'components/ub/recipes';
import { resolveButtonColors } from 'components/ub/core/buttons/Button';

type IconLinkBtnProps = {
  href: string;
  target?: AnchorHTMLAttributes<HTMLAnchorElement>["target"];
  rel?: string;
  children?: ReactNode;
  icon: ReactNode;
  label?: string;
  title?: string;
  className?: string;
  /** Design-system variant (brief §4.1). Defaults to "secondary" when no legacy colour props are passed. */
  variant?: ButtonVariant;
  /** sm 32 · md 40 (default) · lg 48. Icon-only links render as a circle of that size. */
  size?: ButtonSize;
  /** Legacy colour overrides — still honoured when passed. Prefer `variant`. */
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
  hoverTextColor?: string;
  hoverBorderColor?: string;
};

/** A link styled as a pill button (or a circular icon button when there is no label). */
const LinkBtn = ({
  href,
  target,
  rel,
  children,
  icon,
  label,
  title,
  className,
  variant,
  size = 'md',
  bgColor,
  textColor,
  borderColor,
  hoverTextColor,
  hoverBorderColor,
}: IconLinkBtnProps) => {
  const colors = resolveButtonColors(variant, { bgColor, textColor, borderColor, hoverTextColor, hoverBorderColor });
  const shape = label ? buttonSizes[size] : `${iconButtonSizes[size]} shrink-0 p-0`;
  return (
    <Link
      href={href}
      target={target}
      rel={rel}
      title={title || label}
      aria-label={label ? undefined : title}
      className={`${buttonBase} ${shape} ${colors} ${className || ''}`}
    >
      {icon}

      {label && <span className="whitespace-nowrap">{label}</span>}
      {children}
    </Link>
  );
};

export default LinkBtn;
