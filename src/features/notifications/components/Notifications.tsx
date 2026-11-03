"use client";

import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowRight, Bell, CheckCheck, ExternalLink, RefreshCw } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EASE, MICRO_DURATION } from "components/ub/core/FadeIn";

import { useAllNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead } from "../hooks";
import {
  getNotificationIconConfig,
  getSenderName,
  getNotificationPhotoKey,
  getNotificationStageStatus,
} from "../utils/notificationIcons";
import { getNotificationCategory, type NotificationCategory } from "../utils/notificationCategory";
import type { ReadStatus, Notification } from "../types";
import NotificationAvatar from "./NotificationAvatar";
import TablePagination from "components/ub/data/TablePagination";
import Tabs from "components/ub/navigation/Tabs";
import type { TabItem } from "components/ub/navigation/Tabs";
import EmptyData from "components/ub/feedback/EmptyData";

const PAGE_SIZE = 20;
// Unread notifications load in batches of this size via "Load more" (rather
// than numbered pages) so the Action Required / System Info split can keep
// being computed over everything loaded so far.
const UNREAD_BATCH_SIZE = 100;

type UnreadCategoryFilter = "all" | NotificationCategory;

const UNREAD_CATEGORY_TABS: { key: UnreadCategoryFilter; label: string }[] = [
  { key: "all", label: "All Unread" },
  { key: "action_required", label: "Action Required" },
  { key: "info", label: "System Info" },
];

// Semantic color per sub-filter, matching StatusBadge's warning/info/neutral palette.
const UNREAD_CATEGORY_COLORS: Record<UnreadCategoryFilter, { active: string; inactive: string; dot: string; count: string }> = {
  all: {
    active: "border-slate-700 bg-slate-100 text-slate-800",
    inactive: "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
    dot: "bg-slate-500",
    count: "text-slate-400",
  },
  action_required: {
    active: "border-amber-600 bg-amber-50 text-amber-700",
    inactive: "border-slate-200 bg-white text-slate-600 hover:border-amber-200 hover:bg-amber-50",
    dot: "bg-amber-500",
    count: "text-amber-500",
  },
  info: {
    active: "border-blue-600 bg-blue-50 text-blue-700",
    inactive: "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50",
    dot: "bg-blue-500",
    count: "text-blue-500",
  },
};

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const FILTER_TABS = (unreadCount: number): TabItem<ReadStatus>[] => [
  { key: "all", label: "All" },
  { key: "unread", label: unreadCount > 0 ? `Unread (${unreadCount})` : "Unread" },
];

interface NotificationsProps {
  /** When set, clicking a notification (or its external-link icon) navigates
   * to `${applicationBasePath}/${application_id}`. Omit for roles that don't
   * have an applications view of their own (e.g. reviewer, data entry). */
  applicationBasePath?: string;
  /** When set, a `partner_signed_up` notification navigates to
   * `${partnerBasePath}/${data.partner_id}` instead. Only admin/reviewer
   * receive that notification type, so only they need this. */
  partnerBasePath?: string;
}

function getNotificationHref(
  notification: Notification,
  applicationBasePath?: string,
  partnerBasePath?: string
): string | undefined {
  if (notification.type === "partner_signed_up") {
    const partnerId = notification.data?.partner_id;
    return partnerBasePath && partnerId ? `${partnerBasePath}/${partnerId}` : undefined;
  }
  return applicationBasePath && notification.application_id
    ? `${applicationBasePath}/${notification.application_id}`
    : undefined;
}

export default function Notifications({ applicationBasePath, partnerBasePath }: NotificationsProps) {
  const [filter, setFilter] = useState<ReadStatus>("unread");
  const [page, setPage] = useState(1);
  const [unreadPage, setUnreadPage] = useState(1);
  const [accumulatedUnread, setAccumulatedUnread] = useState<Notification[]>([]);
  const [unreadCategory, setUnreadCategory] = useState<UnreadCategoryFilter>("action_required");
  const autoSelectedRef = useRef(false);
  const router = useRouter();

  const isUnreadTab = filter === "unread";

  const { notifications, total, loading, error, refetch: refetchNotifications } = useAllNotifications({
    readStatus: filter,
    page: isUnreadTab ? unreadPage : page,
    pageSize: isUnreadTab ? UNREAD_BATCH_SIZE : PAGE_SIZE,
  });
  const { unreadCount, refetch: refetchCount } = useUnreadCount({});
  const { markAsRead: markRead } = useMarkAsRead();
  const { markAllAsRead, loading: markingAll } = useMarkAllAsRead();

  // Each successful unread fetch either replaces (page 1) or appends
  // (page > 1, via "Load more") into the running accumulated list.
  useEffect(() => {
    if (!isUnreadTab || loading) return;
    setAccumulatedUnread((prev) => {
      if (unreadPage === 1) return notifications;
      const seen = new Set(prev.map((n) => n.id));
      return [...prev, ...notifications.filter((n) => !seen.has(n.id))];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUnreadTab, loading, unreadPage, notifications]);

  const changeFilter = (next: ReadStatus) => {
    setFilter(next);
    setPage(1);
    setUnreadPage(1);
    setAccumulatedUnread([]);
    setUnreadCategory("action_required");
    autoSelectedRef.current = false;
  };

  const selectUnreadCategory = (next: UnreadCategoryFilter) => {
    setUnreadCategory(next);
    autoSelectedRef.current = true;
  };

  const loadMoreUnread = () => setUnreadPage((p) => p + 1);

  const markAsRead = async (id: string) => {
    try {
      await markRead(id);
      // The unread set just shifted — start over from page 1 rather than
      // re-merging a now-stale later page into the accumulated list.
      if (isUnreadTab) setUnreadPage(1);
      await Promise.all([refetchNotifications(), refetchCount()]);
      window.dispatchEvent(new CustomEvent("notifications:refetch"));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      if (isUnreadTab) setUnreadPage(1);
      await Promise.all([refetchNotifications(), refetchCount()]);
      window.dispatchEvent(new CustomEvent("notifications:refetch"));
    } catch (err) {
      console.error("Failed to mark all notifications as read", err);
    }
  };

  const sourceList = isUnreadTab ? accumulatedUnread : notifications;
  const sorted = [...sourceList].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const actionRequiredCount = isUnreadTab
    ? sorted.filter((n) => getNotificationCategory(n) === "action_required").length
    : 0;
  const infoCount = isUnreadTab ? sorted.length - actionRequiredCount : 0;

  // Default the Unread tab to Action Required; if there's nothing needing
  // action, fall back to System Info instead of landing on an empty tab.
  useEffect(() => {
    if (!isUnreadTab || loading || autoSelectedRef.current) return;
    autoSelectedRef.current = true;
    if (actionRequiredCount === 0 && infoCount > 0) {
      setUnreadCategory("info");
    }
  }, [isUnreadTab, loading, actionRequiredCount, infoCount]);

  const displayed = isUnreadTab && unreadCategory !== "all"
    ? sorted.filter((n) => getNotificationCategory(n) === unreadCategory)
    : sorted;

  // Only show the big list-level skeleton on the very first load for a tab;
  // a "Load more" fetch keeps the existing items visible and shows its own
  // small loading state on the button instead.
  const showFullSkeleton = loading && !(isUnreadTab && accumulatedUnread.length > 0);
  const isLoadingMoreUnread = isUnreadTab && loading && accumulatedUnread.length > 0;
  const hasMoreUnread = isUnreadTab && accumulatedUnread.length < total;

  return (
    <section className="mb-6 mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
          {unreadCount > 0 && (
            <p className="mt-0.5 text-sm text-slate-500">
              {unreadCount} new {unreadCount === 1 ? "notification" : "notifications"}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={markingAll}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4" />
            {markingAll ? "Marking..." : "Mark all as read"}
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <Tabs<ReadStatus> tabs={FILTER_TABS(unreadCount)} active={filter} onChange={changeFilter} className="pt-2" />

      {/* Unread sub-filter: Action Required vs System Info */}
      {isUnreadTab && !showFullSkeleton && !error && sorted.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-6 py-3">
          {UNREAD_CATEGORY_TABS.map(({ key, label }) => {
            const count = key === "all" ? sorted.length : key === "action_required" ? actionRequiredCount : infoCount;
            const active = unreadCategory === key;
            const colors = UNREAD_CATEGORY_COLORS[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => selectUnreadCategory(key)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  active ? colors.active : colors.inactive
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
                {label} {count > 0 && <span className={active ? colors.count : "text-slate-400"}>({count})</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* List */}
      <AnimatePresence mode="wait">
      <motion.div
        key={`${filter}-${unreadCategory}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: MICRO_DURATION, ease: EASE }}
      >
        {showFullSkeleton ? (
          <div className="flex flex-col">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-4 px-4 py-4">
                <div className="h-11 w-11 animate-pulse rounded-md bg-slate-100" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
                  <div className="h-3 w-1/4 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <EmptyData
            icon={AlertTriangle}
            color="red"
            title="Something went wrong"
            subtitle="We couldn't load your notifications. Please try again."
            action={
              <button
                type="button"
                onClick={() => refetchNotifications()}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </button>
            }
          />
        ) : displayed.length === 0 ? (
          <EmptyData
            icon={Bell}
            color="blue"
            title={
              isUnreadTab && sorted.length > 0 && unreadCategory === "action_required" ? "Nothing needs your attention"
              : isUnreadTab && sorted.length > 0 && unreadCategory === "info" ? "No system updates"
              : isUnreadTab ? "No unread notifications"
              : "No notifications yet"
            }
            subtitle={
              isUnreadTab && sorted.length > 0 && unreadCategory !== "all" ? "Switch tabs to see other unread notifications."
              : isUnreadTab ? "You're all caught up."
              : "You'll see updates here as they happen."
            }
          />
        ) : (
          <div>
            {displayed.map((notification, index) => {
              const isUnread = notification.read_at === null;
              const config = getNotificationIconConfig(notification);
              const sender = getSenderName(notification);
              const href = getNotificationHref(notification, applicationBasePath, partnerBasePath);
              const university = notification.data?.university_name;
              const { stage, status } = getNotificationStageStatus(notification);

              return (
                <div
                  key={notification.id}
                  onClick={async () => {
                    if (isUnread) await markAsRead(notification.id);
                    if (href) router.push(href);
                  }}
                  className={`flex cursor-pointer items-start gap-4 px-4 py-3 transition-colors ${
                    index !== displayed.length - 1 ? "border-b border-slate-50" : ""
                  } ${isUnread ? "bg-blue-50 hover:bg-blue-100/60" : "hover:bg-slate-50"}`}
                >
                  <NotificationAvatar
                    photoKey={getNotificationPhotoKey(notification)}
                    icon={config.icon}
                    bg={config.bg}
                    iconColor={config.iconColor}
                    badgeBg={config.badgeBg}
                  />

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug text-slate-900">
                      <span className="font-bold">{sender}</span>
                      {notification.title && (
                        <span className="ml-1 font-normal text-slate-700">{notification.title}</span>
                      )}
                    </p>
                    {university && (
                      <p className="mt-0.5 truncate text-xs font-medium text-slate-500">{university}</p>
                    )}
                    {notification.body && (
                      <p className="mt-0.5 truncate text-sm text-slate-500">{notification.body}</p>
                    )}
                    {(stage || status) && (
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        {stage && (
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                            {stage}
                          </span>
                        )}
                        {stage && status && <ArrowRight className="h-3 w-3 shrink-0 text-slate-400" />}
                        {status && (
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                            {status}
                          </span>
                        )}
                      </div>
                    )}
                    <p className={`mt-1 text-xs font-semibold ${isUnread ? "text-blue-600" : "text-slate-400"}`}>
                      {timeAgo(notification.created_at)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-shrink-0 items-center gap-2 self-center">
                    {isUnread && <div className="h-3 w-3 rounded-full bg-blue-500" />}
                    {href && (
                      <Link
                        href={href}
                        onClick={(e) => e.stopPropagation()}
                        title="View application"
                        className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-500 transition hover:bg-blue-100 hover:text-blue-600"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
      </AnimatePresence>

      {!error && hasMoreUnread && (
        <div className="border-t border-slate-100 p-3 text-center">
          <button
            type="button"
            onClick={loadMoreUnread}
            disabled={isLoadingMoreUnread}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoadingMoreUnread
              ? "Loading more…"
              : `Load more (${total - accumulatedUnread.length} remaining)`}
          </button>
        </div>
      )}

      {!loading && !error && !isUnreadTab && total > 0 && (
        <TablePagination
          currentPage={page}
          onPageChange={setPage}
          itemsPerPage={PAGE_SIZE}
          itemCount={displayed.length}
          totalCount={total}
          itemLabel="notifications"
        />
      )}
    </section>
  );
}
