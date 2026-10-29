// Groups up to three buttons (brief §4.1: never more than three in a row,
// the Primary comes last in reading order). Callers pass children in reading
// order with the Primary last; the group only lays them out.
import React from "react";

export type ButtonGroupAlign = "start" | "end" | "between";

export type ButtonGroupProps = {
  children: React.ReactNode;
  /** start · end (default, dialog footers) · between (first button at start, the rest at end). */
  align?: ButtonGroupAlign;
  /** Below 640px stack the buttons full-width, Primary on top for the thumb. */
  stackOnMobile?: boolean;
  /** Accessible name when the group is a standalone set of actions. */
  label?: string;
  className?: string;
};

const justify: Record<ButtonGroupAlign, string> = {
  start: "sm:justify-start",
  end: "sm:justify-end",
  between: "sm:justify-between",
};

export function ButtonGroup({ children, align = "end", stackOnMobile = false, label, className = "" }: ButtonGroupProps) {
  const items = React.Children.toArray(children).filter(Boolean);
  if (process.env.NODE_ENV !== "production" && items.length > 3) {
    console.warn("ButtonGroup: never put more than three buttons in a row (brief §4.1).");
  }

  // "between": the first button sits alone at start, the rest group at end.
  const content =
    align === "between" && items.length > 1 ? (
      <>
        {items[0]}
        <div className={`flex gap-3 ${stackOnMobile ? "flex-col-reverse sm:flex-row [&>*]:w-full sm:[&>*]:w-auto" : ""}`}>
          {items.slice(1)}
        </div>
      </>
    ) : (
      items
    );

  return (
    <div
      role={label ? "group" : undefined}
      aria-label={label}
      className={
        `flex gap-3 ${justify[align]} ` +
        // Reverse the visual stack on mobile so the Primary (last in DOM) shows first, DOM order unchanged.
        (stackOnMobile ? "flex-col-reverse [&>*]:w-full sm:flex-row sm:items-center sm:[&>*]:w-auto" : `flex-wrap items-center ${align === "end" ? "justify-end" : align === "between" ? "justify-between" : "justify-start"}`) +
        ` ${className}`
      }
    >
      {content}
    </div>
  );
}

export default ButtonGroup;
