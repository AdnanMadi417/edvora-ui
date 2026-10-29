"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { buttonBase, buttonSizes, buttonVariants, card, cardPadding, focusRing } from "components/ub/recipes";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  exiting: boolean;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);
let toastId = 0;

/** Success and info toasts auto-dismiss after 5s; errors stay until closed (brief §4.7). */
const DURATION = 5000;
const EXIT_MS = 200;

// Navy toast surface, white text, semantic icon (brief §4.7). The icon
// colours are the tone "dot" shades, which read on navy in both themes.
const TOAST_STYLES: Record<ToastType, { icon: ReactNode; title: string }> = {
  success: { icon: <CheckCircle2 className="h-5 w-5 text-ub-tone-success-dot" aria-hidden />, title: "Success" },
  error: { icon: <AlertCircle className="h-5 w-5 text-ub-tone-danger-dot" aria-hidden />, title: "Error" },
  info: { icon: <Info className="h-5 w-5 text-ub-light-blue" aria-hidden />, title: "Info" },
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const clearTimer = (id: number) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
  };

  const dismiss = useCallback((id: number) => {
    clearTimer(id);
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, EXIT_MS);
  }, []);

  const schedule = useCallback(
    (id: number, type: ToastType) => {
      if (type === "error") return;
      clearTimer(id);
      timers.current.set(id, setTimeout(() => dismiss(id), DURATION));
    },
    [dismiss],
  );

  useEffect(() => {
    const map = timers.current;
    return () => map.forEach((timer) => clearTimeout(timer));
  }, []);

  const showToast = (message: string, type: ToastType = "info") => {
    const id = toastId++;
    setToasts((prev) => [...prev, { id, message, type, exiting: false }]);
    schedule(id, type);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 end-4 z-[200] flex flex-col items-end gap-2 md:bottom-6 md:end-6"
      >
        {toasts.map((t) => {
          const style = TOAST_STYLES[t.type];
          return (
            <div
              key={t.id}
              role={t.type === "error" ? "alert" : "status"}
              // Hovering or focusing a toast pauses its auto-dismiss.
              onMouseEnter={() => clearTimer(t.id)}
              onMouseLeave={() => !t.exiting && schedule(t.id, t.type)}
              onFocus={() => clearTimer(t.id)}
              onBlur={() => !t.exiting && schedule(t.id, t.type)}
              className={`pointer-events-auto flex w-[360px] max-w-[calc(100vw-2rem)] items-start gap-3 rounded-ub-lg bg-ub-toast px-4 py-3 text-white shadow-ub-lg ${
                t.exiting ? "ub-toast-out" : "ub-toast-in"
              }`}
            >
              <span className="mt-0.5 shrink-0">{style.icon}</span>

              <div className="min-w-0 flex-1">
                <p className="text-ub-label-md">{style.title}</p>
                <p className="mt-0.5 text-ub-body-sm text-ub-neutral-200">{t.message}</p>
              </div>

              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className={`-me-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-ub-full text-ub-neutral-200 transition-colors duration-ub-fast ease-ub-standard hover:bg-ub-navy-border-strong hover:text-white ${focusRing} focus-visible:outline-ub-blue-300`}
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          );
        })}
      </div>

      <style jsx global>{`
        @keyframes ub-toast-in {
          from {
            transform: translateY(0.75rem);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes ub-toast-out {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        .ub-toast-in {
          animation: ub-toast-in var(--ub-duration-base, 200ms) var(--ub-ease-standard, ease-out) both;
        }

        .ub-toast-out {
          animation: ub-toast-out ${EXIT_MS}ms var(--ub-ease-standard, ease-in) forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .ub-toast-in,
          .ub-toast-out {
            animation-duration: 1ms;
          }
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
    <div className="flex min-h-screen items-center justify-center bg-ub-canvas p-6">
      <div className={`${card} ${cardPadding} w-full max-w-sm`}>
        <h2 className="mb-1 text-ub-heading-md text-ub-text-primary">Toast notifications</h2>
        <p className="mb-6 text-ub-body-sm text-ub-text-secondary">Preview each notification type.</p>
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => showToast("Application submitted to Sunway University.", "success")}
            className={`${buttonBase} ${buttonSizes.md} ${buttonVariants.positive} w-full`}
          >
            Success
          </button>
          <button
            type="button"
            onClick={() => showToast("This file is over 10 MB. Upload a PDF under 10 MB.", "error")}
            className={`${buttonBase} ${buttonSizes.md} ${buttonVariants.destructive} w-full`}
          >
            Error
          </button>
          <button
            type="button"
            onClick={() => showToast("New intake dates are available in the Knowledge Hub.", "info")}
            className={`${buttonBase} ${buttonSizes.md} ${buttonVariants.primary} w-full`}
          >
            Info
          </button>
        </div>
      </div>
    </div>
  );
}
