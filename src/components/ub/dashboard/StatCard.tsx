import type { ReactNode } from "react";
import clsx from "clsx";
import { card } from "components/ub/recipes";
import DeltaPill, { type DeltaPillProps } from "./DeltaPill";
import IconTile, { type IconTileTone } from "./IconTile";
import Sparkline from "./Sparkline";
import WidgetStatus from "./WidgetStatus";
import type { IconComponent, WidgetStateProps } from "./types";

export type DashboardStatCardVariant = "default" | "highlighted" | "icon" | "bars";

export interface DashboardStatCardProps extends Omit<WidgetStateProps, "emptyMessage"> {
  label: string;
  /** The figure: Numeral, Amount or text (tabular). */
  value: ReactNode;
  delta?: Pick<DeltaPillProps, "value" | "unit" | "goodWhen" | "comparedTo">;
  /** One line under the value, e.g. "vs 41 last month". */
  caption?: ReactNode;
  /** default · highlighted (brand fill; one per view) · icon (IconTile beside the label) · bars (mini bars under the value). */
  variant?: DashboardStatCardVariant;
  icon?: IconComponent;
  iconTone?: IconTileTone;
  /** Mini bars for variant="bars" (oldest → newest; the last is highlighted). */
  bars?: number[];
  barsLabel?: string;
  /** Header control, e.g. a CardLinkButton. */
  action?: ReactNode;
  className?: string;
}

/**
 * Dashboard KPI card: label, big tabular value, delta pill and caption.
 * (data/StatCard is the glass KPI used on Advisor home; this one is the solid
 * dashboard widget with variants.)
 */
export default function StatCard({ label, value, delta, caption, variant = "default", icon, iconTone = "brand", bars, barsLabel, action, state = "ready", errorMessage, onRetry, className }: DashboardStatCardProps) {
  const hi = variant === "highlighted";
  return (
    <section aria-busy={state === "loading" || undefined} className={clsx(hi ? "rounded-ub-lg border border-transparent bg-ub-action-primary" : card, "flex min-w-0 flex-col gap-3 p-4 md:p-5", className)}>
      {state !== "ready" ? (
        <WidgetStatus state={state === "empty" ? "error" : state} skeleton="stat" errorMessage={errorMessage} onRetry={onRetry} />
      ) : (
        <>
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              {(variant === "icon" || (hi && icon)) && icon && <IconTile icon={icon} tone={hi ? "onBrand" : iconTone} size="md" />}
              <h3 className={clsx("min-w-0 truncate text-ub-label-md", hi ? "text-ub-action-primary-text" : "text-ub-text-secondary")}>{label}</h3>
            </div>
            {action}
          </div>
          <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
            <p className={clsx("ub-tabular text-ub-data-lg", hi ? "text-ub-action-primary-text" : "text-ub-text-primary")}>{value}</p>
            {delta && <DeltaPill {...delta} onBrand={hi} className="mb-1" />}
          </div>
          {variant === "bars" && bars && bars.length > 0 && <Sparkline values={bars} variant="bars" label={barsLabel ?? `${label}, recent trend`} className="h-10 w-full" />}
          {caption && <p className={clsx("text-ub-body-sm", hi ? "text-ub-action-primary-text opacity-90" : "text-ub-text-tertiary")}>{caption}</p>}
        </>
      )}
    </section>
  );
}
