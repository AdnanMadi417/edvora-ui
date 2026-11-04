// Link-styled tertiary text action (brief §4.1 "Tertiary": blue-600 text,
// low emphasis in cards and tables). Renders a Next <Link> when `href` is set.
import React from "react";
import Link from "next/link";
import { focusRing } from "components/ub/recipes";
import { Icon, type IconName } from "components/ub/icons/Icon";

export type TextButtonSize = "sm" | "md" | "lg";

const sizes: Record<TextButtonSize, string> = {
  sm: "min-h-6 text-ub-label-sm gap-1",
  md: "min-h-6 text-ub-label-md gap-1.5",
  lg: "min-h-8 text-ub-label-lg gap-2",
};
const iconSize: Record<TextButtonSize, 16 | 20> = { sm: 16, md: 16, lg: 20 };

const textButtonBase =
  `inline-flex items-center rounded-ub-xs font-medium text-ub-text-link underline-offset-4 ${focusRing} ` +
  "transition-colors duration-ub-fast ease-ub-standard hover:underline active:text-ub-action-primary-pressed motion-reduce:transition-none " +
  "aria-disabled:cursor-not-allowed aria-disabled:text-ub-text-disabled aria-disabled:no-underline disabled:cursor-not-allowed disabled:text-ub-text-disabled disabled:no-underline";

type CommonProps = {
  children: React.ReactNode;
  size?: TextButtonSize;
  leadingIcon?: IconName;
  trailingIcon?: IconName;
  disabled?: boolean;
  className?: string;
};

export type TextButtonProps = CommonProps &
  (
    | ({ href?: undefined } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps>)
    | ({ href: string; target?: string; rel?: string; onClick?: React.MouseEventHandler<HTMLAnchorElement> } & Omit<
        React.AnchorHTMLAttributes<HTMLAnchorElement>,
        keyof CommonProps | "href"
      >)
  );

export function TextButton(props: TextButtonProps) {
  const { children, size = "md", leadingIcon, trailingIcon, disabled = false, className = "", ...rest } = props;
  const cls = `${textButtonBase} ${sizes[size]} ${className}`;
  const content = (
    <>
      {leadingIcon && <Icon name={leadingIcon} size={iconSize[size]} />}
      <span>{children}</span>
      {trailingIcon && <Icon name={trailingIcon} size={iconSize[size]} />}
    </>
  );

  if (rest.href !== undefined) {
    const { href, ...anchor } = rest as React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
    if (disabled) {
      // A disabled link has no href, so it drops out of the tab order.
      return (
        <a {...anchor} aria-disabled="true" className={cls}>
          {content}
        </a>
      );
    }
    return (
      <Link href={href} {...anchor} className={cls}>
        {content}
      </Link>
    );
  }

  const { type = "button", ...button } = rest as React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type={type} disabled={disabled} {...button} className={cls}>
      {content}
    </button>
  );
}

export default TextButton;
