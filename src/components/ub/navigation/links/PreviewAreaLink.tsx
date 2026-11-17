"use client";
import Link from "next/link";
import type { ReactNode } from "react";
/** An explicit role switch for this application's sign-in-free UI preview. */
export default function PreviewAreaLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        sessionStorage.setItem(
          "unibexs:preview-role",
          href.split("/")[1].replace(/-/g, "_")
        );
      }}
    >
      {children}
    </Link>
  );
}
