import { ElementType, HTMLAttributes } from "react";
import clsx from "clsx";

export type HeadingSize = "display-lg" | "display-md" | "heading-xl" | "heading-lg" | "heading-md" | "heading-sm";
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

// Full class names so Tailwind's JIT keeps them. Display and heading-xl step down below 640px (brief §2.5).
const SIZE: Record<HeadingSize, string> = {
  "display-lg": "text-ub-display-lg-mobile sm:text-ub-display-lg",
  "display-md": "text-ub-display-md-mobile sm:text-ub-display-md",
  "heading-xl": "text-ub-heading-xl-mobile sm:text-ub-heading-xl",
  "heading-lg": "text-ub-heading-lg",
  "heading-md": "text-ub-heading-md",
  "heading-sm": "text-ub-heading-sm",
};

/** Sensible default size per level, so <Heading level={2}> just works. */
const LEVEL_SIZE: Record<HeadingLevel, HeadingSize> = { 1: "heading-xl", 2: "heading-lg", 3: "heading-md", 4: "heading-sm", 5: "heading-sm", 6: "heading-sm" };

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Document level (h1–h6). Pick it for the outline, not the look. */
  level?: HeadingLevel;
  /** Visual size; defaults from the level. */
  size?: HeadingSize;
  /** Render as another element (e.g. "p" for a visual heading that isn't in the outline). */
  as?: ElementType;
  truncate?: boolean;
}

/** Headings on the type scale. Sentence case, Deep Navy (text-primary). */
export default function Heading({ level = 2, size, as, truncate, className, children, ...rest }: HeadingProps) {
  const Tag = (as ?? `h${level}`) as ElementType;
  return (
    <Tag className={clsx(SIZE[size ?? LEVEL_SIZE[level]], "text-ub-text-primary", truncate && "truncate", className)} {...rest}>
      {children}
    </Tag>
  );
}
