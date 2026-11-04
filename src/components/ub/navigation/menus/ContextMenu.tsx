"use client";

import React, { ComponentType, KeyboardEvent as ReactKeyboardEvent, ReactElement, ReactNode, cloneElement, isValidElement, useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { menuItem, popover } from "components/ub/recipes";

type IconComponent = ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;

export interface ContextMenuItem {
  type?: "item";
  /** Stable key; defaults to the label. */
  id?: string;
  label: string;
  icon?: IconComponent;
  onSelect?: () => void;
  /** Renders the item as a link (next/link). */
  href?: string;
  tone?: "default" | "danger";
  disabled?: boolean;
  /** Displayed hint, e.g. "Ctrl+E". Also set as aria-keyshortcuts. */
  shortcut?: string;
}
export interface ContextMenuSeparator {
  type: "separator";
}
export interface ContextMenuGroup {
  type: "group";
  label: string;
  items: ContextMenuItem[];
}
export type ContextMenuEntry = ContextMenuItem | ContextMenuSeparator | ContextMenuGroup;

/** Props handed to the trigger (spread onto a button). */
export interface ContextMenuTriggerProps {
  id: string;
  "aria-haspopup": "menu";
  "aria-expanded": boolean;
  "aria-controls": string | undefined;
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
  onKeyDown: (e: ReactKeyboardEvent<HTMLElement>) => void;
}

export interface ContextMenuProps {
  items: ContextMenuEntry[];
  /** A focusable element (usually a button) or a render prop receiving trigger props. */
  trigger: ReactElement<any> | ((props: ContextMenuTriggerProps & { open: boolean }) => ReactNode);
  /** Accessible name for the menu, e.g. "Application actions". */
  label: string;
  /** Edge of the trigger the menu lines up with (logical: follows dir). Default "end". */
  align?: "start" | "end";
  /** Open below (default) or above the trigger. */
  side?: "bottom" | "top";
  /** Menu width classes (default w-56). */
  widthClassName?: string;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

// Local constants: danger tone and disabled state layered on the menuItem recipe.
const itemDanger = "text-ub-tone-danger-text hover:bg-ub-tone-danger-bg";
const itemDisabled = "cursor-not-allowed text-ub-text-disabled hover:bg-transparent";
const TYPEAHEAD_RESET_MS = 500;

const isItem = (e: ContextMenuEntry): e is ContextMenuItem => !e.type || e.type === "item";

/**
 * Accessible menu button (brief §4.7, §9): popover radius 12 + shadow-md,
 * ArrowUp/Down, Home/End and typeahead, Esc closes and returns focus to the
 * trigger, Tab and click-outside close. Positions below, aligned to the end
 * edge by default (logical, so it mirrors in RTL).
 */
export default function ContextMenu({ items, trigger, label, align = "end", side = "bottom", widthClassName = "w-56", onOpenChange, className }: ContextMenuProps) {
  const [open, setOpenState] = useState(false);
  const [visible, setVisible] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const pendingFocus = useRef<"first" | "last">("first");
  const typeahead = useRef({ buffer: "", timer: 0 });
  const baseId = useId();
  const triggerId = `${baseId}-trigger`;
  const menuId = `${baseId}-menu`;

  // Flatten for roving focus.
  const flat: ContextMenuItem[] = [];
  items.forEach((e) => {
    if (isItem(e)) flat.push(e);
    else if (e.type === "group") flat.push(...e.items);
  });

  const setOpen = useCallback(
    (next: boolean) => {
      setOpenState(next);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );

  const focusTrigger = () => {
    const el = document.getElementById(triggerId) ?? rootRef.current?.querySelector<HTMLElement>("button, [href], [tabindex]");
    el?.focus();
  };

  const close = useCallback(
    (restoreFocus: boolean) => {
      setOpen(false);
      if (restoreFocus) focusTrigger();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setOpen],
  );

  const enabledIndexes = () => flat.map((it, i) => (it.disabled ? -1 : i)).filter((i) => i >= 0);

  const focusAt = (index: number) => itemRefs.current[index]?.focus();

  const move = (delta: 1 | -1) => {
    const enabled = enabledIndexes();
    if (!enabled.length) return;
    const current = itemRefs.current.findIndex((el) => el === document.activeElement);
    const pos = enabled.indexOf(current);
    const nextPos = pos < 0 ? (delta === 1 ? 0 : enabled.length - 1) : (pos + delta + enabled.length) % enabled.length;
    focusAt(enabled[nextPos]);
  };

  // Enter animation + initial focus once the menu is rendered.
  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }
    const enabled = enabledIndexes();
    if (enabled.length) focusAt(pendingFocus.current === "first" ? enabled[0] : enabled[enabled.length - 1]);
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Click outside closes (without stealing focus back).
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
    };
  }, [open, close]);

  useEffect(() => () => window.clearTimeout(typeahead.current.timer), []);

  const openWith = (where: "first" | "last") => {
    pendingFocus.current = where;
    setOpen(true);
  };

  const triggerProps: ContextMenuTriggerProps = {
    id: triggerId,
    "aria-haspopup": "menu",
    "aria-expanded": open,
    "aria-controls": open ? menuId : undefined,
    onClick: () => (open ? close(false) : openWith("first")),
    onKeyDown: (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        openWith(e.key === "ArrowDown" ? "first" : "last");
      }
    },
  };

  const select = (item: ContextMenuItem) => {
    if (item.disabled) return;
    close(true);
    item.onSelect?.();
  };

  const runTypeahead = (char: string) => {
    const t = typeahead.current;
    window.clearTimeout(t.timer);
    t.buffer += char.toLowerCase();
    t.timer = window.setTimeout(() => (t.buffer = ""), TYPEAHEAD_RESET_MS);
    const enabled = enabledIndexes();
    const current = itemRefs.current.findIndex((el) => el === document.activeElement);
    // Search from the item after the current one so repeated letters cycle.
    const ordered = [...enabled.filter((i) => i > current), ...enabled.filter((i) => i <= current)];
    const startsWith = (i: number) => flat[i].label.toLowerCase().startsWith(t.buffer);
    const match = t.buffer.length > 1 ? (enabled.find(startsWith) ?? ordered.find(startsWith)) : ordered.find(startsWith);
    if (match !== undefined) focusAt(match);
  };

  const onMenuKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        move(1);
        return;
      case "ArrowUp":
        e.preventDefault();
        move(-1);
        return;
      case "Home":
      case "PageUp":
        e.preventDefault();
        focusAt(enabledIndexes()[0]);
        return;
      case "End":
      case "PageDown": {
        e.preventDefault();
        const enabled = enabledIndexes();
        focusAt(enabled[enabled.length - 1]);
        return;
      }
      case "Escape":
        e.preventDefault();
        e.stopPropagation();
        close(true);
        return;
      case "Tab":
        close(false);
        return;
      case " ": {
        // Space activates links too (buttons already do this natively).
        const el = document.activeElement as HTMLElement | null;
        if (el?.tagName === "A") {
          e.preventDefault();
          el.click();
        }
        return;
      }
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && /\S/.test(e.key)) runTypeahead(e.key);
    }
  };

  let flatIndex = 0;
  const renderItem = (item: ContextMenuItem) => {
    const index = flatIndex++;
    const Icon = item.icon;
    const cls = clsx(menuItem, item.disabled ? itemDisabled : item.tone === "danger" && itemDanger);
    const content = (
      <>
        {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />}
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
        {item.shortcut && <kbd className="ms-auto shrink-0 font-sans text-ub-caption text-ub-text-tertiary">{item.shortcut}</kbd>}
      </>
    );
    const common = {
      ref: (el: HTMLElement | null) => {
        itemRefs.current[index] = el;
      },
      role: "menuitem",
      tabIndex: -1,
      "aria-disabled": item.disabled || undefined,
      "aria-keyshortcuts": item.shortcut,
      className: cls,
    };
    if (item.href && !item.disabled) {
      return (
        <Link key={item.id ?? item.label} href={item.href} {...common} onClick={() => select(item)}>
          {content}
        </Link>
      );
    }
    return (
      <button key={item.id ?? item.label} type="button" {...common} onClick={() => select(item)}>
        {content}
      </button>
    );
  };

  let triggerNode: ReactNode;
  if (typeof trigger === "function") {
    triggerNode = trigger({ ...triggerProps, open });
  } else if (isValidElement<Record<string, unknown>>(trigger)) {
    const own = trigger.props as { onClick?: (e: React.MouseEvent<HTMLElement>) => void; onKeyDown?: (e: ReactKeyboardEvent<HTMLElement>) => void };
    triggerNode = cloneElement(trigger, {
      ...triggerProps,
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        own.onClick?.(e);
        triggerProps.onClick(e);
      },
      onKeyDown: (e: ReactKeyboardEvent<HTMLElement>) => {
        own.onKeyDown?.(e);
        triggerProps.onKeyDown(e);
      },
    });
  }

  itemRefs.current.length = flat.length;

  return (
    <span ref={rootRef} className={clsx("relative inline-flex", className)}>
      {triggerNode}
      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={label}
          aria-orientation="vertical"
          onKeyDown={onMenuKeyDown}
          className={clsx(
            popover,
            widthClassName,
            "absolute z-50 p-1.5 transition-[opacity,transform] duration-ub-base ease-ub-enter motion-reduce:transform-none motion-reduce:duration-ub-fast",
            side === "bottom" ? "top-full mt-2" : "bottom-full mb-2",
            align === "end" ? "end-0" : "start-0",
            visible ? "translate-y-0 scale-100 opacity-100" : clsx("scale-95 opacity-0", side === "bottom" ? "-translate-y-1" : "translate-y-1"),
          )}
        >
          {items.map((entry, i) => {
            if (isItem(entry)) return renderItem(entry);
            if (entry.type === "separator") return <div key={`sep-${i}`} role="separator" className="-mx-1.5 my-1.5 h-px bg-ub-border" />;
            const groupLabelId = `${baseId}-group-${i}`;
            return (
              <div key={`group-${i}`} role="group" aria-labelledby={groupLabelId}>
                <div id={groupLabelId} className="px-3 pb-1 pt-2 text-ub-label-sm text-ub-text-tertiary">
                  {entry.label}
                </div>
                {entry.items.map(renderItem)}
              </div>
            );
          })}
        </div>
      )}
    </span>
  );
}
