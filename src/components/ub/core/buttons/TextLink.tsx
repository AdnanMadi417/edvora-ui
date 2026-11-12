import { AnchorHTMLAttributes } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import clsx from "clsx";
import { focusRing } from "components/ub/recipes";

export interface TextLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  /** Opens in a new tab with an external-link icon and a screen-reader hint. */
  external?: boolean;
}

/** Inline link inside running text. For standalone actions use TextButton. */
export default function TextLink({ href, external, className, children, ...rest }: TextLinkProps) {
  const classes = clsx(
    // py-1 on an inline link: a 24px+ tap box (WCAG 2.5.8) that does not move the text.
    "rounded-ub-xs py-1 font-medium text-ub-text-link underline decoration-1 underline-offset-2 transition-colors duration-ub-fast hover:decoration-2",
    focusRing,
    className,
  );
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={clsx(classes, "inline-flex items-center gap-0.5")} {...rest}>
        {children}
        <ExternalLink className="h-3.5 w-3.5 shrink-0 rtl:-scale-x-100" aria-hidden />
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }
  return (
    <Link href={href} className={classes} {...rest}>
      {children}
    </Link>
  );
}
