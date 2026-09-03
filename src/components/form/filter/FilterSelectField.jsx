import React from "react";
import { ChevronDown } from "lucide-react";

export default function FilterSelectField({
                                            value,
                                            onChange,
                                            options = [],
                                            icon: Icon = null,
                                            defaultOption = "Select ...",
                                          }) {
  return (
    <div className="relative flex-1 sm:flex-none">
      {Icon && (
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      )}

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        // appearance-none hands text layout entirely to our own CSS instead
        // of the browser's native <select> chrome — without it, Safari
        // ignores the pl-10 padding meant to clear the icon (Chrome/Firefox
        // don't), so the icon overlaps the option text. The native arrow
        // that appearance-none removes is replaced by the ChevronDown below.
        className="appearance-none bg-white hover:bg-slate-50 w-full cursor-pointer rounded-lg border border-slate-200 py-2.5 pl-10 pr-8 text-sm text-slate-700 outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
      >
        <option value="all" className="bg-white text-slate-700">
          {defaultOption}
        </option>

        {(Array.isArray(options) ? options : []).map((opt) =>
          typeof opt === "object" && opt !== null ? (
            <option
              key={opt.value ?? opt.id}
              value={opt.value ?? opt.name}
              className="bg-white text-slate-700"
            >
              {opt.label ?? opt.name ?? opt.value}
            </option>
          ) : (
            <option key={opt} value={opt} className="bg-white text-slate-700">
              {opt}
            </option>
          )
        )}
      </select>

      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}
