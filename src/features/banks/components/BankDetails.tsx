"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Landmark, Pencil } from "lucide-react";
import Loading from "components/loading/Loading";
import EmptyData from "components/emptyData/EmptyTableData";
import Button from "components/ui/buttons/Button";
import { StatusBadge } from "components/ui/badges";
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

// View page for a single bank. There's no GET /banks/{id} endpoint — useBank
// finds the record within the already-fetched list (see hooks/useBank.ts).
export default function BankDetails({ id, basePath = "/admin/config-universities/banks" }: Props) {
  const router = useRouter();
  const { bank, loading } = useBank(id);

  const handleBack = () => router.push(basePath);

  if (loading) return <Loading text="Loading bank details..." />;
  if (!bank) return <EmptyData />;

  return (
    <div className="mt-6 max-w-5xl mx-auto">
      <div className="rounded-md border bg-card shadow-sm">
        <div className="flex items-center gap-4 border-b p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700">
            <Landmark className="h-6 w-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-semibold text-slate-900">{bank.name}</h2>
            <p className="text-sm text-slate-500">
              {getCountryName(bank.country)} · {bank.code}
            </p>
          </div>
          {bank.is_active ? (
            <StatusBadge variant="success">Active</StatusBadge>
          ) : (
            <StatusBadge variant="neutral">Inactive</StatusBadge>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 border-t border-slate-200 px-6 py-6 sm:grid-cols-2">
          <DetailRow label="Country" value={getCountryName(bank.country)} />
          <DetailRow label="Bank Code" value={bank.code} />
          <DetailRow label="SWIFT Code" value={bank.swift_code ?? "—"} />
          <DetailRow label="Bank Name" value={bank.name} />
        </div>

        <div className="flex gap-3 border-t border-slate-200 px-6 py-4">
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
      </div>
    </div>
  );
}
