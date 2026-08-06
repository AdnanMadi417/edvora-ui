
import React from "react";
import emptyPng from "/public/img/dashboards/empty-data-icon.png";
import Image from "next/image";

interface EmptyDataProps {
  title?: string;
  subtitle?: string;
}

export default function EmptyData({ title = "No data", subtitle = "No additional information available." }: EmptyDataProps) {
  return (
    <section>
      <div className="mt-5 rounded-md border border-slate-200 bg-card p-10 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-muted">
            <Image
              width={60}
              height={60}
              src={emptyPng}
              alt="No data"
              className="h-14 w-14 opacity-80"
            />
          </div>

          <p className="text-p2 font-medium text-slate-900">{title}</p>

          <p className="text-caption font-normal text-slate-600">{subtitle}</p>
        </div>
      </div>
    </section>
  );
}
