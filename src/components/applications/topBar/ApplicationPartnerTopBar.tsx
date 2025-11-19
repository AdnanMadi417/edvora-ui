"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, ChevronLeft } from "lucide-react";
import RequiredAction from "components/applications/popups/partner/RequiredAction";

interface Props {
  application: { id: string | number };
}

export default function ApplicationAccountManagerTopBar({ application }: Props) {
  const router = useRouter();
  const [showRequiredActionPopup, setShowRequiredActionPopup] = useState(false);

  const handleBack = () => router.push("/partner/applications");
  const openRequiredActionPopup = () => setShowRequiredActionPopup(true);
  const closeRequiredActionPopup = () => setShowRequiredActionPopup(false);

  return (
    <section className="w-full">
      <div className="border-b border-default bg-white/70 backdrop-blur-md">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center justify-between gap-3 py-3 sm:h-16 sm:gap-6">
            <div className="flex items-center gap-2 sm:gap-6">
              <button
                onClick={handleBack}
                className="group flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span className="hidden sm:inline">Back to Applications</span>
              </button>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={openRequiredActionPopup}
                className="flex items-center gap-2 rounded-full border border-orange-200 bg-orange-100 px-4 py-2 text-sm font-medium text-slate-800 transition-all hover:bg-orange-200 focus-visible:ring-2 focus-visible:ring-orange-400"
              >
                <Clock className="h-4 w-4 text-orange-500 transition-transform group-hover:rotate-12" />
                Required Action
              </button>
            </div>
          </div>
        </div>
      </div>

      {application && showRequiredActionPopup && (
        <RequiredAction
          isOpen={showRequiredActionPopup}
          onClose={closeRequiredActionPopup}
          applicationId={application.id}
          onConfirm={(id) => console.log("Confirmed required action for application:", id)}
        />
      )}
    </section>
  );
}
