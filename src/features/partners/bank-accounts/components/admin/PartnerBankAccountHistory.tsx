"use client";

import React, { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { History as HistoryIcon } from "lucide-react";
import ModalHeader from "components/ui/modal/ModalHeader";
import { DetailStatusBadge } from "components/ui/badges";
import { Skeleton } from "components/ui/skeleton";
import { AsyncStateView, getAsyncStatus } from "components/ui/async";
import { AppDate } from "components/ui/date";
import { useBanks } from "features/banks/hooks";
import { usePartnerBankAccountHistory } from "../../hooks";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  partnerId: string;
}

function HistorySkeleton() {
  return (
    <div className="space-y-3 px-6 py-5">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-slate-200 p-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-2 h-3 w-56" />
        </div>
      ))}
    </div>
  );
}

export default function PartnerBankAccountHistory({ isOpen, onClose, partnerId }: Props) {
  const { history, loading, error, fetchHistory } = usePartnerBankAccountHistory();
  const { banks: allBanks } = useBanks({ include_inactive: true });

  useEffect(() => {
    if (isOpen) fetchHistory(partnerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, partnerId]);

  const bankLookup = useMemo(() => new Map(allBanks.map((b) => [b.id, b])), [allBanks]);

  const status = getAsyncStatus(loading, error, history, (h) => h.length === 0);

  // Newest first — the API doesn't guarantee an order.
  const sorted = useMemo(
    () => [...history].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [history]
  );

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-overlay p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
        <div className="overflow-hidden rounded-2xl bg-card shadow-2xl ring-1 ring-black/5">
          <ModalHeader
            title="Bank Account History"
            description="Every version ever recorded for this partner — editing always creates a new row and retires the old one."
            icon={HistoryIcon}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            iconBorder="border-blue-200"
            onClose={onClose}
          />

          <div className="max-h-[65vh] overflow-y-auto">
            <AsyncStateView
              status={status}
              skeleton={<HistorySkeleton />}
              errorMessage={error ?? undefined}
              onRetry={() => fetchHistory(partnerId)}
              emptyTitle="No history yet"
              emptySubtitle="This partner has never had a bank account recorded."
              emptyIcon={HistoryIcon}
            >
              <div className="space-y-3 px-6 py-5">
                {sorted.map((entry) => {
                  const bankName = entry.bank_id
                    ? bankLookup.get(entry.bank_id)?.name ?? "Curated bank"
                    : entry.intl_bank_name;
                  return (
                    <div key={entry.id} className="rounded-lg border border-slate-200 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">{bankName || "—"}</p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {entry.account_holder_name} · {entry.account_number} · {entry.currency}
                          </p>
                        </div>
                        <DetailStatusBadge variant={entry.is_active ? "success" : "neutral"}>
                          {entry.is_active ? "Active" : "Replaced"}
                        </DetailStatusBadge>
                      </div>
                      <p className="mt-2 text-xs text-slate-400">
                        Recorded by {entry.recorded_by_name} ({entry.recorded_by_email}) ·{" "}
                        <AppDate value={entry.created_at} format="datetime" />
                      </p>
                    </div>
                  );
                })}
              </div>
            </AsyncStateView>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
