import { Activity, FileText, LayoutDashboard, Plane, Wallet } from "lucide-react";
import type { TabItem } from "components/ub/navigation/Tabs";

export type ApplicationDetailsTab = "overview" | "documents" | "offer-visa" | "commission" | "activity";

/** Application Details tabs, shared by every role (Advisor, account manager, admin). */
export const APPLICATION_DETAILS_TABS: TabItem<ApplicationDetailsTab>[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "documents", label: "Documents", icon: FileText },
  { key: "offer-visa", label: "Offer & visa", icon: Plane },
  { key: "commission", label: "Commission", icon: Wallet },
  { key: "activity", label: "Activity", icon: Activity },
];
