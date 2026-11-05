"use client";

import { useId, type ReactNode } from "react";
import Tabs, { tabPanelProps } from "components/ub/navigation/controls/Tabs";
import type { ReadStatus } from "../types";
import type { NotificationCategory } from "../utils/notificationCategory";

export type UnreadCategoryFilter = "all" | NotificationCategory;

export interface NotificationTabsProps {
  readStatus: ReadStatus;
  onReadStatusChange: (status: ReadStatus) => void;
  unreadCount: number;
  category: UnreadCategoryFilter;
  onCategoryChange: (category: UnreadCategoryFilter) => void;
  categoryCounts: Record<UnreadCategoryFilter, number>;
  showCategories: boolean;
  children: ReactNode;
}

/** Two-level notification navigation: sections above a quieter category control. */
export default function NotificationTabs({
  readStatus,
  onReadStatusChange,
  unreadCount,
  category,
  onCategoryChange,
  categoryCounts,
  showCategories,
  children,
}: NotificationTabsProps) {
  const readId = useId();
  const categoryId = useId();
  const categories = [
    { key: "all" as const, label: "All unread", count: categoryCounts.all },
    { key: "action_required" as const, label: "Action required", count: categoryCounts.action_required },
    { key: "info" as const, label: "System info", count: categoryCounts.info },
  ];
  const categoriesVisible = readStatus === "unread" && showCategories;

  return (
    <div className="min-w-0">
      <Tabs<ReadStatus>
        tabs={[
          { key: "all", label: "All" },
          { key: "unread", label: "Unread", count: unreadCount },
        ]}
        active={readStatus}
        onChange={onReadStatusChange}
        variant="underline"
        inset={false}
        idPrefix={readId}
        aria-label="Notification read status"
        className="px-4 sm:px-6"
      />
      <div {...tabPanelProps(readId, readStatus)}>
        {categoriesVisible && (
          <div className="border-b border-ub-border bg-ub-surface-subtle px-4 py-3 sm:px-6">
            <Tabs<UnreadCategoryFilter>
              tabs={categories}
              active={category}
              onChange={onCategoryChange}
              variant="pills"
              className="!flex-nowrap overflow-x-auto overscroll-x-contain pb-1"
              size="sm"
              idPrefix={categoryId}
              aria-label="Unread notification category"
            />
          </div>
        )}
        <div {...(categoriesVisible ? tabPanelProps(categoryId, category) : {})}>
          {children}
        </div>
      </div>
    </div>
  );
}
