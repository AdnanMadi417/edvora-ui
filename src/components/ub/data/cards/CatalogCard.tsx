"use client";

import { useRef, type ReactNode } from "react";
import Link from "next/link";
import EntityCell, { type EntityCellStatus } from "components/ub/data/display/EntityCell";
import { buttonBase, buttonSizes, buttonVariants, focusRing } from "components/ub/recipes";
import { ArrowUpRight, Eye } from "lucide-react";
import ActionsDropdown from "components/ub/navigation/menus/ActionsDropdown";

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
  /** Only opens the card's details. Never a button: the card itself opens it. */
  view?: boolean;
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
  // The card opens its details, so "View details" is never a separate button.
  const others = actions.filter((action) => !action.view && action.href !== href);
  const viewLabel = actions.find((action) => action.view || action.href === href)?.ariaLabel ?? `View details of ${name}`;
  return (
    <article
      aria-label={name}
      data-ub-catalog-card
      className={`group relative flex h-full min-w-0 flex-col overflow-hidden rounded-ub-lg border border-ub-border bg-ub-surface shadow-ub-xs transition-[border-color,box-shadow] duration-200 motion-reduce:transition-none ${
        href ? "hover:border-ub-border-hover hover:shadow-ub-sm" : ""
      } ${className}`}
    >
      {href && (
        // Pointer shortcut for the whole card; keyboard and screen readers use the title link.
        <Link ref={cardLink} href={href} aria-hidden="true" tabIndex={-1} className="absolute inset-0 z-10 rounded-ub-lg" {...external} />
      )}

      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
        <h3 className={`relative min-w-0 ${href ? "z-20" : ""}`}>
          {href ? (
            // The title is the card's link to its details (there is no View details button).
            <Link href={href} aria-label={viewLabel} className={`block rounded-ub-md ${focusRing}`} {...external}>
              <EntityCell name={name} avatar={avatar} status={status} subtitle={subtitle} tooltip />
            </Link>
          ) : (
            <EntityCell name={name} avatar={avatar} status={status} subtitle={subtitle} tooltip />
          )}
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

      {(footer || others.length > 0) && (
        <div className="relative z-20 mt-auto border-t border-ub-border bg-ub-surface-subtle px-4 py-3 sm:px-5">
          {footer ??
            (others.length === 1 ? (
              <ActionLink action={others[0]} />
            ) : (
              // Two or more: one menu, View first.
              <div className="flex justify-end">
                <ActionsDropdown
                  iconOnly
                  label={`Actions for ${name}`}
                  items={[
                    ...(href ? [{ label: "View details", icon: Eye, onClick: () => cardLink.current?.click() }] : []),
                    ...others.map((action) => ({ label: action.label, icon: ArrowUpRight, onClick: () => open(action) })),
                  ]}
                />
              </div>
            ))}
        </div>
      )}
    </article>
  );
}

function open(action: CatalogCardAction) {
  if (action.external) window.open(action.href, "_blank", "noopener,noreferrer");
  else window.location.assign(action.href);
}

/** The card's one action, shown directly. */
function ActionLink({ action }: { action: CatalogCardAction }) {
  return (
    <Link
      href={action.href}
      aria-label={action.ariaLabel}
      {...(action.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`flex w-full min-w-0 ${buttonBase} ${buttonSizes.sm} ${buttonVariants[action.variant ?? "secondary"]}`}
    >
      <span className="truncate">{action.label}</span>
    </Link>
  );
}
