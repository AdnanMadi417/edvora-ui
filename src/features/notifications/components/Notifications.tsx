"use client";

import React, { useState } from "react";
import { AlertTriangle, Bell, CheckCheck, ExternalLink, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAllNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead } from "../hooks";
import { getNotificationIconConfig, getSenderName } from "../utils/notificationIcons";
import type { ReadStatus } from "../types";
import TablePagination from "components/ui/table/TablePagination";
import { Tabs, type TabItem } from "components/ui/tabs";
import EmptyData from "components/emptyData/EmptyData";

const PAGE_SIZE = 20;

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
}

export default function Notifications({ applicationBasePath }: NotificationsProps) {
  const [filter, setFilter] = useState<ReadStatus>("unread");
  const [page, setPage] = useState(1);
  const router = useRouter();

  const { notifications, total, loading, error, refetch: refetchNotifications } = useAllNotifications({
    readStatus: filter,
    page,
    pageSize: PAGE_SIZE,
  });
  const { unreadCount, refetch: refetchCount } = useUnreadCount({});
  const { markAsRead: markRead } = useMarkAsRead();
  const { markAllAsRead, loading: markingAll } = useMarkAllAsRead();

  const changeFilter = (next: ReadStatus) => {
    setFilter(next);
    setPage(1);
  };

  const markAsRead = async (id: string) => {
    try {
      await markRead(id);
      await Promise.all([refetchNotifications(), refetchCount()]);
      window.dispatchEvent(new CustomEvent("notifications:refetch"));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      await Promise.all([refetchNotifications(), refetchCount()]);
      window.dispatchEvent(new CustomEvent("notifications:refetch"));
    } catch (err) {
      console.error("Failed to mark all notifications as read", err);
    }
  };

  const displayed = [...notifications].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <section className="mb-6 mt-6 max-w-5xl mx-auto overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
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

      {/* List */}
      <div>
        {loading ? (
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
            title={filter === "unread" ? "No unread notifications" : "No notifications yet"}
            subtitle={filter === "unread" ? "You're all caught up." : "You'll see updates here as they happen."}
          />
        ) : (
          <div>
            {displayed.map((notification, index) => {
              const isUnread = notification.read_at === null;
              const config = getNotificationIconConfig(notification);
              const Icon = config.icon;
              const sender = getSenderName(notification);
              const href = applicationBasePath && notification.application_id
                ? `${applicationBasePath}/${notification.application_id}`
                : undefined;

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
                  {/* Icon with type badge */}
                  <div className="relative flex-shrink-0">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-md ${config.bg}`}>
                      <Icon className={`h-5 w-5 ${config.iconColor}`} />
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full ring-2 ring-white ${config.badgeBg}`}>
                      <Bell className="h-2 w-2 text-white" />
                    </span>
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug text-slate-900">
                      <span className="font-bold">{sender}</span>
                      {notification.title && (
                        <span className="ml-1 font-normal text-slate-700">{notification.title}</span>
                      )}
                    </p>
                    {notification.body && (
                      <p className="mt-0.5 truncate text-sm text-slate-500">{notification.body}</p>
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
      </div>

      {!loading && !error && total > 0 && (
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
