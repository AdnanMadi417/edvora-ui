"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MdCategory,
  MdEmail,
  MdPhone,
  MdPublic,
  MdCake,
} from "react-icons/md";
import {
  AlertTriangle,
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
  Mail,
  Percent,
  Power,
  RefreshCw,
  CheckCircle,
  XCircle,
} from "lucide-react";

import {
  useAgencyMemberDetails,
  useSuspendMember,
  useReactivateMember,
  useResendMemberWelcomeEmail,
} from "../../hooks";

import Loading from "components/loading/Loading";
import EmptyData from "components/emptyData/EmptyData";
import { useToast } from "components/context/ToastContext";
import { getDocumentDownloadUrl } from "services/documentService";
import { downloadFileAs, buildDocumentFileName } from "utils/documentFileName";
import PresignedImage from "components/ui/PresignedImage";
import Button from "components/ui/buttons/Button";
import IconButton from "components/ui/buttons/IconButton";
import { StatusBadge } from "components/ui/badges";
import { parseDate, formatDate } from "components/ui/date/utils";
import { parseApiError } from "utils/parseApiError";

import SuspendReactivateMemberModal from "./SuspendReactivateMemberModal";
import ResendMemberWelcomeEmailConfirmation from "./ResendMemberWelcomeEmailConfirmation";

function formatDateOfBirth(value?: string | null): string | undefined {
  const date = parseDate(value);
  return date ? formatDate(date, "short", "en-US") : undefined;
}

function formatDateTime(value?: string | null): string | undefined {
  const date = parseDate(value);
  return date ? formatDate(date, "datetime", "en-US") : undefined;
}

interface AgencyMemberDetailsProps {
  memberId: string;
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
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3 sm:flex-1">
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

export default function AgencyMemberDetails({ memberId }: AgencyMemberDetailsProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const { member, loading, error, refetch } = useAgencyMemberDetails(memberId);
  const { suspendMember, loading: isSuspending } = useSuspendMember();
  const { reactivateMember, loading: isReactivating } = useReactivateMember();
  const { resendMemberWelcomeEmail, loading: isResendingWelcome } = useResendMemberWelcomeEmail();

  const [isSuspendOpen, setIsSuspendOpen] = useState(false);
  const [isResendWelcomeOpen, setIsResendWelcomeOpen] = useState(false);
  const [welcomeCooldownUntil, setWelcomeCooldownUntil] = useState(0);
  const [cooldownTick, setCooldownTick] = useState(0);

  React.useEffect(() => {
    if (welcomeCooldownUntil <= cooldownTick) return;
    const t = setInterval(() => setCooldownTick(Date.now()), 1000);
    return () => clearInterval(t);
  }, [welcomeCooldownUntil, cooldownTick]);

  const welcomeCooldownSeconds = Math.max(0, Math.ceil((welcomeCooldownUntil - cooldownTick) / 1000));

  const handleToggleActive = async () => {
    if (!member) return;
    try {
      if (member.is_active) {
        await suspendMember(member.partner_id);
        showToast("Member suspended successfully.", "success");
      } else {
        await reactivateMember(member.partner_id);
        showToast("Member reactivated successfully.", "success");
      }
      setIsSuspendOpen(false);
      refetch();
    } catch (error: any) {
      const backendMessage = parseApiError(error, "Please try again.");
      showToast(`Failed to update member. ${backendMessage}`, "error");
    }
  };

  const handleResendWelcome = async () => {
    if (!member) return;
    try {
      await resendMemberWelcomeEmail(member.partner_id);
      showToast("Welcome email resent successfully.", "success");
      setIsResendWelcomeOpen(false);
      setWelcomeCooldownUntil(Date.now() + 60_000);
      setCooldownTick(Date.now());
    } catch (error: any) {
      const backendMessage = parseApiError(error, "Please try again.");
      showToast(`Failed to resend welcome email. ${backendMessage}`, "error");
    }
  };

  if (loading && !member) return <Loading text="Loading member details..." />;

  if (error) {
    return (
      <EmptyData
        icon={AlertTriangle}
        color="red"
        title="Something went wrong"
        subtitle={error}
        action={
          <button
            type="button"
            onClick={refetch}
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        }
      />
    );
  }

  if (!member) return <EmptyData title="Member not found" subtitle="This member may have been removed." />;

  const canResendWelcome = member.is_active && !member.last_login;

  return (
    <div className="mx-auto mt-6 max-w-5xl">
      <div className="rounded-lg border border-slate-200 bg-white">

        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="relative shrink-0">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                <PresignedImage
                  fileKey={member.individual_details?.profile_photo_file_key ?? undefined}
                  alt="Profile"
                  className="h-full w-full object-cover"
                  fallback={member.name ? member.name.slice(0, 2).toUpperCase() : "NA"}
                />
              </div>
              <span
                className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${
                  member.is_active ? "bg-emerald-500" : "bg-slate-300"
                }`}
              />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-lg font-semibold text-slate-900">{member.name || "Unknown Member"}</h2>
                {member.is_active ? (
                  <StatusBadge variant="success" icon={<CheckCircle className="h-3 w-3" />}>Active</StatusBadge>
                ) : (
                  <StatusBadge variant="neutral" icon={<XCircle className="h-3 w-3" />}>Suspended</StatusBadge>
                )}
              </div>
              <p className="truncate text-sm text-slate-500">{member.email}</p>
            </div>
          </div>

          <Button
            className="shrink-0 self-end sm:self-auto"
            onClick={() => router.push("/partner/team-members")}
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
            <InfoRow icon={<MdPublic className="h-4 w-4" />} label="Country" value={member.country} />
            <InfoRow icon={<MdPublic className="h-4 w-4" />} label="Nationality" value={member.nationality} />
            <InfoRow icon={<MdPhone className="h-4 w-4" />} label="Phone Number" value={member.phone} />
            <InfoRow icon={<MdEmail className="h-4 w-4" />} label="Email" value={member.email} />
            <InfoRow
              icon={<Percent className="h-4 w-4" />}
              label="Commission Visibility"
              value={member.commission_visible ? `Visible (${member.commission_display_percentage}%)` : "Hidden"}
            />
            <InfoRow
              icon={<CalendarDays className="h-4 w-4" />}
              label="Joined"
              value={formatDateOfBirth(member.created_at)}
            />
            <InfoRow
              icon={<Clock className="h-4 w-4" />}
              label="Last Login"
              value={formatDateTime(member.last_login) || "Never"}
            />
          </div>
        </div>

        {/* Individual Details */}
        <div className="border-b border-slate-200 p-6">
          <div className="mb-4 flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-slate-500" />
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Individual Details
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoRow
              icon={<MdCake className="h-4 w-4" />}
              label="Date of Birth"
              value={formatDateOfBirth(member.individual_details?.date_of_birth)}
            />
            <InfoRow
              icon={<MdCategory className="h-4 w-4" />}
              label="Passport Number"
              value={member.individual_details?.passport_number}
            />
            <InfoRow
              icon={<Briefcase className="h-4 w-4" />}
              label="Background"
              value={member.individual_details?.background}
            />
            <InfoRow
              icon={<Link2 className="h-4 w-4" />}
              label="LinkedIn"
              value={member.individual_details?.linkedin_url}
              href={member.individual_details?.linkedin_url || undefined}
            />
            <InfoRow
              icon={<Link2 className="h-4 w-4" />}
              label="Social Media"
              value={member.individual_details?.social_media_url}
              href={member.individual_details?.social_media_url || undefined}
            />
          </div>
          <div className="mt-3 space-y-2">
            <DocRow
              label="Profile Photo"
              fileKey={member.individual_details?.profile_photo_file_key}
              personName={member.name}
            />
            <DocRow
              label="Passport Photo"
              fileKey={member.individual_details?.passport_photo_file_key}
              personName={member.name}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-end gap-3 p-6">
          {canResendWelcome && (
            <Button
              onClick={() => setIsResendWelcomeOpen(true)}
              icon={<Mail className="h-4 w-4" />}
              text="Resend Welcome Email"
              bgColor="bg-white"
              textColor="text-slate-700"
              borderColor="border-slate-200"
              hoverTextColor="hover:text-slate-900"
              hoverBorderColor="hover:border-slate-300"
            />
          )}
          <Button
            onClick={() => setIsSuspendOpen(true)}
            icon={member.is_active ? <Ban className="h-4 w-4" /> : <Power className="h-4 w-4" />}
            text={member.is_active ? "Suspend Member" : "Reactivate Member"}
            bgColor={member.is_active ? "bg-red-50" : "bg-emerald-50"}
            textColor={member.is_active ? "text-red-700" : "text-emerald-700"}
            borderColor={member.is_active ? "border-red-600" : "border-emerald-600"}
            hoverTextColor={member.is_active ? "hover:text-red-800" : "hover:text-emerald-800"}
            hoverBorderColor={member.is_active ? "hover:border-red-700" : "hover:border-emerald-700"}
          />
        </div>
      </div>

      <SuspendReactivateMemberModal
        isOpen={isSuspendOpen}
        onClose={() => setIsSuspendOpen(false)}
        onConfirm={handleToggleActive}
        isSubmitting={isSuspending || isReactivating}
        memberName={member.name}
        isActive={member.is_active}
      />

      <ResendMemberWelcomeEmailConfirmation
        isOpen={isResendWelcomeOpen}
        onClose={() => setIsResendWelcomeOpen(false)}
        onConfirm={handleResendWelcome}
        isSending={isResendingWelcome}
        memberName={member.name}
        cooldownSeconds={welcomeCooldownSeconds}
      />
    </div>
  );
}
