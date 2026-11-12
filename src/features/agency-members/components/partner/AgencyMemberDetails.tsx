"use client";

import Breadcrumbs from "components/ub/navigation/links/Breadcrumbs";
import React, { useState } from "react";
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

import Loading from "components/ub/feedback/states/Loading";
import EmptyData from "components/ub/feedback/states/EmptyData";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { getDocumentDownloadUrl } from "services/documentService";
import { downloadFileAs, buildDocumentFileName } from "utils/documentFileName";
import PresignedImage from "components/ub/data/media/PresignedImage";
import Button from "components/ub/core/buttons/Button";
import IconButton from "components/ub/core/buttons/IconButton";
import StatusBadge from "components/ub/data/badges/StatusBadge";
import { parseDate, formatDate } from "components/ub/data/formatting/appDateUtils";
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
    <div className="flex items-start gap-3 rounded-lg border border-ub-border bg-ub-surface-subtle p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ub-surface text-ub-text-secondary">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-ub-text-secondary">{label}</p>
        {href && value ? (
          <button
            type="button"
            onClick={() => window.open(encodeURI(href), "_blank", "noopener,noreferrer")}
            className="mt-0.5 inline-flex items-center gap-1 text-sm font-medium text-ub-text-link hover:underline"
          >
            Visit link <ExternalLink className="h-3 w-3" />
          </button>
        ) : (
          <p className="mt-0.5 break-words text-sm font-medium text-ub-text-primary [overflow-wrap:anywhere]">
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
    <div className="flex flex-col gap-3 rounded-lg border border-ub-border p-4 transition-colors hover:bg-ub-surface-subtle sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3 sm:flex-1">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ub-surface-subtle text-ub-text-secondary">
          <FileText className="h-5 w-5" />
        </div>
        <p className="truncate text-sm font-semibold text-ub-text-primary">{label}</p>
      </div>
      {fileKey ? (
        <div className="flex shrink-0 items-center gap-2 sm:ml-4">
          <IconButton
            onClick={handleView}
            disabled={!!loading}
            title="View document"
            icon={<Eye className={`h-4 w-4 ${loading === "view" ? "animate-pulse" : ""}`} />}
            bgColor="bg-ub-surface-subtle"
            textColor="text-ub-text-secondary"
            borderColor="border-transparent"
            hoverTextColor="hover:text-ub-text-secondary"
            hoverBorderColor="hover:border-ub-border"
            className="hover:bg-ub-surface-subtle"
          />
          <IconButton
            onClick={handleDownload}
            disabled={!!loading}
            title="Download document"
            icon={<Download className={`h-4 w-4 ${loading === "download" ? "animate-pulse" : ""}`} />}
            bgColor="bg-ub-tone-success-bg"
            textColor="text-ub-tone-success-text"
            borderColor="border-transparent"
            hoverTextColor="hover:text-ub-tone-success-text"
            hoverBorderColor="hover:border-ub-tone-success-border"
            className="hover:bg-ub-tone-success-bg"
          />
        </div>
      ) : (
        <span className="text-xs text-ub-text-tertiary sm:ml-4">Not uploaded</span>
      )}
    </div>
  );
}

export default function AgencyMemberDetails({ memberId }: AgencyMemberDetailsProps) {
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
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-ub-border px-3 py-1.5 text-xs font-medium text-ub-text-secondary transition hover:bg-ub-surface-subtle"
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
    <div className="mx-auto mt-6 ">
      <div className="rounded-lg border border-ub-border bg-ub-surface">

        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-ub-border px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="relative shrink-0">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-ub-tone-brand-bg text-sm font-semibold text-ub-text-link">
                <PresignedImage
                  fileKey={member.individual_details?.profile_photo_file_key ?? undefined}
                  alt="Profile"
                  className="h-full w-full object-cover"
                  fallback={member.name ? member.name.slice(0, 2).toUpperCase() : "NA"}
                />
              </div>
              <span
                className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-ub-surface ${
                  member.is_active ? "bg-ub-tone-success-dot" : "bg-ub-tone-neutral-dot"
                }`}
              />
            </div>
            <div className="min-w-0">
              <Breadcrumbs
                className="mb-1"
                items={[{ label: "Team members", href: "/partner/team-members" }, { label: member.name || "Team member" }]}
              />
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-lg font-semibold text-ub-text-primary">{member.name || "Unknown Member"}</h2>
                {member.is_active ? (
                  <StatusBadge variant="success" icon={<CheckCircle className="h-3 w-3" />}>Active</StatusBadge>
                ) : (
                  <StatusBadge variant="neutral" icon={<XCircle className="h-3 w-3" />}>Suspended</StatusBadge>
                )}
              </div>
              <p className="truncate text-sm text-ub-text-secondary">{member.email}</p>
            </div>
          </div>

        </div>

        {/* Account Overview */}
        <div className="border-b border-ub-border p-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-ub-text-secondary">
            Account overview
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <InfoRow icon={<MdPublic className="h-4 w-4" />} label="Country" value={member.country} />
            <InfoRow icon={<MdPublic className="h-4 w-4" />} label="Nationality" value={member.nationality} />
            <InfoRow icon={<MdPhone className="h-4 w-4" />} label="Phone number" value={member.phone} />
            <InfoRow icon={<MdEmail className="h-4 w-4" />} label="Email" value={member.email} />
            <InfoRow
              icon={<Percent className="h-4 w-4" />}
              label="Commission visibility"
              value={member.commission_visible ? `Visible (${member.commission_display_percentage}%)` : "Hidden"}
            />
            <InfoRow
              icon={<CalendarDays className="h-4 w-4" />}
              label="Joined"
              value={formatDateOfBirth(member.created_at)}
            />
            <InfoRow
              icon={<Clock className="h-4 w-4" />}
              label="Last login"
              value={formatDateTime(member.last_login) || "Never"}
            />
          </div>
        </div>

        {/* Individual Details */}
        <div className="border-b border-ub-border p-6">
          <div className="mb-4 flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-ub-text-secondary" />
            <p className="text-xs font-semibold uppercase tracking-wide text-ub-text-secondary">
              Individual details
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoRow
              icon={<MdCake className="h-4 w-4" />}
              label="Date of birth"
              value={formatDateOfBirth(member.individual_details?.date_of_birth)}
            />
            <InfoRow
              icon={<MdCategory className="h-4 w-4" />}
              label="Passport number"
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
              label="Social media"
              value={member.individual_details?.social_media_url}
              href={member.individual_details?.social_media_url || undefined}
            />
          </div>
          <div className="mt-3 space-y-2">
            <DocRow
              label="Profile photo"
              fileKey={member.individual_details?.profile_photo_file_key}
              personName={member.name}
            />
            <DocRow
              label="Passport photo"
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
              text="Resend welcome email"
              variant="secondary"
            />
          )}
          <Button
            onClick={() => setIsSuspendOpen(true)}
            icon={member.is_active ? <Ban className="h-4 w-4" /> : <Power className="h-4 w-4" />}
            text={member.is_active ? "Suspend Member" : "Reactivate Member"}
            variant="secondary"
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
