import { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import clsx from "clsx";

type Variant = "primary" | "inverse" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex select-none items-center justify-center gap-2 rounded-ub-full font-medium whitespace-nowrap " +
  "transition-[background-color,color,border-color,box-shadow,transform] duration-ub-fast ease-ub-standard " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ub-border-focus " +
  "disabled:pointer-events-none disabled:bg-ub-action-disabled-bg disabled:text-ub-action-disabled-text";

// Brief §4.1. In dark sections the primary picks up --ub-glow-action on hover/focus.
const variants: Record<Variant, string> = {
  primary:
    "bg-ub-action-primary text-ub-action-primary-text hover:bg-ub-action-primary-hover active:bg-ub-action-primary-pressed hover:shadow-ub-glow focus-visible:shadow-ub-glow",
  inverse: "bg-ub-action-inverse text-ub-action-inverse-text hover:bg-ub-action-inverse-hover active:bg-ub-blue-100",
  secondary:
    "border-ub-strong border-ub-action-secondary text-ub-action-secondary-text hover:bg-ub-action-secondary-hover active:bg-ub-action-secondary-pressed",
  ghost: "border border-ub-border text-ub-text-primary hover:border-ub-border-hover hover:bg-ub-surface-raised",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-4 text-ub-label-md",
  md: "h-10 px-5 text-ub-label-md",
  lg: "h-12 px-6 text-ub-label-lg",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function buttonClasses({ variant = "primary", size = "md", className }: Omit<CommonProps, "children" | "icon">) {
  return clsx(base, variants[variant], sizes[size], className);
}

/** Pill link styled as a button. */
export function ButtonLink({ href, variant, size, icon, children, className, ...rest }: CommonProps & { href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  return (
    <Link href={href} className={buttonClasses({ variant, size, className })} {...rest}>
      {children}
      {icon}
    </Link>
  );
}

/** Pill button. All buttons are pills (brief §4.1). */
export default function Button({ variant, size, icon, children, className, type = "button", ...rest }: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={buttonClasses({ variant, size, className })} {...rest}>
      {children}
      {icon}
    </button>
  );
}
