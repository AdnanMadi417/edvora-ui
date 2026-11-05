"use client";

import { useId, type ReactNode } from "react";
import Tabs, { tabPanelProps } from "components/ub/navigation/controls/Tabs";
import Chip from "components/ub/data/badges/Chip";
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
            <div
              role="group"
              aria-label="Unread notification categories"
              className="flex flex-nowrap gap-2 overflow-x-auto overscroll-x-contain pb-1 sm:hidden"
            >
              {categories.map(({ key, label, count }) => (
                <Chip
                  key={key}
                  size="sm"
                  selected={category === key}
                  onSelectedChange={() => onCategoryChange(key)}
                  aria-controls={`${categoryId}-panel-${key}`}
                >
                  {label} ({count})
                </Chip>
              ))}
            </div>
            <div className="hidden sm:block">
              <Tabs<UnreadCategoryFilter>
                tabs={categories}
                active={category}
                onChange={onCategoryChange}
                variant="segmented"
                size="sm"
                idPrefix={categoryId}
                aria-label="Unread notification category"
              />
            </div>
          </div>
        )}
        <div {...(categoriesVisible ? tabPanelProps(categoryId, category) : {})}>
          {children}
        </div>
      </div>
    </div>
  );
}
