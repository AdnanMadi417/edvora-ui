"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Ban, Wallet } from "lucide-react";

import { Skeleton } from "components/ui/skeleton";
import { AsyncStateView, getAsyncStatus } from "components/ui/async";
import { StatusBadge } from "components/ui/badges";
import Button from "components/ui/buttons/Button";
import ActionsDropdown from "components/ui/buttons/ActionsDropdown";
import DocumentActions from "features/applications/shared/DocumentActions";
import { formatCommissionAmount } from "features/applications/shared/commissionTypes";
import AppDate from "components/ui/date/AppDate";

import { usePayout, usePaymentMethods } from "../../hooks";

const VoidPayout = React.lazy(() => import("./VoidPayout"));

interface Props {
  partnerId: string;
  payoutId: string;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-1 flex items-center gap-2 text-sm text-slate-900">{value}</div>
    </div>
  );
}

function PayoutDetailSkeleton() {
  return (
    <>
      <div className="flex items-center gap-4 border-b p-6">
        <Skeleton className="h-12 w-12 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="mt-2 h-4 w-32" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="grid grid-cols-1 gap-4 border-t border-slate-200 px-6 py-6 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-2 h-4 w-36" />
          </div>
        ))}
      </div>
    </>
  );
}

export default function PayoutDetailPage({ partnerId, payoutId }: Props) {
  const router = useRouter();
  const { payout, loading, error, refetch } = usePayout(payoutId);
  const { paymentMethods } = usePaymentMethods();
  const [showVoidModal, setShowVoidModal] = useState(false);

  const status = getAsyncStatus(loading, error, payout, (p) => p === null);

  const handleBack = () => router.push(`/admin/partners/${partnerId}`);

  const paymentMethodName =
    paymentMethods.find((m) => m.id === payout?.payment_method_id)?.name ?? "—";

  const amountSent = payout?.items.reduce((sum, item) => sum + item.paid_amount, 0) ?? 0;

  const agreedTotals = (payout?.items ?? []).reduce<Record<string, number>>((acc, item) => {
    acc[item.source_currency] = (acc[item.source_currency] ?? 0) + item.source_amount;
    return acc;
  }, {});

  const isVoided = !!payout?.voided_at;

  return (
    <div className="mx-auto mt-6 max-w-5xl">
      <div className="rounded-md border bg-card shadow-sm">
        <AsyncStateView
          status={status}
          skeleton={<PayoutDetailSkeleton />}
          errorMessage={error ?? undefined}
          onRetry={refetch}
          emptyTitle="Payout not found"
          emptySubtitle="It may have been removed, or the link is out of date."
          emptyIcon={Wallet}
          emptyAction={
            <Button
              onClick={handleBack}
              icon={<ChevronLeft className="h-4 w-4" />}
              text="Back"
              bgColor="bg-white"
              textColor="text-slate-600"
              borderColor="border-slate-300"
              hoverTextColor="hover:text-slate-800"
              hoverBorderColor="hover:border-slate-400"
            />
          }
        >
          <div className="flex items-center gap-4 border-b p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-lg font-semibold text-slate-900">{payout?.bank_reference}</h2>
              <p className="text-sm text-slate-500">
                {paymentMethodName} · <AppDate value={payout?.paid_at} format="short" />
              </p>
            </div>
            {isVoided ? (
              <StatusBadge variant="danger">Voided</StatusBadge>
            ) : (
              <StatusBadge variant="success">Active</StatusBadge>
            )}
            {!isVoided && (
              <ActionsDropdown
                items={[
                  {
                    label: "Void & Correct Payout",
                    icon: Ban,
                    color: "red",
                    onClick: () => setShowVoidModal(true),
                  },
                ]}
              />
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 border-t border-slate-200 px-6 py-6 sm:grid-cols-2">
            <DetailRow label="Payment Method" value={paymentMethodName} />
            <DetailRow label="Paid At" value={<AppDate value={payout?.paid_at} format="short" />} />
            <DetailRow
              label="Amount Sent"
              value={payout ? formatCommissionAmount(amountSent, payout.currency) : "—"}
            />
            <DetailRow
              label="Agreed Total"
              value={
                Object.entries(agreedTotals).length > 0
                  ? Object.entries(agreedTotals)
                      .map(([currency, amount]) => formatCommissionAmount(amount, currency))
                      .join(" + ")
                  : "—"
              }
            />
            {isVoided && <DetailRow label="Void Reason" value={payout?.void_reason ?? "—"} />}
            <DetailRow
              label="Receipt"
              value={
                <DocumentActions
                  fileKey={payout?.receipt_file_key}
                  label="Payout Receipt"
                />
              }
            />
          </div>

          <div className="border-t border-slate-200 px-6 py-6">
            <p className="mb-3 text-sm font-semibold text-slate-900">Applications Covered</p>
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-start text-xs font-semibold tracking-wider text-slate-900">
                      Application
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-semibold tracking-wider text-slate-900">
                      Paid Amount
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-semibold tracking-wider text-slate-900">
                      Agreed Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {payout?.items.map((item) => (
                    <tr key={item.application_commission_id}>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">
                        {item.application_id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {formatCommissionAmount(item.paid_amount, payout.currency)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {formatCommissionAmount(item.source_amount, item.source_currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </AsyncStateView>
      </div>

      {payout && (
        <React.Suspense fallback={null}>
          <VoidPayout
            isOpen={showVoidModal}
            onClose={() => setShowVoidModal(false)}
            payout={payout}
            onSuccess={refetch}
          />
        </React.Suspense>
      )}
    </div>
  );
}
