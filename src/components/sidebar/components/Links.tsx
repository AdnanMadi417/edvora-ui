"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { IRoute } from "../../../types/navigation";
import { ChevronDown } from "lucide-react";

export default function Links({ routes }: { routes: IRoute[] }) {
  const pathname = usePathname();

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    routes.forEach((route, index) => {
      const parentPath = route.layout + route.path;
      const hasActiveChild =
        route.children?.some(
          (child) => pathname === child.layout + child.path
        ) ?? false;

      if (pathname === parentPath || hasActiveChild) {
        setExpandedIndex(index);
      }
    });
  }, [pathname, routes]);

  return (
    <div className="flex flex-col">
      {routes.map((route, index) => {
        const fullPath = route.layout + route.path;
        const Icon = route.icon;

        const hasChildren = !!route.children?.length;
        const isExpanded = expandedIndex === index;
        const isHovered = hoveredIndex === index;

        const isActive =
          pathname === fullPath ||
          pathname.startsWith(fullPath + "/") ||
          route.children?.some(
            (child) => pathname === child.layout + child.path
          );

        return (
          <div key={index} className="relative">

            <div
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`ml-3 flex cursor-pointer items-center justify-between rounded-md px-3 py-3 text-sm font-medium transition-colors duration-200 ease-in-out
              ${isActive || isHovered ? "text-slate-900" : "text-slate-500"}`}
            >
              <div className="flex items-center gap-3">
                {Icon && (
                  <Icon
                    className={`text-lg transition-colors ${
                      isActive || isHovered ? "text-slate-900" : "text-slate-600"
                    }`}
                  />
                )}
                <span>
                  <Link href={fullPath}>{route.name}</Link>
                </span>
              </div>

              {hasChildren && (
                <button
                  type="button"
                  onClick={() => setExpandedIndex(isExpanded ? null : index)}
                  className="ml-2 flex items-center"
                >
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isExpanded ? "rotate-180" : "rotate-0"
                    } ${isActive || isHovered ? "text-slate-900" : "text-slate-500"}`}
                  />
                </button>
              )}
            </div>

            {hasChildren && (
              <div
                className={`relative ml-6 flex flex-col gap-1 overflow-hidden transition-[max-height] duration-300 ease-in-out`}
                style={{ maxHeight: isExpanded ? `${route.children!.length * 40}px` : "0px" }}
              >

                <div className="absolute left-2 top-0 bottom-0 flex flex-col items-center justify-start">
                  {route.children!.map((child, childIndex) => {
                    const isLastChild = childIndex === route.children!.length - 1;
                    return (
                      <span
                        key={childIndex}
                        className={`block w-[2px] bg-slate-300 transition-colors group-hover:bg-slate-400
                        ${isLastChild ? "h-1/2 flex-1" : "h-full flex-1"}`}
                      />
                    );
                  })}
                </div>

                <div className="flex flex-col gap-1 pl-5 group">
                  {route.children!.map((child, childIndex) => {
                    const childPath = child.layout + child.path;
                    const ChildIcon = child.icon;
                    const isChildActive = pathname === childPath;

                    return (
                      <Link
                        key={childIndex}
                        href={childPath}
                        className={`relative flex items-center gap-2 rounded-s p-2 text-sm transition-all
                        ${
                          isChildActive
                            ? "text-slate-900 font-medium border-slate-500 bg-slate-50"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-l-2 border-transparent"
                        }`}
                      >
                        {ChildIcon && <ChildIcon className="h-3 w-3 text-current" />}
                        <span>{child.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Parent active indicator */}
            {isActive && (
              <div className="absolute right-0 top-1 h-[calc(100%-8px)] max-h-[36px] w-1 rounded-md bg-blue-700" />
            )}
          </div>
        );
      })}
    </div>
  );
}
