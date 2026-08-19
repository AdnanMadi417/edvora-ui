"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCheck } from "lucide-react";

import { useAllNotifications, useMarkAsRead, useMarkAllAsRead } from "../hooks";
import { getNotificationIconConfig, getSenderName } from "../utils/notificationIcons";

const PREVIEW_LIMIT = 5;
const CLOSE_DELAY_MS = 150;

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

interface NotificationsPreviewPopoverProps {
  /** Full notifications page route for this role, e.g. "/partner/notifications". */
  notificationsPath: string;
  /** When set, clicking a notification navigates to `${applicationBasePath}/${application_id}`. */
  applicationBasePath?: string;
  /** Called after a notification is marked read (individually or via "mark all"), so the caller can refresh its own unread badge. */
  onNotificationHandled?: () => void;
  /** The bell trigger element (icon + unread badge). */
  children: React.ReactNode;
}

export default function NotificationsPreviewPopover({
  notificationsPath,
  applicationBasePath,
  onNotificationHandled,
  children,
}: NotificationsPreviewPopoverProps) {
  const [open, setOpen] = useState(false);
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setHasOpenedOnce(true);
    setOpen(true);
  };

  const handleLeave = () => {
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  };

  return (
    <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      {children}

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl ring-1 ring-black/5">
          {hasOpenedOnce && (
            <PreviewContent
              notificationsPath={notificationsPath}
              applicationBasePath={applicationBasePath}
              onNavigate={() => setOpen(false)}
              onNotificationHandled={onNotificationHandled}
            />
          )}
        </div>
      )}
    </div>
  );
}

function PreviewContent({
  notificationsPath,
  applicationBasePath,
  onNavigate,
  onNotificationHandled,
}: {
  notificationsPath: string;
  applicationBasePath?: string;
  onNavigate: () => void;
  onNotificationHandled?: () => void;
}) {
  const router = useRouter();
  const { notifications, loading, error, refetch } = useAllNotifications({
    readStatus: "unread",
    page: 1,
    pageSize: PREVIEW_LIMIT,
  });
  const { markAsRead } = useMarkAsRead();
  const { markAllAsRead, loading: markingAll } = useMarkAllAsRead();

  const notifyHandled = () => {
    onNotificationHandled?.();
    window.dispatchEvent(new CustomEvent("notifications:refetch"));
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      await refetch();
      notifyHandled();
    } catch (err) {
      console.error("Failed to mark all notifications as read", err);
    }
  };

  const handleRowClick = async (notification: (typeof notifications)[number]) => {
    try {
      await markAsRead(notification.id);
      notifyHandled();
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
    onNavigate();
    const href = applicationBasePath && notification.application_id
      ? `${applicationBasePath}/${notification.application_id}`
      : notificationsPath;
    router.push(href);
  };

  return (
    <>
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <p className="text-sm font-semibold text-slate-900">Notifications</p>
        {notifications.length > 0 && (
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            disabled={markingAll}
            className="flex items-center gap-1 text-xs font-medium text-blue-600 transition hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            {markingAll ? "Marking..." : "Mark all as read"}
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3">
                <div className="h-9 w-9 shrink-0 animate-pulse rounded-md bg-slate-100" />
                <div className="flex-1 space-y-2 pt-0.5">
                  <div className="h-3.5 w-3/4 animate-pulse rounded bg-slate-100" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="px-4 py-8 text-center text-sm text-red-500">{error}</p>
        ) : notifications.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-400">You&apos;re all caught up.</p>
        ) : (
          notifications.map((notification, index) => {
            const config = getNotificationIconConfig(notification);
            const Icon = config.icon;
            const sender = getSenderName(notification);
            return (
              <button
                key={notification.id}
                type="button"
                onClick={() => handleRowClick(notification)}
                className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
                  index !== notifications.length - 1 ? "border-b border-slate-50" : ""
                }`}
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${config.bg}`}>
                  <Icon className={`h-4 w-4 ${config.iconColor}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm leading-snug text-slate-900">
                    <span className="font-semibold">{sender}</span>
                    {notification.title && <span className="ml-1 font-normal text-slate-700">{notification.title}</span>}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-blue-600">{timeAgo(notification.created_at)}</p>
                </div>
                <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
              </button>
            );
          })
        )}
      </div>

      <Link
        href={notificationsPath}
        onClick={onNavigate}
        className="flex items-center justify-center border-t border-slate-100 px-4 py-3 text-sm font-medium text-blue-600 transition hover:bg-slate-50"
      >
        View all notifications
      </Link>
    </>
  );
}
