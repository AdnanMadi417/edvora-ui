"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { Receipt, Eye, Download, Ban, ChevronRight } from "lucide-react";

import SearchInput from "components/ub/forms/SearchInput";
import TableWrapper from "components/ub/data/TableWrapper";
import TableSkeletonRows from "components/ub/data/TableSkeletonRows";
import TableEmptyRow from "components/ub/data/TableEmptyRow";
import TableErrorRow from "components/ub/data/TableErrorRow";
import TablePagination from "components/ub/data/TablePagination";
import AnimatedTableRow from "components/ub/data/AnimatedTableRow";
import { getAsyncStatus } from "components/ub/feedback/AsyncStatus";
import StatusBadge from "components/ub/data/StatusBadge";
import Tooltip from "components/ub/feedback/Tooltip";
import AppDate from "components/ub/data/AppDate";
import IconButton from "components/ub/core/IconButton";
import { formatCommissionAmount } from "features/applications/shared/commissionTypes";
import { useToast } from "components/ub/feedback/ToastContext";
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
  const router = useRouter();
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

  return (
    <div className="p-6">
      <div className="mb-4">
        <SearchInput
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          placeholder="Search by bank reference or student..."
          className="sm:w-80"
        />
      </div>

      <TableWrapper
        footer={
          <TablePagination
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            itemsPerPage={PAGE_SIZE}
            itemCount={filteredItems.length}
            totalCount={total}
            itemLabel="payouts"
            loading={status === "loading"}
          />
        }
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">Bank Reference</th>
              <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">Payment Method</th>
              <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">Paid At</th>
              <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">Applications</th>
              <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">Amount Sent</th>
              <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">Recorded By</th>
              <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">Actions</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {status === "loading" && <TableSkeletonRows columns={8} rows={5} />}

            {status === "error" && <TableErrorRow colSpan={8} message={error ?? undefined} onRetry={refetch} />}

            {status === "empty" && (
              <TableEmptyRow
                colSpan={8}
                title="No payouts found"
                subtitle={
                  searchTerm
                    ? "Try adjusting your search."
                    : "No payouts have been recorded for this advisor yet."
                }
                icon={<Receipt className="h-8 w-8 text-slate-400" />}
              />
            )}

            <AnimatePresence>
              {status === "success" &&
                filteredItems.map((item) => {
                  const isVoided = !!item.voided_at;
                  return (
                    <AnimatedTableRow
                      key={item.payout_id}
                      className={`group transition-colors ${
                        canOpenPayout ? "cursor-pointer hover:bg-slate-100/50" : ""
                      } ${isVoided ? "opacity-60" : ""}`}
                      onClick={
                        canOpenPayout
                          ? () => router.push(`/admin/advisors/${partnerId}/payouts/${item.payout_id}`)
                          : undefined
                      }
                    >
                      <td className="px-6 py-4 text-sm">
                        <p className="font-medium text-slate-900">{item.bank_reference}</p>
                        {isVoided && (
                          <StatusBadge variant="danger" className="mt-1">
                            Voided
                          </StatusBadge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">{item.payment_method_name}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        <AppDate value={item.paid_at} format="short" />
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">{formatApplicants(item.applications)}</td>
                      <td className="px-6 py-4 text-sm">
                        <p className={isVoided ? "text-slate-400 line-through" : "font-medium text-slate-900"}>
                          {formatCommissionAmount(item.amount_sent, item.currency)}
                        </p>
                        {item.agreed_totals.length > 0 && (
                          <p className="text-xs text-slate-400">
                            Agreed: {item.agreed_totals.map((t) => formatCommissionAmount(t.amount, t.currency)).join(" + ")}
                          </p>
                        )}
                        {isVoided && (
                          <p className="text-xs text-red-600">
                            {item.void_reason}
                            {item.voided_by_name ? ` — ${item.voided_by_name}` : ""}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">{item.recorded_by_name}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {item.receipt_file_url && (
                            <>
                              <Tooltip content="View Receipt" position="left">
                                <IconButton
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleProof(item, "view");
                                  }}
                                  disabled={loadingProof?.id === item.payout_id}
                                  aria-label="View Receipt"
                                  icon={
                                    <Eye
                                      className={`h-4 w-4 ${
                                        loadingProof?.id === item.payout_id && loadingProof.action === "view"
                                          ? "animate-pulse"
                                          : ""
                                      }`}
                                    />
                                  }
                                  bgColor="bg-slate-100"
                                  textColor="text-slate-600"
                                  borderColor="border-transparent"
                                  hoverTextColor="hover:text-slate-600"
                                  hoverBorderColor="hover:border-slate-200"
                                  className="hover:bg-slate-200"
                                />
                              </Tooltip>
                              <Tooltip content="Download Receipt" position="left">
                                <IconButton
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleProof(item, "download");
                                  }}
                                  disabled={loadingProof?.id === item.payout_id}
                                  aria-label="Download Receipt"
                                  icon={
                                    <Download
                                      className={`h-4 w-4 ${
                                        loadingProof?.id === item.payout_id && loadingProof.action === "download"
                                          ? "animate-pulse"
                                          : ""
                                      }`}
                                    />
                                  }
                                  bgColor="bg-blue-50"
                                  textColor="text-blue-600"
                                  borderColor="border-transparent"
                                  hoverTextColor="hover:text-blue-700"
                                  hoverBorderColor="hover:border-blue-200"
                                  className="hover:bg-blue-100"
                                />
                              </Tooltip>
                            </>
                          )}
                          {item.can_void && (
                            <Tooltip content="Void & correct" position="left">
                              <IconButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openVoidModal(item);
                                }}
                                disabled={loadingVoidId === item.payout_id}
                                aria-label="Void & correct"
                                icon={
                                  <Ban
                                    className={`h-4 w-4 ${loadingVoidId === item.payout_id ? "animate-pulse" : ""}`}
                                  />
                                }
                                bgColor="bg-transparent"
                                textColor="text-red-500"
                                borderColor="border-transparent"
                                hoverTextColor="hover:text-red-700"
                                hoverBorderColor="hover:border-transparent"
                                className="hover:bg-red-50"
                              />
                            </Tooltip>
                          )}
                        </div>
                      </td>
                      <td className="w-8 pr-4 py-4">
                        {canOpenPayout && (
                          <ChevronRight className="h-4 w-4 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" />
                        )}
                      </td>
                    </AnimatedTableRow>
                  );
                })}
            </AnimatePresence>
          </tbody>
        </table>
      </TableWrapper>

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
