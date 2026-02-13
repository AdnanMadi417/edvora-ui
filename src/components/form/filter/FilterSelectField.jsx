import React from "react";

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
        <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      )}

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-white w-full cursor-pointer rounded-full border border-gray-200 py-2.5 pl-10 pr-8 text-sm text-slate-700 outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="all" className="bg-white text-slate-700">
          {defaultOption}
        </option>

        {options.map((opt) =>
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

    </div>
  );
}
