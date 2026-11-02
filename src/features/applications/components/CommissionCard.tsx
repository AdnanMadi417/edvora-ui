import type { ReactNode } from "react";
import { Wallet } from "lucide-react";
import Amount from "components/ub/core/Amount";
import DaysTag from "components/ub/data/DaysTag";
import KeyValueGrid from "components/ub/data/KeyValueGrid";
import SectionCard, {
  type SectionCardState,
} from "components/ub/data/SectionCard";
import Tag from "components/ub/data/Tag";
import {
  COMMISSION_STATES,
  type CommissionView,
} from "features/applications/model/applicationView";

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

/** Commission card (brief §6): Expected / Invoiced / Paid tag, amount, due date (when known) and "Tracked automatically". */
export default function CommissionCard({
  commission,
  dueInDays,
  actions,
  state = "ready",
  onRetry,
  className,
}: CommissionCardProps) {
  // Actions (e.g. Confirm received) can apply before a commission record exists, so they keep the card "ready".
  const resolved =
    state === "ready" && !commission && !actions ? "empty" : state;
  const s = commission ? COMMISSION_STATES[commission.state] : null;
  return (
    <SectionCard
      title="Commission"
      action={s && <Tag tone={s.tone}>{s.label}</Tag>}
      state={resolved}
      empty={{
        icon: Wallet,
        title: "No commission yet",
        description: "Commission appears here once the student is placed.",
      }}
      errorMessage="Commission couldn't load."
      onRetry={onRetry}
      footer="Tracked automatically"
      className={className}
    >
      <div className="grid gap-4">
        {!commission && (
          <p className="text-ub-body-sm text-ub-text-secondary">
            No commission record yet.
          </p>
        )}
        {commission && (
          <>
            {/* The expected payout window (expectedFrom/To) is deliberately not shown: the
              Institution sets it, so it must not read as a Unibexs commitment. */}
            <KeyValueGrid
              columns={typeof dueInDays === "number" ? 2 : 1}
              items={[
                {
                  label: "Amount",
                  value:
                    commission.amount !== null ? (
                      <Amount
                        value={commission.amount}
                        currency={commission.currency}
                      />
                    ) : null,
                  hint: commission.type ?? undefined,
                },
                ...(typeof dueInDays === "number"
                  ? [
                      {
                        label: "Due",
                        value: <DaysTag mode="deadline" days={dueInDays} />,
                      },
                    ]
                  : []),
              ]}
            />
            {commission.notes && (
              <p className="text-ub-body-sm text-ub-text-secondary">
                {commission.notes}
              </p>
            )}
          </>
        )}
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </SectionCard>
  );
}
