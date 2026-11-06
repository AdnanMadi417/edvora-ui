"use client";

import React from "react";
import { AlertTriangle, ArrowRightLeft, Trash2 } from "lucide-react";
import FormModal from "components/ub/feedback/dialogs/FormModal";
import Button from "components/ub/core/buttons/Button";

interface DeleteAccountManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  AccountManager?: string;
  /**
   * When > 0, deletion is blocked: the manager still has this many assigned
   * partners (the backend refuses with 409 until they are transferred).
   */
  blockedPartnersCount?: number | null;
  /** Opens the transfer flow from the blocked state. */
  onTransferPartners?: () => void;
}

export default function DeleteAccountManagerModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  AccountManager,
  blockedPartnersCount = null,
  onTransferPartners,
}: DeleteAccountManagerModalProps) {
  const isBlocked =
    typeof blockedPartnersCount === "number" && blockedPartnersCount > 0;
  return (
    <FormModal
      open={isOpen}
      onClose={onClose}
      title="Delete Account Manager"
      description="Confirm removal of this account manager."
      icon={Trash2}
      size="md"
      submitLabel={isDeleting ? "Deleting..." : "Delete Manager"}
      submitTone="destructive"
      submitting={isDeleting}
      submitDisabled={isBlocked}
      onSubmit={(event) => {
        event.preventDefault();
        if (!isBlocked && !isDeleting) onConfirm();
      }}
    >
      <div className="space-y-4">
        {isBlocked ? (
          <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div className="space-y-3">
              <p className="text-sm text-amber-900">
                This account manager still has {blockedPartnersCount} assigned{" "}
                {blockedPartnersCount === 1 ? "advisor" : "advisors"}. Transfer
                them before deleting.
              </p>
              {onTransferPartners && (
                <Button
                  onClick={onTransferPartners}
                  icon={<ArrowRightLeft className="h-4 w-4" />}
                  text="Transfer advisors"
                  variant="secondary"
                />
              )}
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Confirm Deletion
            </h3>
            <p className="text-sm text-slate-500">
              Are you sure you want to remove this account manager from the
              system?
            </p>
          </div>
        )}

        {AccountManager && (
          <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-sm font-medium text-slate-800">
              {AccountManager}
            </p>
          </div>
        )}
      </div>
    </FormModal>
  );
}
