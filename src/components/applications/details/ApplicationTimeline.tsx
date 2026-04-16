"use client";

import React from "react";
import { Check, Clock } from "lucide-react";
import { useAllStages } from "hooks/applications/stages/useStages";

interface ApplicationTimelineProps {
  application: any;
}

const ApplicationTimeline = ({ application }: ApplicationTimelineProps) => {
  const { stages, stagesLoading } = useAllStages();

  const currentStageName: string = application?.stage?.name || "";

  const sortedStages = [...stages].sort((a, b) => a.order_index - b.order_index);

  const currentIndex = sortedStages.findIndex((s) => s.name === currentStageName);

  const getStatus = (index: number): "completed" | "current" | "pending" => {
    if (currentIndex === -1) return "pending";
    if (index < currentIndex) return "completed";
    if (index === currentIndex) return "current";
    return "pending";
  };

  if (stagesLoading || sortedStages.length === 0) return null;

  const totalStages = sortedStages.length;

  // Horizontal: progress line reaches the center of the current node
  const progressWidthH =
    currentIndex < 0
      ? "0%"
      : `${((currentIndex + 0.5) / totalStages) * 100}%`;

  return (
    <div className="mt-5 max-w-5xl mx-auto rounded-xl border border-slate-200 bg-card shadow-sm p-6">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50">
          <Clock className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Application Timeline</h3>
          <p className="text-xs text-slate-500">Track progress through each stage</p>
        </div>
      </div>

      {/* ── MOBILE: vertical layout ──────────────────────────── */}
      <div className="flex flex-col md:hidden">
        {sortedStages.map((stage, index) => {
          const status = getStatus(index);
          const isLast = index === totalStages - 1;

          return (
            <div key={stage.id} className="flex items-start gap-4">

              {/* Left column: node + connector */}
              <div className="flex flex-col items-center">

                {/* Node */}
                {status === "completed" && (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 ring-4 ring-white">
                    <Check className="h-5 w-5 stroke-[2.5] text-white" />
                  </div>
                )}
                {status === "current" && (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-blue-600 bg-white ring-4 ring-white">
                    <div className="h-3 w-3 rounded-full bg-blue-600" />
                  </div>
                )}
                {status === "pending" && (
                  <div className="h-10 w-10 shrink-0 rounded-full border-2 border-slate-300 bg-white ring-4 ring-white" />
                )}

                {/* Vertical connector */}
                {!isLast && (
                  <div
                    className={`mt-1 w-0.5 flex-1 min-h-[28px] rounded-full ${
                      index < currentIndex ? "bg-blue-600" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>

              {/* Right column: label */}
              <div className={`pt-2 ${!isLast ? "pb-6" : ""}`}>
                <p
                  className={`text-sm font-medium leading-snug ${
                    status === "current"
                      ? "text-blue-600"
                      : status === "completed"
                      ? "text-slate-700"
                      : "text-slate-400"
                  }`}
                >
                  {stage.name}
                </p>
                {status === "current" && (
                  <p className="mt-0.5 text-xs font-medium text-slate-400">
                    Current Stage
                  </p>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* ── DESKTOP: horizontal layout ───────────────────────── */}
      <div className="relative hidden md:block">

        {/* Base track */}
        <div
          className="absolute top-5 h-0.5 bg-slate-200"
          style={{
            left: `${(0.5 / totalStages) * 100}%`,
            right: `${(0.5 / totalStages) * 100}%`,
          }}
        />

        {/* Progress track */}
        {currentIndex >= 0 && (
          <div
            className="absolute top-5 h-0.5 bg-blue-600 transition-all duration-500"
            style={{
              left: `${(0.5 / totalStages) * 100}%`,
              width: `calc(${progressWidthH} - ${(0.5 / totalStages) * 100}%)`,
            }}
          />
        )}

        {/* Stage nodes */}
        <div className="relative flex w-full">
          {sortedStages.map((stage, index) => {
            const status = getStatus(index);

            return (
              <div
                key={stage.id}
                className="flex flex-1 flex-col items-center gap-2"
              >
                {/* Node */}
                {status === "completed" && (
                  <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 ring-4 ring-white">
                    <Check className="h-5 w-5 stroke-[2.5] text-white" />
                  </div>
                )}
                {status === "current" && (
                  <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-blue-600 bg-white ring-4 ring-white">
                    <div className="h-3 w-3 rounded-full bg-blue-600" />
                  </div>
                )}
                {status === "pending" && (
                  <div className="relative z-10 h-10 w-10 shrink-0 rounded-full border-2 border-slate-300 bg-white ring-4 ring-white" />
                )}

                {/* Label */}
                <div className="flex w-full flex-col items-center px-1 text-center">
                  <span
                    className={`text-xs font-medium leading-snug ${
                      status === "current"
                        ? "text-blue-600"
                        : status === "completed"
                        ? "text-slate-700"
                        : "text-slate-400"
                    }`}
                  >
                    {stage.name}
                  </span>
                  {status === "current" && (
                    <span className="mt-0.5 text-[11px] font-medium text-slate-400">
                      Current Stage
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default ApplicationTimeline;
