"use client";

import React, { useState } from "react";
import {
  FolderOpen,
  ChevronDown,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Download,
} from "lucide-react";
import { applications } from "../../../data/applications";
import ViewPopup from "../../popups/ViewDoc";

interface ApplicationDocumentsProps {
  params?: { id: string };
}

export default function ApplicationDocuments({
  params,
}: ApplicationDocumentsProps) {
  const [showDocs, setShowDocs] = useState(false);
  const documents = applications[0]?.docs || [];
  const [showViewPopup, setShowViewPopup] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const pendingCount = documents.filter((d) => d.status === "pending").length;
  const approvedCount = documents.filter((d) => d.status === "approved").length;
  const rejectedCount = documents.filter((d) => d.status === "rejected").length;

  const getFileStatus = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <section className="mb-6 mt-6 rounded-lg bg-card transition-all duration-300">
      <div
        className={`group flex items-center justify-between border border-default p-6 transition-all duration-300 ${
          showDocs ? "rounded-t-lg" : "rounded-lg"
        }`}
        onClick={() => setShowDocs(!showDocs)}
      >
        <div className="flex flex-col gap-2">
          <h3 className="text-p3 flex items-center gap-2 font-semibold text-text-primary">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <FolderOpen className="text-xl text-blue-700" />
            </span>
            Documents

            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
              {documents.length} Total
            </span>

          </h3>
        </div>

        <button
          className="flex items-center justify-center rounded-full bg-blue-100 p-2.5 text-blue-600 transition-all duration-200 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
          aria-label="Show documents"
          aria-expanded={showDocs}
        >
          <ChevronDown
            className={`text-lg transition-transform duration-300 ${
              showDocs ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      <div
        className={`transition-all duration-300 ease-in-out ${
          showDocs
            ? "max-h-[2000px] opacity-100"
            : "max-h-0 overflow-hidden opacity-0"
        }`}
      >
        <div className="rounded-b-lg border border-t-0 border-default bg-card p-6">
          <div className="space-y-4">
            {documents.map((doc, index) => (
              <div
                key={doc.id}
                className="relative flex items-center justify-between rounded-lg border border-default p-5 backdrop-blur transition-all duration-300"
                style={{
                  animation: showDocs
                    ? `slideIn 0.3s ease-out ${index * 0.08}s both`
                    : "none",
                }}
              >
                <div className="flex min-w-0 flex-1 items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                      {getFileStatus(doc.status)}
                    </div>
                  </div>

                  <div className="min-w-0 max-w-[350px] flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-slate-800">
                        {doc.name}
                      </h3>
                      <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium capitalize text-slate-600">
                        {doc.type}
                      </span>
                    </div>

                    <p className="mb-2 truncate rounded-full bg-slate-100 px-2.5 py-1 font-mono text-caption text-text-secondary">
                      Emma_Thompson_{doc.name.replace(/\s+/g, "_")}.pdf
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-yellow-500" />
                        <span className="font-medium">v1</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg
                          className="h-3.5 w-3.5 text-slate-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span className="font-medium">2.3 MB</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>{doc.uploadedAt}</span>
                      </div>
                    </div>

                    <div className="mt-2.5 text-xs text-slate-500">
                      Reviewed by{" "}
                      <span className="font-medium text-slate-700">
                        System Account Manager
                      </span>{" "}
                      on 9/8/2025
                    </div>
                  </div>
                </div>

                <div className="ml-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setSelectedDoc(doc);
                      setShowViewPopup(true);
                    }}
                    className="group rounded-full border border-transparent bg-blue-50 p-2 text-blue-600 transition-all duration-200 hover:border-blue-200 hover:bg-blue-100 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-400"
                    title="View Document"
                    aria-label="View Document"
                  >
                    <Eye className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                  </button>

                  <button
                    onClick={() => {
                      const fileUrl =
                        doc.fileUrl || `/docs/${doc.name.replace(/\s+/g, "_")}.pdf`;
                      const link = document.createElement("a");
                      link.href = fileUrl;
                      link.download = fileUrl.split("/").pop() || "document.pdf";
                      link.click();
                    }}
                    className="group rounded-full border border-transparent bg-green-50 p-2 text-green-600 transition-all duration-200 hover:border-green-200 hover:bg-green-100 hover:text-green-700 focus-visible:ring-2 focus-visible:ring-green-400"
                    title="Download Document"
                    aria-label="Download Document"
                  >
                    <Download className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                  </button>

                </div>


              </div>
            ))}
          </div>
        </div>

        <ViewPopup
          isOpen={showViewPopup}
          onClose={() => setShowViewPopup(false)}
          doc={selectedDoc}
        />


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
