"use client";

import Breadcrumbs from "components/ub/navigation/links/Breadcrumbs";
import React, { useEffect, useState } from "react";
import { KeyRound, Save, ShieldCheck } from "lucide-react";

import { useRoles, useRenameRole, useRolePermissions } from "../../hooks";
import Tag from "components/ub/data/badges/Tag";
import Skeleton from "components/ub/feedback/states/Skeleton";
import type { Permission } from "../../types";

import Loading from "components/ub/feedback/states/Loading";
import EmptyData from "components/ub/feedback/states/EmptyTableData";
import InputField from "components/ub/forms/text/InputField";
import Button from "components/ub/core/buttons/Button";
import StatusBadge from "components/ub/data/badges/StatusBadge";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { parseApiError } from "utils/parseApiError";

// Backend resource names → what staff call them in the portal.
const AREA_LABELS: Record<string, string> = { partners: "Advisors", knowledge_hub: "Knowledge Hub" };
const areaLabel = (resource: string) =>
  AREA_LABELS[resource] ?? resource.charAt(0).toUpperCase() + resource.slice(1).replace(/_/g, " ");

/** Permissions grouped by area, e.g. Applications → Read, Approve. */
function groupByArea(permissions: Permission[]) {
  const areas = new Map<string, string[]>();
  permissions.forEach((p) => areas.set(p.resource, [...(areas.get(p.resource) ?? []), p.action]));
  return [...areas.entries()].map(([resource, actions]) => ({ resource, label: areaLabel(resource), actions }));
}

interface RoleDetailsProps {
  roleId: number;
}

export default function RoleDetails({ roleId }: RoleDetailsProps) {
  const { showToast } = useToast();

  const { roles, loading: rolesLoading, refetch: refetchRoles } = useRoles();
  const role = roles.find((r) => r.id === roleId) ?? null;

  const { renameRole, loading: renaming } = useRenameRole();
  // Read-only: editing permissions stays hidden (see b04e4c95); this shows what the role allows.
  const { permissions, loading: permissionsLoading, error: permissionsError } = useRolePermissions(role?.id);
  const areas = groupByArea(permissions);

  const [name, setName] = useState("");

  useEffect(() => {
    if (role) setName(role.name);
  }, [role?.id, role?.name]);

  const nameChanged = !!role && !role.is_system && name.trim() !== role.name;
  const isDirty = nameChanged;
  const saving = renaming;

  const handleSave = async () => {
    if (!role) return;
    try {
      if (nameChanged) {
        await renameRole(role.id, { name: name.trim() });
        refetchRoles();
      }
      showToast("Role updated successfully.", "success");
    } catch (error: any) {
      showToast(`Failed to update role. ${parseApiError(error, "Please try again.")}`, "error");
    }
  };

  if (rolesLoading && !role) return <Loading text="Loading role details..." />;
  if (!role) return <EmptyData />;

  return (
    <section className="mx-auto mt-6 ">
      <div className="overflow-hidden rounded-2xl border border-ub-border bg-ub-surface shadow-sm">
        {/* Header */}
        <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ub-tone-brand-bg text-ub-tone-brand-text">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <Breadcrumbs items={[{ label: "Roles", href: "/admin/roles" }, { label: role.name }]} />
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold text-ub-text-primary">{role.name}</h1>
                {role.is_system ? (
                  <StatusBadge variant="neutral">System</StatusBadge>
                ) : (
                  <StatusBadge variant="info">Custom</StatusBadge>
                )}
              </div>
              <p className="flex items-center gap-1.5 text-sm text-ub-text-secondary">
                <KeyRound className="h-3.5 w-3.5" />
                <code className="rounded bg-ub-surface-subtle px-1.5 py-0.5 text-xs text-ub-text-secondary">{role.code}</code>
              </p>
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-ub-border" />

        {/* Role Name */}
        <div className="p-6">
          <InputField
            label="Role Name"
            field="name"
            placeholder="e.g. Finance Reviewer"
            required
            disabled={role.is_system}
            helperText={role.is_system ? "System roles can't be renamed." : ""}
            formData={{ name }}
            errors={{}}
            updateFormData={(_field: string, value: string) => setName(value)}
          />
        </div>

        <div className="h-px w-full bg-ub-border" />

        {/* What this role can do (read-only) */}
        <section aria-labelledby="role-permissions" className="space-y-4 p-6">
          <div>
            <h2 id="role-permissions" className="text-ub-heading-sm text-ub-text-primary">What this role can do</h2>
            <p className="mt-0.5 text-ub-body-sm text-ub-text-secondary">
              {permissionsLoading || permissionsError
                ? "Areas of the portal this role can use, and what it can do in each."
                : `${permissions.length} ${permissions.length === 1 ? "permission" : "permissions"} across ${areas.length} ${areas.length === 1 ? "area" : "areas"}.`}
            </p>
          </div>
          {permissionsLoading ? (
            <div className="space-y-2" aria-busy="true" aria-label="Loading permissions">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : permissionsError ? (
            <p className="text-ub-body-sm text-ub-text-secondary">Permissions couldn&apos;t be loaded. Refresh the page to try again.</p>
          ) : areas.length === 0 ? (
            <p className="text-ub-body-sm text-ub-text-secondary">This role has no permissions yet.</p>
          ) : (
            <dl className="divide-y divide-ub-border rounded-ub-md border border-ub-border">
              {areas.map((area) => (
                <div key={area.resource} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-6">
                  <dt className="text-ub-label-md text-ub-text-primary sm:w-44 sm:shrink-0">{area.label}</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {area.actions.map((action) => (
                      <Tag key={action} tone="neutral" size="sm" className="capitalize">
                        {action}
                      </Tag>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </section>

        {/* Footer: only custom roles can change (they can be renamed). */}
        {!role.is_system && (
        <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t border-ub-border bg-ub-surface px-6 py-4">
          <Button
            onClick={handleSave}
            disabled={!isDirty || saving}
            icon={<Save className="h-4 w-4" />}
            text={saving ? "Saving..." : "Save Changes"}
            variant="primary"
          />
        </div>
        )}
      </div>
    </section>
  );
}
