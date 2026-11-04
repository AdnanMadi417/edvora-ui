"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ShieldOff, XCircle } from "lucide-react";
import ModalHeader from "components/ub/feedback/dialogs/ModalHeader";
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
  manager_not_found: "That account manager no longer exists. Refresh the page and try again.",
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
export default function UnsharePartnersModal({ isOpen, onClose, sourceManager, onUnshared }: UnsharePartnersModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible || !sourceManager) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-overlay p-4 backdrop-blur-sm"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`w-full max-w-lg transform transition-all duration-300 ${
          isOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
          <ModalHeader
            title="Remove Shared Access"
            description="Stop another account manager from seeing this manager's advisors."
            icon={ShieldOff}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            iconBorder="border-amber-200"
            titleColor="text-gray-900"
            onClose={onClose}
          />
          <UnsharePartnersBody sourceManager={sourceManager} onClose={onClose} onUnshared={onUnshared} />
        </div>
      </div>
    </div>
  );
}

interface BodyProps {
  sourceManager: Pick<AccountManager, "id" | "name">;
  onClose: () => void;
  onUnshared?: (result: UnsharePartnersResult) => void;
}

function UnsharePartnersBody({ sourceManager, onClose, onUnshared }: BodyProps) {
  const [targetId, setTargetId] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const { showToast } = useToast();
  // Inactive managers included on purpose: removing access never needs the target to be active.
  const { accountManagers, loading: managersLoading, error: managersError } = useAccountManagers({ page_size: 100 });
  const { unsharePartners, loading: submitting } = useUnsharePartners();

  const targets = useMemo(
    () => accountManagers.filter((m) => m.id !== sourceManager.id),
    [accountManagers, sourceManager.id]
  );
  const sourceName = sourceManager.name || "this manager";
  const targetName = targets.find((m) => m.id === targetId)?.name ?? "the selected manager";

  const handleConfirm = async () => {
    if (!targetId) {
      setFormError("Select the account manager whose shared access should be removed.");
      return;
    }
    setFormError(null);
    try {
      const result = await unsharePartners(sourceManager.id, { target_manager_id: targetId });
      showToast(
        result.unshared_partners_count === 0
          ? `${targetName} had no shared access to ${sourceName}'s advisors`
          : `Shared access removed: ${targetName} no longer sees ${pluralize(result.unshared_partners_count, "advisor")} of ${sourceName}`,
        "success"
      );
      onUnshared?.(result);
      onClose();
    } catch (err: unknown) {
      const code = getApiErrorCode(err);
      setFormError((code && ERROR_MESSAGES[code]) ?? parseApiError(err, "Failed to remove shared access. Please try again."));
    }
  };

  return (
    <>
      <div className="space-y-5 px-7 py-6">
        <p className="text-sm text-slate-600">
          Choose the account manager who should no longer see{" "}
          <span className="font-medium text-slate-900">{sourceName}</span>&apos;s advisors.{" "}
          {sourceName} stays their primary manager; nothing else changes.
        </p>

        <div>
          <SelectField
            label="Remove access for"
            field="target_manager_id"
            options={targets.map((m) => ({ label: `${m.name || m.email}${m.is_active ? "" : " (inactive)"}`, value: m.id }))}
            formData={{ target_manager_id: targetId }}
            errors={formError && !targetId ? { target_manager_id: formError } : {}}
            updateFormData={(_field: string, value: string) => {
              setTargetId(value);
              setFormError(null);
            }}
            disabled={managersLoading || submitting}
          />
          {managersError && <p className="-mt-2 text-xs text-red-600">{managersError}</p>}
        </div>

        {formError && targetId && (
          <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
        <Button
          onClick={onClose}
          disabled={submitting}
          icon={<XCircle className="h-5 w-5" />}
          text="Cancel"
          bgColor="bg-slate-50"
          textColor="text-slate-700"
          borderColor="border-slate-600"
          hoverTextColor="hover:text-slate-800"
          hoverBorderColor="hover:border-slate-700"
        />
        <Button
          onClick={handleConfirm}
          disabled={submitting || managersLoading || !targetId}
          icon={<ShieldOff className="h-5 w-5" />}
          text={submitting ? "Removing..." : "Remove shared access"}
          bgColor="bg-amber-50"
          textColor="text-amber-800"
          borderColor="border-amber-500"
          hoverTextColor="hover:text-amber-900"
          hoverBorderColor="hover:border-amber-600"
        />
      </div>
    </>
  );
}
