"use client";

import React, { useState } from "react";
import { Wallet, Calendar, Ban } from "lucide-react";
import { DetailStatusBadge } from "components/ui/badges";
import AppDate from "components/ui/date/AppDate";
import { formatCommissionAmount } from "features/applications/shared/commissionTypes";
import { useToast } from "components/context/ToastContext";
import { parseApiError } from "utils/parseApiError";
import Button from "components/ui/buttons/Button";
import DocumentActions from "features/applications/shared/DocumentActions";
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
  studentName?: string | null;
}

export default function PartnerPayoutSection({
  payout,
  canVoid = false,
  onRefetch,
  studentName,
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
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 p-6">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Wallet className="h-4 w-4 text-slate-400" />
            Partner Payout
          </p>
          {payout.paid_amount != null && (
            <p className={`mt-1 text-lg font-bold ${isVoided ? "text-slate-400 line-through" : "text-slate-900"}`}>
              {formatCommissionAmount(payout.paid_amount, payout.currency)}
            </p>
          )}
          <p className="mt-1 text-sm text-slate-500">{payout.bank_reference}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
            <Calendar className="h-3.5 w-3.5" />
            Paid on <AppDate value={payout.paid_at} format="short" />
          </p>
          {isVoided && payout.void_reason && (
            <p className="mt-2 text-xs text-red-600">Void reason: {payout.void_reason}</p>
          )}
          {payout.receipt_file_key && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-slate-500">Receipt</span>
              <DocumentActions fileKey={payout.receipt_file_key} label="Payout Receipt" personName={studentName} />
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          <DetailStatusBadge variant={isVoided ? "danger" : "success"}>
            {isVoided ? "Voided" : "Active"}
          </DetailStatusBadge>
          {canVoid && !isVoided && (
            <Button
              onClick={openVoidModal}
              disabled={loadingFull}
              icon={<Ban className="h-4 w-4" />}
              text={loadingFull ? "Loading..." : "Void & Correct"}
              bgColor="bg-white"
              textColor="text-red-600"
              borderColor="border-red-200"
              hoverTextColor="hover:text-red-700"
              hoverBorderColor="hover:border-red-300"
              className="hover:bg-red-50"
            />
          )}
        </div>
      </div>

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
