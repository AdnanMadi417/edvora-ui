"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, KeyRound, Save, ShieldCheck } from "lucide-react";

import {
  useRoles,
  usePermissionsCatalog,
  useRolePermissions,
  useRenameRole,
  useSetRolePermissions,
} from "../../hooks";
import type { Permission } from "../../types";

import Loading from "components/loading/Loading";
import EmptyData from "components/emptyData/EmptyTableData";
import InputField from "components/form/fields/InputField";
import Button from "components/ui/buttons/Button";
import { StatusBadge } from "components/ui/badges";
import { useToast } from "components/context/ToastContext";
import { parseApiError } from "utils/parseApiError";

interface RoleDetailsProps {
  roleId: number;
}

function formatResourceLabel(resource: string): string {
  return resource
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function RoleDetails({ roleId }: RoleDetailsProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const { roles, loading: rolesLoading, refetch: refetchRoles } = useRoles();
  const role = roles.find((r) => r.id === roleId) ?? null;

  const { permissions: catalog, loading: catalogLoading } = usePermissionsCatalog();
  const { permissionIds, loading: grantsLoading } = useRolePermissions(role?.id);

  const { renameRole, loading: renaming } = useRenameRole();
  const { setRolePermissions, loading: savingPermissions } = useSetRolePermissions();

  const [name, setName] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (role) setName(role.name);
  }, [role?.id, role?.name]);

  useEffect(() => {
    setSelected(new Set(permissionIds));
  }, [permissionIds]);

  const groupedCatalog = useMemo(() => {
    const map = new Map<string, Permission[]>();
    for (const permission of catalog) {
      const group = map.get(permission.resource) ?? [];
      group.push(permission);
      map.set(permission.resource, group);
    }
    return Array.from(map.entries());
  }, [catalog]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const nameChanged = !!role && !role.is_system && name.trim() !== role.name;
  const permissionsChanged = useMemo(() => {
    if (selected.size !== permissionIds.size) return true;
    for (const id of selected) {
      if (!permissionIds.has(id)) return true;
    }
    return false;
  }, [selected, permissionIds]);

  const isDirty = nameChanged || permissionsChanged;
  const saving = renaming || savingPermissions;
  const isLoadingPermissions = catalogLoading || grantsLoading;

  const handleSave = async () => {
    if (!role) return;
    try {
      if (nameChanged) {
        await renameRole(role.id, { name: name.trim() });
        refetchRoles();
      }
      if (permissionsChanged) {
        await setRolePermissions(role.id, Array.from(selected));
      }
      showToast("Role updated successfully.", "success");
    } catch (error: any) {
      showToast(`Failed to update role. ${parseApiError(error, "Please try again.")}`, "error");
    }
  };

  if (rolesLoading && !role) return <Loading text="Loading role details..." />;
  if (!role) return <EmptyData />;

  return (
    <section className="mx-auto mt-6 max-w-5xl">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-card shadow-sm">
        {/* Header */}
        <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-light text-slate-700">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold text-slate-900">{role.name}</h1>
                {role.is_system ? (
                  <StatusBadge variant="neutral">System</StatusBadge>
                ) : (
                  <StatusBadge variant="info">Custom</StatusBadge>
                )}
              </div>
              <p className="flex items-center gap-1.5 text-sm text-slate-500">
                <KeyRound className="h-3.5 w-3.5" />
                <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700">{role.code}</code>
              </p>
            </div>
          </div>

          <Button
            onClick={() => router.push("/admin/roles")}
            icon={<ChevronLeft className="h-4 w-4" />}
            text="Back"
            bgColor="bg-white"
            textColor="text-slate-700"
            borderColor="border-slate-200"
            hoverTextColor="hover:text-slate-900"
            hoverBorderColor="hover:border-slate-300"
          />
        </div>

        <div className="h-px w-full bg-slate-200" />

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

        <div className="h-px w-full bg-slate-200" />

        {/* Permissions */}
        <div className="p-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Permissions
          </p>

          {isLoadingPermissions ? (
            <Loading text="Loading permissions..." />
          ) : groupedCatalog.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              No permissions are available in the catalog.
            </p>
          ) : (
            <div className="space-y-5">
              {groupedCatalog.map(([resource, perms]) => (
                <div key={resource} className="border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {formatResourceLabel(resource)}
                  </p>
                  <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                    {perms.map((permission) => (
                      <label
                        key={permission.id}
                        className="flex items-start gap-3 rounded-lg px-2 py-2 hover:bg-slate-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selected.has(permission.id)}
                          onChange={() => toggle(permission.id)}
                          className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900">{permission.action}</p>
                          {permission.description && (
                            <p className="text-xs text-slate-500">{permission.description}</p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t border-slate-200 bg-card px-6 py-4">
          <Button
            onClick={handleSave}
            disabled={!isDirty || saving || isLoadingPermissions}
            icon={<Save className="h-4 w-4" />}
            text={saving ? "Saving..." : "Save Changes"}
            bgColor="bg-blue-50"
            textColor="text-blue-700"
            borderColor="border-blue-600"
            hoverTextColor="hover:text-blue-800"
            hoverBorderColor="hover:border-blue-700"
          />
        </div>
      </div>
    </section>
  );
}
