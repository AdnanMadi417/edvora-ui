import Link from "next/link";
import clsx from "clsx";
import { ArrowUpRight } from "lucide-react";
import { buttonBase, buttonVariants, iconButtonSizes } from "components/ub/recipes";

export interface CardLinkButtonProps {
  href: string;
  /** Names the destination, e.g. "Open Application Tracker". Required: the button has no text. */
  label: string;
  /** primary (filled, for a highlighted card) or secondary (default). */
  tone?: "primary" | "secondary";
  size?: "sm" | "md";
  className?: string;
}

/** Round ↗ link to a card's detail page. The arrow mirrors in RTL. */
export default function CardLinkButton({ href, label, tone = "secondary", size = "sm", className }: CardLinkButtonProps) {
  return (
    <Link href={href} aria-label={label} title={label} className={clsx(buttonBase, iconButtonSizes[size], buttonVariants[tone], className)}>
      <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
    </Link>
  );
}
