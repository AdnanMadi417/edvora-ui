import type { StatusBadgeVariant } from "components/ub/data/badges/StatusBadge";

export function getStatusVariant(name: string): StatusBadgeVariant {
  const code = name?.toLowerCase().replace(/\s+/g, "_") ?? "";
  if (!code) return "neutral";
  if (code.includes("reject") || code.includes("expired")) return "danger";
  if (code.includes("approv") || code.includes("confirm") || code.includes("accepted") || code.includes("completed")) return "success";
  if (code.includes("correction") || code.includes("re_upload") || code.includes("re-upload") || code.includes("disputed")) return "attention";
  if (code.includes("review") || code.includes("waiting") || code.includes("processing") || code.includes("pending")) return "warning";
  return "info";
}
