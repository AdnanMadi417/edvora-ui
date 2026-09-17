"use client";

import React, { useState } from "react";
import { UserPlus } from "lucide-react";

import Button from "components/ui/buttons/Button";
import { Tabs, type TabItem } from "components/ui/tabs";
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

  return (
    <div className="mt-6 max-w-5xl mx-auto text-p2">
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
