import Alert, { type AlertTone } from "components/ub/feedback/Alert";
import type { ApplicationView } from "features/applications/model/applicationView";

export interface ApplicationAlert {
  id: string;
  tone: AlertTone;
  title: string;
  body?: string;
  action?: { label: string; onClick?: () => void; href?: string };
}

/**
 * Pure: alerts the application data itself implies — a correction/rejection
 * reason, else documents needing replacement (never both: same message). Stale-fee warnings need
 * Knowledge Hub data the details API doesn't return, so callers pass them in.
 */
export function buildApplicationAlerts(view: Pick<ApplicationView, "documents" | "stage">, correctionReason?: string | null): ApplicationAlert[] {
  const alerts: ApplicationAlert[] = [];
  const replace = view.documents.filter((d) => d.state === "needs-replacing");
  if (view.stage.resolved?.attention && correctionReason) {
    alerts.push({ id: "action-needed", tone: "warning", title: view.stage.statusName ?? "Action needed", body: correctionReason });
  }
  // The correction alert already names what to fix; the rows show which files.
  if (replace.length > 0 && alerts.length === 0) {
    alerts.push({
      id: "replace-documents",
      tone: "danger",
      title: replace.length === 1 ? `Replace the ${replace[0].name.toLowerCase()}` : `Replace ${replace.length} documents`,
      body: replace.length === 1 ? replace[0].reason ?? undefined : replace.map((d) => d.name).join(", "),
    });
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
