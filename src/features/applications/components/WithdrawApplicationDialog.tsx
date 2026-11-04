"use client";

import { ConfirmDialog } from "components/ub/feedback/dialogs/Modal";

export interface WithdrawApplicationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  /** Disables both buttons while the request runs. */
  loading?: boolean;
}

/** Brief §8: the dialog names the consequence; Cancel is focused first. */
export default function WithdrawApplicationDialog({ open, onClose, onConfirm, loading = false }: WithdrawApplicationDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      loading={loading}
      tone="danger"
      title="Withdraw this application?"
      consequence="The Institution will be notified, and this can't be undone."
      confirmLabel="Withdraw application"
    />
  );
}
