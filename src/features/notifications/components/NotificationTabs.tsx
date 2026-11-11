"use client";

import { useId, type ReactNode } from "react";
import Tabs, { tabPanelProps } from "components/ub/navigation/controls/Tabs";
import type { NotificationCategory } from "../utils/notificationCategory";

/** Action needed and Updates show unread notifications; All shows everything, read or not. */
export type NotificationView = NotificationCategory | "all";

export interface NotificationTabsProps {
  view: NotificationView;
  onViewChange: (view: NotificationView) => void;
  /** Unread counts per category. */
  counts: Record<NotificationCategory, number>;
  children: ReactNode;
}

/** One row of notification tabs: Action needed · Updates · All. */
export default function NotificationTabs({ view, onViewChange, counts, children }: NotificationTabsProps) {
  const id = useId();
  return (
    <div className="min-w-0">
      <Tabs<NotificationView>
        tabs={[
          { key: "action_required", label: "Action needed", count: counts.action_required },
          { key: "info", label: "Updates", count: counts.info },
          { key: "all", label: "All" },
        ]}
        active={view}
        onChange={onViewChange}
        variant="underline"
        inset={false}
        idPrefix={id}
        aria-label="Notifications"
        className="px-4 sm:px-6"
      />
      <div {...tabPanelProps(id, view)}>{children}</div>
    </div>
  );
}
