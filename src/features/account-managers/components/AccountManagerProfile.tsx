import { AlertCircle, Check, Users, X } from "lucide-react";
import React from "react";
import { StatusBadge } from "components/ui/badges";
import type { AccountManager } from "../types";

interface AccountManagerProfileProps {
  manager: AccountManager;
}

export default function AccountManagerProfile({ manager }: AccountManagerProfileProps) {
  return (
    <section>
      <div className="mb-5 mt-5 max-w-5xl mx-auto block rounded-lg border border-slate-200 bg-card p-6 ">
        <div className="flex items-center gap-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-light text-xl font-semibold text-slate-700">
            {manager.name?.charAt(0).toUpperCase() ?? "?"}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold text-slate-900">
                {manager.name}
              </h1>

              <StatusBadge
                variant={manager.is_active ? "success" : "neutral"}
                icon={manager.is_active ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              >
                {manager.is_active ? "Active" : "Inactive"}
              </StatusBadge>
            </div>

            <p className="break-all text-sm text-slate-500">{manager.email}</p>
          </div>
        </div>

        <div className="my-5 h-px bg-slate-200" />

        <div className="space-y-5 text-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <span className="flex items-center gap-2 text-slate-600">
              <Users className="h-4 w-4" />
              Assigned Partners
            </span>

            {Number(manager.assigned_partners_count) > 0 ? (
              <StatusBadge variant="success" icon={<Users className="h-3 w-3" />} className="w-fit">
                {Number(manager.assigned_partners_count)} Partner
                {Number(manager.assigned_partners_count) !== 1 && "s"}
              </StatusBadge>
            ) : (
              <StatusBadge variant="danger" icon={<AlertCircle className="h-3 w-3" />}>
                Needs Partner
              </StatusBadge>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
