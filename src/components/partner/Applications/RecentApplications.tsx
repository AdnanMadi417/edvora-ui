"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronLeft, Clock, School } from 'lucide-react';
import { useRouter } from "next/navigation";


export default function RecentApplications() {
  const [showTimeline, setShowTimeline] = useState(false);
  const router = useRouter();

  const handleBack = () => {
    router.push("/account-manager/applications");
  };


  const recentApplications = [
    {
      name: "Emma Thompson",
      program: "Master of Data Science",
      university: "Australian National University",
      stage: "Stage 5",
      timestamp: "Oct 17, 2025, 03:02 PM",
    },
    {
      name: "Li Wei",
      program: "Master of Engineering",
      university: "Monash University",
      stage: "Stage 4",
      timestamp: "Oct 16, 2025, 03:02 PM",
    },
    {
      name: "Michael Johnson",
      program: "Master of Business Administration",
      university: "University of Sydney",
      stage: "Stage 3",
      timestamp: "Oct 15, 2025, 03:02 PM",
    },
    {
      name: "Priya Sharma",
      program: "Bachelor of Architecture",
      university: "Melbourne University",
      stage: "Stage 2",
      timestamp: "Oct 14, 2025, 03:02 PM",
    },
    {
      name: "Ahmed Al-Mansouri",
      program: "Master of Computer Science",
      university: "University of Technology Sydney",
      stage: "Stage 1",
      timestamp: "Oct 13, 2025, 03:02 PM",
    },
  ];

  return (
    <section className="mb-6 mt-6 rounded-lg bg-card transition-all duration-300">

      <div
        className={`group flex items-center justify-between border border-default p-6 transition-all duration-300 ${
          showTimeline ? "rounded-t-lg" : "rounded-lg"
        }`}
        onClick={() => setShowTimeline(!showTimeline)}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Clock className="w-6 h-6 text-blue-700" />
          </span>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              Recent Applications
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3">

          <button
            onClick={handleBack}
            className="group flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="hidden sm:inline">Back to Applications</span>
          </button>

          <button
            className="flex items-center justify-center rounded-full bg-blue-100 p-2.5 text-blue-600 transition-all duration-200 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
            aria-label="Show applications"
            aria-expanded={showTimeline}
          >
            <ChevronDown
              className={`text-lg transition-transform duration-300 ${
                showTimeline ? "rotate-180" : ""
              }`}
            />
          </button>

        </div>


      </div>

      <div
        className={`transition-all duration-300 ease-in-out ${
          showTimeline
            ? "max-h-[1500px] opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="rounded-b-lg border border-t-0 border-default bg-card p-6">
          <div className="space-y-4">
            {recentApplications.map((app, index) => (
              <div
                key={index}
                className="relative flex items-start justify-between rounded-lg border border-default p-5 backdrop-blur transition-all duration-300 hover:shadow-sm"
                style={{
                  animation: showTimeline
                    ? `slideIn 0.3s ease-out ${index * 0.08}s both`
                    : "none",
                }}
              >
                <div className="flex min-w-0 flex-1 items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                      <School className="w-6 h-6 text-blue-700" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-text-primary">
                      {app.name}
                    </h3>
                    <p className="text-sm text-slate-600">{app.program}</p>
                    <p className="text-xs text-text-muted">{app.university}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end text-sm text-slate-600">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {app.stage}
                  </span>
                  <span className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="h-3.5 w-3.5" />
                    {app.timestamp}
                  </span>
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
