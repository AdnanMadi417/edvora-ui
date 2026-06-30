"use client";

import React, { useEffect, useState } from 'react';
import {
  FolderOpen,
  ChevronDown,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  RotateCcw,
} from "lucide-react";
import ViewPopup from "features/applications/shared/ViewDoc";
import HoldPopup from "features/applications/admin/components/popups/ResubmitDoc";
import EmptyData from "components/emptyData/EmptyData";
import { AppDate } from "components/ui/date";
import { getDocumentDownloadUrl } from "services/documentService";
import api from "lib/useApi"

interface ApplicationDocumentsProps {
  application: any;
  onRefetch?: () => void;
}

export default function ApplicationDocuments({
  application,
  onRefetch,
}: ApplicationDocumentsProps) {
  const [showDocs, setShowDocs] = useState(false);
  const [showViewPopup, setShowViewPopup] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [showResubmitPopup, setShowResubmitPopup] = useState(false);
  const [correctionStatusId, setCorrectionStatusId] = useState<string | null>(null);


  useEffect(() => {
    const fetchApplicationDetails = async () => {
      try {
        const response = await api.get(`/applications/${application.id}`);
        const appData = response.data;

        const correctionStatus = appData.manager_allowed_next_statuses?.find(
          (s) => s.name === "Correction Requested by Admin"
        );

        setCorrectionStatusId(correctionStatus?.id || null);
      } catch (err) {
        console.error(err);
      }
    };

    if (application?.id) fetchApplicationDetails();
  }, [application?.id]);

  const handleDownload = async (fileKey: string) => {
    try {
      const downloadUrl = await getDocumentDownloadUrl(fileKey);
      window.open(downloadUrl, "_blank");
    } catch (err: any) {
      console.error("Download failed:", err);
      alert(err?.message || "Failed to download document");
    }
  };

  const allDocs = application?.documents || [];
  const documents = allDocs;
  const paymentDocuments = application?.payment_documents || [];
  const arrivalDocuments = application?.arrival_documents || [];
  const emgsEvalDoc = application?.emgs_evaluation_document || null;
  const offerLetterDoc = application?.offer_letter_document || null;
  const visaDoc = application?.visa_document || null;
  const commissionDocuments: any[] = Object.values(application?.commission_documents || {}).filter(Boolean) as any[];

  const singleDocs = [emgsEvalDoc, offerLetterDoc, visaDoc].filter(Boolean);
  const totalDocuments = documents.length + paymentDocuments.length + arrivalDocuments.length + singleDocs.length + commissionDocuments.length;
  const pendingDocuments = [...documents, ...paymentDocuments, ...arrivalDocuments, ...singleDocs, ...commissionDocuments].filter(
    (d) => d.status === "1" || d.status === "pending"
  ).length;

  const getFileStatus = (status: string) => {
    switch (status) {
      case "1":
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "2":
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "3":
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getFileName = (fileUrl: string | null) => {
    if (!fileUrl) return "document.pdf";
    return fileUrl.split("/").pop() || "document.pdf";
  };

  if (totalDocuments === 0) {
    return <EmptyData />;
  }

  return (
    <>
      <div
        className="group flex cursor-pointer items-center justify-between p-4 sm:p-5 transition-all duration-200 hover:bg-slate-50/80"
        onClick={() => setShowDocs(!showDocs)}
      >
        {/* Left: icon + info */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-50">
              <FolderOpen className="h-5 w-5 text-blue-600" />
            </div>
            {pendingDocuments > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-md bg-amber-500 text-[10px] font-bold text-white">
                {pendingDocuments}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Application Documents</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              {totalDocuments} {totalDocuments === 1 ? "file" : "files"}
              {pendingDocuments > 0 && (
                <span className="font-medium text-amber-600"> · {pendingDocuments} pending review</span>
              )}
            </p>
          </div>
        </div>

        {/* Right: badges + chevron */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              {totalDocuments} Total
            </span>
            {pendingDocuments > 0 && (
              <span className="rounded-md bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                {pendingDocuments} Pending
              </span>
            )}
          </div>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
              showDocs ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"
            } group-hover:bg-blue-50 group-hover:text-blue-600`}
          >
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showDocs ? "rotate-180" : ""}`} />
          </div>
        </div>
      </div>

      <div
        className={`transition-all duration-300 ease-in-out ${
          showDocs
            ? "max-h-[2000px] opacity-100"
            : "max-h-0 overflow-hidden opacity-0"
        }`}
      >
        <div className="space-y-4 border-t border-slate-200 p-6">

          <div className="space-y-4">
            {allDocs.map((doc: any, index: number) => (
              <div
                key={doc.id}
                className="relative flex items-center justify-between rounded-lg border border-slate-200 p-5 backdrop-blur transition-all duration-300"
                style={{
                  animation: showDocs
                    ? `slideIn 0.3s ease-out ${index * 0.08}s both`
                    : "none",
                }}
              >
                <div className="flex min-w-0 flex-1 items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary">
                      {getFileStatus(doc.status)}
                    </div>
                  </div>

                  <div className="min-w-0 max-w-[350px] flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-slate-800">
                        {doc.document_type.charAt(0).toUpperCase() +
                          doc.document_type.slice(1)}
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
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
                        <span className="font-medium">PDF</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span><AppDate value={doc.created_at} format="short" fallback="Not provided" /></span>
                      </div>
                    </div>

                    {doc.approve_notes && (
                      <div className="mt-2.5 text-xs text-slate-500">
                        Notes:{" "}
                        <span className="font-medium text-slate-700">
                          {doc.approve_notes}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="ml-4 flex flex-wrap gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!doc.file_key) return;
                      handleDownload(doc.file_key);
                    }}
                    className="group rounded-md cursor-pointer border border-transparent bg-blue-50 p-2 text-blue-600 transition-all duration-200 hover:border-blue-200 hover:bg-blue-100 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-400"
                    title="Download Document"
                    aria-label="Download Document"
                    disabled={!doc.file_key}
                  >
                    <Download className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDoc(doc);
                      setShowResubmitPopup(true);
                    }}
                    className="group rounded-md border border-transparent bg-amber-100 p-2 text-amber-700 transition-all duration-200 hover:border-amber-300 hover:bg-amber-200 hover:text-amber-800 focus-visible:ring-2 focus-visible:ring-amber-500"
                    title="Resubmit Document"
                    aria-label="Resubmit Document"
                  >
                    <RotateCcw className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {paymentDocuments.map((doc: any, index: number) => (
              <div
                key={doc.id}
                className="relative flex items-center justify-between rounded-lg border border-slate-200 p-5 backdrop-blur transition-all duration-300"
                style={{
                  animation: showDocs
                    ? `slideIn 0.3s ease-out ${index * 0.08}s both`
                    : "none",
                }}
              >
                <div className="flex min-w-0 flex-1 items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary">
                      {getFileStatus(doc.status)}
                    </div>
                  </div>

                  <div className="min-w-0 max-w-[350px] flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-slate-800">
                        {doc.document_type
                          ? doc.document_type.charAt(0).toUpperCase() + doc.document_type.slice(1)
                          : "Not provided"}
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
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
                        <span className="font-medium">PDF</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span><AppDate value={doc.created_at} format="short" fallback="Not provided" /></span>
                      </div>
                    </div>

                    {doc.approve_notes && (
                      <div className="mt-2.5 text-xs text-slate-500">
                        Notes:{" "}
                        <span className="font-medium text-slate-700">
                          {doc.approve_notes}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="ml-4 flex flex-wrap gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!doc.file_key) return;
                      handleDownload(doc.file_key);
                    }}
                    className="group rounded-md cursor-pointer border border-transparent bg-blue-50 p-2 text-blue-600 transition-all duration-200 hover:border-blue-200 hover:bg-blue-100 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-400"
                    title="Download Document"
                    aria-label="Download Document"
                    disabled={!doc.file_key}
                  >
                    <Download className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDoc(doc);
                      setShowResubmitPopup(true);
                    }}
                    className="group rounded-md border border-transparent bg-amber-100 p-2 text-amber-700 transition-all duration-200 hover:border-amber-300 hover:bg-amber-200 hover:text-amber-800 focus-visible:ring-2 focus-visible:ring-amber-500"
                    title="Resubmit Document"
                    aria-label="Resubmit Document"
                  >
                    <RotateCcw className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {arrivalDocuments.map((doc: any, index: number) => (
              <div
                key={doc.id}
                className="relative flex items-center justify-between rounded-lg border border-slate-200 p-5 backdrop-blur transition-all duration-300"
                style={{
                  animation: showDocs
                    ? `slideIn 0.3s ease-out ${index * 0.08}s both`
                    : "none",
                }}
              >
                <div className="flex min-w-0 flex-1 items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary">
                      {getFileStatus(doc.status)}
                    </div>
                  </div>

                  <div className="min-w-0 max-w-[350px] flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-slate-800">
                        {doc.document_type.charAt(0).toUpperCase() +
                          doc.document_type.slice(1)}
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
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
                        <span className="font-medium">PDF</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span><AppDate value={doc.created_at} format="short" fallback="Not provided" /></span>
                      </div>
                    </div>

                    {doc.approve_notes && (
                      <div className="mt-2.5 text-xs text-slate-500">
                        Notes:{" "}
                        <span className="font-medium text-slate-700">
                          {doc.approve_notes}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="ml-4 flex flex-wrap gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!doc.file_key) return;
                      handleDownload(doc.file_key);
                    }}
                    className="group rounded-md cursor-pointer border border-transparent bg-blue-50 p-2 text-blue-600 transition-all duration-200 hover:border-blue-200 hover:bg-blue-100 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-400"
                    title="Download Document"
                    aria-label="Download Document"
                    disabled={!doc.file_key}
                  >
                    <Download className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDoc(doc);
                      setShowResubmitPopup(true);
                    }}
                    className="group rounded-md border border-transparent bg-amber-100 p-2 text-amber-700 transition-all duration-200 hover:border-amber-300 hover:bg-amber-200 hover:text-amber-800 focus-visible:ring-2 focus-visible:ring-amber-500"
                    title="Resubmit Document"
                    aria-label="Resubmit Document"
                  >
                    <RotateCcw className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {offerLetterDoc && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Offer Letter</p>
              <div className="relative flex items-center justify-between rounded-lg border border-slate-200 p-5 backdrop-blur transition-all duration-300">
                <div className="flex min-w-0 flex-1 items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary">
                      {getFileStatus(offerLetterDoc.status)}
                    </div>
                  </div>
                  <div className="min-w-0 max-w-[350px] flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-slate-800">
                        {offerLetterDoc.document_type}
                      </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span><AppDate value={offerLetterDoc.created_at} format="short" fallback="Not provided" /></span>
                      </div>
                    </div>
                    {offerLetterDoc.approve_notes && (
                      <div className="mt-2.5 text-xs text-slate-500">
                        Notes: <span className="font-medium text-slate-700">{offerLetterDoc.approve_notes}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="ml-4 flex flex-wrap gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); if (!offerLetterDoc.file_key) return; handleDownload(offerLetterDoc.file_key); }}
                    className="group rounded-md cursor-pointer border border-transparent bg-blue-50 p-2 text-blue-600 transition-all duration-200 hover:border-blue-200 hover:bg-blue-100 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-400"
                    title="Download Document"
                    disabled={!offerLetterDoc.file_key}
                  >
                    <Download className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {emgsEvalDoc && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">EMGS Eval Document</p>
              <div className="relative flex items-center justify-between rounded-lg border border-slate-200 p-5 backdrop-blur transition-all duration-300">
                <div className="flex min-w-0 flex-1 items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary">
                      {getFileStatus(emgsEvalDoc.status)}
                    </div>
                  </div>
                  <div className="min-w-0 max-w-[350px] flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-slate-800">
                        {emgsEvalDoc.document_type}
                      </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="font-medium">PDF</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span><AppDate value={emgsEvalDoc.created_at} format="short" fallback="Not provided" /></span>
                      </div>
                    </div>
                    {emgsEvalDoc.approve_notes && (
                      <div className="mt-2.5 text-xs text-slate-500">
                        Notes: <span className="font-medium text-slate-700">{emgsEvalDoc.approve_notes}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="ml-4 flex flex-wrap gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!emgsEvalDoc.file_key) return;
                      handleDownload(emgsEvalDoc.file_key);
                    }}
                    className="group rounded-md cursor-pointer border border-transparent bg-blue-50 p-2 text-blue-600 transition-all duration-200 hover:border-blue-200 hover:bg-blue-100 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-400"
                    title="Download Document"
                    aria-label="Download Document"
                    disabled={!emgsEvalDoc.file_key}
                  >
                    <Download className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {visaDoc && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Visa Document</p>
              <div className="relative flex items-center justify-between rounded-lg border border-slate-200 p-5 backdrop-blur transition-all duration-300">
                <div className="flex min-w-0 flex-1 items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary">
                      {getFileStatus(visaDoc.status)}
                    </div>
                  </div>
                  <div className="min-w-0 max-w-[350px] flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-slate-800">{visaDoc.document_type}</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="font-medium">PDF</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span><AppDate value={visaDoc.created_at} format="short" fallback="Not provided" /></span>
                      </div>
                    </div>
                    {visaDoc.approve_notes && (
                      <div className="mt-2.5 text-xs text-slate-500">
                        Notes: <span className="font-medium text-slate-700">{visaDoc.approve_notes}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="ml-4 flex flex-wrap gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); if (!visaDoc.file_key) return; handleDownload(visaDoc.file_key); }}
                    className="group rounded-md cursor-pointer border border-transparent bg-blue-50 p-2 text-blue-600 transition-all duration-200 hover:border-blue-200 hover:bg-blue-100 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-400"
                    title="Download Document"
                    disabled={!visaDoc.file_key}
                  >
                    <Download className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {commissionDocuments.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Commission Documents</p>
              {commissionDocuments.map((doc: any) => (
                <div key={doc.id} className="relative flex items-center justify-between rounded-lg border border-slate-200 p-5 backdrop-blur transition-all duration-300">
                  <div className="flex min-w-0 flex-1 items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary">
                        {getFileStatus(doc.status)}
                      </div>
                    </div>
                    <div className="min-w-0 max-w-[350px] flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <h3 className="truncate text-sm font-semibold text-slate-800">{doc.document_type}</h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span><AppDate value={doc.created_at} format="short" fallback="Not provided" /></span>
                        </div>
                      </div>
                      {doc.approve_notes && (
                        <div className="mt-2.5 text-xs text-slate-500">
                          Notes: <span className="font-medium text-slate-700">{doc.approve_notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex flex-wrap gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); if (!doc.file_key) return; handleDownload(doc.file_key); }}
                      className="group rounded-md cursor-pointer border border-transparent bg-blue-50 p-2 text-blue-600 transition-all duration-200 hover:border-blue-200 hover:bg-blue-100 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-400"
                      title="Download Document"
                      disabled={!doc.file_key}
                    >
                      <Download className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <ViewPopup
          isOpen={showViewPopup}
          onClose={() => setShowViewPopup(false)}
          doc={selectedDoc}
        />

        {showResubmitPopup && selectedDoc && (
          <HoldPopup
            isOpen={showResubmitPopup}
            onClose={() => setShowResubmitPopup(false)}
            applicationId={application.id}
            docId={selectedDoc.document_type_id}
            statusId={correctionStatusId}
            onRefetch={onRefetch}
          />
        )}
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
    </>
  );
}
