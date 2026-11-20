"use client";
import { tableSectionPadding } from "components/ub/recipes";
import TableActions, {
  TableAction,
} from "components/ub/data/tables/TableActions";
import DataTable, {
  type DataTableColumn,
} from "components/ub/data/tables/DataTable";
import type { Partner } from "features/partners/types";
import AdvisorDirectoryToolbar from "../shared/AdvisorDirectoryToolbar";
import AdvisorEntityCell, { advisorName } from "../shared/AdvisorEntityCell";

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
import { useMediaQuery } from "hooks/useMediaQuery";
import SplitDonuts from "components/ub/dashboard/charts/SplitDonuts";
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

type ReviewerPartnersTab = "partners" | "pending-otps";

const TABS: TabItem<ReviewerPartnersTab>[] = [
  { key: "partners", label: "Advisors" },
  { key: "pending-otps", label: "Pending registrations" },
];

type StatusFilter = "active" | "inactive" | "individual" | "agency" | "unverified" | null;

function statusToParams(status: StatusFilter): {
  is_active?: boolean;
  is_verified?: boolean;
  type?: string;
} {
  if (status === "unverified") return { is_verified: false };
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

  const wide = useMediaQuery("(min-width: 1024px)");
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
  const count = (id: string) => Number(statsCards.find((c) => c.id === id)?.count ?? 0);
  const advisorSplits = [
    {
      label: "Account",
      parts: [
        { id: "active", label: "Active", value: count("active"), color: "var(--ub-tone-success-dot)" },
        { id: "inactive", label: "Suspended", value: count("inactive"), color: "var(--ub-tone-danger-dot)" },
      ],
    },
    {
      label: "Type",
      parts: [
        { id: "individual", label: "Individual", value: count("individual"), color: "var(--ub-chart-cat-1)" },
        { id: "agency", label: "Company", value: count("agency"), color: "var(--ub-chart-cat-2)" },
      ],
    },
  ];

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

  // ?status= from a link (the home advisor rings) opens the list on that group.
  useEffect(() => {
    // "suspended" is the word people see; "inactive" is the older link.
    // Company/Individual come as ?type= (older links used ?status=).
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("type") || params.get("status");
    const status = raw === "suspended" ? "inactive" : raw === "company" ? "agency" : raw;
    if (status && ["active", "inactive", "individual", "agency", "unverified"].includes(status))
      setSelectedStatus(status as StatusFilter);
  }, []);

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
              primary
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
              {wide ? (
                <StatsFilterCards
                  className="grid grid-cols-2 gap-3 lg:grid-cols-4 [&_button]:gap-2 [&_button]:p-3"
                  cards={statsCards}
                  selectedId={selectedStatus}
                  onSelect={handleCardSelect}
                />
              ) : (
                // Phones and tablets: one donut per split (as on Applications); rows still filter.
                <SplitDonuts
                  unit="Advisors"
                  groups={advisorSplits}
                  selectedId={selectedStatus}
                  onSelect={(id) => handleCardSelect(id)}
                />
              )}
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
              <DataTable
                columns={columns}
                rows={partners}
                getRowId={(partner) => partner.id}
                getRowHref={(partner) => `/reviewer/advisors/${partner.id}`}
                caption="Advisor directory"
                loading={isInitialLoad}
                error={error}
                onRetry={refetch}
                getRowClassName={() => "lg:[&>td]:py-4"}
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
