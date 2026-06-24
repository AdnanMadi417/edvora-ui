"use client";

import React, { useState, useEffect } from "react";
import { XCircle, FileText } from "lucide-react";
import Image from "next/image";
import filePng from "/public/img/dashboards/file-icon.png";

interface ViewPopupProps {
  isOpen: boolean;
  onClose: () => void;
  doc: any | null;
}

export default function ViewPopup({ isOpen, onClose, doc }: ViewPopupProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) setIsVisible(true);
    else setTimeout(() => setIsVisible(false), 300);
  }, [isOpen]);

  if (!isVisible || !doc) return null;

  const handleClose = () => onClose();

  const fileUrl = doc.file_url || `/docs/${doc.name?.replace(/\s+/g, "_")}.pdf`;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-overlay p-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-lg transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative overflow-hidden rounded-2xl bg-card">
          <div className="relative border-b border-default px-6 pb-4 pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-md border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                  <FileText
                    className="h-6 w-6 text-blue-600"
                    strokeWidth={2.5}
                  />
                </div>

                <div className="space-y-1">
                  <h5 className="text-xl font-bold tracking-tight text-gray-900">
                    Document Preview
                  </h5>
                  <div className="flex items-center gap-2">
                    <span className="text-p2 font-medium text-slate-600">
                      {doc.name}
                    </span>

                    <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium text-blue-700">
                      <FileText className="mr-1 h-4 w-4" strokeWidth={1.5} />
                      {doc.type}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleClose}
                aria-label="Close dialog"
                className="group flex h-9 w-9 items-center justify-center rounded-md text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4 px-6 py-6 ">
            <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-accent bg-blue-200 px-6 py-5">
              <Image
                src={filePng}
                alt="file icon"
                className="h-20 w-20 opacity-80"
              />

              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Document Preview
                </h3>
                <p className="mt-1 text-p2 text-text-secondary">
                  Click to Close or download this document.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-default px-6 py-5">
            <button
              onClick={handleClose}
              className="rounded-md border bg-card px-5 py-2.5 text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const link = document.createElement("a");
                link.href = fileUrl;
                link.download = fileUrl.split("/").pop() || "document.pdf";
                link.click();
              }}
              className="rounded-md bg-blue-600 px-5 py-2.5 text-white"
            >
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
