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
  User,
} from "lucide-react";
import { useAccountManagerPartnerDetails } from "features/partners/hooks";
import Loading from "components/loading/Loading";
import EmptyData from "components/emptyData/EmptyTableData";
import { useToast } from "components/context/ToastContext";
import { getDocumentDownloadUrl } from "services/documentService";
import { downloadFileAs, buildDocumentFileName } from "utils/documentFileName";
import PresignedImage from "components/ui/PresignedImage";
import Button from "components/ui/buttons/Button";
import IconButton from "components/ui/buttons/IconButton";
import { parseDate, formatDate } from "components/ui/date/utils";
import AccountManagerPartnerApplicationsTable from "./AccountManagerPartnerApplicationsTable";

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
    <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        {href && value ? (
          <button
            type="button"
            onClick={() => window.open(href, "_blank", "noopener,noreferrer")}
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
    <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <FileText className="h-5 w-5" />
        </div>
        <p className="truncate text-sm font-semibold text-slate-800">{label}</p>
      </div>
      {fileKey ? (
        <div className="ml-4 flex shrink-0 items-center gap-2">
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
        <span className="ml-4 text-xs text-slate-400">Not uploaded</span>
      )}
    </div>
  );
}

export default function AccountManagerPartnerProfile({ id }: Props) {
  const router = useRouter();
  const { partner, isPartnerLoading } = useAccountManagerPartnerDetails(id);

  if (isPartnerLoading) return <Loading text="Loading partner details..." />;
  if (!partner) return <EmptyData />;

  const isIndividual = partner.type === "individual";
  const isCompany = partner.type === "agency";

  return (
    <div className="mx-auto mt-6 max-w-5xl">
      <div className="rounded-lg border border-slate-200 bg-white">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-4">
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
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{partner.name || "Unknown Partner"}</h2>
              <p className="text-sm text-slate-500">{partner.email}</p>
            </div>
          </div>

          <Button
            onClick={() => router.push("/account-manager/partners")}
            icon={<ChevronLeft className="h-4 w-4" />}
            text="Back"
            bgColor="bg-white"
            textColor="text-slate-700"
            borderColor="border-slate-200"
            hoverTextColor="hover:text-slate-900"
            hoverBorderColor="hover:border-slate-300"
          />
        </div>

        {/* Account Overview */}
        <div className="border-b border-slate-200 p-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Account Overview
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <InfoRow icon={<MdPublic className="h-4 w-4" />} label="Country" value={partner.country} />
            <InfoRow icon={<MdPhone className="h-4 w-4" />} label="Phone Number" value={partner.phone} />
            <InfoRow icon={<MdEmail className="h-4 w-4" />} label="Email" value={partner.email} />
            <InfoRow
              icon={<MdCategory className="h-4 w-4" />}
              label="Partner Type"
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
          </div>
        </div>

        {/* Individual Details */}
        {isIndividual && (
          <div className="border-b border-slate-200 p-6">
            <div className="mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-slate-500" />
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Individual Details
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
            <div className="mt-3 space-y-2">
              <DocRow
                label="Identity Document"
                fileKey={partner.individual_details?.id_document_file_key}
                personName={partner.name}
              />
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
          <div className="border-b border-slate-200 p-6">
            <div className="mb-4 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-slate-500" />
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Company Details
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
            <div className="mt-3 space-y-2">
              <DocRow
                label="Company Registration Document"
                fileKey={partner.company_details?.company_registration_doc_file_key}
                personName={partner.name}
              />
              <DocRow
                label="Contact Identity Document"
                fileKey={partner.company_details?.contact_id_document_file_key}
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

      {/* Applications submitted by this partner */}
      <div className="mt-6">
        <AccountManagerPartnerApplicationsTable partnerId={id} />
      </div>
    </div>
  );
}
