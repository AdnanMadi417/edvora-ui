import { ElementType, HTMLAttributes } from "react";
import clsx from "clsx";

export type TextSize = "body-lg" | "body-md" | "body-sm" | "label-lg" | "label-md" | "label-sm" | "caption";
export type TextTone = "primary" | "secondary" | "tertiary" | "disabled" | "link" | "success" | "warning" | "danger" | "on-action";

const SIZE: Record<TextSize, string> = {
  "body-lg": "text-ub-body-lg",
  "body-md": "text-ub-body-md",
  "body-sm": "text-ub-body-sm",
  "label-lg": "text-ub-label-lg",
  "label-md": "text-ub-label-md",
  "label-sm": "text-ub-label-sm",
  caption: "text-ub-caption",
};

const TONE: Record<TextTone, string> = {
  primary: "text-ub-text-primary",
  secondary: "text-ub-text-secondary",
  tertiary: "text-ub-text-tertiary",
  disabled: "text-ub-text-disabled",
  link: "text-ub-text-link",
  success: "text-ub-tone-success-text",
  warning: "text-ub-tone-warning-text",
  danger: "text-ub-tone-danger-text",
  "on-action": "text-ub-text-on-action",
};

const CLAMP: Record<2 | 3 | 4, string> = { 2: "line-clamp-2", 3: "line-clamp-3", 4: "line-clamp-4" };

export interface TextProps extends HTMLAttributes<HTMLElement> {
  size?: TextSize;
  tone?: TextTone;
  /** Emphasis by weight only (brief §2.5: never color or italics). */
  weight?: "regular" | "medium" | "semibold";
  /** Tabular numerals for amounts, dates and KPIs. */
  tabular?: boolean;
  as?: ElementType;
  truncate?: boolean;
  /** Clamp to 2–4 lines. */
  lineClamp?: 2 | 3 | 4;
}

/** Body, label and caption text on the type scale. Defaults to body-md, secondary. */
export default function Text({ size = "body-md", tone = "secondary", weight, tabular, as = "p", truncate, lineClamp, className, children, ...rest }: TextProps) {
  const Tag = as;
  return (
    <Tag
      className={clsx(
        SIZE[size],
        TONE[tone],
        weight === "medium" && "font-medium",
        weight === "semibold" && "font-semibold",
        tabular && "ub-tabular",
        truncate && "truncate",
        lineClamp && CLAMP[lineClamp],
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
