"use client";

import React, { useEffect, useRef, useState } from "react";
import { LucideIcon, MoreVertical } from "lucide-react";
import { buttonBase, buttonSizes, buttonVariants, iconTints, menuItem, popover } from "components/ub/recipes";

type ItemColor = "amber" | "blue" | "red" | "green";

// Icon tile tint per item colour; tone tokens flip with data-ub-theme.
const ICON_TINT: Record<ItemColor, string> = {
  amber: iconTints.amber,
  blue: iconTints.blue,
  red: iconTints.red,
  green: iconTints.green,
};

export interface DropdownItem {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  color?: ItemColor;
}

interface ActionsDropdownProps {
  items: DropdownItem[];
  label?: string;
}

export default function ActionsDropdown({ items, label = "Actions" }: ActionsDropdownProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const close = (restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  };

  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(ref.current?.contains(document.activeElement) ?? false);
    };
    document.addEventListener("mousedown", onMouse);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouse);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const toggle = () => {
    setMounted(true);
    const next = !open;
    setOpen(next);
    // Opening moves focus into the menu so keyboard users land on the first item.
    if (next) requestAnimationFrame(() => focusItem(0));
  };

  const handleItemClick = (onClick: () => void) => {
    close();
    onClick();
  };

  // Arrow keys move through menu items (brief §9).
  const focusItem = (index: number) => {
    const count = items.length;
    if (!count) return;
    itemRefs.current[((index % count) + count) % count]?.focus();
  };

  const onTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setMounted(true);
      setOpen(true);
      const target = e.key === "ArrowDown" ? 0 : items.length - 1;
      requestAnimationFrame(() => focusItem(target));
    }
  };

  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    const current = itemRefs.current.findIndex((el) => el === document.activeElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      focusItem(current + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      focusItem(current - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusItem(0);
    } else if (e.key === "End") {
      e.preventDefault();
      focusItem(items.length - 1);
    } else if (e.key === "Tab") {
      close();
    }
  };

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        onKeyDown={onTriggerKeyDown}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`${buttonBase} ${buttonSizes.md} ${buttonVariants.secondary} ${open ? "bg-ub-action-secondary-pressed" : ""}`}
      >
        {label}
        <MoreVertical
          aria-hidden
          className={`h-4 w-4 transition-transform duration-ub-base ease-ub-standard motion-reduce:transition-none ${open ? "rotate-90" : "rotate-0"}`}
        />
      </button>

      {/* Panel */}
      {mounted && (
        <div
          className={`${popover} absolute end-0 top-full z-50 mt-2 w-56 overflow-hidden transition-[opacity,transform] duration-ub-fast ease-ub-standard motion-reduce:transition-none ltr:origin-top-right rtl:origin-top-left ${
            open ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none -translate-y-1 scale-95 opacity-0"
          }`}
          onTransitionEnd={() => {
            if (!open) setMounted(false);
          }}
          role="menu"
          aria-label={label}
          onKeyDown={onMenuKeyDown}
        >
          <div className="p-1.5">
            {items.map((item, i) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  ref={(el) => {
                    itemRefs.current[i] = el;
                  }}
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  onClick={() => handleItemClick(item.onClick)}
                  className={`${menuItem} h-11 gap-3 font-medium`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-ub-md ${ICON_TINT[item.color ?? "blue"]}`}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
