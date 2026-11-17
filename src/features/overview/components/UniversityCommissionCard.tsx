"use client";
import { useState } from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";
import DashboardCard from "components/ub/dashboard/cards/DashboardCard";
import DataTable, {
  type DataTableColumn,
} from "components/ub/data/tables/DataTable";
import PresignedImage from "components/ub/data/media/PresignedImage";
import Combobox from "components/ub/forms/selection/Combobox";
import Drawer from "components/ub/feedback/dialogs/Drawer";
import Button from "components/ub/core/buttons/Button";
import CardLinkButton from "components/ub/dashboard/cards/CardLinkButton";
import type { OverviewResource } from "../model/types";
import type {
  CommissionBucket,
  UniversityCommission,
} from "../model/dashboardData";
const amount = (value: number, currency: string) =>
  `${currency} ${value.toLocaleString("en-MY", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })}`;
export default function UniversityCommissionCard({
  resource,
  admin,
  onRetry,
}: {
  resource?: OverviewResource;
  admin: boolean;
  onRetry: () => void;
}) {
  const [currency, setCurrency] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState<{
    row: UniversityCommission;
    bucket: CommissionBucket;
    label: string;
  } | null>(null);
  const all = resource?.data?.universityCommission || [];
  const filtered = all.filter((row) => !currency || row.currency === currency);
  const rows = expanded ? filtered : filtered.slice(0, 5);
  const base = admin ? "/admin" : "/partner";
  const cell = (
    row: UniversityCommission,
    bucket: CommissionBucket,
    label: string
  ) =>
    !bucket.records.length ? (
      <span className="text-ub-text-tertiary">—</span>
    ) : (
      <button
        type="button"
        className="ub-tabular break-words text-start font-medium text-ub-text-link hover:underline"
        aria-label={`${label} for ${row.name} in ${row.currency}`}
        onClick={() => setSelected({ row, bucket, label })}
      >
        {bucket.unknown ? "Not available" : amount(bucket.amount, row.currency)}
      </button>
    );
  const columns: DataTableColumn<UniversityCommission>[] = [
    {
      key: "name",
      header: "University",
      cell: (row) => {
        const matches = (resource?.data?.universities || []).filter(
          (university) => university.name.trim() === row.name
        );
        const university = matches.length === 1 ? matches[0] : null;
        return (
          <div className="flex min-w-0 items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-ub-md bg-ub-tone-brand-bg">
              <PresignedImage
                fileKey={university?.logo_file_key || ""}
                alt=""
                className="h-full w-full object-contain"
                fallback={
                  <Building2
                    aria-hidden="true"
                    className="h-5 w-5 text-ub-tone-brand-text"
                  />
                }
              />
            </div>
            <div className="min-w-0">
              {university ? (
                <Link
                  href={`${base}/universities/${encodeURIComponent(
                    university.id
                  )}`}
                  className="break-words font-medium text-ub-text-primary hover:text-ub-text-link"
                >
                  {row.name}
                </Link>
              ) : (
                <span className="break-words font-medium">{row.name}</span>
              )}
              <p className="mt-1 text-ub-caption text-ub-text-secondary">
                {row.currency}
                {row.disputed ? ` · ${row.disputed} disputed` : ""}
              </p>
              {!!row.paid.records.length && (
                <div className="mt-1 text-ub-caption md:hidden">
                  Paid: {cell(row, row.paid, "Paid commission")}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "applications",
      header: "Applications",
      mobileSecondary: true,
      cell: (row) =>
        new Set(
          [
            ...row.expected.records,
            ...row.ready.records,
            ...row.paid.records,
          ].map((record) => record.applicationId)
        ).size + row.disputed,
    },
    {
      key: "expected",
      header: "Expected",
      cell: (row) => cell(row, row.expected, "Expected commission"),
    },
    {
      key: "ready",
      header: "Ready for payout",
      cell: (row) => cell(row, row.ready, "Ready for payout"),
    },
    {
      key: "paid",
      header: "Paid",
      mobileSecondary: true,
      cell: (row) => cell(row, row.paid, "Paid commission"),
    },
  ];
  return (
    <>
      <DashboardCard
        title="Commission by university"
        as="h2"
        subtitle={
          admin
            ? "Monitor university processing and outstanding advisor payouts."
            : "See where your university commissions stand."
        }
        state={
          resource?.state === "ready" && !all.length
            ? "empty"
            : resource?.state || "loading"
        }
        emptyMessage="Commission will appear when applications reach the commission stage."
        errorMessage={resource?.error}
        onRetry={onRetry}
        actions={
          <CardLinkButton
            href={
              admin ? "/admin/finance-queue" : "/partner/commission-tracker"
            }
            label="Open commission tracker"
          />
        }
        controls={
          all.length ? (
            <div className="max-w-xs">
              <Combobox
                compact
                ariaLabel="Commission currency"
                placeholder="All currencies"
                options={[
                  { value: "", label: "All currencies" },
                  ...Array.from(new Set(all.map((row) => row.currency)))
                    .sort()
                    .map((value) => ({ value, label: value })),
                ]}
                value={currency}
                onChange={(value) => {
                  setCurrency(value || "");
                  setExpanded(false);
                }}
              />
            </div>
          ) : undefined
        }
        footer={
          <p className="text-ub-caption text-ub-text-secondary">
            Expected: awaiting the university. Ready: awaiting payout. Paid:
            settled records. Currencies are never combined; unavailable amounts
            remain undisclosed.
          </p>
        }
      >
        <DataTable
          columns={columns}
          rows={rows}
          getRowId={(row) => row.key}
          caption="University commission summary"
          empty={{
            title: "No commissions in this currency",
            description: "Choose another currency.",
          }}
        />
        {filtered.length > 5 && (
          <div className="mt-3">
            <Button
              size="sm"
              text={
                expanded ? "Show fewer universities" : "Show all universities"
              }
              onClick={() => setExpanded(!expanded)}
            />
          </div>
        )}
      </DashboardCard>
      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.row.name || "University commissions"}
        description={
          selected ? `${selected.label} · ${selected.row.currency}` : undefined
        }
      >
        <ul className="divide-y divide-ub-border">
          {selected?.bucket.records.map((record) => (
            <li
              key={record.id}
              className="flex min-w-0 flex-wrap items-start justify-between gap-3 py-3"
            >
              <div className="min-w-0">
                <Link
                  className="break-words font-medium text-ub-text-link hover:underline"
                  href={`${base}/applications/${encodeURIComponent(
                    record.applicationId
                  )}`}
                >
                  {record.student || record.reference}
                </Link>
                <p className="mt-1 text-ub-caption text-ub-text-secondary">
                  {record.reference}
                </p>
              </div>
              <span className="ub-tabular text-ub-body-sm">
                {record.amount === null
                  ? "Not available"
                  : amount(record.amount, selected.row.currency)}
              </span>
            </li>
          ))}
        </ul>
      </Drawer>
    </>
  );
}
