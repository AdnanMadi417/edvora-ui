"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, KeyRound, Save, ShieldCheck } from "lucide-react";

import { useRoles, useRenameRole } from "../../hooks";

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

export default function RoleDetails({ roleId }: RoleDetailsProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const { roles, loading: rolesLoading, refetch: refetchRoles } = useRoles();
  const role = roles.find((r) => r.id === roleId) ?? null;

  const { renameRole, loading: renaming } = useRenameRole();

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
    <section className="mx-auto mt-6 max-w-5xl">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
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

        {/* Footer */}
        <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
          <Button
            onClick={handleSave}
            disabled={!isDirty || saving}
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
