"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MdCategory,
  MdEmail,
  MdPhone,
  MdPublic,
  MdSupervisorAccount,
} from "react-icons/md";
import {
  Briefcase,
  Camera,
  Clock,
  Download,
  Eye,
  ExternalLink,
  FileText,
  KeyRound,
  Link2,
  User,
  Users,
} from "lucide-react";
import { StatusBadge } from "components/ui/badges";
import { Tabs, type TabItem } from "components/ui/tabs";
import { usePartnerProfile, useUpdatePartnerProfile } from "features/partners";
import { PartnerBankAccountSection } from "features/partners/bank-accounts";
import Loading from "components/loading/Loading";
import EmptyData from "components/emptyData/EmptyTableData";
import ChangePasswordPopup from "./ChangePasswordPopup";
import ActionsDropdown from "components/ui/buttons/ActionsDropdown";
import IconButton from "components/ui/buttons/IconButton";
import { useToast } from "components/context/ToastContext";
import { getDocumentDownloadUrl } from "services/documentService";
import { downloadFileAs, buildDocumentFileName } from "utils/documentFileName";
import { getPresignedUploads, uploadFilesToSpaces } from "services/uploadService";
import { useFileDrop } from "components/form/upload/useFileDrop";
import PresignedImage from "components/ui/PresignedImage";
import { parseDate, formatDate } from "components/ui/date/utils";
import { parseApiError } from "utils/parseApiError";

interface PartnerDetailsProps {
  id: string;
}

type ProfileTab = "profile" | "team" | "bank";

function formatDateOfBirth(value?: string | null): string | undefined {
  const date = parseDate(value);
  return date ? formatDate(date, "short", "en-US") : undefined;
}

function InfoRow({ icon, label, value, href }: { icon: React.ReactNode; label: string; value?: string | null; href?: string }) {
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
          <p className="mt-0.5 text-sm font-medium text-slate-900">{value || "Not provided"}</p>
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

const PartnerDetails = ({ id }: PartnerDetailsProps) => {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [tab, setTab] = useState<ProfileTab>("profile");
  const router = useRouter();
  const { showToast } = useToast();

  const { partner, isPartnerLoading, refetch } = usePartnerProfile();
  const { updateProfile } = useUpdatePartnerProfile();

  const handleUpdate = () => router.push("/partner/profile/edit");

  const handleAvatarUpload = async (file: File) => {
    if (!partner || avatarUploading) return;
    setAvatarUploading(true);
    try {
      const presigned = await getPresignedUploads([file], "partners-files");
      const [uploaded] = await uploadFilesToSpaces([file], presigned, () => {});
      const isIndividualPartner = partner.type === "individual";
      const payload = {
        name: partner.name,
        type: partner.type,
        country: partner.country,
        phone: partner.phone,
        ...(isIndividualPartner
          ? {
              individual_details: {
                ...partner.individual_details,
                profile_photo_file_key: uploaded.file_key,
                profile_photo_file_url: uploaded.public_url,
              },
            }
          : {
              company_details: {
                ...partner.company_details,
                logo_file_key: uploaded.file_key,
                logo_file_url: uploaded.public_url,
              },
            }),
      };
      await updateProfile(payload);
      showToast("Profile photo updated", "success");
      refetch();
    } catch (err: unknown) {
      showToast(parseApiError(err, "Failed to update profile photo."), "error");
    } finally {
      setAvatarUploading(false);
    }
  };

  const { isDragging: isAvatarDragging, dropHandlers: avatarDropHandlers } = useFileDrop({
    onFiles: (files) => handleAvatarUpload(files[0]),
    disabled: avatarUploading,
  });

  if (isPartnerLoading) return <Loading text="Loading advisor profile details..." />;
  if (!partner) return <EmptyData />;

  const isIndividual = partner.type === "individual";
  const isCompany = partner.type === "agency";

  const profileTabs: TabItem<ProfileTab>[] = [
    { key: "profile", label: "Profile" },
    ...(isCompany ? [{ key: "team" as const, label: "Team" }] : []),
    { key: "bank", label: "Bank Account" },
  ];

  return (
    <>
      <ChangePasswordPopup isOpen={showChangePassword} onClose={() => setShowChangePassword(false)} />

      <div className="mx-auto mt-6 max-w-5xl">
        <div className="rounded-lg border border-slate-200 bg-white">

          {/* Header */}
          <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              {/* The whole avatar circle is the drop target, not just the
                  small camera badge — a badge-sized hit area is impractical
                  to drop a file onto. */}
              <div className="relative shrink-0" {...avatarDropHandlers}>
                <div
                  className={`flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-sm font-semibold text-blue-700 transition-colors ${
                    isAvatarDragging ? "ring-2 ring-blue-400 ring-offset-2" : ""
                  }`}
                >
                  <PresignedImage
                    fileKey={(isIndividual ? partner.individual_details?.profile_photo_file_key : partner.company_details?.logo_file_key) ?? undefined}
                    alt="Profile"
                    className="h-full w-full object-cover"
                    fallback={partner.name ? partner.name.slice(0, 2).toUpperCase() : "NA"}
                  />
                  {avatarUploading && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-[10px] font-medium text-white">
                      …
                    </div>
                  )}
                </div>
                <span className={`absolute -bottom-0.5 left-0 h-3.5 w-3.5 rounded-full border-2 border-white ${partner.is_active ? "bg-emerald-500" : "bg-slate-300"}`} />
                <label
                  htmlFor="profile-photo-inline"
                  className="absolute -bottom-1 -right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white transition-colors hover:bg-blue-700"
                  title="Change photo"
                >
                  <Camera className="h-3 w-3" />
                  <input
                    id="profile-photo-inline"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    disabled={avatarUploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAvatarUpload(file);
                      e.target.value = "";
                    }}
                  />
                </label>
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

            <div className="shrink-0 self-end sm:self-auto">
              <ActionsDropdown
                items={[
                  { label: "Update Details", icon: Clock, color: "amber", onClick: handleUpdate },
                  { label: "Change Password", icon: KeyRound, color: "blue", onClick: () => setShowChangePassword(true) },
                ]}
              />
            </div>
          </div>

          <Tabs<ProfileTab> tabs={profileTabs} active={tab} onChange={setTab} />

          {/* Account Overview */}
          {tab === "profile" && (
          <div key={tab} className="animate-in fade-in duration-200">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Account Overview</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <InfoRow icon={<MdPublic className="h-4 w-4" />} label="Country of Residence" value={partner.country} />
              <InfoRow icon={<MdPublic className="h-4 w-4" />} label="Nationality" value={partner.nationality} />
              <InfoRow icon={<MdPhone className="h-4 w-4" />} label="Phone Number" value={partner.phone} />
              <InfoRow icon={<MdEmail className="h-4 w-4" />} label="Email" value={partner.email} />
              <InfoRow icon={<MdCategory className="h-4 w-4" />} label="Advisor Type" value={partner.type === "individual" ? "Individual Advisor" : "Agency / Company"} />
              <InfoRow icon={<MdSupervisorAccount className="h-4 w-4" />} label="Assigned Manager" value={partner.assigned_manager_name} />
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
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Individual Details</p>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <InfoRow icon={<Briefcase className="h-4 w-4" />} label="Background" value={partner.individual_details?.background} />
                <InfoRow icon={<Link2 className="h-4 w-4" />} label="LinkedIn" value={partner.individual_details?.linkedin_url} href={partner.individual_details?.linkedin_url || undefined} />
                <InfoRow icon={<Link2 className="h-4 w-4" />} label="Social Media" value={partner.individual_details?.social_media_url} href={partner.individual_details?.social_media_url || undefined} />
                <InfoRow icon={<MdCategory className="h-4 w-4" />} label="Date of Birth" value={formatDateOfBirth(partner.individual_details?.date_of_birth)} />
                <InfoRow icon={<MdCategory className="h-4 w-4" />} label="Passport Number" value={partner.individual_details?.passport_number} />
              </div>
              <div className="flex flex-col gap-2">
                <DocRow label="Passport Photo" fileKey={partner.individual_details?.passport_photo_file_key} personName={partner.name} />
              </div>
            </div>
          )}

          {/* Company Details */}
          {isCompany && (
            <div className="flex flex-col gap-4 border-b border-slate-200 p-6">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-slate-500" />
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Company Details</p>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <InfoRow icon={<Briefcase className="h-4 w-4" />} label="Company Name" value={partner.company_details?.company_name} />
                <InfoRow icon={<Link2 className="h-4 w-4" />} label="Website" value={partner.company_details?.website_url} href={partner.company_details?.website_url || undefined} />
                <InfoRow icon={<MdCategory className="h-4 w-4" />} label="Date of Birth" value={formatDateOfBirth(partner.company_details?.date_of_birth)} />
                <InfoRow icon={<MdCategory className="h-4 w-4" />} label="Passport Number" value={partner.company_details?.passport_number} />
              </div>
              <div className="flex flex-col gap-2">
                <DocRow label="Company Registration Document" fileKey={partner.company_details?.company_registration_doc_file_key} personName={partner.name} />
                <DocRow label="Passport Photo" fileKey={partner.company_details?.passport_photo_file_key} personName={partner.name} />
                <DocRow label="Agency Logo" fileKey={partner.company_details?.logo_file_key} personName={partner.name} />
              </div>
            </div>
          )}

          </div>
          )}

          {/* Team Members */}
          {isCompany && tab === "team" && (
            <div key={tab} className="flex flex-col gap-4 p-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-500" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Team Members</p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/partner/team-members")}
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  Manage Team
                </button>
              </div>
              {!partner.agency_members?.length ? (
                <p className="py-8 text-center text-sm text-slate-500">
                  No team members yet. Invite one from the full Team Members page.
                </p>
              ) : (
              <div className="flex flex-col gap-2">
                {partner.agency_members.map((member) => (
                  <div
                    key={member.id}
                    onClick={() => router.push(`/partner/team-members/${member.partner_id}`)}
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

          {/* Bank Account */}
          {tab === "bank" && (
            <div key={tab} className="animate-in fade-in duration-200">
              <PartnerBankAccountSection partner={partner} />
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default PartnerDetails;
