"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  Users,
  Clock,
  Mail,
  Globe,
  GraduationCap,
  Building,
  User,
} from "lucide-react";

export default function PartnerStudentsList() {
  const [showTimeline, setShowTimeline] = useState(false);

  const PartnerStudentsList = [
    {
      name: "Ahmed Al-Mansouri",
      country: "UAE",
      email: "ahmed.almansouri@gmail.com",
      program: "Master of Computer Science",
      university: "University of Technology Sydney",
      timestamp: "Oct 21, 2025, 10:20 AM",
    },
    {
      name: "Priya Sharma",
      country: "India",
      email: "priya.sharma@gmail.com",
      program: "Bachelor of Architecture",
      university: "University of Delhi",
      timestamp: "Oct 21, 2025, 10:20 AM",
    },
    {
      name: "Michael Johnson",
      country: "USA",
      email: "michael.johnson@gmail.com",
      program: "Master of Business Administration",
      university: "University of Sydney",
      timestamp: "Oct 21, 2025, 10:20 AM",
    },
    {
      name: "Li Wei",
      country: "China",
      email: "li.wei@gmail.com",
      program: "Master of Engineering",
      university: "Monash University",
      timestamp: "Oct 21, 2025, 10:20 AM",
    },
    {
      name: "Emma Thompson",
      country: "United Kingdom",
      email: "emma.thompson@gmail.com",
      program: "Master of Data Science",
      university: "Australian National University",
      timestamp: "Oct 21, 2025, 10:20 AM",
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
            <Users className="h-6 w-6 text-blue-700" />
          </span>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              Students Brought by Partner
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3">
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
            : "max-h-0 overflow-hidden opacity-0"
        }`}
      >
        <div className="rounded-b-lg border border-t-0 border-default bg-card p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PartnerStudentsList.map((app, index) => (
              <div
                key={index}
                role="button"
                tabIndex={0}
                className="relative block cursor-pointer rounded-xl border border-gray-100 p-5 backdrop-blur transition-all duration-300 hover:border-gray-200"
                style={{
                  animation: showTimeline
                    ? `slideIn 0.3s ease-out ${index * 0.08}s both`
                    : "none",
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                      <User className="h-4 w-4 text-blue-700" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-semibold text-text-primary">
                      {app.name}
                    </h3>

                    <div className="flex items-center gap-1 text-caption text-slate-600">
                      <Globe className="h-3 w-3 text-slate-600" />
                      <span className="truncate">{app.country}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 space-y-2 border-t border-gray-100 pt-3 text-slate-500">
                  <div className="flex items-center gap-2 text-xs">
                    <Mail className="h-3.5 w-3.5 " />
                    <span className="truncate">
                      {app.email || "No email provided"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <GraduationCap className="h-3.5 w-3.5" />
                    <span className="truncate">{app.program || "N/A"}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <Building className="h-3.5 w-3.5" />
                    <span className="truncate">{app.university || "N/A"}</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {app.timestamp
                      ? new Date(app.timestamp).toLocaleString()
                      : "Unknown date"}
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
