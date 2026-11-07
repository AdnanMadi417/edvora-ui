"use client";

import React, { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence } from "framer-motion";
import Link from "next/link";
import clsx from "clsx";
import { ArrowDown, ArrowUp, ArrowUpDown, Check, Minus, X } from "lucide-react";
import { pageSelectionState, selectRange, toggleId, togglePage } from "components/ub/data/tables/tableSelection";
import TableWrapper from "components/ub/data/tables/TableWrapper";
import TableSkeletonRows from "components/ub/data/tables/TableSkeletonRows";
import TableEmptyRow from "components/ub/data/tables/TableEmptyRow";
import TableErrorRow from "components/ub/data/tables/TableErrorRow";
import AnimatedTableRow from "components/ub/data/tables/AnimatedTableRow";
import { Avatar } from "components/ub/data/media/Avatar";
import { checkbox, focusRing, tableHead } from "components/ub/recipes";

// ── Types ────────────────────────────────────────────────────────────────

export type DataTableAlign = "start" | "end";
export type DataTableDensity = "comfortable" | "compact";
export type SortDirection = "asc" | "desc";
export interface DataTableSort {
  key: string;
  direction: SortDirection;
}
export type SortValue = string | number | Date | null | undefined;

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  cell: (row: T, index: number) => ReactNode;
  /** "end" for amounts: right-aligned (left in RTL) with tabular numerals. */
  align?: DataTableAlign;
  sortable?: boolean;
  /** Value used for sorting. Defaults to `row[key]`. */
  sortValue?: (row: T) => SortValue;
  /** CSS width, e.g. "240px" or "20%". */
  width?: string;
  /** Label in the stacked mobile layout when `header` isn't plain text. */
  mobileLabel?: string;
}

export interface DataTableEmptyState {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  /** Accessible table name (visually hidden caption). */
  caption: string;
  /** comfortable 56px (default, Advisors) · compact 44px (team owners, Institution portal). */
  density?: DataTableDensity;

  loading?: boolean;
  skeletonRows?: number;
  /** Error message; when set the error row replaces the data. */
  error?: string | null;
  onRetry?: () => void;
  empty?: DataTableEmptyState;

  /** Adds a checkbox column, select-all header and the bulk-action bar. */
  selectable?: boolean;
  selectedIds?: string[];
  defaultSelectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  /** Checkbox name per row, e.g. (r) => r.student. Default "row N". */
  getRowLabel?: (row: T) => string;
  /** Bulk-action buttons; receives the selected ids and a clear function. */
  bulkActions?: (selectedIds: string[], clearSelection: () => void, context: BulkContext) => ReactNode;

  /** Controlled sort (pass `null` for unsorted). */
  sort?: DataTableSort | null;
  defaultSort?: DataTableSort | null;
  onSortChange?: (sort: DataTableSort | null) => void;
  /** Rows already arrive sorted (server-side); skip client sorting. */
  manualSort?: boolean;

  /** Footer slot, typically <TablePagination />. */
  footer?: ReactNode;

  /** table (default; scrolls horizontally below 768px) · cards: stacked cards at every width (Knowledge Hub, mobile-first lists). */
  layout?: DataTableLayout;
  /** Mobile table presentation. Defaults to horizontal scrolling, like Applications. */
  mobileLayout?: "stacked" | "scroll";
  scrollClassName?: string;
  /** Return true, or a reason string to disable the row's checkbox (shown as its tooltip). */
  isRowSelectable?: (row: T) => true | string;
  /** Total rows across all pages (server mode). With onSelectAllMatchingChange, offers "Select all N". */
  totalCount?: number;
  /** "All matching rows" is selected, not just the ids (bulk actions get { allMatching: true }). */
  allMatchingSelected?: boolean;
  onSelectAllMatchingChange?: (all: boolean) => void;
  /** When this value changes (e.g. the filters), the selection clears and the change is announced. */
  selectionResetKey?: string;
  /** Makes each row open this href: the first column becomes a link that covers the row. */
  getRowHref?: (row: T) => string;
  /** "_blank" opens rows in a new tab (announced to screen readers). Default same tab. */
  rowLinkTarget?: "_self" | "_blank";
  /** Keys of columns to hide (DataTableToolbar's Columns menu). */
  hiddenColumns?: string[];
  /** Pin the first column while the table scrolls sideways (wide tables, from 768px). */
  stickyFirstColumn?: boolean;
  /** Extra classes for one row, e.g. "opacity-60" for a voided entry. Keep to tokens and opacity; selection and hover colours still apply. */
  getRowClassName?: (row: T, index: number) => string | undefined;
  className?: string;
}

export type DataTableLayout = "table" | "cards";

/** Third argument of bulkActions. */
export interface BulkContext {
  /** Every row matching the current filters is selected (send the filters, not the ids). */
  allMatching: boolean;
  count: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────

/** Pure, stable comparator: nulls last, numbers/dates numerically, strings with natural order. */
export function compareSortValues(a: SortValue, b: SortValue): number {
  const empty = (v: SortValue) => v === null || v === undefined || v === "";
  if (empty(a) && empty(b)) return 0;
  if (empty(a)) return 1;
  if (empty(b)) return -1;
  const na = a instanceof Date ? a.getTime() : a;
  const nb = b instanceof Date ? b.getTime() : b;
  if (typeof na === "number" && typeof nb === "number") return na - nb;
  return String(na).localeCompare(String(nb), undefined, { numeric: true, sensitivity: "base" });
}

export function sortRows<T>(rows: T[], columns: DataTableColumn<T>[], sort: DataTableSort | null | undefined): T[] {
  if (!sort) return rows;
  const col = columns.find((c) => c.key === sort.key);
  if (!col) return rows;
  const get = col.sortValue ?? ((r: T) => (r as Record<string, unknown>)[col.key] as SortValue);
  const dir = sort.direction === "asc" ? 1 : -1;
  return rows
    .map((row, i) => ({ row, i }))
    .sort((x, y) => {
      const va = get(x.row);
      const vb = get(y.row);
      // Empty values stay last in both directions.
      const emptyA = va === null || va === undefined || va === "";
      const emptyB = vb === null || vb === undefined || vb === "";
      if (emptyA !== emptyB) return emptyA ? 1 : -1;
      return dir * compareSortValues(va, vb) || x.i - y.i;
    })
    .map((x) => x.row);
}

/** Uncontrolled state that becomes controlled when `value` is passed. */
function useControllable<V>(value: V | undefined, initial: V, onChange?: (v: V) => void) {
  const [inner, setInner] = useState<V>(initial);
  const controlled = value !== undefined;
  const current = controlled ? (value as V) : inner;
  const set = (v: V) => {
    if (!controlled) setInner(v);
    onChange?.(v);
  };
  return [current, set] as const;
}

const ariaSort = (dir?: SortDirection) => (dir === "asc" ? "ascending" : dir === "desc" ? "descending" : "none");

function TableCheckbox({
  checked,
  indeterminate,
  onChange,
  label,
  disabledReason,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (e: React.MouseEvent<HTMLInputElement>) => void;
  label: string;
  /** Disables the box; the reason is its tooltip and accessible description. */
  disabledReason?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const reasonId = useId();
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = !!indeterminate;
  }, [indeterminate]);
  return (
    <span className="relative inline-grid place-items-center">
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        // onClick (not onChange) so the handler sees shiftKey for range selection.
        onChange={() => undefined}
        onClick={onChange}
        disabled={!!disabledReason}
        title={disabledReason}
        aria-describedby={disabledReason ? reasonId : undefined}
        aria-label={label}
        aria-checked={indeterminate ? "mixed" : checked}
        className={`peer ${checkbox} indeterminate:border-ub-action-primary indeterminate:bg-ub-action-primary`}
      />
      <Check aria-hidden="true" strokeWidth={3} className="pointer-events-none absolute inset-0 m-auto hidden h-3.5 w-3.5 text-ub-action-primary-text peer-checked:block" />
      <Minus aria-hidden="true" strokeWidth={3} className="pointer-events-none absolute inset-0 m-auto hidden h-3.5 w-3.5 text-ub-action-primary-text peer-indeterminate:block" />
      {disabledReason && (
        <span id={reasonId} className="sr-only">
          {disabledReason}
        </span>
      )}
    </span>
  );
}

// ── First-column helper ──────────────────────────────────────────────────

export interface DataTablePrimaryCellProps {
  name: string;
  /** Reference ID, e.g. "UBX-2026-0412" (rendered with .ub-ref). */
  reference?: string;
  avatarSrc?: string | null;
}

/** Avatar + name + reference ID, the standard first column (brief §4.6). */
export function DataTablePrimaryCell({ name, reference, avatarSrc }: DataTablePrimaryCellProps) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <Avatar name={name} src={avatarSrc} size={32} alt="" />
      <span className="min-w-0">
        <span className="block truncate text-ub-label-md text-ub-text-primary">{name}</span>
        {reference && <span className="ub-ref block text-ub-caption text-ub-text-tertiary">{reference}</span>}
      </span>
    </span>
  );
}

// ── DataTable ────────────────────────────────────────────────────────────

// Tables scroll on phones by default; stacked rows and card layouts remain explicit options.
const rowHeight: Record<DataTableDensity, string> = { comfortable: "md:h-14", compact: "md:h-11" };

export default function DataTable<T>({
  columns: allColumns,
  rows,
  getRowId,
  caption,
  density = "comfortable",
  loading,
  skeletonRows = 5,
  error,
  onRetry,
  empty = { title: "Nothing here yet", description: "Items you add will show up here." },
  selectable,
  selectedIds,
  defaultSelectedIds = [],
  onSelectionChange,
  getRowLabel,
  bulkActions,
  sort: sortProp,
  defaultSort = null,
  onSortChange,
  manualSort,
  footer,
  layout = "table",
  mobileLayout = "scroll",
  scrollClassName,
  isRowSelectable,
  totalCount,
  allMatchingSelected = false,
  onSelectAllMatchingChange,
  selectionResetKey,
  getRowHref,
  rowLinkTarget = "_self",
  hiddenColumns,
  stickyFirstColumn = false,
  getRowClassName,
  className,
}: DataTableProps<T>) {
  const [selected, setSelectedRaw] = useControllable<string[]>(selectedIds, defaultSelectedIds, onSelectionChange);
  const [sort, setSort] = useControllable<DataTableSort | null>(sortProp, defaultSort, onSortChange);
  const [announcement, setAnnouncement] = useState("");
  const anchor = useRef<string | null>(null);

  const columns = useMemo(() => (hiddenColumns?.length ? allColumns.filter((c) => !hiddenColumns.includes(c.key)) : allColumns), [allColumns, hiddenColumns]);
  const sortedRows = useMemo(() => (manualSort ? rows : sortRows(rows, allColumns, sort)), [rows, allColumns, sort, manualSort]);
  const rowIds = useMemo(() => sortedRows.map(getRowId), [sortedRows, getRowId]);
  const disabledReason = useMemo(() => {
    const map = new Map<string, string>();
    if (isRowSelectable) sortedRows.forEach((r, i) => {
      const ok = isRowSelectable(r);
      if (ok !== true) map.set(rowIds[i], ok);
    });
    return map;
  }, [sortedRows, rowIds, isRowSelectable]);
  const selectableIds = useMemo(() => rowIds.filter((id) => !disabledReason.has(id)), [rowIds, disabledReason]);

  const selectedSet = new Set(selected);
  const pageState = pageSelectionState(selected, selectableIds);
  const showData = !loading && !error && sortedRows.length > 0;
  const colCount = columns.length + (selectable ? 1 : 0);
  const cards = layout === "cards";
  const count = allMatchingSelected && totalCount ? totalCount : selected.length;

  const setSelected = (ids: string[]) => {
    if (allMatchingSelected) onSelectAllMatchingChange?.(false);
    setSelectedRaw(ids);
    setAnnouncement(ids.length ? `${ids.length} selected` : "");
  };
  const clearSelection = () => {
    if (allMatchingSelected) onSelectAllMatchingChange?.(false);
    setSelectedRaw([]);
    setAnnouncement("");
  };

  // Filters changed: the old selection no longer matches what's on screen.
  const resetKey = useRef(selectionResetKey);
  useEffect(() => {
    if (resetKey.current === selectionResetKey) return;
    resetKey.current = selectionResetKey;
    if (selected.length || allMatchingSelected) {
      clearSelection();
      setAnnouncement("Selection cleared because the filters changed");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on a key change
  }, [selectionResetKey]);

  const toggleAll = () => {
    anchor.current = null;
    setSelected(togglePage(selected, selectableIds));
  };
  const toggleRow = (id: string, shift: boolean) => {
    const next = shift && anchor.current ? selectRange(selected, rowIds, anchor.current, id, (x) => !disabledReason.has(x)) : toggleId(selected, id);
    anchor.current = id;
    setSelected(next);
  };

  // asc → desc → unsorted
  const cycleSort = (key: string) => {
    if (sort?.key !== key) setSort({ key, direction: "asc" });
    else if (sort.direction === "asc") setSort({ key, direction: "desc" });
    else setSort(null);
  };

  const offerAllMatching = !!onSelectAllMatchingChange && !!totalCount && totalCount > rowIds.length && pageState === "all";

  // Stacked-card vs table classes for each element.
  const t = {
    table: cards ? "block w-full" : "block w-full border-collapse text-start md:table",
    thead: cards ? "block" : "block md:table-header-group",
    headRow: (show: boolean) => clsx(show ? "flex items-center" : "hidden", !cards && "md:table-row"),
    tbody: cards ? "block" : "block md:table-row-group",
    row: cards ? "block border-t border-ub-border py-3" : clsx("block border-t border-ub-border py-3 md:table-row md:py-0", rowHeight[density]),
    cell: cards
      ? "flex items-start justify-between gap-4 px-4 py-1 text-ub-body-sm text-ub-text-primary"
      : "flex items-start justify-between gap-4 px-4 py-1 text-ub-body-sm text-ub-text-primary md:table-cell md:py-0 md:align-middle",
    headCell: cards ? "hidden" : "hidden h-11 px-4 font-medium md:table-cell",
    label: cards ? "shrink-0 text-ub-label-sm text-ub-text-tertiary" : "shrink-0 text-ub-label-sm text-ub-text-tertiary md:hidden",
    checkCell: cards ? "flex px-4 py-1" : "flex px-4 py-1 md:table-cell md:w-12 md:py-0 md:align-middle",
  };
  const mobileScroll = !cards && mobileLayout === "scroll";
  if (mobileScroll) Object.assign(t, {
    table: "w-full min-w-[1000px] border-collapse text-start",
    thead: "table-header-group sticky top-0 z-20 bg-ub-table-head",
    headRow: () => "table-row",
    tbody: "table-row-group",
    row: "table-row border-t border-ub-border",
    cell: "table-cell px-4 py-2 align-middle text-start text-ub-body-sm text-ub-text-primary",
    headCell: "table-cell h-11 px-4 text-start font-medium",
    label: "hidden",
    checkCell: "table-cell w-12 px-4 py-2 align-middle",
  });
  const pin = (first: boolean, head = false) =>
    stickyFirstColumn && first && !cards ? clsx("md:sticky md:z-10", selectable ? "md:start-12" : "md:start-0", head ? "md:bg-ub-table-head" : "md:bg-inherit") : "";

  return (
    <div
      className={className}
      onKeyDown={(e) => {
        if (e.key === "Escape" && selectable && count > 0) {
          e.stopPropagation();
          clearSelection();
          setAnnouncement("Selection cleared");
        }
      }}
    >
      {selectable && (
        <div role="status" aria-live="polite" className="sr-only">
          {announcement || (count > 0 ? `${count} selected` : "")}
        </div>
      )}

      {selectable && (offerAllMatching || allMatchingSelected) && (
        <p className="mb-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-ub-md bg-ub-surface-subtle px-4 py-2 text-ub-body-sm text-ub-text-secondary">
          {allMatchingSelected ? (
            <>
              All <span className="ub-tabular font-medium text-ub-text-primary">{totalCount}</span> results are selected.
              <button type="button" onClick={clearSelection} className={`rounded-ub-xs font-medium text-ub-text-link hover:underline ${focusRing}`}>
                Clear selection
              </button>
            </>
          ) : (
            <>
              All <span className="ub-tabular font-medium text-ub-text-primary">{selectableIds.length}</span> on this page are selected.
              <button type="button" onClick={() => onSelectAllMatchingChange?.(true)} className={`rounded-ub-xs font-medium text-ub-text-link hover:underline ${focusRing}`}>
                Select all {totalCount} results
              </button>
            </>
          )}
        </p>
      )}

      <TableWrapper footer={footer} scrollClassName={scrollClassName} scrollLabel={mobileScroll ? `${caption}: scroll to see all columns and rows` : undefined}>
        <table className={t.table} aria-busy={loading || undefined}>
          <caption className="sr-only">{caption}</caption>
          <thead className={`${tableHead} ${t.thead}`}>
            {/* On mobile (and in cards) only the select-all cell of the header row is shown. */}
            <tr className={t.headRow(!!selectable && showData)}>
              {selectable && (
                <th scope="col" className={clsx(mobileScroll ? "table-cell h-11 w-12 px-4 align-middle" : "flex h-11 w-auto items-center gap-3 px-4", !cards && "md:table-cell md:w-12 md:align-middle", stickyFirstColumn && !cards && "md:sticky md:start-0 md:z-10 md:bg-ub-table-head")}>
                  <TableCheckbox checked={pageState === "all"} indeterminate={pageState === "some"} onChange={toggleAll} label="Select all rows" />
                  <span aria-hidden="true" className={mobileScroll ? "hidden" : cards ? "" : "md:hidden"}>
                    Select all
                  </span>
                </th>
              )}
              {columns.map((col, ci) => {
                const active = sort?.key === col.key ? sort.direction : undefined;
                const end = col.align === "end";
                const SortIcon = active === "asc" ? ArrowUp : active === "desc" ? ArrowDown : ArrowUpDown;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    style={col.width ? { width: col.width } : undefined}
                    aria-sort={col.sortable ? ariaSort(active) : undefined}
                    className={clsx(t.headCell, end ? "text-end" : "text-start", pin(ci === 0, true))}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => cycleSort(col.key)}
                        className={`-mx-1 inline-flex items-center gap-1 rounded-ub-xs px-1 hover:text-ub-text-primary ${end ? "flex-row-reverse" : ""} ${focusRing}`}
                      >
                        {col.header}
                        <SortIcon aria-hidden="true" className={`h-3.5 w-3.5 ${active ? "text-ub-text-primary" : "text-ub-text-tertiary"}`} />
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className={t.tbody}>
            {loading && <TableSkeletonRows columns={colCount} rows={skeletonRows} />}
            {!loading && error && <TableErrorRow colSpan={colCount} message={error} onRetry={onRetry} />}
            {!loading && !error && sortedRows.length === 0 && (
              <TableEmptyRow colSpan={colCount} title={empty.title} subtitle={empty.description} action={empty.action} icon={empty.icon} />
            )}
            {showData && (
              <AnimatePresence initial={false}>
                {sortedRows.map((row, index) => {
                  const id = rowIds[index];
                  const isSelected = allMatchingSelected ? !disabledReason.has(id) : selectedSet.has(id);
                  const href = getRowHref?.(row);
                  const label = getRowLabel ? getRowLabel(row) : `row ${index + 1}`;
                  return (
                    <AnimatedTableRow
                      key={id}
                      onClick={href ? (event) => {
                        const target = event.target as HTMLElement;
                        if (event.defaultPrevented || target.closest('a, button, input, select, textarea, label, [role="button"], [role="checkbox"], [role="switch"], [contenteditable="true"], [data-row-action]') || window.getSelection()?.toString()) return;
                        const link = event.currentTarget.querySelector<HTMLAnchorElement>('a[data-row-link]');
                        link?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: event.ctrlKey, metaKey: event.metaKey, shiftKey: event.shiftKey, altKey: event.altKey }));
                      } : undefined}
                      data-selected={isSelected || undefined}
                      className={clsx(t.row, href && "relative cursor-pointer", isSelected ? "bg-ub-selected" : clsx("bg-ub-surface", cards ? "hover:bg-ub-row-hover" : "md:hover:bg-ub-row-hover"), getRowClassName?.(row, index))}
                    >
                      {selectable && (
                        <td className={clsx(t.checkCell, "relative z-10", stickyFirstColumn && !cards && "md:sticky md:start-0 md:bg-inherit")}>
                          <TableCheckbox
                            checked={isSelected}
                            onChange={(e) => toggleRow(id, e.shiftKey)}
                            label={`Select ${label}`}
                            disabledReason={disabledReason.get(id)}
                          />
                        </td>
                      )}
                      {columns.map((col, ci) => {
                        const end = col.align === "end";
                        const mobileLabel = col.mobileLabel ?? (typeof col.header === "string" ? col.header : col.key);
                        const content = col.cell(row, index);
                        return (
                          <td key={col.key} className={clsx(t.cell, end ? clsx("ub-tabular", !cards && "md:text-end") : !cards && "md:text-start", pin(ci === 0))}>
                            <span aria-hidden="true" className={t.label}>
                              {mobileLabel}
                            </span>
                            <span className={clsx(mobileScroll ? "block min-w-0 text-start" : "min-w-0 text-end", !cards && "md:block", !cards && (end ? "md:text-end" : "md:text-start"))}>
                              {/* The first column's link covers the whole row; other interactive cells sit above it (relative z-10). */}
                              {href && ci === 0 ? (
                                <Link
                                  data-row-link
                                  href={href}
                                  target={rowLinkTarget === "_blank" ? "_blank" : undefined}
                                  rel={rowLinkTarget === "_blank" ? "noopener noreferrer" : undefined}
                                  className={`rounded-ub-xs after:absolute after:inset-0 ${focusRing}`}
                                >
                                  {content}
                                  {rowLinkTarget === "_blank" && <span className="sr-only"> (opens in a new tab)</span>}
                                </Link>
                              ) : (
                                <span className={href ? "relative z-10" : undefined}>{content}</span>
                              )}
                            </span>
                          </td>
                        );
                      })}
                    </AnimatedTableRow>
                  );
                })}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </TableWrapper>

      {/* Bulk-action bar floats at the bottom of the viewport while rows are selected (above the mobile nav). */}
      {selectable && count > 0 && (
        <div
          role="group"
          aria-label="Bulk actions"
          className="sticky bottom-20 z-20 mt-3 flex flex-wrap items-center gap-3 rounded-ub-lg border border-ub-border-overlay bg-ub-surface-raised px-4 py-2 shadow-ub-lg md:bottom-4"
        >
          <span aria-hidden="true" className="ub-tabular text-ub-label-md text-ub-text-primary">
            {count} selected
          </span>
          <div className="flex flex-1 flex-wrap items-center gap-2">{bulkActions?.(selected, clearSelection, { allMatching: allMatchingSelected, count })}</div>
          <button
            type="button"
            onClick={clearSelection}
            className={`inline-flex h-8 items-center gap-1.5 rounded-ub-full px-3 text-ub-label-md text-ub-text-link hover:bg-ub-action-secondary-hover ${focusRing}`}
          >
            <X aria-hidden="true" className="h-4 w-4" />
            Clear selection
          </button>
        </div>
      )}
    </div>
  );
}
