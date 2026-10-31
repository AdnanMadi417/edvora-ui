import { ElementType, ReactNode } from "react";
import clsx from "clsx";

export interface ProseProps {
  children: ReactNode;
  /** body-lg for Knowledge Hub articles and onboarding; body-md elsewhere. */
  size?: "md" | "lg";
  as?: ElementType;
  className?: string;
}

/**
 * Reading container (brief §2.5): max 680px, left-aligned (start), never
 * justified, with spacing and colors for headings, lists, links and code.
 */
export default function Prose({ children, size = "md", as: Tag = "div", className }: ProseProps) {
  return (
    <Tag
      className={clsx(
        "max-w-ub-reading text-start text-ub-text-secondary",
        size === "lg" ? "text-ub-body-lg" : "text-ub-body-md",
        "[&_h2]:mb-2 [&_h2]:mt-8 [&_h2]:text-ub-heading-lg [&_h2]:text-ub-text-primary",
        "[&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-ub-heading-md [&_h3]:text-ub-text-primary",
        "[&_p]:mb-4 [&_strong]:font-semibold [&_strong]:text-ub-text-primary",
        "[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:ps-5 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:ps-5 [&_li]:mb-1",
        "[&_a]:font-medium [&_a]:text-ub-text-link [&_a]:underline [&_a]:underline-offset-2",
        "[&_code]:rounded-ub-xs [&_code]:bg-ub-surface-subtle [&_code]:px-1 [&_code]:text-ub-text-primary",
        "[&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
