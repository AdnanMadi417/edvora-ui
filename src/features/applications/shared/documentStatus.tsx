import React from "react";
import { Clock, CheckCircle, XCircle } from "lucide-react";

export const DOCUMENT_STATUS_ICON: Record<string, React.ReactNode> = {
  "1": <Clock className="h-5 w-5 text-yellow-500" />,
  "2": <CheckCircle className="h-5 w-5 text-green-600" />,
  "3": <XCircle className="h-5 w-5 text-red-600" />,
  pending: <Clock className="h-5 w-5 text-yellow-500" />,
  approved: <CheckCircle className="h-5 w-5 text-green-600" />,
  rejected: <XCircle className="h-5 w-5 text-red-600" />,
};

export const DOCUMENT_STATUS_BADGE: Record<string, string> = {
  "1": "border-yellow-200 bg-yellow-50 text-yellow-700",
  "2": "border-green-200 bg-green-50 text-green-700",
  "3": "border-red-200 bg-red-50 text-red-700",
  pending: "border-yellow-200 bg-yellow-50 text-yellow-700",
  approved: "border-green-200 bg-green-50 text-green-700",
  rejected: "border-red-200 bg-red-50 text-red-700",
};

export const DOCUMENT_STATUS_LABEL: Record<string, string> = {
  "1": "Pending",
  "2": "Approved",
  "3": "Rejected",
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};
