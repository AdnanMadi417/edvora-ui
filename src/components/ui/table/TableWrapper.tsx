import React from "react";

interface TableWrapperProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function TableWrapper({ children, footer }: TableWrapperProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <div className="overflow-x-auto">{children}</div>
      {footer}
    </div>
  );
}
