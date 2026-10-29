import { ReactNode } from "react";
import clsx from "clsx";

type Tone = "blue" | "teal" | "sky" | "plum" | "amber" | "grey";

// Dark-section tag hues (brief §2.1). Tags are 6px, never pills.
const tones: Record<Tone, string> = {
  blue: "bg-ub-tag-indigo-bg-dark text-ub-tag-indigo-text-dark",
  teal: "bg-ub-tag-teal-bg-dark text-ub-tag-teal-text-dark",
  sky: "bg-ub-tag-sky-bg-dark text-ub-tag-sky-text-dark",
  plum: "bg-ub-tag-plum-bg-dark text-ub-tag-plum-text-dark",
  amber: "bg-ub-tag-amber-bg-dark text-ub-tag-amber-text-dark",
  grey: "bg-ub-tag-grey-bg-dark text-ub-tag-grey-text-dark",
};

export default function Badge({ children, tone = "grey", dot = false, className }: { children: ReactNode; tone?: Tone; dot?: boolean; className?: string }) {
  return (
    <span className={clsx("inline-flex h-6 items-center gap-1.5 rounded-ub-sm px-2 text-ub-label-sm", tones[tone], className)}>
      {dot && <span aria-hidden className="h-1.5 w-1.5 rounded-ub-full bg-current" />}
      {children}
    </span>
  );
}
