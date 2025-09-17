"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Route {
  name: string;
  layout: string;
  path: string;
}

export default function Links({ routes }: { routes: Route[] }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col space-y-2">
      {routes.map((route, index) => {
        const fullPath = route.layout + route.path;
        const isActive = pathname === fullPath;

        return (
          <Link
            key={index}
            href={fullPath}
            className={`block rounded-lg px-4 py-2 text-sm font-medium ${
              isActive
                ? "bg-brand-500 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {route.name}
          </Link>
        );
      })}
    </div>
  );
}
