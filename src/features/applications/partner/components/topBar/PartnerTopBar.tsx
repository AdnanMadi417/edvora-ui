"use client";

import { useRouter } from "next/navigation";
import {ChevronLeft } from "lucide-react";

interface Props {
  application: { id: string | number };
}

export default function ApplicationAccountManagerTopBar({ application }: Props) {
  const router = useRouter();

  const handleBack = () => router.push("/partner/applications");

  return (
    <section className="w-full">

      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3 sm:h-10 sm:gap-6">
          <div className="flex items-center gap-2 sm:gap-6">
            <button
              onClick={handleBack}
              className="group flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-200 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span className="hidden sm:inline">Back to Applications</span>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3"></div>
        </div>
      </div>

    </section>
  );
}
