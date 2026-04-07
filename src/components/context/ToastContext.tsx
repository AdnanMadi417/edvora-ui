"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContextType {
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);
let toastId = 0;

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    const id = toastId++;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getStyles = (type: "success" | "error" | "info") => {
    const styles = {
      success: {
        bg: "bg-emerald-50 dark:bg-emerald-900",
        border: "border-l-4 border-emerald-500",
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
        progress: "bg-emerald-500",
        text: "text-emerald-900 dark:text-emerald-100",
      },
      error: {
        bg: "bg-rose-50 dark:bg-rose-900",
        border: "border-l-4 border-rose-500",
        icon: <AlertCircle className="h-5 w-5 text-rose-500" />,
        progress: "bg-rose-500",
        text: "text-rose-900 dark:text-rose-100",
      },
      info: {
        bg: "bg-blue-50 dark:bg-blue-900",
        border: "border-l-4 border-blue-500",
        icon: <Info className="h-5 w-5 text-blue-500" />,
        progress: "bg-blue-500",
        text: "text-blue-900 dark:text-blue-100",
      },
    };
    return styles[type];
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => {
          const style = getStyles(t.type);
          return (
            <div
              key={t.id}
              className={`pointer-events-auto relative flex items-start gap-3 ${style.bg} ${style.border} rounded-md px-4 py-3.5 w-96 max-w-[calc(100vw-3rem)] backdrop-blur-sm animate-slide-in`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {style.icon}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium leading-snug ${style.text}`}>
                  {t.message}
                </p>
              </div>

              <button
                onClick={() => removeToast(t.id)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                aria-label="Close notification"
              >
                <X className="h-4 w-4" />
              </button>

              <div className={`absolute bottom-0 left-0 h-1 ${style.progress} rounded-bl-lg animate-progress origin-left`} />
            </div>
          );
        })}
      </div>

      <style jsx>{`
          @keyframes slide-in {
              from {
                  transform: translateX(calc(100% + 1.5rem));
                  opacity: 0;
              }
              to {
                  transform: translateX(0);
                  opacity: 1;
              }
          }

          @keyframes progress {
              from {
                  transform: scaleX(1);
              }
              to {
                  transform: scaleX(0);
              }
          }

          .animate-slide-in {
              animation: slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .animate-progress {
              animation: progress 4s linear forwards;
          }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context)
    throw new Error("useToast must be used within ToastProvider");
  return context;
};

export default function ToastDemo() {
  const { showToast } = useToast();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100  dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Toast Notifications
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Try out the modern toast notification system
        </p>

        <div className="space-y-3">
          <button
            onClick={() => showToast("Changes saved successfully!", "success")}
            className="w-full px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            Show Success Toast
          </button>

          <button
            onClick={() => showToast("Something went wrong. Please try again.", "error")}
            className="w-full px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            Show Error Toast
          </button>

          <button
            onClick={() => showToast("New updates are available for download.", "info")}
            className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            Show Info Toast
          </button>
        </div>
      </div>
    </div>
  );
}