"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
  exiting: boolean;
}

interface ToastContextType {
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);
let toastId = 0;

const DURATION = 4000;
const EXIT_MS = 320;

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = (id: number) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, EXIT_MS);
  };

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    const id = toastId++;
    setToasts((prev) => [...prev, { id, message, type, exiting: false }]);
    setTimeout(() => dismiss(id), DURATION - EXIT_MS);
  };

  const getStyles = (type: "success" | "error" | "info") => {
    return {
      success: {
        accent: "bg-emerald-500",
        iconBg: "bg-emerald-100",
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
        progress: "bg-emerald-400",
        title: "Success",
      },
      error: {
        accent: "bg-rose-500",
        iconBg: "bg-rose-100",
        icon: <AlertCircle className="h-4 w-4 text-rose-600" />,
        progress: "bg-rose-400",
        title: "Error",
      },
      info: {
        accent: "bg-blue-500",
        iconBg: "bg-blue-100",
        icon: <Info className="h-4 w-4 text-blue-600" />,
        progress: "bg-blue-400",
        title: "Info",
      },
    }[type];
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="pointer-events-none fixed bottom-6 right-6 z-[200] flex flex-col items-end gap-2">
        {toasts.map((t) => {
          const style = getStyles(t.type);
          return (
            <div
              key={t.id}
              className={`pointer-events-auto w-[360px] max-w-[calc(100vw-3rem)] overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-black/[0.06] ${
                t.exiting ? "animate-toast-out" : "animate-toast-in"
              }`}
            >
              {/* top accent */}
              <div className={`h-[3px] w-full ${style.accent}`} />

              <div className="flex items-start gap-3 px-4 py-3.5">
                {/* icon badge */}
                <div
                  className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${style.iconBg}`}
                >
                  {style.icon}
                </div>

                {/* text */}
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold leading-none text-gray-900">
                    {style.title}
                  </p>
                  <p className="mt-1 text-[13px] leading-snug text-gray-500">
                    {t.message}
                  </p>
                </div>

                {/* close */}
                <button
                  onClick={() => dismiss(t.id)}
                  className="flex-shrink-0 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                  aria-label="Dismiss"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* progress bar */}
              <div className={`h-[3px] w-full ${style.progress} animate-toast-progress origin-left`} />
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes toast-in {
          from {
            transform: translateX(calc(100% + 1.5rem));
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes toast-out {
          from {
            transform: translateX(0);
            opacity: 1;
            max-height: 120px;
          }
          to {
            transform: translateX(calc(100% + 1.5rem));
            opacity: 0;
            max-height: 0;
          }
        }

        @keyframes toast-progress {
          from {
            transform: scaleX(1);
          }
          to {
            transform: scaleX(0);
          }
        }

        .animate-toast-in {
          animation: toast-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .animate-toast-out {
          animation: toast-out ${EXIT_MS}ms cubic-bezier(0.7, 0, 1, 1) forwards;
        }

        .animate-toast-progress {
          animation: toast-progress ${DURATION}ms linear forwards;
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};

export default function ToastDemo() {
  const { showToast } = useToast();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <h2 className="mb-1 text-xl font-bold text-gray-900">
          Toast Notifications
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          Try out the notification system
        </p>
        <div className="space-y-2.5">
          <button
            onClick={() => showToast("Changes saved successfully!", "success")}
            className="w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-600"
          >
            Success
          </button>
          <button
            onClick={() => showToast("Something went wrong. Please try again.", "error")}
            className="w-full rounded-lg bg-rose-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-rose-600"
          >
            Error
          </button>
          <button
            onClick={() => showToast("New updates are available for download.", "info")}
            className="w-full rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-600"
          >
            Info
          </button>
        </div>
      </div>
    </div>
  );
}
