"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import clsx from "clsx";
import { focusRing } from "components/ub/recipes";

export interface RefIdProps {
  /** Reference ID, student ID or passport number, e.g. "UBX-2026-0412". */
  value: string;
  /** Adds a copy button (with an accessible label). */
  copyable?: boolean;
  className?: string;
}

/** IDs with the "ss02" stylistic set so I/l/1 and O/0 read apart (brief §1.2). Never monospace. */
export default function RefId({ value, copyable, className }: RefIdProps) {
  const [copied, setCopied] = useState(false);
  const id = <span className="ub-ref whitespace-nowrap">{value}</span>;
  if (!copyable) return <span className={className}>{id}</span>;
  return (
    <span className={clsx("inline-flex items-center gap-1", className)}>
      {id}
      <button
        type="button"
        aria-label={copied ? `Copied ${value}` : `Copy ${value}`}
        onClick={() => {
          navigator.clipboard?.writeText(value).catch(() => undefined);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        }}
        className={clsx("inline-grid h-6 w-6 place-items-center rounded-ub-full text-ub-icon transition-colors duration-ub-fast hover:bg-ub-action-secondary-hover hover:text-ub-icon-interactive", focusRing)}
      >
        {copied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? "Copied" : ""}
      </span>
    </span>
  );
}
