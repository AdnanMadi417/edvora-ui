import type { TabItem } from "components/ui/tabs";

export type ApplicationDetailsTab = "details" | "activity";

export const APPLICATION_DETAILS_TABS: TabItem<ApplicationDetailsTab>[] = [
  { key: "details", label: "Details" },
  { key: "activity", label: "Activity History" },
];
