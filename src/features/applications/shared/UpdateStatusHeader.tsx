"use client";

import React from "react";
import { Clock } from "lucide-react";
import ModalHeader from "components/ub/feedback/ModalHeader";

interface UpdateStatusHeaderProps {
  stageName?: string;
  statusName?: string;
  onClose: () => void;
}

// Identical across the admin and account-manager "Update Application
// Status" popups — kept as one component so the two stay in sync.
export default function UpdateStatusHeader({ stageName, statusName, onClose }: UpdateStatusHeaderProps) {
  return (
    <ModalHeader
      title="Update Application Status"
      description={`Stage: ${stageName || "No Stage"}   ·   Status: ${statusName || "No Status"}`}
      icon={Clock}
      iconBg="bg-gradient-to-br from-blue-50 to-blue-100"
      iconColor="text-blue-600"
      iconBorder="border-blue-200"
      onClose={onClose}
    />
  );
}
