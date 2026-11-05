import type { LucideIcon } from "lucide-react";
import type { WidgetState } from "components/ub/dashboard/types";

export type OverviewRole =
  | "admin"
  | "account_manager"
  | "reviewer"
  | "data_entry"
  | "partner";
export interface OverviewContext {
  role: OverviewRole;
  partnerId?: string;
  agencyAdmin?: boolean;
  canViewCommission?: boolean;
  canCreateApplication?: boolean;
}
export interface OverviewItem {
  id: string;
  title: string;
  description: string;
  href: string;
  at?: string;
  status?: string;
}
export interface OverviewData {
  total: number;
  items: OverviewItem[];
  distribution?: {
    key: string;
    label: string;
    value: number;
    stageId?: string;
  }[];
}
export interface OverviewResource {
  state: WidgetState;
  data?: OverviewData;
  error?: string;
}
export interface ResourcePlan {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  emptyMessage: string;
  load: () => Promise<OverviewData>;
}
export interface OverviewMetric {
  source: string;
  label: string;
  caption: string;
  icon: LucideIcon;
  href: string;
}
