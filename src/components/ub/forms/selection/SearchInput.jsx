import React from "react";
import { Search } from "lucide-react";
import { searchField } from "components/ub/recipes";

/** Pill search field (brief §5). */
export default function SearchInput({ value, onChange, placeholder = "Search", className = "" }) {
  return (
    <div className={`relative min-w-[200px] flex-1 ${className}`}>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ub-text-tertiary"
      />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={placeholder}
        className={searchField}
      />
    </div>
  );
}
