"use client";

import { useRef, type ComponentType, type KeyboardEvent } from "react";
import clsx from "clsx";
import { focusRing, focusRingInset, tabList } from "components/ub/recipes";

export interface TabItem<T extends string = string> {
  key: T;
  label: string;
  /** 16px leading icon, e.g. a lucide-react icon component (not an element). */
  icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  /** Count shown after the label (99+ cap), e.g. unread items. */
  count?: number;
  /** Skipped by the keyboard and not selectable. */
  disabled?: boolean;
}

/**
 * - underline (default): brief §4.7, sections of one page (Student profile).
 * - segmented: pill track with a raised thumb, switching views of the same data (Table / Board).
 * - pills: separate chips, status filters above a list (All / Unread).
 * - vertical: side list like the sidebar nav, settings and long profiles.
 */
export type TabsVariant = "underline" | "segmented" | "pills" | "vertical";
export type TabsSize = "sm" | "md";

export interface TabsProps<T extends string> {
  tabs: TabItem<T>[];
  active: T;
  onChange: (key: T) => void;
  variant?: TabsVariant;
  /** md (default) · sm for dense toolbars and cards. */
  size?: TabsSize;
  /** Tabs share the full width equally (segmented and pills; underline on mobile). */
  fullWidth?: boolean;
  /** Allow dense segmented labels to wrap on narrow screens. */
  wrapLabels?: boolean;
  /** Visually hide labels and show them as tooltips (segmented and pills). Labels stay for screen readers. */
  iconOnly?: boolean;
  /** Underline only: 24px inline padding so the first tab lines up with card content. Default true. */
  inset?: boolean;
  /** Prefix for tab/panel ids; pair with tabPanelProps() on each panel for aria-controls. */
  idPrefix?: string;
  className?: string;
  /** Accessible name for the tab list. */
  "aria-label"?: string;
}

/** Spread on a tab panel so it's labelled by its tab: <div {...tabPanelProps("profile", "documents")} />. */
export function tabPanelProps(idPrefix: string, key: string) {
  return { id: `${idPrefix}-panel-${key}`, role: "tabpanel" as const, "aria-labelledby": `${idPrefix}-tab-${key}`, tabIndex: 0 };
}

const transition = "transition-[background-color,border-color,color,box-shadow] duration-ub-fast ease-ub-standard motion-reduce:transition-none";

// Full class names per variant/size so Tailwind's JIT sees them. None use the
// Primary Blue fill: tabs never compete with the view's one Primary action.
const LIST: Record<TabsVariant, string> = {
  underline: tabList,
  segmented: "inline-flex max-w-full gap-1 overflow-x-auto rounded-ub-full border border-ub-border bg-ub-surface-subtle p-1",
  pills: "flex flex-wrap gap-2",
  vertical: "flex flex-col gap-1",
};

const HEIGHT: Record<TabsVariant, Record<TabsSize, string>> = {
  underline: { md: "h-11 px-3 text-ub-label-md", sm: "h-9 px-2.5 text-ub-label-sm" },
  segmented: { md: "h-8 px-3 text-ub-label-md", sm: "h-7 px-2.5 text-ub-label-sm" },
  pills: { md: "h-9 px-4 text-ub-label-md", sm: "h-8 px-3 text-ub-label-sm" },
  vertical: { md: "h-10 px-3 text-ub-label-md", sm: "h-9 px-3 text-ub-label-sm" },
};

function tabClasses(variant: TabsVariant, selected: boolean): string {
  switch (variant) {
    case "segmented":
      return clsx(
        "rounded-ub-full border",
        focusRingInset,
        selected
          ? "border-ub-border bg-ub-surface-raised text-ub-text-primary shadow-ub-xs"
          : "border-transparent text-ub-text-secondary hover:bg-ub-action-ghost-hover hover:text-ub-text-primary",
      );
    case "pills":
      return clsx(
        "rounded-ub-full border",
        focusRing,
        selected
          ? "border-ub-border-focus bg-ub-selected text-ub-text-selected"
          : "border-ub-border bg-ub-surface text-ub-text-secondary hover:border-ub-border-hover hover:text-ub-text-primary",
      );
    case "vertical":
      return clsx(
        "w-full justify-start rounded-ub-md border-s-2",
        focusRingInset,
        selected ? "border-ub-border-focus bg-ub-selected text-ub-text-selected" : "border-transparent text-ub-text-secondary hover:bg-ub-nav-hover hover:text-ub-text-primary",
      );
    default:
      // brief §4.7: 2px blue underline on the active tab
      return clsx(
        "-mb-px border-b-2",
        focusRingInset,
        selected ? "border-ub-border-focus text-ub-tab-active" : "border-transparent text-ub-text-secondary hover:text-ub-text-primary",
      );
  }
}

const formatCount = (n: number) => (n > 99 ? "99+" : String(n));

/**
 * Tabs with optional icons and counts in four variants (see TabsVariant).
 * WAI-ARIA tabs: roving tab index; Left/Right (mirrored in RTL) or Up/Down for
 * vertical, plus Home and End, move and activate; disabled tabs are skipped
 * (brief §9). Pair with tabPanelProps() for the panels.
 */
export default function Tabs<T extends string>({
  tabs,
  active,
  onChange,
  variant = "underline",
  size = "md",
  fullWidth = false,
  wrapLabels = false,
  iconOnly = false,
  inset = true,
  idPrefix,
  className,
  "aria-label": ariaLabel,
}: TabsProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const vertical = variant === "vertical";
  const wrap = wrapLabels && variant === "segmented";
  const hideLabels = iconOnly && (variant === "segmented" || variant === "pills");

  /** Moves from `from` by `step`, skipping disabled tabs, and activates the result. */
  const move = (from: number, step: 1 | -1) => {
    const count = tabs.length;
    for (let n = 1; n <= count; n++) {
      const i = (((from + step * n) % count) + count) % count;
      if (!tabs[i].disabled) {
        refs.current[i]?.focus();
        onChange(tabs[i].key);
        return;
      }
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const current = tabs.findIndex((t) => t.key === active);
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const nextKey = vertical ? "ArrowDown" : rtl ? "ArrowLeft" : "ArrowRight";
    const prevKey = vertical ? "ArrowUp" : rtl ? "ArrowRight" : "ArrowLeft";
    if (e.key === nextKey) move(current, 1);
    else if (e.key === prevKey) move(current, -1);
    else if (e.key === "Home") move(-1, 1);
    else if (e.key === "End") move(tabs.length, -1);
    else return;
    e.preventDefault();
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      aria-orientation={vertical ? "vertical" : "horizontal"}
      onKeyDown={onKeyDown}
      className={clsx(LIST[variant], variant === "underline" && inset && "px-6", fullWidth && variant !== "vertical" && "w-full", className)}
    >
      {tabs.map(({ key, label, icon: Icon, count, disabled }, i) => {
        const selected = active === key;
        return (
          <button
            key={key}
            ref={(el) => {
              refs.current[i] = el;
            }}
            id={idPrefix ? `${idPrefix}-tab-${key}` : undefined}
            aria-controls={idPrefix ? `${idPrefix}-panel-${key}` : undefined}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            disabled={disabled}
            title={hideLabels ? label : undefined}
            onClick={() => onChange(key)}
            className={clsx(
              wrap ? "inline-flex min-w-0 items-center gap-1 text-center sm:flex-none" : "inline-flex shrink-0 items-center gap-2 whitespace-nowrap",
              transition,
              wrap ? "min-h-9 px-2 py-1.5 text-ub-label-sm" : HEIGHT[variant][size],
              tabClasses(variant, selected),
              fullWidth && variant !== "vertical" && "flex-1 justify-center",
              hideLabels && "px-0 aspect-square justify-center",
              "disabled:cursor-not-allowed disabled:text-ub-text-disabled disabled:hover:bg-transparent",
            )}
          >
            {Icon && <Icon className={clsx("h-4 w-4 shrink-0", selected ? "text-current" : "text-ub-icon")} aria-hidden="true" />}
            <span className={clsx(wrap && "min-w-0 whitespace-normal sm:whitespace-nowrap", hideLabels && "sr-only", vertical && "min-w-0 flex-1 truncate text-start")}>{label}</span>
            {typeof count === "number" && count > 0 && (
              <span
                className={clsx(
                  "ub-tabular inline-grid h-5 min-w-5 place-items-center rounded-ub-full border px-1.5 text-ub-label-sm",
                  selected ? "border-transparent bg-ub-action-primary text-ub-action-primary-text" : "border-ub-count-border bg-ub-count-bg text-ub-count-text",
                  hideLabels && "hidden",
                )}
              >
                {formatCount(count)}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
