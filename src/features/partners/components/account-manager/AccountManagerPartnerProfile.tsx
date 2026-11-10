"use client";

import { useId as useTabId } from "react";
import AdvisorProfileOverview from "../shared/AdvisorProfileOverview";
import AdvisorProfileHeader from "../shared/AdvisorProfileHeader";
import SectionCard from "components/ub/data/cards/SectionCard";
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
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import { useAccountManagerPartnerDetails } from "features/partners/hooks";
import { formatAgencyRole } from "features/partners/utils";
import Loading from "components/ub/feedback/states/Loading";
import EmptyData from "components/ub/feedback/states/EmptyTableData";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { getDocumentDownloadUrl } from "services/documentService";
import { downloadFileAs, buildDocumentFileName } from "utils/documentFileName";
import PresignedImage from "components/ub/data/media/PresignedImage";
import Button from "components/ub/core/buttons/Button";
import IconButton from "components/ub/core/buttons/IconButton";
import StatusBadge from "components/ub/data/badges/StatusBadge";
import Tabs, { tabPanelProps } from "components/ub/navigation/controls/Tabs";
import type { TabItem } from "components/ub/navigation/controls/Tabs";
import AccountManagerPartnerApplicationsTable from "./AccountManagerPartnerApplicationsTable";
import { PayoutStatementSection } from "features/applications/payouts";
import { usePageTitle } from "components/ub/navigation/layout/pageTitle";



interface Props {
  id: string;
}

type DetailsTab = "profile" | "team" | "applications" | "statement";

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

export default function AccountManagerPartnerProfile({ id }: Props) {
  const router = useRouter();
  const { partner, isPartnerLoading, partnerError } =
    useAccountManagerPartnerDetails(id);
  const tabId = useTabId();
  const [tab, setTab] = useState<DetailsTab>("profile");
  usePageTitle(partner?.name);

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
        { key: "applications", label: "Applications" },
        { key: "statement", label: "Commission Tracker" },
      ]
    : [
        { key: "profile", label: "Profile" },
        { key: "applications", label: "Applications" },
        { key: "statement", label: "Commission Tracker" },
      ];

  return (
    <div className="mx-auto mt-6 min-w-0">
      <div className="min-w-0 overflow-hidden rounded-ub-xl border border-ub-border bg-ub-surface">
        {/* Header */}
        <AdvisorProfileHeader
          partner={partner}
          basePath="/account-manager/advisors"
          editable={false}
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
              showProfilePhoto
            />
          )}
          {isCompany && tab === "team" && (
            <div
              key={tab}
              className="flex flex-col gap-4 p-6 animate-in fade-in duration-200"
            >
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
                          `/account-manager/advisors/${member.partner_id}`
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

          {/* Applications */}
          {tab === "applications" && (
            <div key={tab} className="animate-in fade-in duration-200">
              <AccountManagerPartnerApplicationsTable partnerId={id} />
            </div>
          )}

          {/* Statement */}
          {tab === "statement" && (
            <div key={tab} className="animate-in fade-in duration-200">
              <PayoutStatementSection partnerId={id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
