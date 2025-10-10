"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  Clock,
  CheckCircle,
  XCircle,
  History,
} from "lucide-react";
import { applications } from "components/data/applications";

interface ApplicationTimeLineProps {
  params?: { id: string };
}

export default function TimeLine({
                                   params,
                                 }: ApplicationTimeLineProps) {
  const [showTimeline, setShowTimeline] = useState(false);

  const timelineEvents = applications[0]?.history?.events || [];

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
        <div className="flex flex-col gap-2">
          <h3 className="text-p3 flex items-center gap-2 font-semibold text-text-primary">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <History className="text-xl text-blue-700" />
            </span>
            Timeline & Activity
          </h3>
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
          showTimeline ? "max-h-[1500px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="rounded-b-lg border border-t-0 border-default bg-card p-6">
          <div className="space-y-4">

            {timelineEvents.map((event, index) => (
              <div
                key={index}
                className="relative flex items-center justify-between rounded-lg border border-default p-5 backdrop-blur transition-all duration-300"
                style={{
                  animation: showTimeline
                    ? `slideIn 0.3s ease-out ${index * 0.08}s both`
                    : "none",
                }}
              >
                <div className="flex min-w-0 flex-1 items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                      {getTimelineIcon(event.description)}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="truncate text-base font-semibold text-text-primary">
                        {event.description}
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-xs text-slate-600">
                      <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium text-slate-600">
                        By: <span className="font-semibold ml-1 text-slate-700">{event.by}</span>
                      </span>

                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>{event.timestamp}</span>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="text-p3 ml-4 flex-shrink-0 font-medium text-slate-500">
                </div>
              </div>
            ))}
          </div>
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
      `}</style>
    </section>
  );
}
