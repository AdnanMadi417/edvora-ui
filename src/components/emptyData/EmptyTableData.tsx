import React from "react";
import emptyPng from "/public/img/dashboards/empty-data-icon.png";
import Image from "next/image";

export default function EmptyData() {
  return (
    <section>
      <div className="m-0 text-center">
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

          <p className="text-p2 font-medium text-slate-900">No data found</p>

          <p className="text-caption font-normal text-slate-600">
            There is no data available at the moment
          </p>
        </div>
      </div>
    </section>
  );
}
