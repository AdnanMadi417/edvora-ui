import type { ReactNode } from "react";
import { Wallet } from "lucide-react";
import Amount from "components/ub/core/Amount";
import DaysTag from "components/ub/data/DaysTag";
import KeyValueGrid from "components/ub/data/KeyValueGrid";
import SectionCard, { type SectionCardState } from "components/ub/data/SectionCard";
import Tag from "components/ub/data/Tag";
import { COMMISSION_STATES, type CommissionView } from "features/applications/model/applicationView";
import { formatCommissionTimeline } from "features/applications/shared/commissionTypes";

export interface CommissionCardProps {
  commission: CommissionView | null;
  /** Days until payment is due. Hidden when the API doesn't provide a due date. */
  dueInDays?: number | null;
  /** Role actions, e.g. "Confirm received" / "Dispute commission". */
  actions?: ReactNode;
  state?: SectionCardState;
  onRetry?: () => void;
  className?: string;
}

/** Commission card (brief §6): Expected / Invoiced / Paid tag, amount, due date and "Tracked automatically". */
export default function CommissionCard({ commission, dueInDays, actions, state = "ready", onRetry, className }: CommissionCardProps) {
  const resolved = state === "ready" && !commission ? "empty" : state;
  const s = commission ? COMMISSION_STATES[commission.state] : null;
  const window = commission ? formatCommissionTimeline(commission.expectedFrom, commission.expectedTo) : null;
  return (
    <SectionCard
      title="Commission"
      action={s && <Tag tone={s.tone}>{s.label}</Tag>}
      state={resolved}
      empty={{ icon: Wallet, title: "No commission yet", description: "Commission appears here once the student is placed." }}
      errorMessage="Commission couldn't load."
      onRetry={onRetry}
      footer="Tracked automatically"
      className={className}
    >
      {commission && (
        <div className="grid gap-4">
          <KeyValueGrid
            columns={2}
            items={[
              { label: "Amount", value: commission.amount !== null ? <Amount value={commission.amount} currency={commission.currency} /> : null, hint: commission.type ?? undefined },
              { label: "Due", value: typeof dueInDays === "number" ? <DaysTag mode="deadline" days={dueInDays} /> : window, hint: typeof dueInDays === "number" ? window ?? undefined : undefined },
            ]}
          />
          {commission.notes && <p className="text-ub-body-sm text-ub-text-secondary">{commission.notes}</p>}
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      )}
    </SectionCard>
  );
}
