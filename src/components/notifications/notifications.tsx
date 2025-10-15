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
} from "lucide-react";
import { notifications as initialNotifications } from "components/data/applications";

interface PartnerNotificationProps {
  params?: { id: string };
}

export default function Notifications({ params }: PartnerNotificationProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationList, setNotificationList] =
    useState(initialNotifications);
  const [removingIndex, setRemovingIndex] = useState<number | null>(null);

  const getNotificationIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("approved"))
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (t.includes("rejected"))
      return <XCircle className="h-5 w-5 text-red-500" />;
    if (t.includes("pending"))
      return <Clock className="h-5 w-5 text-yellow-500" />;
    return <Info className="h-5 w-5 text-blue-600" />;
  };

  const markAsRead = (index: number) => {
    setRemovingIndex(index);
    setTimeout(() => {
      setNotificationList((prev) => prev.filter((_, i) => i !== index));
      setRemovingIndex(null);
    }, 300);
  };

  return (
    <section className="mb-6 mt-6 rounded-lg bg-card transition-all duration-300">
      <div
        className={`group flex items-center justify-between border border-default p-6 transition-all duration-300 ${
          showNotifications ? "rounded-t-lg" : "rounded-lg"
        }`}
        onClick={() => setShowNotifications(!showNotifications)}
      >
        <div className="flex flex-col gap-2">
          <h3 className="text-p3 flex items-center gap-3 font-semibold text-text-primary">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Bell className="text-xl text-blue-700" />
            </span>

            <span className="flex flex-col">
              <span>Notifications Center</span>
              <span className="flex items-center gap-1 text-caption font-normal text-text-muted">
                Pending {notificationList.length}{" "}
                {notificationList.length === 1
                  ? "notification"
                  : "notifications"}
              </span>
            </span>
          </h3>

          <p className="text-p2 text-text-muted">
            See updates about student applications and actions required.
          </p>
        </div>

        <button
          className="flex items-center justify-center rounded-full bg-blue-100 p-2.5 text-blue-600 transition-all duration-200 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
          aria-label="Toggle notifications"
          aria-expanded={showNotifications}
        >
          <ChevronDown
            className={`text-lg transition-transform duration-300 ${
              showNotifications ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      <div
        className={`transition-all duration-300 ease-in-out ${
          showNotifications
            ? "max-h-[1500px] opacity-100"
            : "max-h-0 overflow-hidden opacity-0"
        }`}
      >
        <div className="rounded-b-lg border border-t-0 border-default bg-card p-6">
          {notificationList.length === 0 ? (
            <div className="flex items-center justify-center py-10 text-text-muted">
              <Bell className="text-text-mute mr-2 h-5 w-5" /> No notifications
              yet
            </div>
          ) : (
            <div className="space-y-4">
              {notificationList.map((note, index) => (
                <div
                  key={index}
                  className={`relative flex items-center justify-between rounded-lg border border-default bg-white p-5 backdrop-blur transition-all duration-300 hover:shadow-sm ${
                    removingIndex === index
                      ? "animate-fadeOut"
                      : "animate-slideIn"
                  }`}
                >
                  <div className="flex min-w-0 flex-1 items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                        {getNotificationIcon(note.type)}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h3 className="truncate text-base font-semibold text-text-primary">
                          {note.title}
                        </h3>
                      </div>

                      <p className="mb-1 text-p2 text-text-muted">
                        {note.message}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-xs text-slate-600">
                        <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium text-slate-600">
                          From:{" "}
                          <span className="ml-1 font-semibold text-slate-700">
                            {note.from}
                          </span>
                        </span>

                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>{note.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => markAsRead(index)}
                    className="ml-4 flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 transition hover:bg-green-200"
                  >
                    <Check className="h-3.5 w-3.5" /> Mark as Read
                  </button>
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
            transform: translateY(-10px);
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
            transform: translateY(-10px);
          }
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }

        .animate-fadeOut {
          animation: fadeOut 0.3s ease-in forwards;
        }
      `}</style>
    </section>
  );
}
