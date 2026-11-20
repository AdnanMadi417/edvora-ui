import { Activity, FileText, LayoutDashboard, ListChecks, Plane, Wallet } from "lucide-react";
import type { TabItem } from "components/ub/navigation/controls/Tabs";

export type ApplicationDetailsTab = "overview" | "details" | "documents" | "offer-visa" | "commission" | "activity";

/** Application Details tabs, shared by every role (Advisor, account manager, admin). */
export const APPLICATION_DETAILS_TABS: TabItem<ApplicationDetailsTab>[] = [
  // "Summary": what needs doing now. "Details": everything about the application, once.
  { key: "overview", label: "Summary", icon: LayoutDashboard },
  { key: "details", label: "Details", icon: ListChecks },
  { key: "documents", label: "Documents", icon: FileText },
  { key: "offer-visa", label: "Offer & visa", icon: Plane },
  { key: "commission", label: "Commission", icon: Wallet },
  { key: "activity", label: "Activity", icon: Activity },
];
