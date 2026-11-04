"use client";

import React, { useState } from "react";
import { ShieldX, UserPlus } from "lucide-react";

import Button from "components/ub/core/buttons/Button";
import Loading from "components/ub/feedback/states/Loading";
import Tabs from "components/ub/navigation/controls/Tabs";
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
  const [tab, setTab] = useState<Tab>("members");
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Agency Scaler is admin-only -- the nav link is hidden for members, but
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
        <div className="rounded-lg border border-slate-200 bg-white">
          <Loading text="Loading..." />
        </div>
      </div>
    );
  }
  if (partner?.agency_role === "member") {
    return (
      <div className="mt-6 text-p2">
        <div className="flex flex-col items-center gap-3 rounded-lg border border-slate-200 bg-white p-12 text-center">
          <ShieldX className="h-10 w-10 text-slate-300" />
          <p className="text-sm font-medium text-slate-700">Agency Scaler is managed by your agency admin.</p>
          <p className="text-sm text-slate-500">You don&apos;t have access to invite or manage team members.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 text-p2">
      <div className="rounded-lg border border-slate-200 bg-white">

        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Agency Scaler</h3>
            <p className="mt-0.5 text-sm text-slate-500">Invite colleagues to join your agency</p>
          </div>
          <Button
            onClick={() => setIsInviteOpen(true)}
            icon={<UserPlus className="h-4 w-4" />}
            text="Invite Member"
            bgColor="bg-blue-50"
            textColor="text-blue-700"
            borderColor="border-blue-600"
            hoverTextColor="hover:text-blue-800"
            hoverBorderColor="hover:border-blue-700"
          />
        </div>

        <Tabs<Tab> tabs={TABS} active={tab} onChange={setTab} />

        <div key={tab} className="animate-in fade-in duration-200">
          {tab === "members" ? (
            <AgencyMembersTable key={`members-${refreshKey}`} />
          ) : (
            <AgencyInvitationsTable key={`invitations-${refreshKey}`} />
          )}
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
