"use client";

import React, { createContext, useContext, type ReactNode } from "react";
import Link from "next/link";
import { focusRingInset } from "components/ub/recipes";

const DenseContext = createContext(false);

export interface ListProps {
  children: ReactNode;
  /** 44px rows instead of 56px. */
  dense?: boolean;
  /** Outlined container (radius 12) instead of a bare list. */
  bordered?: boolean;
  /** Accessible name for the list. */
  "aria-label"?: string;
  className?: string;
}

/** Divided list (brief §4 Data). Compose with ListItem. */
export function List({ children, dense = false, bordered = false, className, ...aria }: ListProps) {
  return (
    <DenseContext.Provider value={dense}>
      <ul
        className={`divide-y divide-ub-border ${bordered ? "overflow-hidden rounded-ub-lg border border-ub-border bg-ub-surface" : ""} ${className ?? ""}`}
        {...aria}
      >
        {children}
      </ul>
    </DenseContext.Provider>
  );
}

export interface ListItemProps {
  title: ReactNode;
  description?: ReactNode;
  /** Avatar or icon before the text. */
  leading?: ReactNode;
  /** Right-hand metadata, e.g. a date or tag (end side in RTL). */
  meta?: ReactNode;
  /** Separate action after the row (kept outside the row's own link/button). */
  trailing?: ReactNode;
  /** Makes the row a link. */
  href?: string;
  /** Makes the row a button (ignored when `href` is set). */
  onClick?: () => void;
  /** Marks the current item, e.g. the open conversation. */
  current?: boolean;
  className?: string;
}

export function ListItem({ title, description, leading, meta, trailing, href, onClick, current, className }: ListItemProps) {
  const dense = useContext(DenseContext);
  const interactive = !!href || !!onClick;
  const pad = dense ? "min-h-11 py-2" : "min-h-14 py-3";

  const body = (
    <>
      {leading && <span className="flex shrink-0 items-center text-ub-icon-default">{leading}</span>}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-ub-label-md text-ub-text-primary">{title}</span>
        {description && <span className="block truncate text-ub-body-sm text-ub-text-secondary">{description}</span>}
      </span>
      {meta && <span className="shrink-0 text-ub-caption text-ub-text-tertiary">{meta}</span>}
    </>
  );

  const rowClass = `flex min-w-0 flex-1 items-center gap-3 px-4 text-start ${pad}`;
  const interactiveClass =
    `${rowClass} transition-colors duration-ub-fast ease-ub-standard motion-reduce:transition-none hover:bg-ub-row-hover ${focusRingInset} ` +
    (current ? "bg-ub-selected hover:bg-ub-selected" : "");

  let main: ReactNode;
  if (href) {
    main = (
      <Link href={href} aria-current={current ? "page" : undefined} className={interactiveClass}>
        {body}
      </Link>
    );
  } else if (onClick) {
    main = (
      <button type="button" onClick={onClick} aria-current={current ? "true" : undefined} className={interactiveClass}>
        {body}
      </button>
    );
  } else {
    main = <div className={`${rowClass} ${current ? "bg-ub-selected" : ""}`}>{body}</div>;
  }

  return (
    <li className={`flex items-center ${className ?? ""}`} data-interactive={interactive || undefined}>
      {main}
      {trailing && <span className="flex shrink-0 items-center pe-3">{trailing}</span>}
    </li>
  );
}

export default List;
