import { ReactNode } from "react";
import clsx from "clsx";
import Reveal from "./Reveal";

interface SectionHeadingProps {
  id?: string;
  eyebrow?: string;
  heading: string;
  subheading?: string;
  action?: ReactNode;
  className?: string;
}

export default function SectionHeading({ id, eyebrow, heading, subheading, action, className }: SectionHeadingProps) {
  return (
    <div className={clsx("flex flex-col gap-6 md:flex-row md:items-end md:justify-between", className)}>
      <Reveal className="max-w-ub-reading">
        {eyebrow && <p className="mb-3 text-ub-label-md text-ub-text-link">{eyebrow}</p>}
        <h2 id={id} className="text-ub-heading-xl-mobile text-ub-text-primary sm:text-ub-display-md">
          {heading}
        </h2>
        {subheading && <p className="mt-4 text-ub-body-lg text-ub-text-secondary">{subheading}</p>}
      </Reveal>
      {action && <Reveal delay={0.1}>{action}</Reveal>}
    </div>
  );
}
