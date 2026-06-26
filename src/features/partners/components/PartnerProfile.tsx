"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MdCategory,
  MdEmail,
  MdPhone,
  MdPublic,
  MdSupervisorAccount,
  MdToggleOn,
  MdVerified,
} from "react-icons/md";
import {
  Briefcase,
  Clock,
  ExternalLink,
  FileText,
  KeyRound,
  Link2,
  User,
} from "lucide-react";
import { usePartnerProfile } from "features/partners";
import Loading from "components/loading/Loading";
import EmptyData from "components/emptyData/EmptyTableData";
import ChangePasswordPopup from "features/partners/components/ChangePasswordPopup";
import ActionsDropdown from "components/ui/buttons/ActionsDropdown";
import { useToast } from "components/context/ToastContext";
import { getDocumentDownloadUrl } from "services/documentService";

interface PartnerDetailsProps {
  id: string;
}

function InfoRow({ icon, label, value, href }: { icon: React.ReactNode; label: string; value?: string | null; href?: string }) {
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
          <p className="mt-0.5 text-sm font-medium text-slate-900">{value || "Not provided"}</p>
        )}
      </div>
    </div>
  );
}

function DocRow({ label, fileKey }: { label: string; fileKey?: string | null }) {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleView = async () => {
    if (!fileKey || loading) return;
    setLoading(true);
    try {
      const url = await getDocumentDownloadUrl(fileKey);
      window.open(url, "_blank");
    } catch {
      showToast("Failed to load document.", "error");
    } finally {
      setLoading(false);
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
        <button
          onClick={handleView}
          disabled={loading}
          className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-transparent bg-green-50 text-green-600 transition hover:border-green-200 hover:bg-green-100 disabled:opacity-50"
          title="View document"
        >
          <ExternalLink className={`h-4 w-4 ${loading ? "animate-pulse" : ""}`} />
        </button>
      ) : (
        <span className="ml-4 text-xs text-slate-400">Not uploaded</span>
      )}
    </div>
  );
}

const PartnerDetails = ({ id }: PartnerDetailsProps) => {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const router = useRouter();

  const { partner, isPartnerLoading } = usePartnerProfile();

  const handleUpdate = () => router.push("/partner/profile/edit");

  if (isPartnerLoading) return <Loading text="Loading partner profile details..." />;
  if (!partner) return <EmptyData />;

  const isIndividual = partner.type === "individual";
  const isCompany = partner.type === "company";

  return (
    <>
      <ChangePasswordPopup isOpen={showChangePassword} onClose={() => setShowChangePassword(false)} />

      <div className="mx-auto mt-6 max-w-5xl">
        <div className="rounded-lg border border-slate-200 bg-white">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                  {partner.name ? partner.name.slice(0, 2).toUpperCase() : "NA"}
                </div>
                <span className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${partner.is_active ? "bg-emerald-500" : "bg-slate-300"}`} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{partner.name}</h2>
                <p className="text-sm text-slate-500">{partner.email}</p>
              </div>
            </div>

            <ActionsDropdown
              items={[
                { label: "Update Details", icon: Clock, color: "amber", onClick: handleUpdate },
                { label: "Change Password", icon: KeyRound, color: "blue", onClick: () => setShowChangePassword(true) },
              ]}
            />
          </div>

          {/* Account Overview */}
          <div className="border-b border-slate-200 p-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Account Overview</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <InfoRow icon={<MdPublic className="h-4 w-4" />} label="Country" value={partner.country} />
              <InfoRow icon={<MdPhone className="h-4 w-4" />} label="Phone Number" value={partner.phone} />
              <InfoRow icon={<MdEmail className="h-4 w-4" />} label="Email" value={partner.email} />
              <InfoRow icon={<MdCategory className="h-4 w-4" />} label="Partner Type" value={partner.type === "individual" ? "Individual Advisor" : "Agency / Company"} />
              <InfoRow icon={<MdSupervisorAccount className="h-4 w-4" />} label="Assigned Manager" value={partner.assigned_manager_name} />
              <InfoRow icon={<MdVerified className="h-4 w-4" />} label="Verification" value={partner.is_verified ? "Verified" : "Not Verified"} />
              <InfoRow icon={<MdToggleOn className="h-4 w-4" />} label="Account Status" value={partner.is_active ? "Active" : "Inactive"} />
            </div>
          </div>

          {/* Individual Details */}
          {isIndividual && (
            <div className="border-b border-slate-200 p-6">
              <div className="mb-4 flex items-center gap-2">
                <User className="h-4 w-4 text-slate-500" />
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Individual Details</p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoRow icon={<Briefcase className="h-4 w-4" />} label="Background" value={partner.individual_details?.background} />
                <InfoRow icon={<Link2 className="h-4 w-4" />} label="LinkedIn" value={partner.individual_details?.linkedin_url} href={partner.individual_details?.linkedin_url || undefined} />
                <InfoRow icon={<Link2 className="h-4 w-4" />} label="Social Media" value={partner.individual_details?.social_media_url} href={partner.individual_details?.social_media_url || undefined} />
              </div>
              <div className="mt-3">
                <DocRow label="Identity Document" fileKey={partner.individual_details?.id_document_file_key} />
              </div>
            </div>
          )}

          {/* Company Details */}
          {isCompany && (
            <div className="border-b border-slate-200 p-6">
              <div className="mb-4 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-slate-500" />
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Company Details</p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoRow icon={<Briefcase className="h-4 w-4" />} label="Company Name" value={partner.company_details?.company_name} />
                <InfoRow icon={<Link2 className="h-4 w-4" />} label="Website" value={partner.company_details?.website_url} href={partner.company_details?.website_url || undefined} />
              </div>
              <div className="mt-3 space-y-2">
                <DocRow label="Company Registration Document" fileKey={partner.company_details?.company_registration_doc_file_key} />
                <DocRow label="Contact Identity Document" fileKey={partner.company_details?.contact_id_document_file_key} />
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default PartnerDetails;
