"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import type { IRoute } from "../../../types/navigation";
import { ChevronDown } from "lucide-react";
import { focusRingInset } from "components/ub/recipes";

function matchesPath(pathname: string, path: string) {
  return pathname === path || pathname.startsWith(path + "/");
}

// Sidebar nav item (brief §4.7): height 40, radius 8; active = primary fill
// with white text, inactive = secondary text with a surface hover.
const navItemBase =
  "flex h-10 w-full items-center gap-3 rounded-ub-md px-3 text-start text-ub-label-md transition-colors duration-ub-fast ease-ub-standard " +
  focusRingInset;
const navItemActive = "bg-ub-action-primary text-ub-action-primary-text";
const navItemInactive = "text-ub-text-secondary hover:bg-ub-surface hover:text-ub-text-primary";
// A parent whose child is the current page: tinted, not filled.
const navItemParentActive = "bg-ub-selected text-ub-text-link hover:bg-ub-selected";

const CHILD_ROW_HEIGHT = 40;
const CHILD_GAP = 4;

export default function Links({ routes, onLinkClick }: { routes: IRoute[]; onLinkClick?: () => void }) {
  const pathname = usePathname();
  const baseId = useId();

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Some children share overlapping path prefixes (e.g. a child with an empty
  // sub-path is itself a prefix of sibling children's paths), so prefix-matching
  // more than one child at a time is possible — only the longest (most specific)
  // match should be highlighted.
  const getActiveChild = (route: IRoute) =>
    route.children
      ?.filter((child) => matchesPath(pathname, child.layout + child.path))
      .sort((a, b) => (b.layout + b.path).length - (a.layout + a.path).length)[0];

  useEffect(() => {
    routes.forEach((route, index) => {
      const parentPath = route.layout + route.path;
      const hasActiveChild =
        route.children?.some(
          (child) => matchesPath(pathname, child.layout + child.path)
        ) ?? false;

      if (matchesPath(pathname, parentPath) || hasActiveChild) {
        setExpandedIndex(index);
      }
    });
  }, [pathname, routes]);

  return (
    <ul className="flex flex-col gap-1">
      {routes.map((route, index) => {
        const fullPath = route.layout + route.path;
        const Icon = route.icon;

        const hasChildren = !!route.children?.length;
        const isExpanded = expandedIndex === index;

        const activeChild = getActiveChild(route);
        const isActive = matchesPath(pathname, fullPath) || !!activeChild;
        const submenuId = `${baseId}-sub-${index}`;

        const content = (
          <>
            {Icon && <Icon className="h-5 w-5 shrink-0" aria-hidden />}
            <span className="min-w-0 flex-1 truncate">{route.name}</span>
          </>
        );

        return (
          <li key={index}>
            {hasChildren ? (
              <button
                type="button"
                data-tour-id={route.path.replace(/^\//, "")}
                aria-expanded={isExpanded}
                aria-controls={submenuId}
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
                className={clsx(navItemBase, isActive ? navItemParentActive : navItemInactive)}
              >
                {content}
                <ChevronDown
                  aria-hidden
                  className={clsx(
                    "h-4 w-4 shrink-0 transition-transform duration-ub-base ease-ub-standard motion-reduce:transition-none",
                    isExpanded && "rotate-180",
                  )}
                />
              </button>
            ) : (
              <Link
                href={fullPath}
                data-tour-id={route.path.replace(/^\//, "")}
                aria-current={isActive ? "page" : undefined}
                onClick={onLinkClick}
                className={clsx(navItemBase, isActive ? navItemActive : navItemInactive)}
              >
                {content}
              </Link>
            )}

            {hasChildren && (
              <ul
                id={submenuId}
                aria-hidden={!isExpanded}
                className="ms-5 flex flex-col gap-1 overflow-hidden border-s border-ub-border ps-3 transition-[max-height,margin] duration-ub-slow ease-ub-standard motion-reduce:transition-none"
                style={{
                  maxHeight: isExpanded ? `${route.children!.length * (CHILD_ROW_HEIGHT + CHILD_GAP) + CHILD_GAP}px` : "0px",
                  marginTop: isExpanded ? CHILD_GAP : 0,
                }}
              >
                {route.children!.map((child, childIndex) => {
                  const childPath = child.layout + child.path;
                  const ChildIcon = child.icon;
                  const isChildActive = child === activeChild;

                  return (
                    <li key={childIndex}>
                      <Link
                        href={childPath}
                        data-tour-id={child.path.replace(/^\//, "")}
                        aria-current={isChildActive ? "page" : undefined}
                        tabIndex={isExpanded ? undefined : -1}
                        onClick={onLinkClick}
                        className={clsx(navItemBase, "gap-2 text-ub-body-sm", isChildActive ? navItemActive : navItemInactive)}
                      >
                        {ChildIcon && <ChildIcon className="h-4 w-4 shrink-0" aria-hidden />}
                        <span className="min-w-0 flex-1 truncate">{child.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}
