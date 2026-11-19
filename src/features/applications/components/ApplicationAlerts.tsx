import Alert, { type AlertTone } from "components/ub/feedback/notifications/Alert";
import type { ApplicationView } from "features/applications/model/applicationView";

export interface ApplicationAlert {
  id: string;
  tone: AlertTone;
  title: string;
  body?: string;
  action?: { label: string; onClick?: () => void; href?: string };
}

/**
 * Pure: alerts the application data itself implies: the correction or
 * rejection reason staff wrote. Documents needing replacement are not an
 * alert; they show once, in the Overview's "Documents needing action" card
 * (with the reason and the replace control) and the Documents tab badge.
 * Stale-fee warnings need Knowledge Hub data the details API doesn't
 * return, so callers pass them in.
 */
export function buildApplicationAlerts(view: Pick<ApplicationView, "documents" | "stage">, correctionReason?: string | null): ApplicationAlert[] {
  const alerts: ApplicationAlert[] = [];
  if (view.stage.resolved?.attention && correctionReason) {
    alerts.push({ id: "action-needed", tone: "warning", title: view.stage.statusName ?? "Action needed", body: correctionReason });
  }
  return alerts;
}

export interface ApplicationAlertsProps {
  alerts: ApplicationAlert[];
  className?: string;
}

/** Stacked inline alerts above the tracker; renders nothing when empty. */
export default function ApplicationAlerts({ alerts, className }: ApplicationAlertsProps) {
  if (alerts.length === 0) return null;
  return (
    <div className={className ? `grid gap-3 ${className}` : "grid gap-3"}>
      {alerts.map((a) => (
        <Alert key={a.id} tone={a.tone} title={a.title} action={a.action}>
          {a.body}
        </Alert>
      ))}
    </div>
  );
}
