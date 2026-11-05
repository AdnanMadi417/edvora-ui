"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Tabs, { tabPanelProps } from "components/ub/navigation/controls/Tabs";
import { techStack } from "lib/content";
import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import { techIcons } from "../icons";

/** WAI-ARIA tabs: arrow keys/Home/End move between categories. */
export default function TechStack() {
  const [active, setActive] = useState(0);
  const baseId = useId();

  const category = techStack.categories[active];

  return (
    <section aria-labelledby="stack-heading" className="py-24 md:py-32">
      <Container>
        <SectionHeading id="stack-heading" eyebrow={techStack.eyebrow} heading={techStack.heading} subheading={techStack.subheading} />
        <div className="mt-12">
          <Tabs
            tabs={techStack.categories.map((category, index) => ({ key: String(index), label: category.name }))}
            active={String(active)}
            onChange={(key) => setActive(Number(key))}
            variant="underline"
            inset={false}
            idPrefix={baseId}
            aria-label="Technology categories"
          />
        </div>
        <div {...tabPanelProps(baseId, String(active))} className="mt-8">
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
