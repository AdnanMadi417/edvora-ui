"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle, ArrowRightLeft, ChevronDown, ChevronUp, ListChecks, Share2, Users, XCircle,
} from "lucide-react";
import ModalHeader from "components/ui/modal/ModalHeader";
import Button from "components/ui/buttons/Button";
import SelectField from "components/form/fields/SelectField";
import SearchableChecklist, { type SearchableChecklistItem } from "components/form/search/SearchableChecklist";
import RadioCardGroup from "components/form/radio/RadioCardGroup";
import { useToast } from "components/context/ToastContext";
import { getApiErrorCode, getApiErrorDetails, parseApiError } from "utils/parseApiError";
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
  /** The manager whose partners are being handed over or shared. */
  sourceManager: TransferSourceManager | null;
  /** Fired after a successful transfer/share so callers can refetch lists and counts. */
  onTransferred?: (result: TransferPartnersResult) => void;
  /** Which option is pre-selected when the dialog opens. */
  initialMode?: TransferPartnersMode;
  /** Hide the Share option (e.g. from the blocked-delete flow, where only a move makes sense). */
  allowShare?: boolean;
}

/** Backend error codes mapped to admin-facing copy; anything else falls back to the API message. */
const ERROR_MESSAGES: Record<string, string> = {
  manager_not_found: "That account manager no longer exists. Refresh the page and try again.",
  target_manager_inactive: "The selected account manager is inactive. Choose an active one.",
  same_manager: "Choose a different account manager.",
  target_required_for_copy: "Choose the account manager to share with.",
  partner_not_assigned_to_source:
    "Some of these advisors changed while you were on this screen. Refresh the page and try again.",
};

function pluralize(count: number, noun: string) {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

function firstName(fullName: string | null | undefined) {
  return (fullName ?? "").trim().split(/\s+/)[0] || "This manager";
}

/**
 * "Transfer or Share Advisors" dialog (UBX-318 / UBX-324). Same entry point
 * for both operations on a manager's whole portfolio, or on a ticked subset
 * chosen from a searchable list (UBX-469):
 * - Transfer (move): the source ends up with none; the target becomes primary.
 * - Share (copy): the source keeps everything; the target is added as an
 *   additional manager with identical access. A snapshot, not a mirror.
 * Opened from the manager profile's Partners tab, the managers table row
 * action, and the blocked delete-manager flow.
 */
export default function TransferPartnersModal({
  isOpen,
  onClose,
  sourceManager,
  onTransferred,
  initialMode = "move",
  allowShare = true,
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
            title={allowShare ? "Transfer or Share Advisors" : "Transfer Advisors"}
            description={
              allowShare
                ? "Hand this manager's advisors over to another account manager, or give another manager shared access."
                : "Hand this manager's advisors over to another account manager."
            }
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
            initialMode={allowShare ? initialMode : "move"}
            allowShare={allowShare}
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
  initialMode: TransferPartnersMode;
  allowShare: boolean;
  onClose: () => void;
  onTransferred?: (result: TransferPartnersResult) => void;
}

const MODE_OPTIONS: { value: TransferPartnersMode; label: string; hint: string; icon: typeof ArrowRightLeft }[] = [
  { value: "move", label: "Transfer", hint: "Move them. The current manager loses access.", icon: ArrowRightLeft },
  { value: "copy", label: "Share", hint: "Copy access. Both managers see them.", icon: Share2 },
];

/** "all" keeps the original whole-portfolio behaviour; "selected" sends only the ticked partner_ids (UBX-469). */
type TransferScope = "all" | "selected";

const SCOPE_OPTIONS: { value: TransferScope; label: string; hint: (count: number) => string; icon: typeof Users }[] = [
  { value: "all", label: "All advisors", hint: (n) => `Every advisor currently assigned (${n}).`, icon: Users },
  { value: "selected", label: "Selected advisors", hint: () => "Pick them from a searchable list.", icon: ListChecks },
];

/** Partner ids the backend named in a `partner_not_assigned_to_source` rejection. */
function rejectedPartnerIds(err: unknown): string[] {
  const ids = getApiErrorDetails(err)?.partner_ids;
  return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === "string") : [];
}

function TransferPartnersBody({ sourceManager, initialMode, allowShare, onClose, onTransferred }: BodyProps) {
  const [mode, setMode] = useState<TransferPartnersMode>(initialMode);
  const [scope, setScope] = useState<TransferScope>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [targetId, setTargetId] = useState("");
  const [showList, setShowList] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { showToast } = useToast();
  const { accountManagers, loading: managersLoading, error: managersError } = useAccountManagers({
    is_active: true,
    page_size: 100,
  });
  const { transferPartners, loading: submitting } = useTransferPartners();

  const targets = useMemo(
    () => accountManagers.filter((m) => m.id !== sourceManager.id && m.is_active),
    [accountManagers, sourceManager.id]
  );

  const count = Number(sourceManager.assigned_partners_count) || 0;
  const partners = useMemo(() => sourceManager.assigned_partners ?? [], [sourceManager.assigned_partners]);
  const sourceName = sourceManager.name || "this manager";
  const sourceFirst = firstName(sourceManager.name);
  const targetName = targets.find((m) => m.id === targetId)?.name ?? "the selected manager";
  const isShare = mode === "copy";
  // From the blocked-delete flow (allowShare=false) only moving everything
  // unblocks the deletion, so the scope choice is not offered there.
  const canPickSubset = allowShare && partners.length > 0;
  const isSubset = canPickSubset && scope === "selected";
  const effectiveCount = isSubset ? selectedIds.size : count;

  const checklistItems = useMemo<SearchableChecklistItem[]>(
    () =>
      partners.map((p) => ({
        id: p.id,
        label: p.name || "Unnamed advisor",
        sublabel: p.email ?? null,
        badge: p.type === "agency" ? "Company" : null,
        hint: p.type === "agency" ? "Includes the agency's team members" : null,
      })),
    [partners]
  );

  const handleConfirm = async () => {
    if (!targetId) {
      setFormError(
        isShare
          ? "Select the account manager to share these advisors with."
          : "Select the account manager who will receive these advisors."
      );
      return;
    }
    setFormError(null);
    try {
      const result = await transferPartners(sourceManager.id, {
        target_manager_id: targetId,
        mode,
        // Omitted in "all" mode so the backend keeps acting on whatever it
        // currently holds for the source (idempotent re-runs included).
        ...(isSubset ? { partner_ids: Array.from(selectedIds) } : {}),
      });
      showToast(successMessage(result, targetName), "success");
      onTransferred?.(result);
      onClose();
    } catch (err: unknown) {
      const code = getApiErrorCode(err);
      if (code === "partner_not_assigned_to_source") {
        // Someone else moved them meanwhile: drop the stale ticks so a retry
        // after refresh can succeed with the rest.
        const stale = rejectedPartnerIds(err);
        if (stale.length) {
          setSelectedIds((prev) => {
            const next = new Set(prev);
            stale.forEach((id) => next.delete(id));
            return next;
          });
        }
      }
      setFormError(
        (code && ERROR_MESSAGES[code]) ??
          parseApiError(err, isShare ? "Failed to share advisors. Please try again." : "Failed to transfer advisors. Please try again.")
      );
    }
  };

  const confirmDisabled =
    submitting || managersLoading || count === 0 || !targetId || (isSubset && selectedIds.size === 0);
  const verb = isShare ? "Share" : "Transfer";

  return (
    <>
      <div className="max-h-[65vh] space-y-5 overflow-y-auto px-7 py-6">
        {allowShare && (
          <RadioCardGroup
            ariaLabel="What do you want to do?"
            value={mode}
            onChange={(value) => {
              setMode(value);
              setFormError(null);
            }}
            options={MODE_OPTIONS}
          />
        )}

        {canPickSubset && (
          <RadioCardGroup
            ariaLabel="Which advisors?"
            value={scope}
            onChange={(value) => {
              setScope(value);
              setFormError(null);
            }}
            options={SCOPE_OPTIONS.map((opt) => ({ ...opt, hint: opt.hint(count) }))}
          />
        )}

        {count === 0 ? (
          <p className="text-sm text-slate-600">
            <span className="font-medium text-slate-900">{sourceName}</span> has no advisors to {verb.toLowerCase()}.
          </p>
        ) : isSubset ? (
          isShare ? (
            <p className="text-sm text-slate-600">
              Share only the advisors you tick below with another account manager. {sourceFirst} keeps them; the other
              manager will also see and manage them. Advisors assigned to {sourceFirst} later are not shared automatically.
            </p>
          ) : (
            <p className="text-sm text-slate-600">
              Move only the advisors you tick below from <span className="font-medium text-slate-900">{sourceName}</span>{" "}
              to another account manager. {sourceFirst} will no longer see them.
            </p>
          )
        ) : isShare ? (
          <p className="text-sm text-slate-600">
            {count === 1 ? "Share the only advisor assigned to " : `Share all ${count} advisors of `}
            <span className="font-medium text-slate-900">{sourceName}</span> with another account manager.{" "}
            {sourceFirst} keeps {count === 1 ? "this advisor" : "these advisors"}; the other manager will also see and
            manage {count === 1 ? "it" : "them"}. Advisors assigned to {sourceFirst} later are not shared automatically.
          </p>
        ) : (
          <p className="text-sm text-slate-600">
            {count === 1 ? "Move the only advisor assigned to " : `Move all ${count} advisors from `}
            <span className="font-medium text-slate-900">{sourceName}</span> to another account manager.{" "}
            {sourceFirst} will no longer see {count === 1 ? "this advisor" : "these advisors"}.
          </p>
        )}

        {isSubset && (
          <SearchableChecklist
            items={checklistItems}
            selected={selectedIds}
            onChange={setSelectedIds}
            itemNoun="advisors"
            label={isShare ? "advisors to share" : "advisors to transfer"}
            disabled={submitting}
          />
        )}

        {!isSubset && count > 0 && partners.length > 0 && (
          <div className="rounded-md border border-slate-200 bg-slate-50">
            <button
              type="button"
              onClick={() => setShowList((v) => !v)}
              className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium text-slate-700 hover:text-slate-900"
              aria-expanded={showList}
            >
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-400" />
                {showList ? "Hide advisors" : "Show advisors"} ({partners.length})
              </span>
              {showList ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {showList && (
              <ul className="max-h-40 overflow-y-auto border-t border-slate-200 px-4 py-2 text-sm text-slate-700">
                {partners.map((p) => (
                  <li key={p.id} className="truncate py-1">
                    {p.name || "Unnamed advisor"}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {count > 0 && (
          <div>
            <SelectField
              label={isShare ? "Share with account manager" : "New account manager"}
              field="target_manager_id"
              options={targets.map((m) => ({ label: m.name || m.email, value: m.id }))}
              formData={{ target_manager_id: targetId }}
              errors={formError && !targetId ? { target_manager_id: formError } : {}}
              updateFormData={(_field: string, value: string) => {
                setTargetId(value);
                setFormError(null);
              }}
              disabled={managersLoading || submitting}
            />
            {managersError && (
              <p className="-mt-2 text-xs text-red-600">{managersError}</p>
            )}
            {!managersLoading && !managersError && targets.length === 0 && (
              <p className="-mt-2 text-xs text-slate-500">
                There is no other active account manager to {verb.toLowerCase()} to.
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
          disabled={confirmDisabled}
          icon={isShare ? <Share2 className="h-5 w-5" /> : <ArrowRightLeft className="h-5 w-5" />}
          text={
            submitting
              ? isShare ? "Sharing..." : "Transferring..."
              : `${verb} ${pluralize(effectiveCount, "advisor")}`
          }
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

function successMessage(result: TransferPartnersResult, targetName: string): string {
  if (result.mode === "copy") {
    if (result.shared_partners_count === 0 && result.already_shared_count > 0) {
      return `${targetName} already had access to ${pluralize(result.already_shared_count, "advisor")}`;
    }
    const base = `${pluralize(result.shared_partners_count, "advisor")} shared with ${targetName}`;
    return result.already_shared_count > 0
      ? `${base} (${result.already_shared_count} already had access)`
      : base;
  }
  return `${pluralize(result.moved_partners_count, "advisor")} transferred to ${targetName}`;
}
