"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconType } from "react-icons";
import { useState } from "react";

interface Route {
  name: string;
  layout: string;
  path: string;
  icon: IconType;
}

export default function Links({ routes }: { routes: Route[] }) {
  const pathname = usePathname();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.25rem",
        padding: "0.5rem"
      }}
    >
      {routes.map((route, index) => {
        const fullPath = route.layout + route.path;
        const isActive = pathname === fullPath;
        const isHovered = hoveredIndex === index;
        const Icon = route.icon;

        return (
          <Link
            key={index}
            href={fullPath}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.75rem ",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--font-size-p2)",
              fontWeight: isActive ? "var(--font-weight-medium)" : "var(--font-weight-medium)",
              color: isActive
                ? "var(--primary-text-color)"
                : isHovered
                  ? "var(--primary-text-color)"
                  : "var(--secondary-text-color)",
              backgroundColor: isActive
                ? "var(--table-header-bg)"
                : isHovered
                  ? "var(--card-hover)"
                  : "transparent",
              transition: "var(--transition-fast)",
              cursor: "pointer",
              textDecoration: "none",
            }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <Icon
              style={{
                fontSize: "var(--icon-size)",
                color: isActive
                  ? "var(--primary-text-color)"
                  : isHovered
                    ? "var(--secondary-text-color)"
                    : "var(--muted-text-color)",
                transition: "var(--transition-fast)",
              }}
            />
            <span>{route.name}</span>
          </Link>
        );
      })}
    </div>
  );
}