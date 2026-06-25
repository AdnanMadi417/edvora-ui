"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  application: any;
}

export default function ApplicationAccountManagerTopBar({ application }: Props) {
  const router = useRouter();

  const studentName = application?.student?.name ?? "Application";

  return (
    <div className="flex items-center justify-between gap-4 px-6 py-3.5">
      <div className="flex items-center gap-1.5 text-sm">
        <button
          onClick={() => router.push("/partner/applications")}
          className="flex items-center gap-1 text-slate-500 transition-colors hover:text-slate-800"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Applications</span>
        </button>
        <ChevronRight className="hidden h-3.5 w-3.5 text-slate-300 sm:block" />
        <span className="hidden max-w-[200px] truncate font-medium text-slate-800 sm:block">
          {studentName}
        </span>
      </div>
    </div>
  );
}
