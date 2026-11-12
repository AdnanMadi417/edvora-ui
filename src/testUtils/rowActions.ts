// Finds an action that a table row or detail page offers, wherever it lives:
// shown inline, inside a row's "More actions" menu, or inside a page's
// "Actions" menu. Tables moved most row actions into menus, and a row's
// "View X" action became the row's own name link.
import { fireEvent, screen } from "@testing-library/react";

const MENU_TRIGGER = /^(More actions for .+|Actions)$/;

function inline(name: string): HTMLElement | null {
  const direct = screen.queryByRole("button", { name }) ?? screen.queryByRole("link", { name });
  if (direct) return direct;
  // "View X" is now the row's name link (or name button).
  const view = /^View (.+)$/.exec(name);
  if (view) {
    // The row link's name is the whole cell, which starts with the row's name.
    const starts = new RegExp(`^${view[1].replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
    return screen.queryAllByRole("link", { name: starts })[0] ?? screen.queryAllByRole("button", { name: starts })[0] ?? null;
  }
  return null;
}

function closeMenus() {
  fireEvent.keyDown(document, { key: "Escape" });
  fireEvent.mouseDown(document.body);
}

/** The action, opening the menu that holds it and leaving it open so it can be clicked; null when no row or page offers it. */
export function queryRowActionOpen(name: string): HTMLElement | null {
  const found = inline(name);
  if (found) return found;
  for (const trigger of screen.queryAllByRole("button", { name: MENU_TRIGGER })) {
    fireEvent.click(trigger);
    const item = screen.queryByRole("menuitem", { name });
    if (item) return item;
    closeMenus();
  }
  return null;
}

/** The action (see queryRowActionOpen); throws when nothing offers it. */
export function rowAction(name: string): HTMLElement {
  const found = queryRowActionOpen(name);
  if (!found) throw new Error(`No row or page action named "${name}"`);
  return found;
}

/** Whether any row or page offers the action; leaves no menu open. */
export function queryRowAction(name: string): HTMLElement | null {
  const found = queryRowActionOpen(name);
  if (found && found.getAttribute("role") === "menuitem") closeMenus();
  return found;
}

/** The hidden file input behind a kit upload control, found from the control's label (for user.upload). */
export function fileInput(label: RegExp | string): HTMLInputElement {
  const control = screen.getByLabelText(label);
  const input =
    control instanceof HTMLInputElement && control.type === "file"
      ? control
      : control.parentElement?.querySelector<HTMLInputElement>('input[type="file"]');
  if (!input) throw new Error(`No file input next to the control labelled ${label}`);
  return input;
}
