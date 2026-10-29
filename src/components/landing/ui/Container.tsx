import { ReactNode } from "react";
import clsx from "clsx";

/** Marketing container: 1200px max (1320 at 2xl), 16px gutters on mobile. */
export default function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx("mx-auto w-full max-w-ub-marketing px-4 md:px-8 2xl:max-w-ub-marketing-2xl", className)}>{children}</div>;
}
