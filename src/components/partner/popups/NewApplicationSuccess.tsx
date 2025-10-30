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
      className="fixed inset-0 flex items-center justify-center bg-overlay p-4 transition-all duration-300 z-[80] backdrop-blur-sm"
    >
      <div className="w-full max-w-2xl transform transition-all duration-300 relative overflow-hidden rounded-2xl bg-card shadow-lg animate-fade-in">

        <div className="relative border-b border-default px-6 pb-4 pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                <CheckCircle className="h-6 w-6 text-blue-600" strokeWidth={2.5} />
              </div>
              <div>
                <h5 className="text-h5 font-bold text-gray-900">
                  Application Submitted!
                </h5>
                <p className="mt-0.5 text-caption text-text-muted">
                  Your applicants’ information has been received successfully.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="group flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-gray-600"
            >
              <XCircle className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
        </div>

        <div className="space-y-5 px-6 py-4">
          <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <p className="text-p2 leading-relaxed text-text-primary">
              Thank you for submitting your applicants’ details. Our team will
              review their applications and notify you once there are updates.
            </p>
          </div>

          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="text-sm text-green-800 leading-relaxed">
              <strong>For you as our Partner:</strong> You can now track the
              progress of each applicant from your dashboard. We appreciate your
              continued collaboration!
            </p>
          </div>
        </div>

        <div className="border-t border-default px-6 py-5 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-blue-600 text-white px-5 py-2 text-sm font-medium hover:bg-blue-700 transition"
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
