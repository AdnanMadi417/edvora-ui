"use client";
import { useState } from "react";
import { useReducedMotion } from "framer-motion";
import { focusRing } from "components/ub/recipes";

/** Tab-styled section links keep every detail visible on the page. */
export default function DetailsSectionNav({
  sections,
  label,
}: {
  sections: { id: string; label: string }[];
  label: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();
  const active = sections.some((section) => section.id === selected)
    ? selected
    : sections[0]?.id;
  return (
    <nav
      aria-label={label}
      className="flex gap-2 overflow-x-auto overscroll-x-contain border-y border-ub-border px-3 pt-2 sm:px-5"
    >
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          aria-current={active === section.id ? "location" : undefined}
          className={`shrink-0 rounded-t-ub-lg border-b-2 px-4 py-3 text-ub-label-md transition-colors motion-reduce:transition-none ${focusRing} ${
            active === section.id
              ? "border-ub-border-focus bg-ub-selected text-ub-text-selected"
              : "border-transparent text-ub-text-secondary hover:bg-ub-action-ghost-hover hover:text-ub-text-primary"
          }`}
          onClick={(event) => {
            if (
              event.metaKey ||
              event.ctrlKey ||
              event.shiftKey ||
              event.altKey
            )
              return;
            const target = document.getElementById(section.id);
            if (!target) return;
            event.preventDefault();
            setSelected(section.id);
            window.history.pushState(
              window.history.state,
              "",
              `#${section.id}`
            );
            target.focus({ preventScroll: true });
            target.scrollIntoView({
              behavior: reducedMotion ? "auto" : "smooth",
              block: "start",
            });
          }}
        >
          {section.label}
        </a>
      ))}
    </nav>
  );
}
