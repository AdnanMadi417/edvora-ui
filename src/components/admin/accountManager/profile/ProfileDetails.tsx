import {
  AlertCircle,
  Check,
  Users, X,
} from 'lucide-react';
import React from "react";

import { AccountManager } from "hooks/account-managers/useAccountManagerDetails";

interface ProfileDetailsProps {
  manager: AccountManager;
}

export default function ProfileDetails({ manager }: ProfileDetailsProps) {
  return (
    <section>
      <div className="mb-5 mt-5 block rounded-lg border border-slate-200 bg-card p-6 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-light text-xl font-semibold text-slate-700">
            {manager.name?.charAt(0).toUpperCase() ?? "?"}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold text-slate-900">
                {manager.name}
              </h1>

              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                  manager.is_active
                    ? "border border-green-700 bg-green-100 text-green-700"
                    : "border border-slate-500 bg-slate-100 text-slate-500"
                }`}
              >
                {manager.is_active ? (
                  <>
                    <Check className="h-3 w-3" />
                    Active
                  </>
                ) : (
                  <>
                    <X className="h-3 w-3" />
                    Inactive
                  </>
                )}
              </span>
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
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 w-fit">
                <Users className="h-3 w-3" />
                {Number(manager.assigned_partners_count)} Partner
                {Number(manager.assigned_partners_count) !== 1 && "s"}
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                <AlertCircle className="h-3 w-3" />
                Needs Partner
              </span>
            )}
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <span className="flex items-center gap-2 text-slate-600">
              <Users className="h-4 w-4" />
              Partner List
            </span>

            {manager.assigned_partners &&
            manager.assigned_partners.length > 0 ? (
              <div className="flex flex-wrap gap-2 md:justify-end">
                {manager.assigned_partners.map((partner) => (
                  <span
                    key={partner.id}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700 transition hover:bg-slate-100"
                  >
                    {partner.name}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-slate-400">
                No partners assigned
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
