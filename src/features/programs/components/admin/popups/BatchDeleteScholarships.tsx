"use client";

import React, { useState, useEffect } from "react";
import { XCircle, GraduationCap, Trash2, AlertCircle } from "lucide-react";

import { useDeleteScholarships, useGetProgramScholarships } from "features/programs/hooks";

import ModalHeader from "components/ui/modal/ModalHeader";
import Button from "components/ui/buttons/Button";
import Loading from "components/loading/Loading";
import RichTextDisplay from "components/ui/RichTextDisplay";

import { useToast } from "components/context/ToastContext";
import { parseApiError } from "utils/parseApiError";

interface BatchDeleteScholarshipsProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProgramIds: string[];
  onSuccess?: () => void;
}

export default function BatchDeleteScholarships({
  isOpen,
  onClose,
  selectedProgramIds,
  onSuccess,
}: BatchDeleteScholarshipsProps) {
  const { deleteScholarships, loading: deleting } = useDeleteScholarships();
  const { scholarships, loading: fetching, error: fetchError, fetchScholarships } =
    useGetProgramScholarships();
  const { showToast } = useToast();

  const [isVisible, setIsVisible] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setSelected(new Set());
      fetchScholarships(selectedProgramIds);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const toggleOne = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === scholarships.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(scholarships.map((s) => s.name)));
    }
  };

  const handleDelete = async () => {
    if (selected.size === 0) return;

    try {
      await deleteScholarships({
        program_ids: selectedProgramIds,
        scholarship_names: Array.from(selected),
      });

      showToast("Scholarships deleted successfully.", "success");

      setTimeout(() => {
        onClose();
        onSuccess?.();
      }, 1500);
    } catch (error: unknown) {
      const backendMessage = parseApiError(error, "Please try again.");
      showToast(`Delete failed. ${backendMessage}`, "error");
    }
  };

  if (!isVisible) return null;

  const allSelected = scholarships.length > 0 && selected.size === scholarships.length;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-overlay p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full max-w-md transform transition-all duration-300 ${
          isOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-4 scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
          <ModalHeader
            title="Delete Scholarships"
            description={`Select scholarships to remove from ${selectedProgramIds.length} selected program${selectedProgramIds.length !== 1 ? "s" : ""}.`}
            icon={GraduationCap}
            iconBg="bg-red-50"
            iconColor="text-red-600"
            iconBorder="border-red-200"
            titleColor="text-gray-900"
            onClose={onClose}
          />

          <div className="px-6 py-5">
            {fetching && <Loading text="Fetching scholarships..." />}

            {!fetching && fetchError && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {fetchError}
              </div>
            )}

            {!fetching && !fetchError && scholarships.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                  <GraduationCap className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600">No scholarships found</p>
                <p className="text-xs text-slate-400">The selected programs have no scholarships attached.</p>
              </div>
            )}

            {!fetching && scholarships.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {scholarships.length} scholarship{scholarships.length !== 1 ? "s" : ""} found
                  </span>
                  <button
                    type="button"
                    onClick={toggleAll}
                    className="text-xs font-medium text-red-600 hover:text-red-700"
                  >
                    {allSelected ? "Deselect all" : "Select all"}
                  </button>
                </div>

                <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                  {scholarships.map((s) => {
                    const isChecked = selected.has(s.name);
                    return (
                      <label
                        key={s.name}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all ${
                          isChecked
                            ? "border-red-200 bg-red-50"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleOne(s.name)}
                          className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-red-600 focus:ring-red-500"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`truncate text-sm font-semibold ${isChecked ? "text-red-800" : "text-slate-800"}`}>
                              {s.name}
                            </p>
                            {s.coverage_percent > 0 && (
                              <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                                isChecked ? "bg-red-100 text-red-700" : "bg-blue-50 text-blue-700"
                              }`}>
                                {s.coverage_percent}%
                              </span>
                            )}
                          </div>
                          {s.description && (
                            <RichTextDisplay html={s.description} className="mt-0.5 line-clamp-2 text-xs text-slate-500" />
                          )}
                          {s.max_amount > 0 && (
                            <p className={`mt-1 text-xs font-medium ${isChecked ? "text-red-600" : "text-slate-400"}`}>
                              Up to {s.currency} {s.max_amount.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <Button
              onClick={onClose}
              disabled={deleting}
              icon={<XCircle className="h-5 w-5" />}
              text="Cancel"
              bgColor="bg-slate-50"
              textColor="text-slate-700"
              borderColor="border-slate-600"
              hoverTextColor="hover:text-slate-800"
              hoverBorderColor="hover:border-slate-700"
            />
            <Button
              onClick={handleDelete}
              disabled={selected.size === 0 || deleting || fetching}
              icon={<Trash2 className="h-5 w-5" />}
              text={
                deleting
                  ? "Deleting..."
                  : selected.size > 0
                  ? `Delete ${selected.size} Scholarship${selected.size !== 1 ? "s" : ""}`
                  : "Delete Scholarships"
              }
              bgColor="bg-red-50"
              textColor="text-red-700"
              borderColor="border-red-600"
              hoverTextColor="hover:text-red-800"
              hoverBorderColor="hover:border-red-700"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
