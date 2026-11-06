import React from "react";
import { Pencil, UserCog } from "lucide-react";
import LinkBtn from "components/ub/core/buttons/LinkBtn";
import StatusBadge from "components/ub/data/badges/StatusBadge";
import DescriptionList from "components/ub/data/display/DescriptionList";
import type { AccountManager } from "../types";

export default function AccountManagerProfile({
  manager,
  editable = false,
}: {
  manager: AccountManager;
  editable?: boolean;
}) {
  return (
    <section className="my-5 min-w-0 overflow-hidden rounded-ub-xl border border-ub-border bg-ub-surface">
      <div className="flex flex-wrap items-start gap-4 border-b border-ub-border p-4 sm:p-6">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-ub-lg bg-ub-tone-brand-bg text-ub-tone-brand-text">
          <UserCog className="h-7 w-7" />
        </span>
        <div className="min-w-0 flex-1 space-y-2">
          <h1 className="break-words text-ub-heading-lg">{manager.name}</h1>
          <p className="break-all text-ub-body-sm text-ub-text-secondary">
            {manager.email}
          </p>
          <StatusBadge variant={manager.is_active ? "success" : "neutral"}>
            {manager.is_active ? "Active" : "Inactive"}
          </StatusBadge>
        </div>
        {editable && (
          <LinkBtn
            href={`/admin/account-managers/profile/${manager.id}/edit`}
            icon={<Pencil className="h-4 w-4" />}
            title={`Edit ${manager.name}`}
          />
        )}
      </div>
      <div className="p-4 sm:p-6">
        <DescriptionList
          columns={2}
          items={[
            {
              label: "Assigned advisors",
              value: Number(manager.assigned_partners_count) || 0,
            },
            {
              label: "Shared advisors",
              value: Number(manager.shared_partners_count) || 0,
            },
          ]}
        />
      </div>
    </section>
  );
}
