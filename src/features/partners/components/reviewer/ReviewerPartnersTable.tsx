"use client";
import TableActions, {
  TableAction,
} from "components/ub/data/tables/TableActions";
import DataTable, {
  type DataTableColumn,
} from "components/ub/data/tables/DataTable";
import type { Partner } from "features/partners/types";
import AdvisorDirectoryToolbar from "../shared/AdvisorDirectoryToolbar";

import { useId as useTabId } from "react";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  RefreshCw,
  Users,
  UserCog,
  BadgeCheck,
  CalendarDays,
  Pencil,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Ban,
  Power,
  Clock,
  Handshake,
  SlidersHorizontal,
  Building2,
  User,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import AppDate from "components/ub/data/formatting/AppDate";
import StatusBadge from "components/ub/data/badges/StatusBadge";
import { usePartners, useUpdatePartner } from "features/partners/hooks";
import { useAccountManagers } from "features/account-managers/hooks";
import ReviewPartnerPopup from "../admin/ReviewPartnerPopup";
import SuspendActivatePartner from "../admin/SuspendActivatePartner";
import PendingRegistrationOtpsTable from "../admin/PendingRegistrationOtpsTable";
import Tabs, { tabPanelProps } from "components/ub/navigation/controls/Tabs";
import type { TabItem } from "components/ub/navigation/controls/Tabs";
import StatsFilterCards, {
  type FilterCardItem,
} from "components/ub/navigation/controls/StatsFilterCards";
import TablePagination from "components/ub/data/tables/TablePagination";
import PresignedImage from "components/ub/data/media/PresignedImage";
import Button from "components/ub/core/buttons/Button";
import IconButton from "components/ub/core/buttons/IconButton";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { parseApiError } from "utils/parseApiError";

const ITEMS_PER_PAGE = 10;

type ReviewerPartnersTab = "partners" | "pending-otps";

const TABS: TabItem<ReviewerPartnersTab>[] = [
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

export default function ReviewerPartnersTable() {
  const router = useRouter();
  const tabId = useTabId();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedManager, setSelectedManager] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<ReviewerPartnersTab>(
    searchParams.get("tab") === "pending-otps" ? "pending-otps" : "partners"
  );

  const { accountManagers } = useAccountManagers();
  const managerOptions = accountManagers.map((m) => ({
    label: m.name,
    value: m.id,
  }));

  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewPartner, setReviewPartner] = useState<{
    id: string;
    name: string;
    assignedManagerId?: string;
  } | null>(null);

  const { showToast } = useToast();
  const { updatePartner, isUpdatingPartner } = useUpdatePartner();
  const [isSuspendOpen, setIsSuspendOpen] = useState(false);
  const [suspendTarget, setSuspendTarget] = useState<any>(null);

  const handleSuspendActivate = async () => {
    if (!suspendTarget) return;
    try {
      // Only the field actually changing — see PartnersTable.tsx for why
      // sending the whole stale row here is dangerous.
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

  const loadingStartedRef = React.useRef(false);
  useEffect(() => {
    if (loading) {
      loadingStartedRef.current = true;
    } else if (loadingStartedRef.current) {
      setHasLoadedOnce(true);
    }
  }, [loading]);

  const isInitialLoad = !hasLoadedOnce;
  const isRefetching = loading && hasLoadedOnce;

  const statsCards = useMemo<FilterCardItem[]>(
    () => [
      {
        id: "active",
        label: "Active",
        count: stats?.active ?? 0,
        icon: CheckCircle,
        colorScheme: "emerald",
      },
      {
        id: "inactive",
        label: "Suspended",
        count: stats?.inactive ?? 0,
        icon: XCircle,
        colorScheme: "rose",
      },
      {
        id: "individual",
        label: "Individual",
        count: stats?.individual ?? 0,
        icon: User,
        colorScheme: "violet",
      },
      {
        id: "agency",
        label: "Company",
        count: stats?.agency ?? 0,
        icon: Building2,
        colorScheme: "cyan",
      },
    ],
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

  const columns: DataTableColumn<Partner>[] = [
    {
      key: "0",
      header: "Advisor",
      cell: (partner) => (
        <>
          <div className="flex items-center gap-2">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ub-tone-brand-bg text-sm font-semibold text-ub-text-link">
              <PresignedImage
                fileKey={
                  (partner.type === "individual"
                    ? partner.individual_details?.profile_photo_file_key
                    : partner.company_details?.logo_file_key) ?? undefined
                }
                alt={partner.name}
                className="h-full w-full object-cover"
                fallback={
                  partner.name ? partner.name.slice(0, 2).toUpperCase() : "NA"
                }
              />
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-ub-surface ${
                  partner.is_active ? "bg-ub-tone-success-dot" : "bg-ub-tone-neutral-dot"
                }`}
              />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-ub-text-primary">
                {partner.type === "agency"
                  ? partner.company_details?.company_name ||
                    partner.name ||
                    "Unknown Advisor"
                  : partner.name || "Unknown Advisor"}
              </div>
              <div className="truncate text-xs text-ub-text-secondary capitalize">
                {partner.type === "agency" &&
                partner.company_details?.company_name
                  ? `${partner.name} · `
                  : ""}
                {partner.type || "—"} · {partner.country || "—"}
              </div>
            </div>
          </div>
        </>
      ),
    },
    {
      key: "1",
      header: "Contact info",
      cell: (partner) => (
        <>
          <div className="truncate text-sm text-ub-text-primary">
            {partner.phone || "—"}
          </div>
          <div className="truncate text-xs text-ub-text-secondary">
            {partner.email || "—"}
          </div>
        </>
      ),
    },
    {
      key: "2",
      header: "Assigned manager",
      cell: (partner) => (
        <>
          <div className="truncate text-sm text-ub-text-primary">
            {partner.assigned_manager_name || (
              <span className="text-ub-text-tertiary">Unassigned</span>
            )}
          </div>
        </>
      ),
    },
    {
      key: "3",
      header: "Status",
      cell: (partner) => (
        <>
          <div className="flex flex-wrap items-center gap-2">
            {!partner.is_verified && !partner.is_active ? (
              <StatusBadge
                variant="warning"
                icon={<Clock className="h-3 w-3" />}
              >
                Pending review
              </StatusBadge>
            ) : partner.is_active ? (
              <StatusBadge
                variant="success"
                icon={<CheckCircle className="h-3 w-3" />}
              >
                Active
              </StatusBadge>
            ) : (
              <StatusBadge
                variant="neutral"
                icon={<XCircle className="h-3 w-3" />}
              >
                Inactive
              </StatusBadge>
            )}
            {partner.agency_membership && (
              <StatusBadge
                variant="info"
                icon={<Building2 className="h-3 w-3" />}
              >
                Member of {partner.agency_membership.agency_name}
              </StatusBadge>
            )}
          </div>
        </>
      ),
    },
    {
      key: "4",
      header: "Registered",
      cell: (partner) => (
        <>
          <div className="text-sm text-ub-text-primary">
            <AppDate value={partner.created_at} format="short" fallback="—" />
          </div>
        </>
      ),
    },
    {
      key: "5",
      header: "Actions",
      cell: (partner) => (
        <>
          <TableActions>
            {!partner.is_verified && !partner.is_active && (
              <>
                <TableAction
                  label={"Review registration"}
                  icon={<ShieldCheck className="h-4 w-4" />}
                  onSelect={() => {
                    setReviewPartner({
                      id: partner.id,
                      name: partner.name || "",
                      assignedManagerId:
                        partner.assigned_manager_id || undefined,
                    });
                    setIsReviewOpen(true);
                  }}
                />
                <div className="h-5 border-l border-ub-border" />
              </>
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
        </>
      ),
    },
  ];

  return (
    <div className="mt-6 min-w-0 overflow-hidden rounded-ub-xl border border-ub-border bg-ub-surface">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6 border-b border-ub-border">
        <div>
          <p className="mt-0.5 text-sm text-ub-text-secondary">
            Review and approve or reject partner registrations
          </p>
        </div>
      </div>

      <Tabs<ReviewerPartnersTab>
        tabs={TABS}
        active={activeTab}
        onChange={setActiveTab}
        variant="underline"
        idPrefix={tabId}
        aria-label="Advisor registration sections"
      />
      <div {...tabPanelProps(tabId, activeTab)}>
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

            <div className="min-w-0 p-3 sm:p-6">
              <DataTable
                columns={columns}
                rows={partners}
                getRowId={(partner) => partner.id}
                getRowHref={(partner) => `/reviewer/advisors/${partner.id}`}
                caption="Advisor directory"
                loading={isInitialLoad}
                error={error}
                onRetry={refetch}
                getRowClassName={() => "md:[&>td]:py-4"}
                scrollClassName="max-h-[65dvh] overflow-y-auto overscroll-contain"
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
      </div>
    </div>
  );
}
