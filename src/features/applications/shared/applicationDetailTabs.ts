import type { TabItem } from "components/ub/navigation/Tabs";

export type ApplicationDetailsTab = "details" | "documents" | "activity";

export const APPLICATION_DETAILS_TABS: TabItem<ApplicationDetailsTab>[] = [
  { key: "details", label: "Details" },
  { key: "activity", label: "Activity History" },
];

/** Partner-only: adds the Documents tab (required/uploaded/rejected status for
 *  the offer-letter-stage forms), between Details and Activity History. Admin
 *  and account-manager keep the base APPLICATION_DETAILS_TABS. */
export const PARTNER_APPLICATION_DETAILS_TABS: TabItem<ApplicationDetailsTab>[] = [
  { key: "details", label: "Details" },
  { key: "documents", label: "Documents" },
  { key: "activity", label: "Activity History" },
];
