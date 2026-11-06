"use client";

import { useId as useTabId } from "react";
import AdvisorProfileOverview from "../shared/AdvisorProfileOverview";
import AdvisorProfileHeader from "../shared/AdvisorProfileHeader";
import SectionCard from "components/ub/data/cards/SectionCard";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MdCategory,
  MdEmail,
  MdPhone,
  MdPublic,
  MdSupervisorAccount,
  MdToggleOn,
} from "react-icons/md";
import {
  Ban,
  Briefcase,
  CalendarDays,
  ChevronLeft,
  Clock,
  Download,
  Eye,
  ExternalLink,
  FileText,
  Link2,
  MoreVertical,
  Pencil,
  Power,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { EASE, MICRO_DURATION } from "components/ub/core/motion/FadeIn";
import {
  usePartnerDetails,
  useUpdateAgencyMemberStatus,
} from "features/partners/hooks";
import { useAccountManagers } from "features/account-managers/hooks";
import SuspendReactivateMemberModal from "features/agency-members/components/partner/SuspendReactivateMemberModal";
import type { AgencyMember } from "features/agency-members/types";
import Loading from "components/ub/feedback/states/Loading";
import EmptyData from "components/ub/feedback/states/EmptyTableData";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { getDocumentDownloadUrl } from "services/documentService";
import { parseApiError } from "utils/parseApiError";
import { formatAgencyRole } from "features/partners/utils";
import { downloadFileAs, buildDocumentFileName } from "utils/documentFileName";
import PresignedImage from "components/ub/data/media/PresignedImage";
import Button from "components/ub/core/buttons/Button";
import IconButton from "components/ub/core/buttons/IconButton";
import StatusBadge from "components/ub/data/badges/StatusBadge";
import Tabs, { tabPanelProps } from "components/ub/navigation/controls/Tabs";
import type { TabItem } from "components/ub/navigation/controls/Tabs";
import ReviewPartnerPopup from "./ReviewPartnerPopup";
import PartnerApplicationsTable from "./PartnerApplicationsTable";
import AdditionalManagersSection from "./AdditionalManagersSection";
import { PartnerBankAccountSection } from "features/partners/bank-accounts";
import { PayoutStatementSection } from "features/applications/payouts";

interface Props {
  id: string;
}

type DetailsTab =
  | "profile"
  | "team"
  | "bank-account"
  | "applications"
  | "statement";



function DocRow({
  label,
  fileKey,
  personName,
}: {
  label: string;
  fileKey?: string | null;
  personName?: string | null;
}) {
  const [loading, setLoading] = useState<"view" | "download" | null>(null);
  const { showToast } = useToast();

  const handleView = async () => {
    if (!fileKey || loading) return;
    setLoading("view");
    try {
      const url = await getDocumentDownloadUrl(fileKey);
      window.open(url, "_blank");
    } catch {
      showToast("Failed to load document.", "error");
    } finally {
      setLoading(null);
    }
  };

  const handleDownload = async () => {
    if (!fileKey || loading) return;
    setLoading("download");
    try {
      const url = await getDocumentDownloadUrl(fileKey);
      const fileName = buildDocumentFileName(personName || "", label, fileKey);
      await downloadFileAs(url, fileName);
    } catch {
      showToast("Failed to download document.", "error");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-2 sm:flex-1">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <FileText className="h-5 w-5" />
        </div>
        <p className="truncate text-sm font-semibold text-slate-800">{label}</p>
      </div>
      {fileKey ? (
        <div className="flex shrink-0 items-center gap-2 sm:ml-4">
          <IconButton
            onClick={handleView}
            disabled={!!loading}
            title="View document"
            icon={
              <Eye
                className={`h-4 w-4 ${
                  loading === "view" ? "animate-pulse" : ""
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
          <IconButton
            onClick={handleDownload}
            disabled={!!loading}
            title="Download document"
            icon={
              <Download
                className={`h-4 w-4 ${
                  loading === "download" ? "animate-pulse" : ""
                }`}
              />
            }
            bgColor="bg-green-50"
            textColor="text-green-600"
            borderColor="border-transparent"
            hoverTextColor="hover:text-green-600"
            hoverBorderColor="hover:border-green-200"
            className="hover:bg-green-100"
          />
        </div>
      ) : (
        <span className="text-xs text-slate-400 sm:ml-4">Not uploaded</span>
      )}
    </div>
  );
}

const VALID_TABS: DetailsTab[] = [
  "profile",
  "team",
  "bank-account",
  "applications",
  "statement",
];

export default function PartnerDetails({ id }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const { partner, isPartnerLoading, partnerError, refetch } =
    usePartnerDetails(id);
  const [showReview, setShowReview] = useState(false);
  // Lets a link from elsewhere (e.g. "Add a bank account" from a payout
  // flow with no account on file) land straight on the right tab.
  const requestedTab = searchParams.get("tab") as DetailsTab | null;
  const tabId = useTabId();
  const [tab, setTab] = useState<DetailsTab>(
    requestedTab && VALID_TABS.includes(requestedTab) ? requestedTab : "profile"
  );
  const [openActions, setOpenActions] = useState(false);
  const { accountManagers } = useAccountManagers();
  const managerOptions = accountManagers.map((m) => ({
    label: m.name,
    value: m.id,
  }));

  const [suspendTarget, setSuspendTarget] = useState<AgencyMember | null>(null);
  const { updateAgencyMemberStatus, loading: isUpdatingStatus } =
    useUpdateAgencyMemberStatus();

  const handleConfirmSuspendToggle = async () => {
    if (!suspendTarget) return;
    try {
      await updateAgencyMemberStatus(
        suspendTarget.partner_id,
        !suspendTarget.is_active
      );
      showToast(
        suspendTarget.is_active
          ? "Member suspended successfully."
          : "Member reactivated successfully.",
        "success"
      );
      setSuspendTarget(null);
      refetch();
    } catch (error: unknown) {
      showToast(parseApiError(error, "Please try again."), "error");
    }
  };

  if (isPartnerLoading) return <Loading text="Loading advisor details..." />;
  if (partnerError)
    return (
      <SectionCard
        title="Advisor details"
        state="error"
        errorMessage={partnerError}
      />
    );
  if (!partner) return <EmptyData />;

  const isIndividual = partner.type === "individual";
  const isCompany = partner.type === "agency";

  const TABS: TabItem<DetailsTab>[] = isCompany
    ? [
        { key: "profile", label: "Profile" },
        { key: "team", label: "Team" },
        { key: "bank-account", label: "Bank Account" },
        { key: "applications", label: "Applications" },
        { key: "statement", label: "Commission Tracker" },
      ]
    : [
        { key: "profile", label: "Profile" },
        { key: "bank-account", label: "Bank Account" },
        { key: "applications", label: "Applications" },
        { key: "statement", label: "Commission Tracker" },
      ];

  return (
    <>
      <ReviewPartnerPopup
        isOpen={showReview}
        onClose={() => setShowReview(false)}
        onSuccess={refetch}
        partnerId={id}
        partnerName={partner.name || ""}
        managerOptions={managerOptions}
        currentManagerId={partner.assigned_manager_id || undefined}
      />

      <SuspendReactivateMemberModal
        isOpen={!!suspendTarget}
        onClose={() => setSuspendTarget(null)}
        onConfirm={handleConfirmSuspendToggle}
        isSubmitting={isUpdatingStatus}
        memberName={suspendTarget?.name || ""}
        isActive={!!suspendTarget?.is_active}
      />

      <div className="mx-auto mt-6 min-w-0">
        <div className="min-w-0 overflow-hidden rounded-ub-xl border border-ub-border bg-ub-surface">
          {/* Header */}
          <AdvisorProfileHeader
            partner={partner}
            basePath="/admin/advisors"
            editable={true}
            actions={
              !partner.is_verified && !partner.is_active ? (
                <IconButton
                  title="Review registration"
                  variant="secondary"
                  icon={<ShieldCheck className="h-4 w-4" />}
                  onClick={() => setShowReview(true)}
                />
              ) : undefined
            }
          />

          <Tabs<DetailsTab>
            tabs={TABS}
            active={tab}
            onChange={setTab}
            variant="underline"
            idPrefix={tabId}
            aria-label="Advisor sections"
          />
          <div {...tabPanelProps(tabId, tab)}>
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: MICRO_DURATION, ease: EASE }}
              >
                {tab === "profile" && (
                  <AdvisorProfileOverview
                    partner={partner}
                    renderDocument={(label, fileKey) => (
                      <DocRow
                        label={label}
                        fileKey={fileKey}
                        personName={partner.name}
                      />
                    )}
                    managers={
                      <AdditionalManagersSection
                        partner={partner}
                        accountManagers={accountManagers}
                        onChanged={refetch}
                      />
                    }
                  />
                )}
                {/* Team Members */}
                {isCompany && tab === "team" && (
                  <div className="flex flex-col gap-4 p-6">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-500" />
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Team Members
                      </p>
                    </div>
                    {!partner.agency_members?.length ? (
                      <p className="py-8 text-center text-sm text-slate-500">
                        No team members yet.
                      </p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {partner.agency_members.map((member) => (
                          <div
                            key={member.id}
                            onClick={() =>
                              router.push(
                                `/admin/advisors/${member.partner_id}`
                              )
                            }
                            className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 p-3 transition-colors hover:border-blue-300 hover:bg-blue-50/40"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-slate-900">
                                {member.name}
                              </p>
                              <p className="truncate text-xs text-slate-500">
                                {member.email}
                              </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              {member.is_active ? (
                                <StatusBadge variant="success">
                                  Active
                                </StatusBadge>
                              ) : (
                                <StatusBadge variant="neutral">
                                  Suspended
                                </StatusBadge>
                              )}
                              <IconButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSuspendTarget(member);
                                }}
                                title={
                                  member.is_active
                                    ? "Suspend member"
                                    : "Reactivate member"
                                }
                                icon={
                                  member.is_active ? (
                                    <Ban className="h-4 w-4" />
                                  ) : (
                                    <Power className="h-4 w-4" />
                                  )
                                }
                                bgColor="bg-transparent"
                                textColor={
                                  member.is_active
                                    ? "text-slate-400"
                                    : "text-emerald-600"
                                }
                                borderColor="border-transparent"
                                hoverTextColor={
                                  member.is_active
                                    ? "hover:text-red-600"
                                    : "hover:text-emerald-700"
                                }
                                hoverBorderColor="hover:border-transparent"
                                className={
                                  member.is_active
                                    ? "hover:bg-red-50"
                                    : "hover:bg-emerald-50"
                                }
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Bank Account */}
                {tab === "bank-account" && (
                  <PartnerBankAccountSection partner={partner} viewer="staff" />
                )}

                {/* Applications */}
                {tab === "applications" && (
                  <PartnerApplicationsTable partnerId={id} />
                )}

                {/* Statement */}
                {tab === "statement" && (
                  <PayoutStatementSection partnerId={id} canOpenPayout />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}
