// Pure selection rules for DataTable (brief §4.6). Kept out of the component
// so the edge cases (ranges, disabled rows, pages) are unit-tested.

/** Toggles one id. */
export function toggleId(selected: readonly string[], id: string): string[] {
  return selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id];
}

/**
 * Shift-click: applies the clicked row's new state to every selectable row
 * between the anchor and the clicked row (inclusive), keeping the rest.
 */
export function selectRange(selected: readonly string[], visibleIds: readonly string[], anchorId: string, targetId: string, selectable: (id: string) => boolean = () => true): string[] {
  const a = visibleIds.indexOf(anchorId);
  const b = visibleIds.indexOf(targetId);
  if (a < 0 || b < 0) return toggleId(selected, targetId);
  const [from, to] = a < b ? [a, b] : [b, a];
  const range = visibleIds.slice(from, to + 1).filter(selectable);
  const turnOn = !selected.includes(targetId);
  if (turnOn) return Array.from(new Set([...selected, ...range]));
  const off = new Set(range);
  return selected.filter((id) => !off.has(id));
}

export type PageSelection = "none" | "some" | "all";

/** Header checkbox state for the visible (selectable) rows. */
export function pageSelectionState(selected: readonly string[], selectableIds: readonly string[]): PageSelection {
  if (!selectableIds.length) return "none";
  const set = new Set(selected);
  const n = selectableIds.filter((id) => set.has(id)).length;
  return n === 0 ? "none" : n === selectableIds.length ? "all" : "some";
}

/** Header checkbox click: select every selectable visible row, or clear them if all were selected. */
export function togglePage(selected: readonly string[], selectableIds: readonly string[]): string[] {
  if (pageSelectionState(selected, selectableIds) === "all") {
    const page = new Set(selectableIds);
    return selected.filter((id) => !page.has(id));
  }
  return Array.from(new Set([...selected, ...selectableIds]));
}
