"use client";

import React, { useState } from "react";
import { AlertCircle, CheckCircle2, Share2, Users, XCircle } from "lucide-react";
import StatusBadge from "components/ub/data/StatusBadge";
import Tabs from "components/ub/navigation/Tabs";
import type { TabItem } from "components/ub/navigation/Tabs";
import type { AccountManager } from "../../types";
import AccountManagerPartnersTable from "../AccountManagerPartnersTable";

interface Props {
  manager: AccountManager;
  /** Refetch the manager after something changed its data (e.g. a partner transfer). */
  onManagerChanged?: () => void;
}

type DetailsTab = "profile" | "partners";

const TABS: TabItem<DetailsTab>[] = [
  { key: "profile", label: "Profile" },
  { key: "partners", label: "Advisors" },
];

export default function AccountManagerDetailsTabs({ manager, onManagerChanged }: Props) {
  const [tab, setTab] = useState<DetailsTab>("profile");

  return (
    <div className="mt-5 max-w-5xl mx-auto rounded-lg border border-slate-200 bg-white">
      {/* Header */}
      <div className="flex items-center gap-5 border-b border-slate-200 p-6">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent-light text-xl font-semibold text-slate-700">
          {manager.name?.charAt(0).toUpperCase() ?? "?"}
        </div>

        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold text-slate-900">{manager.name}</h1>
            <StatusBadge
              variant={manager.is_active ? "success" : "neutral"}
              icon={manager.is_active ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
            >
              {manager.is_active ? "Active" : "Inactive"}
            </StatusBadge>
          </div>
          <p className="break-all text-sm text-slate-500">{manager.email}</p>
        </div>
      </div>

      <Tabs<DetailsTab> tabs={TABS} active={tab} onChange={setTab} />

      {tab === "profile" && (
        <div key={tab} className="animate-in fade-in duration-200 p-6 text-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <span className="flex items-center gap-2 text-slate-600">
              <Users className="h-4 w-4" />
              Assigned Advisors
            </span>

            <div className="flex flex-wrap items-center gap-1.5">
              {Number(manager.assigned_partners_count) > 0 ? (
                <StatusBadge variant="success" icon={<Users className="h-3 w-3" />} className="w-fit">
                  {Number(manager.assigned_partners_count)} Advisor
                  {Number(manager.assigned_partners_count) !== 1 && "s"}
                </StatusBadge>
              ) : (
                <StatusBadge variant="danger" icon={<AlertCircle className="h-3 w-3" />}>
                  Needs Advisor
                </StatusBadge>
              )}
              {Number(manager.shared_partners_count ?? 0) > 0 && (
                <StatusBadge variant="info" icon={<Share2 className="h-3 w-3" />} className="w-fit">
                  {Number(manager.shared_partners_count)} shared
                </StatusBadge>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "partners" && (
        <div key={tab} className="animate-in fade-in duration-200">
          <AccountManagerPartnersTable manager={manager} onTransferred={onManagerChanged} />
        </div>
      )}
    </div>
  );
}
