import React, { useEffect } from "react";
import { CheckCircle, XCircle } from "lucide-react";

export default function NewApplicationSuccess({ onClose }) {
  useEffect(() => {
    // Close on Escape key
    const handleKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKey);

    // Auto-close after 3 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => {
      window.removeEventListener("keydown", handleKey);
      clearTimeout(timer);
    };
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[80] flex items-center justify-center bg-overlay p-4 backdrop-blur-sm transition-all duration-300"
    >
      <div className="animate-fade-in relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-card shadow-lg transition-all duration-300">
        <div className="relative border-b border-default px-6 pb-4 pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-md border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                <CheckCircle
                  className="h-6 w-6 text-blue-600"
                  strokeWidth={2.5}
                />
              </div>
              <div>
                <h5 className="text-h5 font-bold text-gray-900">
                  Application Submitted!
                </h5>
                <p className="mt-0.5 text-caption text-slate-600">
                  Your applicants’ information has been received successfully.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="group flex h-9 w-9 items-center justify-center rounded-md text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-gray-600"
            >
              <XCircle className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
        </div>

        <div className="space-y-5 px-6 py-4">
          <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <p className="text-p2 leading-relaxed text-slate-900">
              Your application details have been successfully submitted. Our
              team will review the information and get back to you with any
              updates soon.
            </p>
          </div>

          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="text-sm leading-relaxed text-green-800">
              <strong>Next Steps:</strong> You can monitor the status of your
              submission through your dashboard. Thank you for keeping your
              information up to date!
            </p>
          </div>
        </div>

        <div className="flex justify-end border-t border-default px-6 py-5">
          <button
            onClick={onClose}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.25s ease-out;
        }
      `}</style>
    </div>
  );
}
