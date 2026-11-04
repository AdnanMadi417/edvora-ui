"use client";

import React, { useState } from "react";
import { Ban } from "lucide-react";
import Amount from "components/ub/core/typography/Amount";
import RefId from "components/ub/core/typography/RefId";
import AppDate from "components/ub/data/formatting/AppDate";
import DescriptionList from "components/ub/data/display/DescriptionList";
import KeyValueGrid from "components/ub/data/display/KeyValueGrid";
import SectionCard from "components/ub/data/cards/SectionCard";
import StatusTag from "components/ub/dashboard/shared/StatusTag";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { parseApiError } from "utils/parseApiError";
import Button from "components/ub/core/buttons/Button";
import { payoutsApi } from "../services";
import type { PartnerPayout, Payout } from "../types";

// VoidPayout is admin-only tooling — import it lazily so the partner and
// account-manager bundles, which render this section with canVoid=false,
// never pull in the void modal's code.
const VoidPayout = React.lazy(() => import("./admin/VoidPayout"));

interface PartnerPayoutSectionProps {
  payout: PartnerPayout | null;
  canVoid?: boolean;
  onRefetch?: () => void;
  /** Kept for callers; the receipt is listed under Commission documents. */
  studentName?: string | null;
}

export default function PartnerPayoutSection({
  payout,
  canVoid = false,
  onRefetch,
}: PartnerPayoutSectionProps) {
  const { showToast } = useToast();
  const [fullPayout, setFullPayout] = useState<Payout | null>(null);
  const [loadingFull, setLoadingFull] = useState(false);
  const [showVoidModal, setShowVoidModal] = useState(false);

  if (!payout) return null;

  const isVoided = !!payout.voided_at;

  const openVoidModal = async () => {
    setLoadingFull(true);
    try {
      const res = await payoutsApi.get(payout.id);
      setFullPayout(res.data);
      setShowVoidModal(true);
    } catch (err: unknown) {
      showToast(parseApiError(err, "Failed to load payout details."), "error");
    } finally {
      setLoadingFull(false);
    }
  };

  return (
    <>
      <SectionCard
        title="Advisor payout"
        action={<StatusTag status={isVoided ? "Voided" : "Paid"} tone={isVoided ? "danger" : "success"} size="md" />}
        footer={
          canVoid && !isVoided ? (
            <Button variant="secondary" size="sm" onClick={openVoidModal} loading={loadingFull} icon={<Ban className="h-4 w-4" aria-hidden="true" />} text="Void and correct" />
          ) : undefined
        }
      >
        <div className="grid gap-4">
          <KeyValueGrid
            columns={2}
            items={[
              { label: "Amount paid", value: payout.paid_amount != null ? <span className={isVoided ? "text-ub-text-tertiary line-through" : undefined}><Amount value={payout.paid_amount} currency={payout.currency} /></span> : null },
              { label: "Paid on", value: <AppDate value={payout.paid_at} /> },
            ]}
          />
          <DescriptionList
            layout="inline"
            divided
            fallback="Not available"
            items={[
              { label: "Bank reference", value: payout.bank_reference && <RefId value={payout.bank_reference} copyable /> },
              ...(isVoided ? [{ label: "Void reason", value: payout.void_reason }] : []),
            ]}
          />
        </div>
      </SectionCard>

      {canVoid && fullPayout && (
        <React.Suspense fallback={null}>
          <VoidPayout
            isOpen={showVoidModal}
            onClose={() => setShowVoidModal(false)}
            payout={fullPayout}
            onSuccess={onRefetch}
          />
        </React.Suspense>
      )}
    </>
  );
}
