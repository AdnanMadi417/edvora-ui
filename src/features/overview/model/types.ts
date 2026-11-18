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
  /** Advisor whose profile Unibexs hasn't verified yet. */
  awaitingVerification?: boolean;
}
export interface OverviewItem {
  id: string;
  title: string;
  description: string;
  href: string;
  at?: string;
  status?: string;
  /** Display text for `status` when it differs from the raw value (e.g. the Unibexs voice for Advisors). */
  statusLabel?: string;
  /** Leads the row with this person's or student's avatar. */
  avatar?: { name: string; src?: string | null };
  /** Days it has waited (lists sort oldest first). */
  waitingDays?: number;
  /** The row's one verb + object button, e.g. "Review eVAL". */
  actionLabel?: string;
}
export interface OverviewData {
  universityCommission?: import("./dashboardData").UniversityCommission[];
  /** Advisor counts (all advisors the viewer can see): active / suspended, company / individual. */
  advisorStats?: { active: number; inactive: number; agency: number; individual: number; verified: number; unverified: number };
  universities?: { id: string; name: string; logo_file_key?: string }[];
  total: number;
  items: OverviewItem[];
  /** Active applications per university (same rows as the stage totals). */
  byUniversity?: { key: string; label: string; value: number }[];
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
