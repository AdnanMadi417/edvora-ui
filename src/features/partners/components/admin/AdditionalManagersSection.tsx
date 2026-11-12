"use client";

import React, { useMemo, useState } from "react";
import { Share2, UserPlus, X } from "lucide-react";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import Button from "components/ub/core/buttons/Button";
import { getApiErrorCode, parseApiError } from "utils/parseApiError";
import { useAdditionalManagers } from "features/partners/hooks";
import type {
  AdditionalManager,
  PartnerDetails,
} from "features/partners/types";
import type { AccountManager } from "features/account-managers/types";
import { fieldControl, fieldControlHeight } from "components/ub/recipes";
import {
  SelectChevron,
  selectControl,
} from "components/ub/forms/layout/FieldChrome";

interface Props {
  partner: PartnerDetails;
  /** Active account managers to offer in the picker (the page already loads these). */
  accountManagers: AccountManager[];
  /** Refetch the partner after a change so the chips reflect the server. */
  onChanged: () => void;
}

const ERROR_MESSAGES: Record<string, string> = {
  manager_is_primary: "That manager is already this advisor's primary manager.",
  target_manager_inactive:
    "That account manager is inactive. Choose an active one.",
  agency_member_manager_not_editable:
    "Team members inherit their agency's managers. Change the agency instead.",
  manager_not_found:
    "That account manager no longer exists. Refresh the page and try again.",
};

/**
 * "Additional managers" on the admin partner page (UBX-324): account managers
 * who share access to this partner without being its primary. Add one from
 * the picker, remove one with the × on its chip. Hidden for agency members —
 * they mirror their agency's managers and cannot be edited directly.
 */
export default function AdditionalManagersSection({
  partner,
  accountManagers,
  onChanged,
}: Props) {
  const { showToast } = useToast();
  const { addManager, removeManager, loading } = useAdditionalManagers();
  const [selectedId, setSelectedId] = useState("");
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);

  const current: AdditionalManager[] = useMemo(
    () => partner.additional_managers ?? [],
    [partner.additional_managers]
  );
  const isMember = partner.agency_role === "member";

  const options = useMemo(() => {
    const taken = new Set([
      partner.assigned_manager_id,
      ...current.map((m) => m.id),
    ]);
    return accountManagers.filter((m) => m.is_active && !taken.has(m.id));
  }, [accountManagers, current, partner.assigned_manager_id]);

  const fail = (err: unknown, fallback: string) => {
    const code = getApiErrorCode(err);
    showToast(
      (code && ERROR_MESSAGES[code]) ?? parseApiError(err, fallback),
      "error"
    );
  };

  const handleAdd = async () => {
    if (!selectedId) return;
    const name =
      accountManagers.find((m) => m.id === selectedId)?.name ?? "The manager";
    try {
      await addManager(partner.id, selectedId);
      showToast(
        `${name} now shares access to ${partner.name || "this advisor"}`,
        "success"
      );
      setSelectedId("");
      onChanged();
    } catch (err: unknown) {
      fail(err, "Failed to add the manager. Please try again.");
    }
  };

  const handleRemove = async (manager: AdditionalManager) => {
    setPendingRemoveId(manager.id);
    try {
      await removeManager(partner.id, manager.id);
      showToast(
        `${manager.name || manager.email} no longer shares access to ${
          partner.name || "this advisor"
        }`,
        "success"
      );
      onChanged();
    } catch (err: unknown) {
      fail(err, "Failed to remove the manager. Please try again.");
    } finally {
      setPendingRemoveId(null);
    }
  };

  return (
    <div
      className="m-3 rounded-ub-lg border border-ub-border p-4 sm:m-6 sm:p-6"
      data-testid="additional-managers"
    >
      <div className="mb-1 flex items-center gap-2">
        <Share2 className="h-4 w-4 text-ub-text-secondary" />
        <p className="text-xs font-semibold uppercase tracking-wide text-ub-text-secondary">
          Additional managers
        </p>
      </div>
      <p className="mb-4 text-xs text-ub-text-secondary">
        {isMember
          ? "Inherited from the agency — change them on the agency's page."
          : "Account managers who can see and manage this advisor alongside the assigned manager."}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {current.length === 0 && (
          <span className="text-sm text-ub-text-secondary">
            No additional managers.
          </span>
        )}
        {current.map((m) => (
          <span
            key={m.id}
            className="inline-flex items-center gap-1.5 rounded-full border border-ub-tone-brand-border bg-ub-tone-brand-bg py-1 pl-3 pr-1.5 text-sm text-ub-text-link"
          >
            {m.name || m.email}
            {!isMember && (
              <button
                type="button"
                onClick={() => handleRemove(m)}
                disabled={loading}
                aria-label={`Remove ${m.name || m.email}`}
                title="Remove shared access"
                className="-my-0.5 flex h-6 w-6 items-center justify-center rounded-full text-ub-icon-interactive transition hover:bg-ub-tone-brand-bg hover:text-ub-text-link disabled:opacity-50"
              >
                <X
                  className={`h-3.5 w-3.5 ${
                    pendingRemoveId === m.id ? "animate-pulse" : ""
                  }`}
                />
              </button>
            )}
          </span>
        ))}
      </div>

      {!isMember && (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-72">
            <select
              aria-label="Add an account manager"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              disabled={loading || options.length === 0}
              className={`${fieldControl} ${fieldControlHeight} ${selectControl}`}
            >
              <option value="">
                {options.length === 0
                  ? "No other active manager available"
                  : "Select an account manager..."}
              </option>
              {options.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name || m.email}
                </option>
              ))}
            </select>
            <SelectChevron />
          </div>
          <Button
            onClick={handleAdd}
            disabled={loading || !selectedId}
            icon={<UserPlus className="h-4 w-4" />}
            text={loading && selectedId ? "Adding..." : "Add manager"}
            variant="secondary"
            className="sm:w-auto"
          />
        </div>
      )}
    </div>
  );
}
