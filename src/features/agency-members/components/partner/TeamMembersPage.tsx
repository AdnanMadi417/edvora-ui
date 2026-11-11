"use client";

import { useId as useTabId } from "react";
import React, { useState } from "react";
import { ShieldX, UserPlus } from "lucide-react";

import Button from "components/ub/core/buttons/Button";
import Loading from "components/ub/feedback/states/Loading";
import Tabs, { tabPanelProps } from "components/ub/navigation/controls/Tabs";
import type { TabItem } from "components/ub/navigation/controls/Tabs";
import { usePartnerProfile } from "features/partners/hooks";
import AgencyMembersTable from "./AgencyMembersTable";
import AgencyInvitationsTable from "./AgencyInvitationsTable";
import InviteAgencyMemberModal from "./InviteAgencyMemberModal";

type Tab = "members" | "invitations";

const TABS: TabItem<Tab>[] = [
  { key: "members", label: "Members" },
  { key: "invitations", label: "Invitations" },
];

export default function TeamMembersPage() {
  const tabId = useTabId();
  const [tab, setTab] = useState<Tab>("members");
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // The Team page is admin-only -- the nav link is hidden for members, but
  // a direct link or bookmark still reaches this page. Its tables call
  // agency-admin-only endpoints unconditionally, which 403 for a member and
  // (via the global axios interceptor) bounce the whole app to
  // /unauthorized. Guard here instead of letting that happen.
  //
  // Must block on isPartnerLoading rather than just checking agency_role:
  // rendering the real tables (and their unconditional fetches) even
  // briefly while the profile is still loading reintroduces the exact 403
  // this guard exists to prevent.
  const { partner, isPartnerLoading } = usePartnerProfile();
  if (isPartnerLoading) {
    return (
      <div className="mt-6 text-p2">
        <div className="rounded-lg border border-ub-border bg-ub-surface">
          <Loading text="Loading..." />
        </div>
      </div>
    );
  }
  if (partner?.agency_role === "member") {
    return (
      <div className="mt-6 text-p2">
        <div className="flex flex-col items-center gap-3 rounded-lg border border-ub-border bg-ub-surface p-12 text-center">
          <ShieldX className="h-10 w-10 text-ub-text-tertiary" />
          <p className="text-sm font-medium text-ub-text-secondary">Your team is managed by your agency admin.</p>
          <p className="text-sm text-ub-text-secondary">You don&apos;t have access to invite or manage team members.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 text-p2">
      <div className="rounded-lg border border-ub-border bg-ub-surface">

        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-ub-border p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mt-0.5 text-sm text-ub-text-secondary">Invite colleagues to join your agency</p>
          </div>
          <Button
            onClick={() => setIsInviteOpen(true)}
            icon={<UserPlus className="h-4 w-4" />}
            text="Invite Member"
            variant="primary"
          />
        </div>

        <Tabs<Tab> tabs={TABS} active={tab} onChange={setTab} variant="underline" idPrefix={tabId} aria-label="Agency team sections" />
        <div {...tabPanelProps(tabId, tab)}>

        <div key={tab} className="animate-in fade-in duration-200">
          {tab === "members" ? (
            <AgencyMembersTable key={`members-${refreshKey}`} />
          ) : (
            <AgencyInvitationsTable key={`invitations-${refreshKey}`} />
          )}
        </div>
      </div>
        </div>

      <InviteAgencyMemberModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onSuccess={() => { setTab("invitations"); setRefreshKey((k) => k + 1); }}
      />
    </div>
  );
}
