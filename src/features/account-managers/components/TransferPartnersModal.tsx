"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowRightLeft, ChevronDown, ChevronUp, Users, XCircle } from "lucide-react";
import ModalHeader from "components/ui/modal/ModalHeader";
import Button from "components/ui/buttons/Button";
import SelectField from "components/form/fields/SelectField";
import { useToast } from "components/context/ToastContext";
import { getApiErrorCode, parseApiError } from "utils/parseApiError";
import { useAccountManagers } from "../hooks/useAccountManagers";
import { useTransferPartners } from "../hooks/useTransferPartners";
import type { AccountManager, TransferPartnersMode, TransferPartnersResult } from "../types";

export type TransferSourceManager = Pick<
  AccountManager,
  "id" | "name" | "assigned_partners_count" | "assigned_partners"
>;

interface TransferPartnersModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** The manager whose partners are being handed over. */
  sourceManager: TransferSourceManager | null;
  /** Fired after a successful transfer so callers can refetch lists and counts. */
  onTransferred?: (result: TransferPartnersResult) => void;
  /** Reserved for a future share/copy option; only "move" exists today. */
  mode?: TransferPartnersMode;
}

/** Backend error codes mapped to admin-facing copy; anything else falls back to the API message. */
const ERROR_MESSAGES: Record<string, string> = {
  manager_not_found: "That account manager no longer exists. Refresh the page and try again.",
  target_manager_inactive: "The selected account manager is inactive. Choose an active one.",
  same_manager: "Choose a different account manager.",
  partner_not_assigned_to_source:
    "Some of these partners changed while you were on this screen. Refresh the page and try again.",
};

function pluralize(count: number, noun: string) {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

function firstName(fullName: string | null | undefined) {
  return (fullName ?? "").trim().split(/\s+/)[0] || "This manager";
}

/**
 * "Transfer Partners" dialog (UBX-318). Moves every partner of `sourceManager`
 * to a manager picked here; the source ends up with none, the target keeps its
 * own and gains these. Opened from the manager profile's Partners tab, the
 * managers table row action, and the blocked delete-manager flow.
 */
export default function TransferPartnersModal({
  isOpen,
  onClose,
  sourceManager,
  onTransferred,
  mode = "move",
}: TransferPartnersModalProps) {
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
        className={`w-full max-w-lg transform transition-all duration-300 md:max-w-xl ${
          isOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
          <ModalHeader
            title="Transfer Partners"
            description="Hand this manager's partners over to another account manager."
            icon={ArrowRightLeft}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            iconBorder="border-blue-200"
            titleColor="text-gray-900"
            onClose={onClose}
          />
          {/* The body mounts only while the dialog is shown, so the managers
              list is fetched on open rather than on every page that hosts it. */}
          <TransferPartnersBody
            sourceManager={sourceManager}
            mode={mode}
            onClose={onClose}
            onTransferred={onTransferred}
          />
        </div>
      </div>
    </div>
  );
}

interface BodyProps {
  sourceManager: TransferSourceManager;
  mode: TransferPartnersMode;
  onClose: () => void;
  onTransferred?: (result: TransferPartnersResult) => void;
}

function TransferPartnersBody({ sourceManager, mode, onClose, onTransferred }: BodyProps) {
  const [targetId, setTargetId] = useState("");
  const [showList, setShowList] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { showToast } = useToast();
  const { accountManagers, loading: managersLoading, error: managersError } = useAccountManagers({
    is_active: true,
    page_size: 100,
  });
  const { transferPartners, loading: transferring } = useTransferPartners();

  const targets = useMemo(
    () => accountManagers.filter((m) => m.id !== sourceManager.id && m.is_active),
    [accountManagers, sourceManager.id]
  );

  const count = Number(sourceManager.assigned_partners_count) || 0;
  const partners = sourceManager.assigned_partners ?? [];
  const sourceName = sourceManager.name || "this manager";
  const targetName = targets.find((m) => m.id === targetId)?.name ?? "the selected manager";

  const handleConfirm = async () => {
    if (!targetId) {
      setFormError("Select the account manager who will receive these partners.");
      return;
    }
    setFormError(null);
    try {
      const result = await transferPartners(sourceManager.id, { target_manager_id: targetId, mode });
      showToast(`${pluralize(result.moved_partners_count, "partner")} transferred to ${targetName}`, "success");
      onTransferred?.(result);
      onClose();
    } catch (err: unknown) {
      const code = getApiErrorCode(err);
      setFormError(
        (code && ERROR_MESSAGES[code]) ?? parseApiError(err, "Failed to transfer partners. Please try again.")
      );
    }
  };

  const confirmDisabled = transferring || managersLoading || count === 0 || !targetId;

  return (
    <>
      <div className="space-y-5 px-7 py-6">
        {count === 0 ? (
          <p className="text-sm text-slate-600">
            <span className="font-medium text-slate-900">{sourceName}</span> has no partners to transfer.
          </p>
        ) : (
          <p className="text-sm text-slate-600">
            {count === 1 ? "Move the only partner assigned to " : `Move all ${count} partners from `}
            <span className="font-medium text-slate-900">{sourceName}</span> to another account manager.{" "}
            {firstName(sourceManager.name)} will no longer see {count === 1 ? "this partner" : "these partners"}.
          </p>
        )}

        {count > 0 && partners.length > 0 && (
          <div className="rounded-md border border-slate-200 bg-slate-50">
            <button
              type="button"
              onClick={() => setShowList((v) => !v)}
              className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium text-slate-700 hover:text-slate-900"
              aria-expanded={showList}
            >
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-400" />
                {showList ? "Hide partners" : "Show partners"} ({partners.length})
              </span>
              {showList ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {showList && (
              <ul className="max-h-40 overflow-y-auto border-t border-slate-200 px-4 py-2 text-sm text-slate-700">
                {partners.map((p) => (
                  <li key={p.id} className="truncate py-1">
                    {p.name || "Unnamed partner"}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {count > 0 && (
          <div>
            <SelectField
              label="New account manager"
              field="target_manager_id"
              options={targets.map((m) => ({ label: m.name || m.email, value: m.id }))}
              formData={{ target_manager_id: targetId }}
              errors={formError && !targetId ? { target_manager_id: formError } : {}}
              updateFormData={(_field: string, value: string) => {
                setTargetId(value);
                setFormError(null);
              }}
              disabled={managersLoading || transferring}
            />
            {managersError && (
              <p className="-mt-2 text-xs text-red-600">{managersError}</p>
            )}
            {!managersLoading && !managersError && targets.length === 0 && (
              <p className="-mt-2 text-xs text-slate-500">
                There is no other active account manager to transfer to.
              </p>
            )}
          </div>
        )}

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
          disabled={transferring}
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
          disabled={confirmDisabled}
          icon={<ArrowRightLeft className="h-5 w-5" />}
          text={transferring ? "Transferring..." : `Transfer ${pluralize(count, "partner")}`}
          bgColor="bg-blue-50"
          textColor="text-blue-700"
          borderColor="border-blue-600"
          hoverTextColor="hover:text-blue-800"
          hoverBorderColor="hover:border-blue-700"
        />
      </div>
    </>
  );
}
