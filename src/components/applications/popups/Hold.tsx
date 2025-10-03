"use client";

import React from 'react';

interface HoldPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  applicationId?: string;
}

export default function HoldPopup({ isOpen, onClose, onConfirm }: HoldPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg border border-default bg-card p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-semibold text-text-primary">
          Hold Application
        </h2>
        <p className="mb-6 text-sm text-text-secondary">
          Are you sure you want to put this application on hold?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-default px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-default/50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Confirm Hold
          </button>
        </div>
      </div>
    </div>
  );
}