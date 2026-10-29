"use client";

import React, { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence } from "framer-motion";
import { ArrowDown, ArrowUp, ArrowUpDown, Check, Minus, X } from "lucide-react";
import TableWrapper from "components/ub/data/TableWrapper";
import TableSkeletonRows from "components/ub/data/TableSkeletonRows";
import TableEmptyRow from "components/ub/data/TableEmptyRow";
import TableErrorRow from "components/ub/data/TableErrorRow";
import AnimatedTableRow from "components/ub/data/AnimatedTableRow";
import { Avatar } from "components/ub/data/Avatar";
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
  bulkActions?: (selectedIds: string[], clearSelection: () => void) => ReactNode;

  /** Controlled sort (pass `null` for unsorted). */
  sort?: DataTableSort | null;
  defaultSort?: DataTableSort | null;
  onSortChange?: (sort: DataTableSort | null) => void;
  /** Rows already arrive sorted (server-side); skip client sorting. */
  manualSort?: boolean;

  /** Footer slot, typically <TablePagination />. */
  footer?: ReactNode;
  className?: string;
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

function TableCheckbox({ checked, indeterminate, onChange, label }: { checked: boolean; indeterminate?: boolean; onChange: () => void; label: string }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = !!indeterminate;
  }, [indeterminate]);
  return (
    <span className="relative inline-grid place-items-center">
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        aria-label={label}
        aria-checked={indeterminate ? "mixed" : checked}
        className={`peer ${checkbox} indeterminate:border-ub-action-primary indeterminate:bg-ub-action-primary`}
      />
      <Check aria-hidden="true" strokeWidth={3} className="pointer-events-none absolute inset-0 m-auto hidden h-3.5 w-3.5 text-ub-action-primary-text peer-checked:block" />
      <Minus aria-hidden="true" strokeWidth={3} className="pointer-events-none absolute inset-0 m-auto hidden h-3.5 w-3.5 text-ub-action-primary-text peer-indeterminate:block" />
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

// Below md every row is a stacked card; from md up it's a real table.
const rowHeight: Record<DataTableDensity, string> = { comfortable: "md:h-14", compact: "md:h-11" };
const cellBase = "flex items-start justify-between gap-4 px-4 py-1 text-ub-body-sm text-ub-text-primary md:table-cell md:py-0 md:align-middle";
const headCellBase = "hidden h-11 px-4 font-medium md:table-cell";

export default function DataTable<T>({
  columns,
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
  className,
}: DataTableProps<T>) {
  const [selected, setSelected] = useControllable<string[]>(selectedIds, defaultSelectedIds, onSelectionChange);
  const [sort, setSort] = useControllable<DataTableSort | null>(sortProp, defaultSort, onSortChange);

  const sortedRows = useMemo(() => (manualSort ? rows : sortRows(rows, columns, sort)), [rows, columns, sort, manualSort]);
  const rowIds = useMemo(() => sortedRows.map(getRowId), [sortedRows, getRowId]);

  const selectedSet = new Set(selected);
  const selectedVisible = rowIds.filter((id) => selectedSet.has(id)).length;
  const allSelected = rowIds.length > 0 && selectedVisible === rowIds.length;
  const someSelected = selectedVisible > 0 && !allSelected;
  const showData = !loading && !error && sortedRows.length > 0;
  const colCount = columns.length + (selectable ? 1 : 0);

  const clearSelection = () => setSelected([]);
  const toggleAll = () => {
    if (allSelected) setSelected(selected.filter((id) => !rowIds.includes(id)));
    else setSelected(Array.from(new Set([...selected, ...rowIds])));
  };
  const toggleRow = (id: string) => setSelected(selectedSet.has(id) ? selected.filter((s) => s !== id) : [...selected, id]);

  // asc → desc → unsorted
  const cycleSort = (key: string) => {
    if (sort?.key !== key) setSort({ key, direction: "asc" });
    else if (sort.direction === "asc") setSort({ key, direction: "desc" });
    else setSort(null);
  };

  const count = selected.length;

  return (
    <div className={className}>
      {selectable && (
        <>
          <div role="status" aria-live="polite" className="sr-only">
            {count > 0 ? `${count} selected` : ""}
          </div>
          {count > 0 && (
            <div
              role="group"
              aria-label="Bulk actions"
              className="mb-3 flex flex-wrap items-center gap-3 rounded-ub-lg border border-ub-action-primary bg-ub-selected px-4 py-2"
            >
              <span aria-hidden="true" className="ub-tabular text-ub-label-md text-ub-text-primary">
                {count} selected
              </span>
              <div className="flex flex-1 flex-wrap items-center gap-2">{bulkActions?.(selected, clearSelection)}</div>
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
        </>
      )}

      <TableWrapper footer={footer}>
        <table className="block w-full border-collapse text-start md:table" aria-busy={loading || undefined}>
          <caption className="sr-only">{caption}</caption>
          <thead className={`${tableHead} block md:table-header-group`}>
            {/* On mobile only the select-all cell of the header row is shown. */}
            <tr className={`${selectable && showData ? "flex items-center" : "hidden"} md:table-row`}>
              {selectable && (
                <th scope="col" className="flex h-11 w-auto items-center gap-3 px-4 md:table-cell md:w-12 md:align-middle">
                  <TableCheckbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} label="Select all rows" />
                  <span aria-hidden="true" className="md:hidden">
                    Select all
                  </span>
                </th>
              )}
              {columns.map((col) => {
                const active = sort?.key === col.key ? sort.direction : undefined;
                const end = col.align === "end";
                const SortIcon = active === "asc" ? ArrowUp : active === "desc" ? ArrowDown : ArrowUpDown;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    style={col.width ? { width: col.width } : undefined}
                    aria-sort={col.sortable ? ariaSort(active) : undefined}
                    className={`${headCellBase} ${end ? "text-end" : "text-start"}`}
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
          <tbody className="block md:table-row-group">
            {loading && <TableSkeletonRows columns={colCount} rows={skeletonRows} />}
            {!loading && error && <TableErrorRow colSpan={colCount} message={error} onRetry={onRetry} />}
            {!loading && !error && sortedRows.length === 0 && (
              <TableEmptyRow colSpan={colCount} title={empty.title} subtitle={empty.description} action={empty.action} icon={empty.icon} />
            )}
            {showData && (
              <AnimatePresence initial={false}>
                {sortedRows.map((row, index) => {
                  const id = rowIds[index];
                  const isSelected = selectedSet.has(id);
                  return (
                    <AnimatedTableRow
                      key={id}
                      data-selected={isSelected || undefined}
                      className={`block border-t border-ub-border py-3 md:table-row md:py-0 ${rowHeight[density]} ${isSelected ? "bg-ub-selected" : "md:hover:bg-ub-surface-subtle"}`}
                    >
                      {selectable && (
                        <td className="flex px-4 py-1 md:table-cell md:w-12 md:py-0 md:align-middle">
                          <TableCheckbox
                            checked={isSelected}
                            onChange={() => toggleRow(id)}
                            label={`Select ${getRowLabel ? getRowLabel(row) : `row ${index + 1}`}`}
                          />
                        </td>
                      )}
                      {columns.map((col) => {
                        const end = col.align === "end";
                        const mobileLabel = col.mobileLabel ?? (typeof col.header === "string" ? col.header : col.key);
                        return (
                          <td key={col.key} className={`${cellBase} ${end ? "ub-tabular md:text-end" : "md:text-start"}`}>
                            <span aria-hidden="true" className="shrink-0 text-ub-label-sm text-ub-text-tertiary md:hidden">
                              {mobileLabel}
                            </span>
                            <span className={`min-w-0 text-end md:block ${end ? "md:text-end" : "md:text-start"}`}>{col.cell(row, index)}</span>
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
    </div>
  );
}
