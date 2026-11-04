"use client";

import React, { useMemo, useState } from "react";
import { Receipt, Eye, Download, Ban } from "lucide-react";

import TablePagination from "components/ub/data/tables/TablePagination";
import DataTable, { type DataTableColumn } from "components/ub/data/tables/DataTable";
import DataTableToolbar from "components/ub/data/tables/DataTableToolbar";
import Tag from "components/ub/data/badges/Tag";
import { getAsyncStatus } from "components/ub/feedback/states/AsyncStatus";
import Tooltip from "components/ub/feedback/dialogs/Tooltip";
import AppDate from "components/ub/data/formatting/AppDate";
import IconButton from "components/ub/core/buttons/IconButton";
import { formatCommissionAmount } from "features/applications/shared/commissionTypes";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { parseApiError } from "utils/parseApiError";
import { getDocumentDownloadUrl } from "services/documentService";
import { downloadFileAs, buildDocumentFileName } from "utils/documentFileName";

import { payoutsApi } from "../../services";
import { usePayoutStatement } from "../../hooks";
import type { Payout, PayoutStatementApplication, PayoutStatementItem } from "../../types";

const VoidPayout = React.lazy(() => import("./VoidPayout"));

const PAGE_SIZE = 20;

const formatApplicants = (applications: PayoutStatementApplication[]) =>
  `${applications.length} — ${applications.map((a) => a.student_name).join(", ")}`;

interface PayoutStatementSectionProps {
  partnerId: string;
  /** Rows open the payout detail page, which lives under /admin — only the
   *  admin profile passes this; on the account manager profile rows stay
   *  read-only instead of bouncing the manager out of the admin app. */
  canOpenPayout?: boolean;
}

export default function PayoutStatementSection({ partnerId, canOpenPayout = false }: PayoutStatementSectionProps) {
  const { showToast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const { items, total, loading, error, refetch } = usePayoutStatement(partnerId, {
    page: currentPage,
    page_size: PAGE_SIZE,
  });

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return items;
    return items.filter(
      (item) =>
        item.bank_reference.toLowerCase().includes(term) ||
        item.applications.some((a) => a.student_name.toLowerCase().includes(term))
    );
  }, [items, searchTerm]);

  const status = getAsyncStatus(loading, error, filteredItems, (r) => r.length === 0);

  const [loadingVoidId, setLoadingVoidId] = useState<string | null>(null);
  const [voidTarget, setVoidTarget] = useState<Payout | null>(null);
  const [showVoidModal, setShowVoidModal] = useState(false);

  const openVoidModal = async (item: PayoutStatementItem) => {
    setLoadingVoidId(item.payout_id);
    try {
      const res = await payoutsApi.get(item.payout_id);
      setVoidTarget(res.data);
      setShowVoidModal(true);
    } catch (err: unknown) {
      showToast(parseApiError(err, "Failed to load payout details."), "error");
    } finally {
      setLoadingVoidId(null);
    }
  };

  // Proof is resolved the same way DocumentActions does everywhere else --
  // via a signed URL from file_key, never the raw stored receipt_file_url.
  // The key comes with the statement row, so this works for account
  // managers too (GET /admin/payouts/{id} is FINANCE only).
  const [loadingProof, setLoadingProof] = useState<{ id: string; action: "view" | "download" } | null>(null);

  const handleProof = async (item: PayoutStatementItem, action: "view" | "download") => {
    setLoadingProof({ id: item.payout_id, action });
    try {
      const fileKey = item.receipt_file_key;
      if (!fileKey) {
        showToast("No receipt on file for this payout.", "error");
        return;
      }
      const url = await getDocumentDownloadUrl(fileKey);
      if (action === "view") {
        window.open(url, "_blank");
      } else {
        await downloadFileAs(url, buildDocumentFileName("", "Payout Receipt", fileKey));
      }
    } catch (err: unknown) {
      showToast(parseApiError(err, "Failed to load receipt."), "error");
    } finally {
      setLoadingProof(null);
    }
  };

  const busy = (item: PayoutStatementItem, action: "view" | "download") => loadingProof?.id === item.payout_id && loadingProof.action === action;
  const columns: DataTableColumn<PayoutStatementItem>[] = [
    {
      key: "reference",
      header: "Bank Reference",
      cell: (item) => (
        <span className="flex flex-wrap items-center gap-2">
          <span className="ub-ref whitespace-nowrap font-medium text-ub-text-primary">{item.bank_reference}</span>
          {item.voided_at && <Tag tone="danger" size="sm">Voided</Tag>}
        </span>
      ),
    },
    { key: "method", header: "Payment Method", cell: (item) => item.payment_method_name },
    { key: "paid", header: "Paid At", cell: (item) => <AppDate value={item.paid_at} format="short" className="whitespace-nowrap" /> },
    { key: "apps", header: "Applications", cell: (item) => formatApplicants(item.applications) },
    {
      key: "amount",
      header: "Amount Sent",
      align: "end",
      cell: (item) => (
        <span className="block whitespace-nowrap">
          <span className={item.voided_at ? "block text-ub-text-tertiary line-through" : "block font-medium text-ub-text-primary"}>{formatCommissionAmount(item.amount_sent, item.currency)}</span>
          {item.agreed_totals.length > 0 && <span className="block text-ub-caption text-ub-text-tertiary">Agreed: {item.agreed_totals.map((t) => formatCommissionAmount(t.amount, t.currency)).join(" + ")}</span>}
          {item.voided_at && (
            <span className="block whitespace-normal text-ub-caption text-ub-tone-danger-text">
              {item.void_reason}
              {item.voided_by_name ? ` — ${item.voided_by_name}` : ""}
            </span>
          )}
        </span>
      ),
    },
    { key: "by", header: "Recorded By", cell: (item) => item.recorded_by_name },
    {
      key: "actions",
      header: "Actions",
      cell: (item) => (
        <span className="flex items-center gap-1">
          {item.receipt_file_url && (
            <>
              <Tooltip content="View Receipt" position="left">
                <IconButton variant="tertiary" size="sm" onClick={() => handleProof(item, "view")} disabled={loadingProof?.id === item.payout_id} aria-label="View Receipt" title="View Receipt" icon={<Eye className={busy(item, "view") ? "h-4 w-4 animate-pulse motion-reduce:animate-none" : "h-4 w-4"} aria-hidden="true" />} />
              </Tooltip>
              <Tooltip content="Download Receipt" position="left">
                <IconButton variant="tertiary" size="sm" onClick={() => handleProof(item, "download")} disabled={loadingProof?.id === item.payout_id} aria-label="Download Receipt" title="Download Receipt" icon={<Download className={busy(item, "download") ? "h-4 w-4 animate-pulse motion-reduce:animate-none" : "h-4 w-4"} aria-hidden="true" />} />
              </Tooltip>
            </>
          )}
          {item.can_void && (
            <Tooltip content="Void & correct" position="left">
              <IconButton variant="tertiary" size="sm" onClick={() => openVoidModal(item)} disabled={loadingVoidId === item.payout_id} aria-label="Void & correct" title="Void & correct" icon={<Ban className={loadingVoidId === item.payout_id ? "h-4 w-4 animate-pulse text-ub-tone-danger-text motion-reduce:animate-none" : "h-4 w-4 text-ub-tone-danger-text"} aria-hidden="true" />} />
            </Tooltip>
          )}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6">
      <DataTableToolbar search={{ value: searchTerm, onChange: setSearchTerm, placeholder: "Search by bank reference or student..." }} />

      <DataTable<PayoutStatementItem>
        caption="Payout statement"
        columns={columns}
        rows={filteredItems}
        getRowId={(item) => item.payout_id}
        getRowClassName={(item) => (item.voided_at ? "opacity-60" : undefined)}
        getRowHref={canOpenPayout ? (item) => `/admin/advisors/${partnerId}/payouts/${item.payout_id}` : undefined}
        manualSort
        loading={status === "loading"}
        error={status === "error" ? error ?? "Couldn't load payouts." : null}
        onRetry={refetch}
        empty={{ title: "No payouts found", description: searchTerm ? "Try adjusting your search." : "No payouts have been recorded for this advisor yet.", icon: <Receipt aria-hidden="true" /> }}
        footer={<TablePagination currentPage={currentPage} onPageChange={setCurrentPage} itemsPerPage={PAGE_SIZE} itemCount={filteredItems.length} totalCount={total} itemLabel="payouts" loading={status === "loading"} />}
      />

      {voidTarget && (
        <React.Suspense fallback={null}>
          <VoidPayout
            isOpen={showVoidModal}
            onClose={() => setShowVoidModal(false)}
            payout={voidTarget}
            onSuccess={refetch}
          />
        </React.Suspense>
      )}
    </div>
  );
}
