"use client";

import React, { useEffect, useState } from "react";
import {
  ChevronDown,
  Clock,
  CheckCircle,
  XCircle,
  History,
  Globe,
} from "lucide-react";
import api from "../../../../lib/useApi";

interface VisaTrackingTimelineProps {
  application: any;
}

export default function VisaTrackingTimeline({
                                               application,
                                             }: VisaTrackingTimelineProps) {
  const [showTimeline, setShowTimeline] = useState(false);
  const [visaCase, setVisaCase] = useState<any>(null);
  const [correctionStatusId, setCorrectionStatusId] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!application?.id) return;

    const fetchApplicationDetails = async () => {
      try {
        const res = await api.get(
          `/applications/${application.id}/visa-case`
        );
        setVisaCase(res.data);
      } catch (err: any) {
        if (err?.response?.status === 404) {
          console.log("ℹ️ Visa case not created yet");
          setVisaCase(null);
        } else {
          console.error(err);
        }
      }

    };

    fetchApplicationDetails();
  }, [application?.id]);

  // ⛔ Debug only — UI stays the same
  const timelineEvents: any[] = [];

  const getTimelineIcon = (description: string) => {
    const descLower = description.toLowerCase();

    if (descLower.includes("approved") || descLower.includes("issued")) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    if (descLower.includes("rejected") || descLower.includes("denied")) {
      return <XCircle className="h-5 w-5 text-red-600" />;
    }
    if (
      descLower.includes("submit") ||
      descLower.includes("initial") ||
      descLower.includes("created")
    ) {
      return <History className="h-5 w-5 text-blue-600" />;
    }
    return <Clock className="h-5 w-5 text-yellow-500" />;
  };

  return (
    <section className="mb-6 mt-6 rounded-lg bg-card transition-all duration-300">
      <div
        className={`group flex items-center justify-between border border-default p-6 transition-all duration-300 ${
          showTimeline ? "rounded-t-lg" : "rounded-lg"
        }`}
        onClick={() => setShowTimeline(!showTimeline)}
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            <Globe className="text-xl text-blue-700" />
          </span>
          <div className="flex flex-col">
            <h3 className="text-p3 font-semibold text-text-primary">
              Visa Tracking Timeline
            </h3>
            <p className="text-sm text-text-muted">
              Track your visa application process from here
            </p>
          </div>
        </div>

        <button
          className="flex items-center justify-center rounded-full bg-blue-100 p-2.5 text-blue-600 transition-all duration-200 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
          aria-label="Show timeline"
          aria-expanded={showTimeline}
        >
          <ChevronDown
            className={`text-lg transition-transform duration-300 ${
              showTimeline ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      <div
        className={`transition-all duration-300 ease-in-out ${
          showTimeline
            ? "max-h-[1500px] opacity-100"
            : "max-h-0 overflow-hidden opacity-0"
        }`}
      >
        <div className="rounded-b-lg border border-t-0 border-default bg-card p-6">
          <div className="relative">
            <div className="space-y-8">
              {timelineEvents.map((event, index) => (
                <div key={index} className="relative flex items-start gap-4">
                  <div className="relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center">
                    {getTimelineIcon(event.description)}

                    {index !== timelineEvents.length - 1 && (
                      <span className="absolute top-12 pb-12 left-1/2 -translate-x-1/2 h-full w-px bg-gray-300"></span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                      <span>{event.timestamp}</span>
                    </div>

                    <h3 className="break-words text-base font-semibold text-text-primary">
                      {event.description}
                    </h3>
                  </div>
                </div>
              ))}

              {timelineEvents.length === 0 && (
                <p className="text-sm text-text-muted">
                  (Debug) Timeline data will appear here
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
