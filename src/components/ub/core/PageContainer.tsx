import React from "react";

export type PageContainerVariant = "table" | "form";

// Brief §2.9 max widths: dashboards 1440, forms 720. Form pages here hold
// two-column field grids, so they keep a wider 1024 cap.
const VARIANT_MAX_WIDTH: Record<PageContainerVariant, string> = {
  table: "max-w-ub-dashboard",
  form: "max-w-5xl",
};

interface PageContainerProps {
  variant?: PageContainerVariant;
  className?: string;
  children: React.ReactNode;
}

export default function PageContainer({ variant = "form", className, children }: PageContainerProps) {
  return (
    <div className={`mx-auto mt-6 w-full ${VARIANT_MAX_WIDTH[variant]} ${className ?? ""}`}>
      {children}
    </div>
  );
}
