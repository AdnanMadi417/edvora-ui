"use client";

import React from "react";
import { Building2, CheckCircle, XCircle } from "lucide-react";

interface Props {
  value: "approved" | "rejected" | null;
  onChange: (value: "approved" | "rejected") => void;
  disabled?: boolean;
  companyName?: string;
}

export default function ApproveRejectToggle({ value, onChange, disabled, companyName }: Props) {
  return (
    <div className="space-y-3">
      {companyName && (
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <Building2 className="h-4 w-4 shrink-0 text-slate-400" />
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Stakeholder</p>
            <p className="truncate text-sm font-semibold text-slate-800">{companyName}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange("approved")}
          className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 px-4 py-5 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
            value === "approved"
              ? "scale-[1.02] border-emerald-500 bg-emerald-500 text-white"
              : "border-slate-200 bg-white text-slate-400 hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-600"
          }`}
        >
          <CheckCircle className={`h-6 w-6 transition-transform duration-200 ${value === "approved" ? "scale-110" : ""}`} />
          Approve
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange("rejected")}
          className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 px-4 py-5 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
            value === "rejected"
              ? "scale-[1.02] border-red-500 bg-red-500 text-white"
              : "border-slate-200 bg-white text-slate-400 hover:border-red-300 hover:bg-red-50/50 hover:text-red-600"
          }`}
        >
          <XCircle className={`h-6 w-6 transition-transform duration-200 ${value === "rejected" ? "scale-110" : ""}`} />
          Reject
        </button>
      </div>
    </div>
  );
}
