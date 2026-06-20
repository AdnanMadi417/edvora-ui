"use client";

import { useState, useEffect } from "react";
import { FlaskConical, X } from "lucide-react";

const STORAGE_KEY = "beta_banner_dismissed";

export default function BetaBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="max-w-5xl mx-auto mb-4 mt-3 overflow-hidden rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 shadow-sm">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100">
          <FlaskConical className="h-4 w-4 text-amber-600" />
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <span className="shrink-0 rounded-full bg-amber-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white">
            Beta
          </span>
          <p className="truncate text-xs font-medium text-amber-800">
            Things are still being polished — you might spot a few bugs or hiccups.{" "}
            <span className="font-semibold">Thanks for testing with us!</span>
          </p>
        </div>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="shrink-0 rounded-lg p-1 text-amber-400 transition hover:bg-amber-100 hover:text-amber-600"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
