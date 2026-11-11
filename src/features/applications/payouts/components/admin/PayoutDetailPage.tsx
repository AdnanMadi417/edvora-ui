"use client";

import Breadcrumbs from "components/ub/navigation/links/Breadcrumbs";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Ban, Wallet } from "lucide-react";

import Skeleton from "components/ub/feedback/states/Skeleton";
import AsyncStateView from "components/ub/feedback/states/AsyncStateView";
import { getAsyncStatus } from "components/ub/feedback/states/AsyncStatus";
import StatusTag from "components/ub/dashboard/shared/StatusTag";
import DescriptionList from "components/ub/data/display/DescriptionList";
import DataTable from "components/ub/data/tables/DataTable";
import IconTile from "components/ub/dashboard/shared/IconTile";
import Card from "components/ub/data/cards/Card";
import Button from "components/ub/core/buttons/Button";
import ActionsDropdown from "components/ub/navigation/menus/ActionsDropdown";
import DocumentActions from "features/applications/shared/DocumentActions";
import { formatCommissionAmount } from "features/applications/shared/commissionTypes";
import AppDate from "components/ub/data/formatting/AppDate";

import { usePayout, usePaymentMethods } from "../../hooks";

const VoidPayout = React.lazy(() => import("./VoidPayout"));

interface Props {
  partnerId: string;
  payoutId: string;
}

function PayoutDetailSkeleton() {
  return (
    <>
      <div className="flex items-center gap-4 border-b border-ub-border p-6">
        <Skeleton className="h-12 w-12 shrink-0 rounded-ub-md" />
        <div className="min-w-0 flex-1">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="mt-2 h-4 w-32" />
        </div>
        <Skeleton className="h-6 w-16 rounded-ub-full" />
      </div>
      <div className="grid grid-cols-1 gap-4 px-6 py-6 sm:grid-cols-2">
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

  const handleBack = () => router.push(`/admin/advisors/${partnerId}`);

  const paymentMethodName =
    paymentMethods.find((m) => m.id === payout?.payment_method_id)?.name ?? "—";

  const amountSent = payout?.items.reduce((sum, item) => sum + item.paid_amount, 0) ?? 0;

  const agreedTotals = (payout?.items ?? []).reduce<Record<string, number>>((acc, item) => {
    acc[item.source_currency] = (acc[item.source_currency] ?? 0) + item.source_amount;
    return acc;
  }, {});

  const isVoided = !!payout?.voided_at;

  return (
    <div className="mx-auto mt-6 ">
      <Card>
        <AsyncStateView
          status={status}
          skeleton={<PayoutDetailSkeleton />}
          errorMessage={error ?? undefined}
          onRetry={refetch}
          emptyTitle="Payout not found"
          emptySubtitle="It may have been removed, or the link is out of date."
          emptyIcon={Wallet}
          emptyAction={
            <Button variant="secondary" onClick={handleBack} icon={<ChevronLeft className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />} text="Back" />
          }
        >
          <div className="flex items-center gap-4 border-b border-ub-border p-6">
            <IconTile icon={Wallet} tone="brand" size="lg" />
            <div className="min-w-0 flex-1">
              <Breadcrumbs
                className="mb-1"
                items={[
                  { label: "Advisors", href: "/admin/advisors" },
                  { label: "Advisor", href: `/admin/advisors/${partnerId}` },
                  { label: payout?.bank_reference ?? "Payout" },
                ]}
              />
              <h2 className="ub-ref truncate text-ub-heading-md text-ub-text-primary">{payout?.bank_reference}</h2>
              <p className="text-ub-body-sm text-ub-text-secondary">
                {paymentMethodName} · <AppDate value={payout?.paid_at} format="short" />
              </p>
            </div>
            <StatusTag status={isVoided ? "Voided" : "Active"} tone={isVoided ? "danger" : "success"} size="md" />
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

          <div className="px-6 py-6">
            <DescriptionList
              columns={2}
              items={[
                { label: "Payment Method", value: paymentMethodName },
                { label: "Paid At", value: <AppDate value={payout?.paid_at} format="short" /> },
                { label: "Amount Sent", value: payout ? <span className="ub-tabular">{formatCommissionAmount(amountSent, payout.currency)}</span> : "—" },
                {
                  label: "Agreed Total",
                  value:
                    Object.entries(agreedTotals).length > 0 ? (
                      <span className="ub-tabular">{Object.entries(agreedTotals).map(([currency, amount]) => formatCommissionAmount(amount, currency)).join(" + ")}</span>
                    ) : (
                      "—"
                    ),
                },
                ...(isVoided ? [{ label: "Void Reason", value: payout?.void_reason ?? "—" }] : []),
                { label: "Receipt", value: <DocumentActions fileKey={payout?.receipt_file_key} label="Payout Receipt" /> },
              ]}
            />
          </div>

          <div className="border-t border-ub-border px-6 py-6">
            <h3 className="mb-3 text-ub-heading-sm text-ub-text-primary">Applications Covered</h3>
            <DataTable
              caption="Applications covered by this payout"
              density="compact"
              rows={payout?.items ?? []}
              getRowId={(item) => item.application_commission_id}
              getRowHref={(item) => `/admin/applications/${item.application_id}`}
              manualSort
              empty={{ title: "No applications", description: "This payout covers no applications." }}
              columns={[
                { key: "application", header: "Application", cell: (item) => <span className="ub-ref font-medium">{item.application_id.slice(0, 8).toUpperCase()}</span> },
                { key: "paid", header: "Paid Amount", align: "end", cell: (item) => (payout ? formatCommissionAmount(item.paid_amount, payout.currency) : "—") },
                { key: "agreed", header: "Agreed Amount", align: "end", cell: (item) => formatCommissionAmount(item.source_amount, item.source_currency) },
              ]}
            />
          </div>
        </AsyncStateView>
      </Card>

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
