"use client";

import { KeyboardEvent, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { techStack } from "lib/content";
import Container from "./ui/Container";
import SectionHeading from "./ui/SectionHeading";
import { techIcons } from "./icons";

/** WAI-ARIA tabs: arrow keys/Home/End move between categories. */
export default function TechStack() {
  const [active, setActive] = useState(0);
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();
  const count = techStack.categories.length;

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const rtl = document.dir === "rtl";
    const next = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 }[e.key as "ArrowRight" | "ArrowLeft"];
    let index: number | null = null;
    if (next) index = (active + next + count) % count;
    if (e.key === "Home") index = 0;
    if (e.key === "End") index = count - 1;
    if (index === null) return;
    e.preventDefault();
    setActive(index);
    tabsRef.current[index]?.focus();
  };

  const category = techStack.categories[active];

  return (
    <section aria-labelledby="stack-heading" className="py-24 md:py-32">
      <Container>
        <SectionHeading id="stack-heading" eyebrow={techStack.eyebrow} heading={techStack.heading} subheading={techStack.subheading} />
        <div role="tablist" aria-label="Technology categories" onKeyDown={onKeyDown} className="mt-12 flex gap-1 overflow-x-auto border-b border-ub-border">
          {techStack.categories.map((c, i) => (
            <button
              key={c.name}
              ref={(el) => {
                tabsRef.current[i] = el;
              }}
              id={`${baseId}-tab-${i}`}
              role="tab"
              type="button"
              aria-selected={i === active}
              aria-controls={`${baseId}-panel`}
              tabIndex={i === active ? 0 : -1}
              onClick={() => setActive(i)}
              className={clsx(
                "-mb-px h-11 shrink-0 border-b-2 px-4 text-ub-label-md transition-colors duration-ub-base focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ub-border-focus",
                i === active ? "border-ub-blue-300 text-ub-text-primary" : "border-transparent text-ub-text-secondary hover:text-ub-text-primary",
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
        <div id={`${baseId}-panel`} role="tabpanel" aria-labelledby={`${baseId}-tab-${active}`} className="mt-8">
          <AnimatePresence mode="wait">
            <motion.ul
              key={category.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
              className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
            >
              {category.items.map(([key, label]) => {
                const Icon = techIcons[key];
                return (
                  <li key={key} className="flex flex-col items-center gap-3 rounded-ub-lg border border-ub-border bg-ub-surface px-4 py-6 text-center transition-colors duration-ub-fast hover:border-ub-border-hover">
                    <Icon className="h-8 w-8 text-ub-text-primary" aria-hidden />
                    <span className="text-ub-label-md text-ub-text-secondary">{label}</span>
                  </li>
                );
              })}
            </motion.ul>
          </AnimatePresence>
        </div>
      </Container>
    </section>
  );
}
