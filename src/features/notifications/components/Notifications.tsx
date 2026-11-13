"use client";

import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowRight, Bell, ExternalLink, RefreshCw } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EASE, MICRO_DURATION } from "components/ub/core/motion/FadeIn";

import { useAllNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead } from "../hooks";
import {
  getNotificationIconConfig,
  getSenderName,
  getNotificationPhotoKey,
  getNotificationStageStatus,
} from "../utils/notificationIcons";
import { getNotificationCategory } from "../utils/notificationCategory";
import type { ReadStatus, Notification } from "../types";
import NotificationAvatar from "./NotificationAvatar";
import MarkAllAsReadButton from "./MarkAllAsReadButton";
import TablePagination from "components/ub/data/tables/TablePagination";
import NotificationTabs, { type NotificationView } from "./NotificationTabs";
import type { NotificationCategory } from "../utils/notificationCategory";
import EmptyData from "components/ub/feedback/states/EmptyData";
import Skeleton from "components/ub/feedback/states/Skeleton";
import Button from "components/ub/core/buttons/Button";
import { useMe } from "hooks/useMe";
import { unibexsVoice } from "lib/unibexsVoice";

const PAGE_SIZE = 20;
// Unread notifications load in batches of this size via "Load more" (rather
// than numbered pages) so the Action Required / System Info split can keep
// being computed over everything loaded so far.
const UNREAD_BATCH_SIZE = 100;

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const ROLE_LABELS: Record<string, string> = {
  account_manager: "Account manager",
  admin: "Admin",
  finance: "Finance",
  reviewer: "Reviewer",
  data_entry: "Data entry",
  partner: "Advisor",
};

/** The event without the student's name, which the first line already shows:
 *  "moved Sara Ochieng's application to X" → "moved the application to X". */
function eventText(title: string, student?: string): string {
  if (!student) return title;
  const name = student.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return title
    .replace(new RegExp(`${name}['’]s application`), "the application")
    .replace(new RegExp(`\\s+(for|about)\\s+${name}$`), "");
}

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
  const { user } = useMe();
  const forAdvisor = user?.role === "partner";
  const [filter, setFilter] = useState<ReadStatus>("unread");
  const [page, setPage] = useState(1);
  const [unreadPage, setUnreadPage] = useState(1);
  const [accumulatedUnread, setAccumulatedUnread] = useState<Notification[]>([]);
  const [unreadCategory, setUnreadCategory] = useState<NotificationCategory>("action_required");
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
    // Keep the loaded unread list while viewing All, so the tab counts stay.
    if (next === "unread") setAccumulatedUnread([]);
    setUnreadCategory("action_required");
    autoSelectedRef.current = false;
  };

  const selectUnreadCategory = (next: NotificationCategory) => {
    setUnreadCategory(next);
    autoSelectedRef.current = true;
  };

  // One row of tabs: Action needed and Updates show unread items, All shows everything.
  const view: NotificationView = filter === "all" ? "all" : unreadCategory;
  const changeView = (next: NotificationView) => {
    if (next === "all") return changeFilter("all");
    if (filter === "all") changeFilter("unread");
    selectUnreadCategory(next);
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

  const actionRequiredCount = accumulatedUnread.filter(
    (n) => getNotificationCategory(n, { forAdvisor }) === "action_required"
  ).length;
  const infoCount = accumulatedUnread.length - actionRequiredCount;

  // Default the Unread tab to Action Required; if there's nothing needing
  // action, fall back to System Info instead of landing on an empty tab.
  useEffect(() => {
    if (!isUnreadTab || loading || autoSelectedRef.current) return;
    autoSelectedRef.current = true;
    if (actionRequiredCount === 0 && infoCount > 0) {
      setUnreadCategory("info");
    }
  }, [isUnreadTab, loading, actionRequiredCount, infoCount]);

  const displayed = isUnreadTab
    ? sorted.filter((n) => getNotificationCategory(n, { forAdvisor }) === unreadCategory)
    : sorted;

  // Only show the big list-level skeleton on the very first load for a tab;
  // a "Load more" fetch keeps the existing items visible and shows its own
  // small loading state on the button instead.
  const showFullSkeleton = loading && !(isUnreadTab && accumulatedUnread.length > 0);
  const isLoadingMoreUnread = isUnreadTab && loading && accumulatedUnread.length > 0;
  const hasMoreUnread = isUnreadTab && accumulatedUnread.length < total;

  return (
    <section aria-label="Notifications" className="mb-6 mt-6 overflow-hidden rounded-ub-lg border border-ub-border bg-ub-surface">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ub-border px-4 py-4 sm:px-6">
        <p className="text-ub-body-sm text-ub-text-secondary">
          {unreadCount > 0
            ? `${unreadCount} new ${unreadCount === 1 ? "notification" : "notifications"}`
            : "You're all caught up"}
        </p>
        <MarkAllAsReadButton
          onClick={handleMarkAllAsRead}
          loading={markingAll}
          disabled={unreadCount === 0}
        />
      </div>

      <NotificationTabs
        view={view}
        onViewChange={changeView}
        counts={{ action_required: actionRequiredCount, info: infoCount }}
      >
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
                <Skeleton className="h-11 w-11" />
                <div className="flex-1 space-y-2 pt-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/4" />
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
              <Button variant="secondary" size="sm" icon={<RefreshCw className="h-4 w-4" aria-hidden="true" />} text="Retry" onClick={() => refetchNotifications()} className="mt-2" />
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
              isUnreadTab && sorted.length > 0 ? "Switch tabs to see other notifications."
              : isUnreadTab ? "You're all caught up."
              : "You'll see updates here as they happen."
            }
          />
        ) : (
          <div>
            {displayed.map((notification, index) => {
              const isUnread = notification.read_at === null;
              const config = getNotificationIconConfig(notification);
              const sender = getSenderName(notification, { forAdvisor });
              const href = getNotificationHref(notification, applicationBasePath, partnerBasePath);
              // Advisors hear one voice: no staff roles, and backend copy reads as Unibexs.
              const say = (text: string | null | undefined) => (forAdvisor ? unibexsVoice(text) : text);
              const university = notification.data?.university_name;
              const { stage, status } = getNotificationStageStatus(notification);
              const student = notification.data?.student_name as string | undefined;
              const role = forAdvisor ? undefined : ROLE_LABELS[(notification.data?.actor_role as string) ?? ""];

              return (
                <div
                  key={notification.id}
                  onClick={async () => {
                    if (isUnread) await markAsRead(notification.id);
                    if (href) router.push(href);
                  }}
                  className={`flex cursor-pointer items-start gap-4 px-4 py-3 transition-colors ${
                    index !== displayed.length - 1 ? "border-b border-ub-border" : ""
                  } ${isUnread ? "bg-ub-selected hover:bg-ub-row-hover" : "hover:bg-ub-row-hover"}`}
                >
                  <NotificationAvatar
                    photoKey={getNotificationPhotoKey(notification)}
                    icon={config.icon}
                    bg={config.bg}
                    iconColor={config.iconColor}
                    badgeBg={config.badgeBg}
                  />

                  {/* Content: student and task first, then who did what. */}
                  <div className="min-w-0 flex-1">
                    {student ? (
                      <p className="truncate text-ub-label-md text-ub-text-primary">
                        {student}
                        {university && <span className="font-normal text-ub-text-secondary"> · {university}</span>}
                      </p>
                    ) : (
                      <p className="text-ub-body-sm text-ub-text-primary">
                        <span className="font-semibold">{sender}</span> {say(notification.title)}
                      </p>
                    )}
                    {notification.body && (
                      <p className="mt-0.5 text-ub-body-sm text-ub-text-primary">{say(notification.body)}</p>
                    )}
                    {student && (
                      <p className="mt-1 text-ub-caption text-ub-text-secondary">
                        <span className="font-medium">{sender}</span>
                        {role && <span>, {role}</span>} {eventText(say(notification.title) ?? "", student)}
                      </p>
                    )}
                    {(stage || status) && (
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        {stage && (
                          <span className="inline-flex items-center rounded-ub-full bg-ub-surface-subtle px-2 py-0.5 text-ub-caption text-ub-text-secondary">
                            {say(stage)}
                          </span>
                        )}
                        {stage && status && <ArrowRight className="h-3 w-3 shrink-0 text-ub-text-tertiary rtl:-scale-x-100" aria-hidden="true" />}
                        {status && (
                          <span className="inline-flex items-center rounded-ub-full bg-ub-tone-brand-bg px-2 py-0.5 text-ub-caption text-ub-tone-brand-text">
                            {say(status)}
                          </span>
                        )}
                      </div>
                    )}
                    <p className={`mt-1 text-ub-caption ${isUnread ? "font-medium text-ub-text-link" : "text-ub-text-tertiary"}`}>
                      {timeAgo(notification.created_at)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-2 self-center">
                    {isUnread && <span className="h-2.5 w-2.5 rounded-ub-full bg-ub-action-primary" aria-label="Unread" role="img" />}
                    {href && (
                      <Link
                        href={href}
                        onClick={(e) => e.stopPropagation()}
                        title="View application"
                        aria-label="View application"
                        className="flex h-11 w-11 items-center justify-center rounded-ub-md text-ub-text-secondary transition hover:bg-ub-surface-subtle hover:text-ub-text-link"
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
        <div className="flex justify-center border-t border-ub-border p-3">
          <Button variant="secondary" size="sm" onClick={loadMoreUnread} loading={isLoadingMoreUnread} text={`Load more (${total - accumulatedUnread.length} remaining)`} />
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
      </NotificationTabs>
    </section>
  );
}
