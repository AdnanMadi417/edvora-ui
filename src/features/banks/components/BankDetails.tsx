"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Landmark, Pencil } from "lucide-react";
import Skeleton from "components/ub/feedback/states/Skeleton";
import AsyncStateView from "components/ub/feedback/states/AsyncStateView";
import { getAsyncStatus } from "components/ub/feedback/states/AsyncStatus";
import Button from "components/ub/core/buttons/Button";
import StatusBadge from "components/ub/data/badges/StatusBadge";
import { useBank } from "../hooks";
import { getCountryName } from "constants/lists";

interface Props {
  id: string;
  /** Where "Back" navigates to and "Edit" is built from — defaults to the
   *  admin route. The data-entry page passes its own base path. */
  basePath?: string;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm text-slate-900">{value}</p>
    </div>
  );
}

// Mirrors the header (icon + title + subtitle + badge) and the 4-cell
// detail grid below, so loading doesn't shift the layout once the bank
// (or the "not found" state) arrives.
function BankDetailsSkeleton() {
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

// View page for a single bank. There's no GET /banks/{id} endpoint — useBank
// finds the record within the already-fetched list (see hooks/useBank.ts).
export default function BankDetails({ id, basePath = "/admin/advisors/banks" }: Props) {
  const router = useRouter();
  const { bank, loading, error, refetch } = useBank(id);
  const status = getAsyncStatus(loading, error, bank, (b) => b === null);

  const handleBack = () => router.push(basePath);

  return (
    <div className="mt-6">
      <div className="rounded-md border bg-white shadow-sm">
        <AsyncStateView
          status={status}
          skeleton={<BankDetailsSkeleton />}
          errorMessage={error ?? undefined}
          onRetry={refetch}
          emptyTitle="Bank not found"
          emptySubtitle="It may have been removed, or the link is out of date."
          emptyIcon={Landmark}
          emptyAction={
            <Button
              onClick={handleBack}
              icon={<ChevronLeft className="h-4 w-4" />}
              text="Back to Banks"
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
              <Landmark className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-lg font-semibold text-slate-900">{bank?.name}</h2>
              <p className="text-sm text-slate-500">
                {getCountryName(bank?.country)} · {bank?.code}
              </p>
            </div>
            {bank?.is_active ? (
              <StatusBadge variant="success">Active</StatusBadge>
            ) : (
              <StatusBadge variant="neutral">Inactive</StatusBadge>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 border-t border-slate-200 px-6 py-6 sm:grid-cols-2">
            <DetailRow label="Country" value={getCountryName(bank?.country)} />
            <DetailRow label="Bank Code" value={bank?.code} />
            <DetailRow label="SWIFT Code" value={bank?.swift_code ?? "—"} />
            <DetailRow label="Bank Name" value={bank?.name} />
          </div>
        </AsyncStateView>

        {status === "success" && (
          <div className="flex gap-2 border-t border-slate-200 px-6 py-4">
            <Button
              onClick={handleBack}
              icon={<ChevronLeft className="h-5 w-5" />}
              text="Back"
              bgColor="bg-white"
              textColor="text-slate-600"
              borderColor="border-slate-300"
              hoverTextColor="hover:text-slate-800"
              hoverBorderColor="hover:border-slate-400"
              className="flex-1 hover:bg-slate-50"
            />
            <Button
              onClick={() => router.push(`${basePath}/${id}/edit`)}
              icon={<Pencil className="h-5 w-5" />}
              text="Edit Bank"
              bgColor="bg-blue-600"
              textColor="text-white"
              borderColor="border-blue-600"
              hoverTextColor="hover:text-white"
              hoverBorderColor="hover:border-blue-700"
              className="flex-1 hover:bg-blue-700"
            />
          </div>
        )}
      </div>
    </div>
  );
}
