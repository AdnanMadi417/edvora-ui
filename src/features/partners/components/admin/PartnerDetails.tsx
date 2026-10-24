"use client";

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
import { EASE, MICRO_DURATION } from "components/ui/FadeIn";
import { usePartnerDetails, useUpdateAgencyMemberStatus } from "features/partners/hooks";
import { useAccountManagers } from "features/account-managers/hooks";
import SuspendReactivateMemberModal from "features/agency-members/components/partner/SuspendReactivateMemberModal";
import type { AgencyMember } from "features/agency-members/types";
import Loading from "components/loading/Loading";
import EmptyData from "components/emptyData/EmptyTableData";
import { useToast } from "components/context/ToastContext";
import { getDocumentDownloadUrl } from "services/documentService";
import { parseApiError } from "utils/parseApiError";
import { formatAgencyRole } from "features/partners/utils";
import { downloadFileAs, buildDocumentFileName } from "utils/documentFileName";
import PresignedImage from "components/ui/PresignedImage";
import Button from "components/ui/buttons/Button";
import IconButton from "components/ui/buttons/IconButton";
import { StatusBadge } from "components/ui/badges";
import { Tabs, type TabItem } from "components/ui/tabs";
import ReviewPartnerPopup from "./ReviewPartnerPopup";
import PartnerApplicationsTable from "./PartnerApplicationsTable";
import AdditionalManagersSection from "./AdditionalManagersSection";
import { PartnerBankAccountSection } from "features/partners/bank-accounts";
import { PayoutStatementSection } from "features/applications/payouts";
import { parseDate, formatDate } from "components/ui/date/utils";

interface Props {
  id: string;
}

type DetailsTab = "profile" | "team" | "bank-account" | "applications" | "statement";

function formatDateOfBirth(value?: string | null): string | undefined {
  const date = parseDate(value);
  return date ? formatDate(date, "short", "en-US") : undefined;
}

function formatDateTime(value?: string | null): string | undefined {
  const date = parseDate(value);
  return date ? formatDate(date, "datetime", "en-US") : undefined;
}

function InfoRow({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  href?: string;
}) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        {href && value ? (
          <button
            type="button"
            onClick={() => window.open(encodeURI(href), "_blank", "noopener,noreferrer")}
            className="mt-0.5 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
          >
            Visit Link <ExternalLink className="h-3 w-3" />
          </button>
        ) : (
          <p className="mt-0.5 text-sm font-medium text-slate-900">
            {value || "Not provided"}
          </p>
        )}
      </div>
    </div>
  );
}

function DocRow({ label, fileKey, personName }: { label: string; fileKey?: string | null; personName?: string | null }) {
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
            icon={<Eye className={`h-4 w-4 ${loading === "view" ? "animate-pulse" : ""}`} />}
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
            icon={<Download className={`h-4 w-4 ${loading === "download" ? "animate-pulse" : ""}`} />}
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

const VALID_TABS: DetailsTab[] = ["profile", "team", "bank-account", "applications", "statement"];

export default function PartnerDetails({ id }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const { partner, isPartnerLoading, refetch } = usePartnerDetails(id);
  const [showReview, setShowReview] = useState(false);
  // Lets a link from elsewhere (e.g. "Add a bank account" from a payout
  // flow with no account on file) land straight on the right tab.
  const requestedTab = searchParams.get("tab") as DetailsTab | null;
  const [tab, setTab] = useState<DetailsTab>(
    requestedTab && VALID_TABS.includes(requestedTab) ? requestedTab : "profile"
  );
  const [openActions, setOpenActions] = useState(false);
  const { accountManagers } = useAccountManagers();
  const managerOptions = accountManagers.map((m) => ({ label: m.name, value: m.id }));

  const [suspendTarget, setSuspendTarget] = useState<AgencyMember | null>(null);
  const { updateAgencyMemberStatus, loading: isUpdatingStatus } = useUpdateAgencyMemberStatus();

  const handleConfirmSuspendToggle = async () => {
    if (!suspendTarget) return;
    try {
      await updateAgencyMemberStatus(suspendTarget.partner_id, !suspendTarget.is_active);
      showToast(
        suspendTarget.is_active ? "Member suspended successfully." : "Member reactivated successfully.",
        "success"
      );
      setSuspendTarget(null);
      refetch();
    } catch (error: unknown) {
      showToast(parseApiError(error, "Please try again."), "error");
    }
  };

  if (isPartnerLoading) return <Loading text="Loading advisor details..." />;
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

    <div className="mx-auto mt-6 max-w-5xl">
      <div className="rounded-lg border border-slate-200 bg-white">

        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="relative shrink-0">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                <PresignedImage
                  fileKey={(isIndividual ? partner.individual_details?.profile_photo_file_key : partner.company_details?.logo_file_key) ?? undefined}
                  alt="Profile"
                  className="h-full w-full object-cover"
                  fallback={partner.name ? partner.name.slice(0, 2).toUpperCase() : "NA"}
                />
              </div>
              <span
                className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${
                  partner.is_active ? "bg-emerald-500" : "bg-slate-300"
                }`}
              />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-slate-900">
                {isCompany ? partner.company_details?.company_name || partner.name : partner.name}
              </h2>
              <p className="truncate text-sm text-slate-500">
                {isCompany && partner.company_details?.company_name ? `${partner.name} • ` : ""}
                {partner.email}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 self-end sm:self-auto">
            {!partner.is_verified && !partner.is_active && (
              <Button
                onClick={() => setShowReview(true)}
                icon={<ShieldCheck className="h-4 w-4" />}
                text="Review"
                bgColor="bg-amber-50"
                textColor="text-amber-700"
                borderColor="border-amber-300"
                hoverTextColor="hover:text-amber-800"
                hoverBorderColor="hover:border-amber-400"
              />
            )}
            <div className="relative">
              <Button
                onClick={() => setOpenActions((v) => !v)}
                icon={<MoreVertical className="h-4 w-4" />}
                text="Actions"
                bgColor="bg-white"
                textColor="text-slate-700"
                borderColor="border-slate-200"
                hoverTextColor="hover:text-slate-700"
                hoverBorderColor="hover:border-slate-300"
                className="hover:bg-slate-50"
              />

              {openActions && (
                <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-lg border border-slate-200 bg-white ring-1 ring-black/5">
                  <div className="flex flex-col gap-2 p-2">
                    <button
                      type="button"
                      aria-label="Edit Advisor Details"
                      className="group flex w-full items-center gap-3 rounded-md border border-transparent bg-white px-4 py-3 text-left text-sm transition-all hover:border-blue-200 hover:bg-blue-50 hover:shadow-sm"
                      onClick={() => { router.push(`/admin/advisors/${id}/edit`); setOpenActions(false); }}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-200">
                        <Pencil className="h-4 w-4" />
                      </div>
                      <span className="font-semibold text-slate-900">Edit Details</span>
                    </button>

                    <button
                      type="button"
                      aria-label="Back to Advisors"
                      className="group flex w-full items-center gap-3 rounded-md border border-transparent bg-white px-4 py-3 text-left text-sm transition-all hover:border-slate-200 hover:bg-slate-50 hover:shadow-sm"
                      onClick={() => { router.push("/admin/advisors"); setOpenActions(false); }}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-600 transition-colors group-hover:bg-slate-200">
                        <ChevronLeft className="h-4 w-4" />
                      </div>
                      <span className="font-semibold text-slate-900">Back to Advisors</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <Tabs<DetailsTab> tabs={TABS} active={tab} onChange={setTab} />

        <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: MICRO_DURATION, ease: EASE }}
        >
        {tab === "profile" && (
        <>

        {/* Account Overview */}
        <div className="flex flex-col gap-4 border-b border-slate-200 p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Account Overview
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <InfoRow icon={<MdPublic className="h-4 w-4" />} label="Country of Residence" value={partner.country} />
            <InfoRow icon={<MdPublic className="h-4 w-4" />} label="Nationality" value={partner.nationality} />
            <InfoRow icon={<MdPhone className="h-4 w-4" />} label="Phone Number" value={partner.phone} />
            <InfoRow icon={<MdEmail className="h-4 w-4" />} label="Email" value={partner.email} />
            <InfoRow
              icon={<MdCategory className="h-4 w-4" />}
              label="Advisor Type"
              value={isIndividual ? "Individual Advisor" : "Agency / Company"}
            />
            <InfoRow
              icon={<MdSupervisorAccount className="h-4 w-4" />}
              label="Assigned Manager"
              value={partner.assigned_manager_name || "Not Assigned"}
            />
            <InfoRow
              icon={<MdToggleOn className="h-4 w-4" />}
              label="Account Status"
              value={partner.is_active ? "Active" : "Inactive"}
            />
            <InfoRow
              icon={<ShieldCheck className="h-4 w-4" />}
              label="Verification Status"
              value={partner.is_verified ? "Verified" : "Pending Verification"}
            />
            <InfoRow
              icon={<CalendarDays className="h-4 w-4" />}
              label="Registered"
              value={formatDateOfBirth(partner.created_at)}
            />
            <InfoRow
              icon={<Clock className="h-4 w-4" />}
              label="Last Updated"
              value={formatDateTime(partner.updated_at)}
            />
            <InfoRow
              icon={<Clock className="h-4 w-4" />}
              label="Last Login"
              value={formatDateTime(partner.last_login) || "Never"}
            />
            {partner.agency_role && (
              <InfoRow
                icon={<ShieldCheck className="h-4 w-4" />}
                label="Agency Role"
                value={formatAgencyRole(partner.agency_role)}
              />
            )}
            {partner.agency_membership && (
              <InfoRow icon={<Users className="h-4 w-4" />} label="Member Of" value={partner.agency_membership.agency_name} />
            )}
          </div>
        </div>

        {/* Additional (shared) managers — UBX-324 */}
        <AdditionalManagersSection partner={partner} accountManagers={accountManagers} onChanged={refetch} />

        {/* Individual Details */}
        {isIndividual && (
          <div className="flex flex-col gap-4 border-b border-slate-200 p-6">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-slate-500" />
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Individual Details
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <InfoRow
                icon={<Briefcase className="h-4 w-4" />}
                label="Background"
                value={partner.individual_details?.background}
              />
              <InfoRow
                icon={<Link2 className="h-4 w-4" />}
                label="LinkedIn"
                value={partner.individual_details?.linkedin_url}
                href={partner.individual_details?.linkedin_url || undefined}
              />
              <InfoRow
                icon={<Link2 className="h-4 w-4" />}
                label="Social Media"
                value={partner.individual_details?.social_media_url}
                href={partner.individual_details?.social_media_url || undefined}
              />
              <InfoRow
                icon={<MdCategory className="h-4 w-4" />}
                label="Date of Birth"
                value={formatDateOfBirth(partner.individual_details?.date_of_birth)}
              />
              <InfoRow
                icon={<MdCategory className="h-4 w-4" />}
                label="Passport Number"
                value={partner.individual_details?.passport_number}
              />
            </div>
            <div className="flex flex-col gap-2">
              <DocRow
                label="Passport Photo"
                fileKey={partner.individual_details?.passport_photo_file_key}
                personName={partner.name}
              />
            </div>
          </div>
        )}

        {/* Company Info */}
        {isCompany && (
          <div className="flex flex-col gap-4 border-b border-slate-200 p-6">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-slate-500" />
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Company Info
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <InfoRow
                icon={<Briefcase className="h-4 w-4" />}
                label="Company Name"
                value={partner.company_details?.company_name}
              />
              <InfoRow
                icon={<Link2 className="h-4 w-4" />}
                label="Website"
                value={partner.company_details?.website_url}
                href={partner.company_details?.website_url || undefined}
              />
            </div>
            <div className="flex flex-col gap-2">
              <DocRow
                label="Company Registration Document"
                fileKey={partner.company_details?.company_registration_doc_file_key}
                personName={partner.name}
              />
              <DocRow
                label="Agency Logo"
                fileKey={partner.company_details?.logo_file_key}
                personName={partner.name}
              />
            </div>
          </div>
        )}

        {/* Personal Info — the company's contact person */}
        {isCompany && (
          <div className="flex flex-col gap-4 border-b border-slate-200 p-6">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-slate-500" />
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Personal Info
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <InfoRow
                icon={<MdCategory className="h-4 w-4" />}
                label="Date of Birth"
                value={formatDateOfBirth(partner.company_details?.date_of_birth)}
              />
              <InfoRow
                icon={<MdCategory className="h-4 w-4" />}
                label="Passport Number"
                value={partner.company_details?.passport_number}
              />
            </div>
            <div className="flex flex-col gap-2">
              <DocRow
                label="Passport Photo"
                fileKey={partner.company_details?.passport_photo_file_key}
                personName={partner.name}
              />
            </div>
          </div>
        )}

        </>
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
              <p className="py-8 text-center text-sm text-slate-500">No team members yet.</p>
            ) : (
            <div className="flex flex-col gap-2">
              {partner.agency_members.map((member) => (
                <div
                  key={member.id}
                  onClick={() => router.push(`/admin/advisors/${member.partner_id}`)}
                  className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 p-3 transition-colors hover:border-blue-300 hover:bg-blue-50/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{member.name}</p>
                    <p className="truncate text-xs text-slate-500">{member.email}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {member.is_active ? (
                      <StatusBadge variant="success">Active</StatusBadge>
                    ) : (
                      <StatusBadge variant="neutral">Suspended</StatusBadge>
                    )}
                    <IconButton
                      onClick={(e) => { e.stopPropagation(); setSuspendTarget(member); }}
                      title={member.is_active ? "Suspend member" : "Reactivate member"}
                      icon={member.is_active ? <Ban className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                      bgColor="bg-transparent"
                      textColor={member.is_active ? "text-slate-400" : "text-emerald-600"}
                      borderColor="border-transparent"
                      hoverTextColor={member.is_active ? "hover:text-red-600" : "hover:text-emerald-700"}
                      hoverBorderColor="hover:border-transparent"
                      className={member.is_active ? "hover:bg-red-50" : "hover:bg-emerald-50"}
                    />
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        )}

        {/* Bank Account */}
        {tab === "bank-account" && <PartnerBankAccountSection partner={partner} />}

        {/* Applications */}
        {tab === "applications" && <PartnerApplicationsTable partnerId={id} />}

        {/* Statement */}
        {tab === "statement" && <PayoutStatementSection partnerId={id} canOpenPayout />}
        </motion.div>
        </AnimatePresence>
      </div>
    </div>
    </>
  );
}
