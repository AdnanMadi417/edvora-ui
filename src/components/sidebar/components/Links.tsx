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
        gap: "0",
        padding: "0",
      }}
    >
      {routes.map((route, index) => {
        const fullPath = route.layout + route.path;
        const isActive = pathname === fullPath || pathname.startsWith(fullPath + "/");
        const isHovered = hoveredIndex === index;
        const Icon = route.icon;

        return (
          <div
            key={index}
            style={{ position: "relative" }}
          >
            <Link
              href={fullPath}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem",
                marginLeft:"0.75rem",
                borderRadius: "var(--radius-md)",
                fontSize: "var(--font-size-p1)",
                fontWeight: "var(--font-weight-medium)",
                color: isActive
                  ? "var(--primary-text-color)"
                  : isHovered
                    ? "var(--primary-text-color)"
                    : "var(--muted-text-color)",
                transition: "var(--transition-medium)",
                cursor: "pointer",
                textDecoration: "none",
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <Icon
                style={{
                  fontSize: "var(--icon-size-b)",
                  color: isActive
                    ? "var(--accent-color)"
                    : isHovered
                      ? "var(--primary-text-color)"
                      : "var(--muted-text-color)",
                  transition: "var(--transition-medium)",
                }}
              />

              <span>{route.name}</span>
            </Link>

            {isActive && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "4px",
                  height: "calc(100% - 8px)",
                  width: "4px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--accent-color)",
                }}
              />
            )}
          </div>
        );
      })}
    </div>

  );
}