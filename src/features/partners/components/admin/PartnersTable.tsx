"use client";
import { tableSectionPadding } from "components/ub/recipes";
import TableActions, {
  TableAction,
} from "components/ub/data/tables/TableActions";
import LinkBtn from "components/ub/core/buttons/LinkBtn";
import DataTable, {
  type DataTableColumn,
} from "components/ub/data/tables/DataTable";
import type { Partner } from "features/partners/types";
import AdvisorDirectoryToolbar from "../shared/AdvisorDirectoryToolbar";
import AdvisorEntityCell, { advisorName } from "../shared/AdvisorEntityCell";

import { useId as useTabId } from "react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronRight,
  Pencil,
  RefreshCw,
  SlidersHorizontal,
  Building2,
  UserCog,
  Users,
  CheckCircle,
  XCircle,
  BadgeCheck,
  User,
  ShieldCheck,
  CalendarDays,
  Mail,
  Ban,
  Power,
  Trash2,
  Handshake,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { EASE, MICRO_DURATION } from "components/ub/core/motion/FadeIn";
import AppDate from "components/ub/data/formatting/AppDate";
import StatusBadge from "components/ub/data/badges/StatusBadge";
import Tabs, { tabPanelProps } from "components/ub/navigation/controls/Tabs";
import type { TabItem } from "components/ub/navigation/controls/Tabs";
import { useRouter } from "next/navigation";
import {
  usePartners,
  useDeletePartner,
  useUpdatePartner,
  useResendApprovalEmail,
} from "features/partners/hooks";
import { useAccountManagers } from "features/account-managers/hooks";
import ReviewPartnerPopup from "./ReviewPartnerPopup";
import ResendApprovalEmailConfirmation from "./ResendApprovalEmailConfirmation";
import PendingRegistrationOtpsTable from "./PendingRegistrationOtpsTable";
import SuspendActivatePartner from "./SuspendActivatePartner";
import DeletePartner from "./DeletePartner";
import StatsFilterCards, {
  type FilterCardItem,
} from "components/ub/navigation/controls/StatsFilterCards";
import TablePagination from "components/ub/data/tables/TablePagination";
import PresignedImage from "components/ub/data/media/PresignedImage";
import Button from "components/ub/core/buttons/Button";
import IconButton from "components/ub/core/buttons/IconButton";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { parseApiError } from "utils/parseApiError";
import { getInitials } from "components/ub/data/media/Avatar";

const ITEMS_PER_PAGE = 10;

type PartnersTab = "partners" | "pending-otps";

const TABS: TabItem<PartnersTab>[] = [
  { key: "partners", label: "Advisors" },
  { key: "pending-otps", label: "Pending registrations" },
];

type StatusFilter = "active" | "inactive" | "individual" | "agency" | null;

function statusToParams(status: StatusFilter): {
  is_active?: boolean;
  type?: string;
} {
  if (status === "active") return { is_active: true };
  if (status === "inactive") return { is_active: false };
  if (status === "individual") return { type: "individual" };
  if (status === "agency") return { type: "agency" };
  return {};
}

export default function PartnersTable() {
  const router = useRouter();
  const { showToast } = useToast();

  const tabId = useTabId();
  const [activeTab, setActiveTab] = useState<PartnersTab>("partners");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedManager, setSelectedManager] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { accountManagers } = useAccountManagers();
  const { updatePartner, isUpdatingPartner } = useUpdatePartner();
  const { resendApprovalEmail, loading: isResendingEmail } =
    useResendApprovalEmail();
  const { deletePartner, loading: isDeletingPartner } = useDeletePartner();

  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewPartner, setReviewPartner] = useState<{
    id: string;
    name: string;
    assignedManagerId?: string;
  } | null>(null);
  const [isResendOpen, setIsResendOpen] = useState(false);
  const [resendTarget, setResendTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isSuspendOpen, setIsSuspendOpen] = useState(false);
  const [suspendTarget, setSuspendTarget] = useState<any>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // partnerId -> epoch ms when the 60s resend-approval-email cooldown ends
  const [resendCooldowns, setResendCooldowns] = useState<
    Record<string, number>
  >({});
  const [cooldownTick, setCooldownTick] = useState(() => Date.now());

  useEffect(() => {
    const hasActive = Object.values(resendCooldowns).some(
      (end) => end > Date.now()
    );
    if (!hasActive) return;
    const id = setInterval(() => {
      const now = Date.now();
      setCooldownTick(now);
      setResendCooldowns((prev) => {
        const next = Object.fromEntries(
          Object.entries(prev).filter(([, end]) => end > now)
        );
        return Object.keys(next).length === Object.keys(prev).length
          ? prev
          : next;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [resendCooldowns]);

  const getResendCooldownSeconds = (partnerId: string) => {
    const end = resendCooldowns[partnerId];
    if (!end) return 0;
    return Math.max(0, Math.ceil((end - cooldownTick) / 1000));
  };

  useEffect(() => {
    const t = setTimeout(() => {
      // Trim so a pasted email with a stray space still matches.
      setDebouncedSearch(searchTerm.trim());
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const { partners, total, stats, loading, error, refetch } = usePartners({
    page: currentPage,
    page_size: ITEMS_PER_PAGE,
    search: debouncedSearch || undefined,
    assigned_manager_id:
      selectedManager !== "all" ? selectedManager : undefined,
    ...statusToParams(selectedStatus),
  });

  const loadingStartedRef = useRef(false);
  useEffect(() => {
    if (loading) {
      loadingStartedRef.current = true;
    } else if (loadingStartedRef.current) {
      setHasLoadedOnce(true);
    }
  }, [loading]);

  const isInitialLoad = !hasLoadedOnce;
  const isRefetching = loading && hasLoadedOnce;

  // Every advisor is active or suspended, and individual or company, so each
  // card's share is of the same whole.
  const advisorTotal = (stats?.active ?? 0) + (stats?.inactive ?? 0);
  const shareOf = (n: number | undefined) => (advisorTotal > 0 ? ((n ?? 0) / advisorTotal) * 100 : undefined);
  const statsCards = useMemo<FilterCardItem[]>(
    () => [
      {
        id: "active",
        label: "Active",
        count: stats?.active ?? 0,
        progress: shareOf(stats?.active),
        shareOf: "of advisors",
        icon: CheckCircle,
        colorScheme: "emerald",
      },
      {
        id: "inactive",
        label: "Suspended",
        count: stats?.inactive ?? 0,
        progress: shareOf(stats?.inactive),
        shareOf: "of advisors",
        icon: XCircle,
        colorScheme: "rose",
      },
      {
        id: "individual",
        label: "Individual",
        count: stats?.individual ?? 0,
        progress: shareOf(stats?.individual),
        shareOf: "of advisors",
        icon: User,
        colorScheme: "violet",
      },
      {
        id: "agency",
        label: "Company",
        count: stats?.agency ?? 0,
        progress: shareOf(stats?.agency),
        shareOf: "of advisors",
        icon: Building2,
        colorScheme: "cyan",
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stats]
  );

  const displayTotal =
    partners.length < ITEMS_PER_PAGE
      ? (currentPage - 1) * ITEMS_PER_PAGE + partners.length
      : total;

  // The stats card is a real filter too: it narrows every search, so it has
  // to count here and be reset by Clear, or a search can come back empty
  // with no visible reason.
  const activeFiltersCount = [
    selectedManager !== "all",
    searchTerm.trim() !== "",
    selectedStatus !== null,
  ].filter(Boolean).length;

  const managerOptions = accountManagers.map((m) => ({
    label: m.name,
    value: m.id,
  }));

  const clearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setSelectedManager("all");
    setSelectedStatus(null);
    setCurrentPage(1);
  };

  const handleCardSelect = (id: string | null) => {
    setSelectedStatus((prev) => (prev === id ? null : (id as StatusFilter)));
    setCurrentPage(1);
  };

  // ?status= from a link (the home advisor rings) opens the list on that group.
  useEffect(() => {
    const status = new URLSearchParams(window.location.search).get("status");
    if (status && ["active", "inactive", "individual", "agency"].includes(status))
      setSelectedStatus(status as StatusFilter);
  }, []);

  const handleResendEmail = async () => {
    if (!resendTarget) return;
    try {
      const res = await resendApprovalEmail(resendTarget.id);
      showToast(
        res?.message || "Approval email resent successfully",
        "success"
      );
      setIsResendOpen(false);
      // A fresh send starts its own 60s cooldown window on the backend.
      setResendCooldowns((prev) => ({
        ...prev,
        [resendTarget.id]: Date.now() + 60_000,
      }));
      refetch();
    } catch (err: any) {
      if (err?.response?.data?.code === "partner_already_logged_in") {
        // Stale frontend check, not a real failure — the partner already logged in.
        showToast(
          parseApiError(err, "This advisor has already logged in."),
          "error"
        );
        setIsResendOpen(false);
        refetch();
        return;
      }
      if (err?.response?.status === 429) {
        const retryAfterSeconds =
          err?.response?.data?.details?.retry_after_seconds;
        if (typeof retryAfterSeconds === "number") {
          setResendCooldowns((prev) => ({
            ...prev,
            [resendTarget.id]: Date.now() + retryAfterSeconds * 1000,
          }));
        }
      }
      showToast(parseApiError(err, "Failed to resend approval email"), "error");
    }
  };

  const handleSuspendActivate = async () => {
    if (!suspendTarget) return;
    try {
      // Only the field actually changing — sending the whole stale row here
      // let this click silently overwrite any edits another admin made since
      // this list was last loaded (including re-cascading a stale
      // assigned_manager_id onto the entire agency).
      await updatePartner(suspendTarget.id, {
        is_active: !suspendTarget.is_active,
      });
      showToast(
        suspendTarget.is_active
          ? "Advisor account suspended"
          : "Advisor account activated",
        "success"
      );
      setIsSuspendOpen(false);
      refetch();
    } catch (err: unknown) {
      const fallback = suspendTarget.is_active
        ? "Failed to suspend account"
        : "Failed to activate account";
      showToast(parseApiError(err, fallback), "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePartner(deleteTarget.id);
      showToast("Advisor deleted successfully", "success");
      setIsDeleteOpen(false);
      refetch();
    } catch (err: unknown) {
      showToast(parseApiError(err, "Failed to delete partner"), "error");
    }
  };

  const columns: DataTableColumn<Partner>[] = [
    {
      key: "advisor",
      header: "Advisor",
      cell: (partner) => <AdvisorEntityCell advisor={partner} />,
    },
    {
      key: "manager",
      header: "Assigned manager",
      cell: (partner) =>
        partner.assigned_manager_name || (
          <span className="text-ub-text-tertiary">Unassigned</span>
        ),
    },
    {
      key: "registered",
      header: "Registered",
      cell: (partner) => (
        <AppDate value={partner.created_at} format="short" fallback="—" />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "end",
      cell: (partner) => (
        <TableActions label={advisorName(partner)}>
          {!partner.is_verified && !partner.is_active && (
            <TableAction
              label="Review registration"
              icon={<ShieldCheck className="h-4 w-4" />}
              onSelect={() => {
                setReviewPartner({
                  id: partner.id,
                  name: partner.name || "",
                  assignedManagerId: partner.assigned_manager_id || undefined,
                });
                setIsReviewOpen(true);
              }}
            />
          )}
          <TableAction
            label="Edit advisor"
            icon={<Pencil className="h-4 w-4" />}
            href={`/admin/advisors/${partner.id}/edit`}
            primary
          />
          {partner.is_active && !partner.last_login && (
            <TableAction
              label="Resend approval email"
              icon={<Mail className="h-4 w-4" />}
              onSelect={() => {
                setResendTarget({ id: partner.id, name: partner.name || "" });
                setIsResendOpen(true);
              }}
            />
          )}
          <TableAction
            label={partner.is_active ? "Suspend account" : "Activate account"}
            icon={
              partner.is_active ? (
                <Ban className="h-4 w-4" />
              ) : (
                <Power className="h-4 w-4" />
              )
            }
            onSelect={() => {
              setSuspendTarget(partner);
              setIsSuspendOpen(true);
            }}
          />
        </TableActions>
      ),
    },
  ];

  return (
    <div className="mt-6 min-w-0 overflow-hidden rounded-ub-xl border border-ub-border bg-ub-surface">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6 border-b border-ub-border">
        <div>
          <p className="mt-0.5 text-sm text-ub-text-secondary">
            Manage and view all advisor organizations
          </p>
        </div>
      </div>

      <Tabs<PartnersTab>
        tabs={TABS}
        active={activeTab}
        onChange={setActiveTab}
        variant="underline"
        idPrefix={tabId}
        aria-label="Advisor directory sections"
      />
      <div {...tabPanelProps(tabId, activeTab)}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: MICRO_DURATION, ease: EASE }}
          >
            {activeTab === "pending-otps" && <PendingRegistrationOtpsTable />}

            {activeTab === "partners" && (
              <>
                {/* Stats Cards */}
                <div className="border-b border-ub-border p-4 sm:p-6">
                  <StatsFilterCards
                    className="grid grid-cols-2 gap-3 lg:grid-cols-4 [&_button]:gap-2 [&_button]:p-3"
                    cards={statsCards}
                    selectedId={selectedStatus}
                    onSelect={handleCardSelect}
                  />
                </div>

                <div className="border-b border-ub-border p-4 sm:p-6">
                  <AdvisorDirectoryToolbar
                    search={searchTerm}
                    onSearch={setSearchTerm}
                    total={total}
                    loading={isRefetching}
                    onClear={clearFilters}
                    manager={selectedManager}
                    status={selectedStatus}
                    managers={managerOptions}
                    onApply={(manager, status) => {
                      setSelectedManager(manager);
                      setSelectedStatus(status);
                      setCurrentPage(1);
                    }}
                  />
                </div>

                <div className={`min-w-0 ${tableSectionPadding}`}>
                  {/* Table */}
                  <DataTable
                    columns={columns}
                    rows={partners}
                    getRowId={(partner) => partner.id}
                    getRowHref={(partner) => `/admin/advisors/${partner.id}`}
                    caption="Advisor directory"
                    loading={isInitialLoad}
                    error={error}
                    onRetry={refetch}
                    getRowClassName={() => "md:[&>td]:py-4"}
                    scrollClassName="max-h-[60dvh] overflow-y-auto overscroll-contain md:max-h-[65dvh]"
                    empty={{
                      title: "No advisors found",
                      description: "Try another search or adjust your filters.",
                    }}
                    footer={
                      <TablePagination
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                        itemsPerPage={ITEMS_PER_PAGE}
                        itemCount={partners.length}
                        totalCount={total}
                        itemLabel="advisors"
                        loading={loading}
                      />
                    }
                  />
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {reviewPartner && (
          <ReviewPartnerPopup
            isOpen={isReviewOpen}
            onClose={() => setIsReviewOpen(false)}
            onSuccess={refetch}
            partnerId={reviewPartner.id}
            partnerName={reviewPartner.name}
            managerOptions={managerOptions}
            currentManagerId={reviewPartner.assignedManagerId}
          />
        )}

        {resendTarget && (
          <ResendApprovalEmailConfirmation
            isOpen={isResendOpen}
            onClose={() => setIsResendOpen(false)}
            onConfirm={handleResendEmail}
            isSending={isResendingEmail}
            partnerName={resendTarget.name}
            cooldownSeconds={getResendCooldownSeconds(resendTarget.id)}
          />
        )}

        {suspendTarget && (
          <SuspendActivatePartner
            isOpen={isSuspendOpen}
            onClose={() => setIsSuspendOpen(false)}
            onConfirm={handleSuspendActivate}
            isSubmitting={isUpdatingPartner}
            partnerName={suspendTarget.name || ""}
            isActive={!!suspendTarget.is_active}
          />
        )}

        {deleteTarget && (
          <DeletePartner
            isOpen={isDeleteOpen}
            onClose={() => setIsDeleteOpen(false)}
            onConfirm={handleDelete}
            isDeleting={isDeletingPartner}
          />
        )}
      </div>
    </div>
  );
}
