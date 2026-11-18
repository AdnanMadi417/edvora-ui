"use client";

import { useRef, type ReactNode } from "react";
import Link from "next/link";
import EntityCell, { type EntityCellStatus } from "components/ub/data/display/EntityCell";
import { buttonBase, buttonSizes, buttonVariants } from "components/ub/recipes";

export interface CatalogCardFact {
  label: string;
  value: ReactNode;
  /** Spans both columns (chips, longer text). */
  wide?: boolean;
  /** "success" for money the Advisor earns (commission). */
  tone?: "default" | "success";
}

export interface CatalogCardAction {
  /** Visible text: always words, never an icon on its own. */
  label: string;
  href: string;
  /** Accessible name when the label alone is ambiguous across cards ("View details of X"). */
  ariaLabel?: string;
  variant?: "primary" | "secondary";
  /** Opens in a new tab (external links, WhatsApp). */
  external?: boolean;
}

export interface CatalogCardProps {
  name: string;
  /** Logo, photo or initials avatar (40px). */
  avatar: ReactNode;
  /** Whether the record is live: the small circle on the avatar. */
  status?: EntityCellStatus;
  /** One short line under the name (university, country…). */
  subtitle?: ReactNode;
  /** Short tags under the header: level, scholarship… Never a description. */
  tags?: ReactNode;
  /** Key facts in a two-column grid, every one labelled the same way. */
  facts?: CatalogCardFact[];
  /** Where the card goes on click; also the "View details" target. */
  href?: string;
  /** Opens `href` in a new tab. */
  hrefExternal?: boolean;
  /** One or two buttons pinned to the bottom, so buttons line up across a row of cards. */
  actions?: CatalogCardAction[];
  /** Replaces the action buttons (e.g. a locked state). */
  footer?: ReactNode;
  className?: string;
}

/**
 * The one card for catalogue records Advisors browse: programs, universities,
 * language centres, logistics providers. Header (avatar with status circle,
 * name with a tooltip, one sub-line), optional tags, a grid of labelled facts,
 * and up to two text buttons at the bottom. The whole card opens the record
 * for pointer users; keyboard and screen-reader users use the buttons.
 */
export default function CatalogCard({
  name,
  avatar,
  status,
  subtitle,
  tags,
  facts = [],
  href,
  hrefExternal = false,
  actions = [],
  footer,
  className = "",
}: CatalogCardProps) {
  const cardLink = useRef<HTMLAnchorElement>(null);
  const external = hrefExternal ? { target: "_blank", rel: "noopener noreferrer" } : {};
  return (
    <article
      aria-label={name}
      data-ub-catalog-card
      className={`group relative flex h-full min-w-0 flex-col overflow-hidden rounded-ub-lg border border-ub-border bg-ub-surface shadow-ub-xs transition-[border-color,box-shadow] duration-200 motion-reduce:transition-none ${
        href ? "hover:border-ub-border-hover hover:shadow-ub-sm" : ""
      } ${className}`}
    >
      {href && (
        // Pointer shortcut only: keyboard and screen readers use the buttons.
        <Link ref={cardLink} href={href} aria-hidden="true" tabIndex={-1} className="absolute inset-0 z-10 rounded-ub-lg" {...external} />
      )}

      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
        <h3
          className={`relative min-w-0 ${href ? "z-20 cursor-pointer" : ""}`}
          onClick={href ? () => cardLink.current?.click() : undefined}
        >
          <EntityCell name={name} avatar={avatar} status={status} subtitle={subtitle} tooltip />
        </h3>

        {tags && <div className="flex min-w-0 flex-wrap gap-1.5">{tags}</div>}

        {facts.length > 0 && (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-ub-border pt-4">
            {facts.map((fact) => (
              <div key={fact.label} className={`min-w-0 ${fact.wide ? "col-span-2" : ""}`}>
                <dt className="text-ub-caption text-ub-text-tertiary">{fact.label}</dt>
                <dd
                  className={`mt-1 min-w-0 break-words ${
                    fact.tone === "success"
                      ? "ub-tabular text-ub-label-lg font-semibold text-ub-tone-success-text"
                      : "text-ub-label-md text-ub-text-primary"
                  }`}
                >
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      {(footer || actions.length > 0) && (
        <div className="relative z-20 mt-auto border-t border-ub-border bg-ub-surface-subtle px-4 py-3 sm:px-5">
          {footer ?? (
            <div className="flex gap-2">
              {actions.slice(0, 2).map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  aria-label={action.ariaLabel}
                  {...(action.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className={`min-w-0 flex-1 ${buttonBase} ${buttonSizes.sm} ${
                    buttonVariants[action.variant ?? "secondary"]
                  }`}
                >
                  <span className="truncate">{action.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
