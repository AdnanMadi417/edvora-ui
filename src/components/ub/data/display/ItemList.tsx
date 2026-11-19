"use client";
import Link from "next/link";
import { TableRowHref } from "components/ub/data/tables/TableActions";
import type { ComponentType, ReactNode } from "react";
import { focusRing, skeleton } from "components/ub/recipes";
import AsyncStateView from "components/ub/feedback/states/AsyncStateView";
import { getAsyncStatus } from "components/ub/feedback/states/AsyncStatus";
import EntityCell, { type EntityCellStatus } from "components/ub/data/display/EntityCell";
import Tag from "components/ub/data/badges/Tag";

export interface ItemListProps<T> {
  items: T[];
  getId: (item: T) => string;
  /** The record's name: one line, truncated with a tooltip. */
  getName: (item: T) => string;
  /** Whether the record is live, drawn as a small circle before the name. */
  getStatus?: (item: T) => EntityCellStatus | undefined;
  /** One short neutral tag after the name, e.g. a code. Never a description. */
  getTag?: (item: T) => string | null | undefined;
  /** Opens the record: a link to its page… */
  getHref?: (item: T) => string;
  /** …or a handler (a details drawer). */
  onOpen?: (item: T) => void;
  /** The row's actions, last and right-aligned: a <TableActions>. */
  renderActions?: (item: T) => ReactNode;
  /** Names the list for screen readers, e.g. "Payment methods". */
  label: string;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  empty?: { title: string; description?: ReactNode; icon?: ComponentType<{ className?: string }>; action?: ReactNode };
  className?: string;
}

const row = "flex min-h-[3.5rem] items-center gap-3 border-b border-ub-border px-4 py-2 last:border-b-0 sm:px-6";
const open = `-mx-2 flex min-w-0 flex-1 items-center gap-3 rounded-ub-sm px-2 py-2 text-start transition-colors hover:bg-ub-surface-subtle ${focusRing}`;

/**
 * A plain list for short lookup records that don't need a table (payment
 * methods, fields of study…): status circle and name, an optional small tag,
 * actions on the right. The same row on phones and desktops; no columns, no
 * descriptions, no pagination.
 */
export default function ItemList<T>({
  items,
  getId,
  getName,
  getStatus,
  getTag,
  getHref,
  onOpen,
  renderActions,
  label,
  loading = false,
  error,
  onRetry,
  empty,
  className = "",
}: ItemListProps<T>) {
  const status = getAsyncStatus(loading, error, items, (list) => list.length === 0);
  const skeletonRows = (
    <ul aria-hidden="true" className={className}>
      {[0, 1, 2].map((i) => (
        <li key={i} className={row}>
          <span className={`h-4 w-2/5 ${skeleton}`} />
          <span className={`ms-auto h-8 w-8 ${skeleton}`} />
        </li>
      ))}
    </ul>
  );
  return (
    <AsyncStateView
      status={status}
      skeleton={skeletonRows}
      errorMessage={error ?? undefined}
      onRetry={onRetry}
      emptyTitle={empty?.title}
      emptySubtitle={empty?.description}
      emptyIcon={empty?.icon}
      emptyAction={empty?.action}
    >
      <ul aria-label={label} data-ub-item-list className={className}>
        {items.map((item) => {
          const name = getName(item);
          const tag = getTag?.(item);
          const body = (
            <>
              <EntityCell name={name} noAvatar status={getStatus?.(item)} className="flex-1" />
              {tag && (
                // The name keeps priority on phones: the tag takes at most 45% and truncates.
                <span className="ms-auto flex min-w-0 max-w-[45%] justify-end sm:max-w-[40%] [&>[data-ub-badge]]:max-w-full">
                  <Tag tone="neutral" size="sm">
                    {tag}
                  </Tag>
                </span>
              )}
            </>
          );
          const href = getHref?.(item);
          return (
            <li key={getId(item)} className={row}>
              {href ? (
                <Link href={href} className={open}>
                  {body}
                </Link>
              ) : onOpen ? (
                <button type="button" onClick={() => onOpen(item)} className={open}>
                  {body}
                </button>
              ) : (
                <span className="flex min-w-0 flex-1 items-center gap-3 py-2">{body}</span>
              )}
              {renderActions && <span className="shrink-0"><TableRowHref.Provider value={href}>{renderActions(item)}</TableRowHref.Provider></span>}
            </li>
          );
        })}
      </ul>
    </AsyncStateView>
  );
}
