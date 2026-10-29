import { ReactNode } from "react";
import clsx from "clsx";

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Inner padding/layout classes. */
  innerClassName?: string;
  /** Marketing cards only (brief §3.5): 45° cut at the bottom-end corner. */
  notch?: boolean;
  interactive?: boolean;
  highlighted?: boolean;
}

/**
 * Card for dark marketing sections. The notch uses clip-path, which removes
 * borders, so the border is an outer layer showing 1px around an inner,
 * slightly smaller-notched surface.
 */
export default function Card({ children, className, innerClassName, notch = false, interactive = false, highlighted = false }: CardProps) {
  return (
    <div
      className={clsx(
        "group relative h-full rounded-ub-2xl p-px",
        notch && "ub-notch-md",
        highlighted ? "bg-ub-blue-500" : "bg-ub-navy-border",
        interactive &&
          "transition-[background-color,transform] duration-ub-base ease-ub-standard hover:-translate-y-1 hover:bg-ub-border-hover motion-reduce:transform-none",
        className,
      )}
    >
      <div
        className={clsx("relative h-full rounded-ub-2xl bg-ub-surface", notch && "ub-notch-md [--ub-notch:calc(var(--ub-notch-md)_-_0.59px)]", innerClassName)}
      >
        {children}
      </div>
    </div>
  );
}
