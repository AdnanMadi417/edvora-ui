"use client";

import React, { useState } from "react";
import { UserPlus } from "lucide-react";

import Button from "components/ui/buttons/Button";
import AgencyMembersTable from "./AgencyMembersTable";
import AgencyInvitationsTable from "./AgencyInvitationsTable";
import InviteAgencyMemberModal from "./InviteAgencyMemberModal";

type Tab = "members" | "invitations";

export default function TeamMembersPage() {
  const [tab, setTab] = useState<Tab>("members");
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const TABS: { key: Tab; label: string }[] = [
    { key: "members", label: "Members" },
    { key: "invitations", label: "Invitations" },
  ];

  return (
    <div className="mt-6 max-w-5xl mx-auto text-p2">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Team Members</h3>
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

      <div className="mb-5 flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              tab === key
                ? "bg-blue-50 text-blue-700"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "members" ? (
        <AgencyMembersTable key={`members-${refreshKey}`} />
      ) : (
        <AgencyInvitationsTable key={`invitations-${refreshKey}`} />
      )}

      <InviteAgencyMemberModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onSuccess={() => { setTab("invitations"); setRefreshKey((k) => k + 1); }}
      />
    </div>
  );
}
