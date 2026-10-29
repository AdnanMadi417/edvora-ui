import { ReactNode } from "react";
import clsx from "clsx";
import styles from "./Marquee.module.css";

/**
 * Infinite horizontal scroller. Pauses on hover/focus and becomes a static,
 * wrapped row under prefers-reduced-motion. The second copy is aria-hidden.
 */
export default function Marquee({ children, durationSeconds = 40, className }: { children: ReactNode; durationSeconds?: number; className?: string }) {
  return (
    <div
      className={clsx(styles.viewport, "overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]", className)}
      style={{ ["--marquee-duration" as string]: `${durationSeconds}s` }}
    >
      <div className={styles.track}>
        <div className="flex shrink-0 items-center">{children}</div>
        <div className={clsx(styles.duplicate, "flex shrink-0 items-center")} aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
