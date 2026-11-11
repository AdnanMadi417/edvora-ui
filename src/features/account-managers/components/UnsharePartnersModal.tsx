"use client";

import React, { useMemo, useState } from "react";
import { AlertTriangle, ShieldOff } from "lucide-react";
import FormModal from "components/ub/feedback/dialogs/FormModal";
import Button from "components/ub/core/buttons/Button";
import SelectField from "components/ub/forms/selection/SelectField";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { getApiErrorCode, parseApiError } from "utils/parseApiError";
import { useAccountManagers } from "../hooks/useAccountManagers";
import { useUnsharePartners } from "../hooks/useUnsharePartners";
import type { AccountManager, UnsharePartnersResult } from "../types";

interface UnsharePartnersModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** The primary manager whose partners another manager may be sharing. */
  sourceManager: Pick<AccountManager, "id" | "name"> | null;
  onUnshared?: (result: UnsharePartnersResult) => void;
}

const ERROR_MESSAGES: Record<string, string> = {
  manager_not_found:
    "That account manager no longer exists. Refresh the page and try again.",
  same_manager: "Choose a different account manager.",
};

function pluralize(count: number, noun: string) {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

/**
 * Mirror of the Share option (UBX-324): removes another manager's shared
 * access to every partner of `sourceManager`. The primary assignment is
 * untouched. Idempotent — a manager with no shared access yields a zero count.
 */
export default function UnsharePartnersModal({
  isOpen,
  onClose,
  sourceManager,
  onUnshared,
}: UnsharePartnersModalProps) {
  if (!isOpen || !sourceManager) return null;
  return (
    <UnsharePartnersBody
      sourceManager={sourceManager}
      onClose={onClose}
      onUnshared={onUnshared}
    />
  );
}

interface BodyProps {
  sourceManager: Pick<AccountManager, "id" | "name">;
  onClose: () => void;
  onUnshared?: (result: UnsharePartnersResult) => void;
}

function UnsharePartnersBody({
  sourceManager,
  onClose,
  onUnshared,
}: BodyProps) {
  const [targetId, setTargetId] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const { showToast } = useToast();
  // Inactive managers included on purpose: removing access never needs the target to be active.
  const {
    accountManagers,
    loading: managersLoading,
    error: managersError,
  } = useAccountManagers({ page_size: 100 });
  const { unsharePartners, loading: submitting } = useUnsharePartners();

  const targets = useMemo(
    () => accountManagers.filter((m) => m.id !== sourceManager.id),
    [accountManagers, sourceManager.id]
  );
  const sourceName = sourceManager.name || "this manager";
  const targetName =
    targets.find((m) => m.id === targetId)?.name ?? "the selected manager";

  const handleConfirm = async () => {
    if (!targetId) {
      setFormError(
        "Select the account manager whose shared access should be removed."
      );
      return;
    }
    setFormError(null);
    try {
      const result = await unsharePartners(sourceManager.id, {
        target_manager_id: targetId,
      });
      showToast(
        result.unshared_partners_count === 0
          ? `${targetName} had no shared access to ${sourceName}'s advisors`
          : `Shared access removed: ${targetName} no longer sees ${pluralize(
              result.unshared_partners_count,
              "advisor"
            )} of ${sourceName}`,
        "success"
      );
      onUnshared?.(result);
      onClose();
    } catch (err: unknown) {
      const code = getApiErrorCode(err);
      setFormError(
        (code && ERROR_MESSAGES[code]) ??
          parseApiError(
            err,
            "Failed to remove shared access. Please try again."
          )
      );
    }
  };

  return (
    <FormModal
      open
      onClose={onClose}
      title={"Remove Shared Access"}
      description={
        "Remove another account manager’s shared access to these advisors."
      }
      icon={ShieldOff}
      size="md"
      onSubmit={(event) => {
        event.preventDefault();
        if (!submitting && !managersLoading && targetId) return handleConfirm();
      }}
      submitting={submitting}
      submitLabel={submitting ? "Removing..." : "Remove shared access"}
      submitTone="destructive"
      submitDisabled={managersLoading || !targetId}
    >
      <fieldset disabled={submitting} className="min-w-0">
        <div className="space-y-5">
          <p className="text-sm text-ub-text-secondary">
            Choose the account manager who should no longer see{" "}
            <span className="font-medium text-ub-text-primary">{sourceName}</span>
            &apos;s advisors. {sourceName} stays their primary manager; nothing
            else changes.
          </p>

          <div>
            <SelectField
              label="Remove access for"
              field="target_manager_id"
              options={targets.map((m) => ({
                label: `${m.name || m.email}${
                  m.is_active ? "" : " (inactive)"
                }`,
                value: m.id,
              }))}
              formData={{ target_manager_id: targetId }}
              errors={
                formError && !targetId ? { target_manager_id: formError } : {}
              }
              updateFormData={(_field: string, value: string) => {
                setTargetId(value);
                setFormError(null);
              }}
              disabled={managersLoading || submitting}
            />
            {managersError && (
              <p className="-mt-2 text-xs text-ub-tone-danger-text">{managersError}</p>
            )}
          </div>

          {formError && targetId && (
            <div className="flex items-start gap-2 rounded-md border border-ub-tone-danger-border bg-ub-tone-danger-bg px-4 py-3 text-sm text-ub-tone-danger-text">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}
        </div>
      </fieldset>
    </FormModal>
  );
}
