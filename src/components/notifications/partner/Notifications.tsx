"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  Bell,
  CheckCircle,
  XCircle,
  Info,
  Clock,
  Check,
  MessageCircle,
} from "lucide-react";

import { useAllNotifications } from "hooks/notifications/useNotifications";
import { useUnreadCount } from "hooks/notifications/useUnreadCount";
import { useMarkAsRead } from "hooks/notifications/useMarkAsRead";


function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function getNotificationIcon(type: string) {
  const t = type.toLowerCase();
  if (t.includes("message"))
    return (
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
        <MessageCircle className="h-5 w-5 text-blue-600" />
      </span>
    );
  if (t.includes("approved"))
    return (
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
        <CheckCircle className="h-5 w-5 text-green-600" />
      </span>
    );
  if (t.includes("rejected"))
    return (
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
        <XCircle className="h-5 w-5 text-red-600" />
      </span>
    );
  if (t.includes("pending"))
    return (
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
        <Clock className="h-5 w-5 text-yellow-600" />
      </span>
    );
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
      <Info className="h-5 w-5 text-slate-500" />
    </span>
  );
}

export default function Notifications() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [removingIndex, setRemovingIndex] = useState<number | null>(null);

  const { notifications, loading, error } = useAllNotifications();
  const { unreadCount, refetch: refetchCount } = useUnreadCount({});
  const { markAsRead: markRead } = useMarkAsRead();

  const markAsRead = async (id: string, index: number) => {
    setRemovingIndex(index);
    try {
      await markRead(id);
      refetchCount();
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    } finally {
      setTimeout(() => setRemovingIndex(null), 300);
    }
  };

  return (
    <section className="mb-6 mt-6 rounded-lg bg-card transition-all duration-300">
      {/* Header */}
      <div
        className={`flex cursor-pointer items-center justify-between border border-default p-6 transition-all duration-300 ${
          showNotifications ? "rounded-t-lg" : "rounded-lg"
        }`}
        onClick={() => setShowNotifications(!showNotifications)}
      >
        <div className="flex flex-col gap-1">
          <h3 className="flex items-center gap-3 text-base font-semibold text-slate-900">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Bell className="h-5 w-5 text-blue-700" />
            </span>
            <span className="flex flex-col">
              <span>Notifications Center</span>
              <span className="text-xs font-normal text-slate-500">
                {unreadCount > 0
                  ? `${unreadCount} unread ${unreadCount === 1 ? "notification" : "notifications"}`
                  : "All caught up"}
              </span>
            </span>
          </h3>
          <p className="ml-[52px] text-sm text-slate-500">
            See updates about student applications and actions required.
          </p>
        </div>

        <button
          className="flex items-center justify-center rounded-full bg-blue-100 p-2 text-blue-600 transition hover:bg-blue-200"
          aria-label="Toggle notifications"
          aria-expanded={showNotifications}
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-300 ${
              showNotifications ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Body */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          showNotifications
            ? "max-h-[1500px] opacity-100"
            : "max-h-0 overflow-hidden opacity-0"
        }`}
      >
        <div className="rounded-b-lg border border-t-0 border-default bg-card p-6">
          {loading ? (
            <div className="py-10 text-center text-slate-500">Loading...</div>
          ) : error ? (
            <div className="py-10 text-center text-red-500">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-10 text-slate-500">
              <Bell className="h-5 w-5" /> No notifications yet
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className={`relative flex items-center justify-between rounded-lg border border-default bg-white p-4 transition-all duration-300 hover:shadow-sm ${
                    notification.read_at !== null ? "opacity-50" : ""
                  } ${
                    removingIndex === index ? "animate-fadeOut" : "animate-slideIn"
                  }`}
                >
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 pt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="mb-0.5 flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-slate-900">
                          {notification.data.sender_name}
                        </span>
                        {notification.read_at === null && (
                          <span className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                        )}
                        <span className="ml-auto flex-shrink-0 text-xs text-slate-400">
                          {timeAgo(notification.created_at)}
                        </span>
                      </div>

                      <p className="mb-0.5 text-xs font-medium text-slate-600">
                        {notification.title}
                      </p>

                      <p className="truncate text-xs text-slate-400">
                        {notification.data.snippet}
                      </p>
                    </div>
                  </div>

                  {notification.read_at === null && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id, index);
                      }}
                      className="ml-4 flex flex-shrink-0 items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 transition hover:bg-green-200 outline-0"
                    >
                      <Check className="h-3 w-3" /> Mark as Read
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeOut {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-8px);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.25s ease-out;
        }
        .animate-fadeOut {
          animation: fadeOut 0.25s ease-in forwards;
        }
      `}</style>
    </section>
  );
}
