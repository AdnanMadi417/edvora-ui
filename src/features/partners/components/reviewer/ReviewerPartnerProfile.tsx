"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MdCategory,
  MdEmail,
  MdPhone,
  MdPublic,
  MdToggleOn,
  MdCake,
} from "react-icons/md";
import {
  Briefcase,
  CalendarDays,
  ChevronLeft,
  Clock,
  Download,
  Eye,
  ExternalLink,
  FileText,
  Link2,
  Pencil,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import { usePartnerDetails } from "features/partners/hooks";
import { formatAgencyRole } from "features/partners/utils";
import Loading from "components/ub/feedback/Loading";
import EmptyData from "components/ub/feedback/EmptyTableData";
import { useToast } from "components/ub/feedback/ToastContext";
import { getDocumentDownloadUrl } from "services/documentService";
import { downloadFileAs, buildDocumentFileName } from "utils/documentFileName";
import PresignedImage from "components/ub/data/PresignedImage";
import Button from "components/ub/core/Button";
import IconButton from "components/ub/core/IconButton";
import StatusBadge from "components/ub/data/StatusBadge";
import Tabs from "components/ub/navigation/Tabs";
import type { TabItem } from "components/ub/navigation/Tabs";
import { parseDate, formatDate } from "components/ub/data/appDateUtils";

type DetailsTab = "profile" | "team";

function formatDateOfBirth(value?: string | null): string | undefined {
  const date = parseDate(value);
  return date ? formatDate(date, "short", "en-US") : undefined;
}

function formatDateTime(value?: string | null): string | undefined {
  const date = parseDate(value);
  return date ? formatDate(date, "datetime", "en-US") : undefined;
}

interface Props {
  id: string;
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

export default function ReviewerPartnerProfile({ id }: Props) {
  const router = useRouter();
  const { partner, isPartnerLoading } = usePartnerDetails(id);
  const [tab, setTab] = useState<DetailsTab>("profile");

  if (isPartnerLoading) return <Loading text="Loading advisor details..." />;
  if (!partner) return <EmptyData />;

  const isIndividual = partner.type === "individual";
  const isCompany = partner.type === "agency";

  const TABS: TabItem<DetailsTab>[] = isCompany
    ? [
        { key: "profile", label: "Profile" },
        { key: "team", label: "Team" },
      ]
    : [{ key: "profile", label: "Profile" }];

  return (
    <div className="mx-auto mt-6 ">
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
                {isCompany ? partner.company_details?.company_name || partner.name || "Unknown Advisor" : partner.name || "Unknown Advisor"}
              </h2>
              <p className="truncate text-sm text-slate-500">
                {isCompany && partner.company_details?.company_name ? `${partner.name} • ` : ""}
                {partner.email}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 self-end sm:self-auto">
            <Button
              onClick={() => router.push("/reviewer/advisors")}
              icon={<ChevronLeft className="h-4 w-4" />}
              text="Back"
              bgColor="bg-white"
              textColor="text-slate-700"
              borderColor="border-slate-200"
              hoverTextColor="hover:text-slate-900"
              hoverBorderColor="hover:border-slate-300"
            />
            <Button
              onClick={() => router.push(`/reviewer/advisors/${id}/edit`)}
              icon={<Pencil className="h-4 w-4" />}
              text="Edit Advisor"
              bgColor="bg-blue-600"
              textColor="text-white"
              borderColor="border-blue-600"
              hoverTextColor="hover:text-white"
              hoverBorderColor="hover:border-blue-700"
              className="hover:bg-blue-700"
            />
          </div>
        </div>

        <Tabs<DetailsTab> tabs={TABS} active={tab} onChange={setTab} />

        {tab === "profile" && (
        <div key={tab} className="animate-in fade-in duration-200">

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
              icon={<MdToggleOn className="h-4 w-4" />}
              label="Account Status"
              value={partner.is_active ? "Active" : "Inactive"}
            />
            <InfoRow
              icon={<CalendarDays className="h-4 w-4" />}
              label="Registered"
              value={formatDateOfBirth(partner.created_at)}
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
                icon={<MdCake className="h-4 w-4" />}
                label="Date of Birth"
                value={formatDateOfBirth(partner.individual_details?.date_of_birth)}
              />
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
                label="Passport Number"
                value={partner.individual_details?.passport_number}
              />
            </div>
            <div className="flex flex-col gap-2">
              <DocRow
                label="Profile Photo"
                fileKey={partner.individual_details?.profile_photo_file_key}
                personName={partner.name}
              />
              <DocRow
                label="Passport Photo"
                fileKey={partner.individual_details?.passport_photo_file_key}
                personName={partner.name}
              />
            </div>
          </div>
        )}

        {/* Company Details */}
        {isCompany && (
          <div className="flex flex-col gap-4 border-b border-slate-200 p-6">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-slate-500" />
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Company Details
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
              <InfoRow
                icon={<MdCake className="h-4 w-4" />}
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
                label="Company Registration Document"
                fileKey={partner.company_details?.company_registration_doc_file_key}
                personName={partner.name}
              />
              <DocRow
                label="Passport Photo"
                fileKey={partner.company_details?.passport_photo_file_key}
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

        </div>
        )}

        {/* Team Members */}
        {isCompany && tab === "team" && (
          <div key={tab} className="flex flex-col gap-4 p-6 animate-in fade-in duration-200">
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
                    onClick={() => router.push(`/reviewer/advisors/${member.partner_id}`)}
                    className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 p-3 transition-colors hover:border-blue-300 hover:bg-blue-50/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{member.name}</p>
                      <p className="truncate text-xs text-slate-500">{member.email}</p>
                    </div>
                    {member.is_active ? (
                      <StatusBadge variant="success">Active</StatusBadge>
                    ) : (
                      <StatusBadge variant="neutral">Suspended</StatusBadge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
