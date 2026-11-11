"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MarkAllAsReadButton from "./MarkAllAsReadButton";

import { useAllNotifications, useMarkAsRead, useMarkAllAsRead } from "../hooks";
import { getNotificationIconConfig, getSenderName, getNotificationPhotoKey } from "../utils/notificationIcons";
import type { Notification } from "../types";
import NotificationAvatar from "./NotificationAvatar";

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
  /** When set, a `partner_signed_up` notification navigates to
   * `${partnerBasePath}/${data.partner_id}` instead. */
  partnerBasePath?: string;
  /** Called after a notification is marked read (individually or via "mark all"), so the caller can refresh its own unread badge. */
  onNotificationHandled?: () => void;
  /** The bell trigger element (icon + unread badge). */
  children: React.ReactNode;
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

export default function NotificationsPreviewPopover({
  notificationsPath,
  applicationBasePath,
  partnerBasePath,
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
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-ub-border bg-ub-surface shadow-xl ring-1 ring-black/5">
          {hasOpenedOnce && (
            <PreviewContent
              notificationsPath={notificationsPath}
              applicationBasePath={applicationBasePath}
              partnerBasePath={partnerBasePath}
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
  partnerBasePath,
  onNavigate,
  onNotificationHandled,
}: {
  notificationsPath: string;
  applicationBasePath?: string;
  partnerBasePath?: string;
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
    const href = getNotificationHref(notification, applicationBasePath, partnerBasePath) ?? notificationsPath;
    router.push(href);
  };

  return (
    <>
      <div className="flex items-center justify-between border-b border-ub-border px-4 py-3">
        <p className="text-sm font-semibold text-ub-text-primary">Notifications</p>
        {notifications.length > 0 && (
          <MarkAllAsReadButton onClick={handleMarkAllAsRead} loading={markingAll} />
        )}
      </div>

      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3">
                <div className="h-9 w-9 shrink-0 animate-pulse rounded-md bg-ub-surface-subtle" />
                <div className="flex-1 space-y-2 pt-0.5">
                  <div className="h-3.5 w-3/4 animate-pulse rounded bg-ub-surface-subtle" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-ub-surface-subtle" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="px-4 py-8 text-center text-sm text-ub-tone-danger-text">{error}</p>
        ) : notifications.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-ub-text-tertiary">You&apos;re all caught up.</p>
        ) : (
          notifications.map((notification, index) => {
            const config = getNotificationIconConfig(notification);
            const sender = getSenderName(notification);
            return (
              <button
                key={notification.id}
                type="button"
                onClick={() => handleRowClick(notification)}
                className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-ub-surface-subtle ${
                  index !== notifications.length - 1 ? "border-b border-ub-border" : ""
                }`}
              >
                <NotificationAvatar
                  photoKey={getNotificationPhotoKey(notification)}
                  icon={config.icon}
                  bg={config.bg}
                  iconColor={config.iconColor}
                  badgeBg={config.badgeBg}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm leading-snug text-ub-text-primary">
                    <span className="font-semibold">{sender}</span>
                    {notification.title && <span className="ml-1 font-normal text-ub-text-secondary">{notification.title}</span>}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-ub-text-link">{timeAgo(notification.created_at)}</p>
                </div>
                <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-ub-action-primary" />
              </button>
            );
          })
        )}
      </div>

      <Link
        href={notificationsPath}
        onClick={onNavigate}
        className="flex items-center justify-center border-t border-ub-border px-4 py-3 text-sm font-medium text-ub-text-link transition hover:bg-ub-surface-subtle"
      >
        View all notifications
      </Link>
    </>
  );
}
