"use client";

import { CheckCheck } from "lucide-react";
import Button from "components/ub/core/buttons/Button";

interface MarkAllAsReadButtonProps {
  onClick: () => void;
  loading: boolean;
  disabled?: boolean;
}

export default function MarkAllAsReadButton({ onClick, loading, disabled }: MarkAllAsReadButtonProps) {
  return (
    <Button
      onClick={onClick}
      loading={loading}
      disabled={disabled}
      variant="secondary"
      size="sm"
      icon={<CheckCheck className="h-4 w-4" aria-hidden="true" />}
      text={loading ? "Marking…" : "Mark all as read"}
      className="shrink-0"
    />
  );
}
