"use client";

import React, {
  Children,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";
import ActionSheet from "components/ub/feedback/dialogs/ActionSheet";
import { focusRing } from "components/ub/recipes";

export const TableRowActionLabel = createContext("Row");
export interface TableActionProps {
  label: string;
  icon?: ReactNode;
  onSelect?: React.MouseEventHandler<HTMLButtonElement>;
  href?: string;
  target?: string;
  disabled?: boolean;
  primary?: boolean;
  danger?: boolean;
}
/** Declarative action, rendered by TableActions as an icon or a labelled menu item. */
export function TableAction(_props: TableActionProps) {
  return null;
}

function collect(children: ReactNode): TableActionProps[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement(child)) return [];
    if (child.type === TableAction) return [child.props as TableActionProps];
    return collect((child.props as { children?: ReactNode }).children);
  });
}
const trigger = `grid h-10 w-10 shrink-0 place-items-center rounded-ub-full text-ub-text-secondary transition-colors duration-200 hover:bg-ub-selected hover:text-ub-text-link disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`;

export default function TableActions({
  children,
  label: labelProp,
}: {
  children: ReactNode;
  label?: string;
}) {
  const contextLabel = useContext(TableRowActionLabel);
  const label = labelProp ?? contextLabel;
  const actions = collect(children);
  const primary = actions.find((action) => action.primary);
  const secondary = actions.filter((action) => action !== primary);
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => {
      setMobile(media.matches);
      setOpen(false);
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!open || mobile) return;
    const outside = (event: MouseEvent) => {
      if (
        !ref.current?.contains(event.target as Node) &&
        !menu.current?.contains(event.target as Node)
      )
        setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    menu.current
      ?.querySelector<HTMLElement>('[role="menuitem"]:not(:disabled)')
      ?.focus();
    document.addEventListener("mousedown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open, mobile]);
  const run = (
    action: TableActionProps,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    setOpen(false);
    if (action.href) {
      // Activate the real link to preserve Next navigation and the action's target.
      const link = document.createElement("a");
      link.href = action.href;
      if (action.target) {
        link.target = action.target;
        link.rel = "noopener noreferrer";
      }
      link.click();
    } else action.onSelect?.(event);
  };
  if (!actions.length) return <span className="text-ub-text-tertiary">—</span>;
  return (
    <div
      ref={ref}
      data-row-action
      className="relative inline-flex items-center gap-1"
      onClick={(event) => event.stopPropagation()}
    >
      {primary && (
        <span className="hidden md:inline-flex">
          {primary.href && !primary.disabled ? (
            <Link
              href={primary.href}
              target={primary.target}
              title={primary.label}
              aria-label={primary.label}
              className={trigger}
            >
              {primary.icon}
            </Link>
          ) : (
            <button
              type="button"
              title={primary.label}
              aria-label={primary.label}
              disabled={primary.disabled}
              onClick={(event) => run(primary, event)}
              className={trigger}
            >
              {primary.icon}
            </button>
          )}
        </span>
      )}
      <button
        ref={button}
        type="button"
        aria-label={`More actions for ${label}`}
        title="More actions"
        aria-expanded={open}
        aria-haspopup={mobile ? "dialog" : "menu"}
        className={`${trigger} ${secondary.length ? "" : "md:hidden"}`}
        onClick={() => setOpen((value) => !value)}
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>
      {open &&
        !mobile &&
        createPortal(
          <div
            ref={menu}
            role="menu"
            aria-label={`${label} actions`}
            className="fixed z-[1000] w-64 max-w-[calc(100vw-24px)] overflow-y-auto rounded-ub-lg border border-ub-border-overlay bg-ub-modal p-1 shadow-ub-lg"
            style={{
              left: Math.max(
                12,
                Math.min(
                  (button.current?.getBoundingClientRect().right ?? 268) - 256,
                  window.innerWidth - 268
                )
              ),
              top: Math.max(
                12,
                Math.min(
                  (button.current?.getBoundingClientRect().bottom ?? 0) + 6,
                  window.innerHeight -
                    Math.min(secondary.length * 44 + 10, 320) -
                    12
                )
              ),
              maxHeight: "min(320px, calc(100dvh - 24px))",
            }}
            onKeyDown={(event) => {
              const items = Array.from(
                menu.current?.querySelectorAll<HTMLButtonElement>(
                  '[role="menuitem"]:not(:disabled)'
                ) ?? []
              );
              const index = items.indexOf(
                document.activeElement as HTMLButtonElement
              );
              if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
                event.preventDefault();
                const next =
                  event.key === "Home"
                    ? 0
                    : event.key === "End"
                    ? items.length - 1
                    : (index +
                        (event.key === "ArrowDown" ? 1 : -1) +
                        items.length) %
                      items.length;
                items[next]?.focus();
              }
            }}
          >
            {secondary.map((action) => (
              <button
                key={action.label}
                type="button"
                role="menuitem"
                disabled={action.disabled}
                className={`flex min-h-11 w-full items-center gap-3 rounded-ub-md px-3 py-2 text-start text-ub-body-sm hover:bg-ub-item-hover disabled:cursor-not-allowed disabled:opacity-60 ${
                  action.danger
                    ? "text-ub-tone-danger-text"
                    : "text-ub-text-primary"
                } ${focusRing}`}
                onClick={(event) => {
                  run(action, event);
                  button.current?.focus();
                }}
              >
                <span className="shrink-0">{action.icon}</span>
                <span className="min-w-0 break-words">{action.label}</span>
              </button>
            ))}
          </div>,
          document.body
        )}
      <ActionSheet
        open={open && mobile}
        onClose={() => setOpen(false)}
        title={`${label} actions`}
        actions={(mobile ? actions : secondary).map((action) => ({
          label: action.label,
          icon: action.icon ? ({ className }) => <span className={className}>{action.icon}</span> : undefined,
          disabled: action.disabled,
          tone: action.danger ? "danger" : "default",
          onSelect: (event) => run(action, event),
        }))}
      />
    </div>
  );
}
