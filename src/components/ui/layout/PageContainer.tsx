import React from "react";

export type PageContainerVariant = "table" | "form";

const VARIANT_MAX_WIDTH: Record<PageContainerVariant, string> = {
  table: "max-w-7xl",
  form: "max-w-5xl",
};

interface PageContainerProps {
  variant?: PageContainerVariant;
  className?: string;
  children: React.ReactNode;
}

export default function PageContainer({ variant = "form", className, children }: PageContainerProps) {
  return (
    <div className={`mt-6 mx-auto ${VARIANT_MAX_WIDTH[variant]} ${className ?? ""}`}>
      {children}
    </div>
  );
}
