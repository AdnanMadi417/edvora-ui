"use client";

import { useId as useTabId } from "react";
import AdvisorProfileHeader from "../shared/AdvisorProfileHeader";
import AdvisorProfileOverview from "../shared/AdvisorProfileOverview";
import SectionCard from "components/ub/data/cards/SectionCard";
import LinkBtn from "components/ub/core/buttons/LinkBtn";
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
import StatusBadge from "components/ub/data/badges/StatusBadge";
import Tabs, { tabPanelProps } from "components/ub/navigation/controls/Tabs";
import type { TabItem } from "components/ub/navigation/controls/Tabs";
import { usePartnerProfile, useUpdatePartnerProfile } from "features/partners";
import { PartnerBankAccountSection } from "features/partners/bank-accounts";
import Loading from "components/ub/feedback/states/Loading";
import EmptyData from "components/ub/feedback/states/EmptyTableData";
import ChangePasswordPopup from "./ChangePasswordPopup";
import ActionsDropdown from "components/ub/navigation/menus/ActionsDropdown";
import IconButton from "components/ub/core/buttons/IconButton";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { getDocumentDownloadUrl } from "services/documentService";
import { downloadFileAs, buildDocumentFileName } from "utils/documentFileName";
import {
  getPresignedUploads,
  uploadFilesToSpaces,
} from "services/uploadService";
import { useFileDrop } from "components/ub/forms/uploads/useFileDrop";
import PresignedImage from "components/ub/data/media/PresignedImage";
import {
  parseDate,
  formatDate,
} from "components/ub/data/formatting/appDateUtils";
import { parseApiError } from "utils/parseApiError";

interface PartnerDetailsProps {
  id: string;
}

type ProfileTab = "profile" | "team" | "bank";

function formatDateOfBirth(value?: string | null): string | undefined {
  const date = parseDate(value);
  return date ? formatDate(date, "short", "en-US") : undefined;
}

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

const PartnerDetails = ({ id }: PartnerDetailsProps) => {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const tabId = useTabId();
  const [tab, setTab] = useState<ProfileTab>("profile");
  const router = useRouter();
  const { showToast } = useToast();

  const { partner, isPartnerLoading, partnerError, refetch } =
    usePartnerProfile();
  const { updateProfile } = useUpdatePartnerProfile();

  const handleUpdate = () => router.push("/partner/profile/edit");

  const handleAvatarUpload = async (file: File) => {
    if (!partner || avatarUploading) return;
    setAvatarUploading(true);
    try {
      const presigned = await getPresignedUploads([file], "partners-files");
      const [uploaded] = await uploadFilesToSpaces([file], presigned, () => {});
      if (!uploaded?.file_key || !uploaded.public_url)
        throw new Error("Profile photo upload failed.");
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

  const { isDragging: isAvatarDragging, dropHandlers: avatarDropHandlers } =
    useFileDrop({
      onFiles: (files) => handleAvatarUpload(files[0]),
      disabled: avatarUploading,
    });

  if (isPartnerLoading)
    return <Loading text="Loading advisor profile details..." />;
  if (partnerError)
    return (
      <SectionCard
        title="My profile"
        state="error"
        errorMessage={partnerError}
        onRetry={refetch}
      />
    );
  if (!partner) return <EmptyData />;

  const isIndividual = partner.type === "individual";
  const isCompany = partner.type === "agency";
  // Agency members have nothing of their own to manage here -- payouts go
  // to the agency admin's account, not theirs (UBX-482) -- so the tab
  // itself is hidden rather than showing just a one-line note.
  const isAgencyMember = partner.agency_role === "member";

  const profileTabs: TabItem<ProfileTab>[] = [
    { key: "profile", label: "Profile" },
    ...(isCompany ? [{ key: "team" as const, label: "Team" }] : []),
    ...(isAgencyMember
      ? []
      : [{ key: "bank" as const, label: "Bank Account" }]),
  ];

  return (
    <>
      <ChangePasswordPopup
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />

      <div className="mx-auto mt-6 min-w-0">
        <div className="min-w-0 overflow-hidden rounded-ub-xl border border-ub-border bg-ub-surface">
          <AdvisorProfileHeader
            partner={partner}
            basePath="/partner/profile"
            backHref={null}
            editHref="/partner/profile/edit"
            editLabel="Edit profile"
            editable
            avatar={
              <div className="relative shrink-0" {...avatarDropHandlers}>
                <div
                  className={`flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center overflow-hidden rounded-ub-xl bg-blue-50 text-sm font-semibold text-blue-700 transition-colors ${
                    isAvatarDragging ? "ring-2 ring-blue-400 ring-offset-2" : ""
                  }`}
                >
                  <PresignedImage
                    fileKey={
                      (isIndividual
                        ? partner.individual_details?.profile_photo_file_key
                        : partner.company_details?.logo_file_key) ?? undefined
                    }
                    alt="Profile"
                    className="h-full w-full object-cover"
                    fallback={
                      partner.name
                        ? partner.name.slice(0, 2).toUpperCase()
                        : "NA"
                    }
                  />
                  {avatarUploading && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-ub-xl bg-black/50 text-[10px] font-medium text-white">
                      …
                    </div>
                  )}
                </div>
                <span
                  className={`absolute -bottom-0.5 left-0 h-3.5 w-3.5 rounded-ub-xl border-2 border-white ${
                    partner.is_active ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                />
                <label
                  htmlFor="profile-photo-inline"
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white transition-colors hover:bg-blue-700"
                  title="Change photo"
                  role="button"
                  tabIndex={avatarUploading ? -1 : 0}
                  aria-label="Change profile photo"
                  aria-disabled={avatarUploading}
                  onKeyDown={(event) => {
                    if (
                      !avatarUploading &&
                      (event.key === "Enter" || event.key === " ")
                    ) {
                      event.preventDefault();
                      document.getElementById("profile-photo-inline")?.click();
                    }
                  }}
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
            }
            actions={
              <IconButton
                title="Change password"
                variant="tertiary"
                icon={<KeyRound className="h-4 w-4" />}
                onClick={() => setShowChangePassword(true)}
              />
            }
          />

          <Tabs<ProfileTab>
            tabs={profileTabs}
            active={tab}
            onChange={setTab}
            variant="underline"
            idPrefix={tabId}
            aria-label="My profile sections"
          />
          <div {...tabPanelProps(tabId, tab)}>
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
              />
            )}

            {/* Team Members */}
            {isCompany && tab === "team" && (
              <div
                key={tab}
                className="m-3 flex flex-col gap-4 rounded-ub-xl border border-ub-border p-4 duration-200 animate-in fade-in sm:m-6 sm:p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-500" />
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Team Members
                    </p>
                  </div>
                  <LinkBtn
                    href="/partner/team-members"
                    label="Manage team"
                    variant="secondary"
                    icon={<Users className="h-4 w-4" />}
                  />
                </div>
                {!partner.agency_members?.length ? (
                  <p className="py-8 text-center text-sm text-slate-500">
                    No team members yet. Invite one from the full Team Members
                    page.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {partner.agency_members.map((member) => (
                      <div
                        key={member.id}
                        onClick={() =>
                          router.push(
                            `/partner/team-members/${member.partner_id}`
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
                <PartnerBankAccountSection partner={partner} viewer="self" />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PartnerDetails;
