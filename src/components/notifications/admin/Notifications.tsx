"use client";

import React, { useState } from "react";
import { Bell, ExternalLink } from "lucide-react";
import Link from "next/link";

import { useAllNotifications } from "hooks/notifications/useNotifications";
import { useUnreadCount } from "hooks/notifications/useUnreadCount";
import { useMarkAsRead } from "hooks/notifications/useMarkAsRead";
import { getNotificationIconConfig, getSenderName } from "utils/notificationIcons";

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Notifications() {
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const { notifications, loading, error } = useAllNotifications();
  const { unreadCount, refetch: refetchCount } = useUnreadCount({});
  const { markAsRead: markRead } = useMarkAsRead();

  const markAsRead = async (id: string) => {
    try {
      await markRead(id);
      refetchCount();
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter((n) => n.read_at === null);
    await Promise.allSettled(unread.map((n) => markRead(n.id)));
    refetchCount();
  };

  const displayed = [...(filter === "unread"
    ? notifications.filter((n) => n.read_at === null)
    : notifications)].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

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
            onClick={markAllAsRead}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-slate-100 px-4 pt-2">
        {(["all", "unread"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`relative px-4 py-2 text-sm font-semibold capitalize transition-colors ${
              filter === tab ? "text-blue-600" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab}
            {tab === "unread" && unreadCount > 0 && (
              <span className="ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-100 px-1.5 text-xs font-bold text-blue-700">
                {unreadCount}
              </span>
            )}
            {filter === tab && (
              <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-blue-600" />
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div>
        {loading ? (
          <div className="flex flex-col">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-4 px-4 py-4">
                <div className="h-11 w-11 animate-pulse rounded-full bg-slate-100" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
                  <div className="h-3 w-1/4 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="px-6 py-12 text-center text-sm text-red-500">{error}</div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-slate-400">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Bell className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-sm font-medium">
              {filter === "unread" ? "No unread notifications" : "No notifications yet"}
            </p>
          </div>
        ) : (
          <div>
            {displayed.map((notification, index) => {
              const isUnread = notification.read_at === null;
              const config = getNotificationIconConfig(notification);
              const Icon = config.icon;
              const sender = getSenderName(notification);

              return (
                <div
                  key={notification.id}
                  onClick={() => isUnread && markAsRead(notification.id)}
                  className={`flex cursor-pointer items-start gap-4 px-4 py-3 transition-colors ${
                    index !== displayed.length - 1 ? "border-b border-slate-50" : ""
                  } ${isUnread ? "bg-blue-50 hover:bg-blue-100/60" : "hover:bg-slate-50"}`}
                >
                  {/* Icon with type badge */}
                  <div className="relative flex-shrink-0">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-full ${config.bg}`}>
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
                    {notification.data?.snippet && (
                      <p className="mt-0.5 line-clamp-2 text-sm text-slate-500">
                        {notification.data.snippet}
                      </p>
                    )}
                    <p className={`mt-1 text-xs font-semibold ${isUnread ? "text-blue-600" : "text-slate-400"}`}>
                      {timeAgo(notification.created_at)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-shrink-0 flex-col items-center gap-2 self-center pl-2">
                    {isUnread && <div className="h-3 w-3 rounded-full bg-blue-500" />}
                    {notification.application_id && (
                      <Link
                        href={`/admin/applications/${notification.application_id}`}
                        onClick={(e) => e.stopPropagation()}
                        title="View application"
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-blue-100 hover:text-blue-600"
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
    </section>
  );
}
