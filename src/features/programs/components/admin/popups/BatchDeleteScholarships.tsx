"use client";

import React, { useState, useEffect } from "react";
import { XCircle, GraduationCap, Trash2, AlertCircle } from "lucide-react";

import { useDeleteScholarships, useGetProgramScholarships } from "features/programs/hooks";

import ModalHeader from "components/ub/feedback/dialogs/ModalHeader";
import Button from "components/ub/core/buttons/Button";
import Loading from "components/ub/feedback/states/Loading";
import RichTextDisplay from "components/ub/data/display/RichTextDisplay";

import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { parseApiError } from "utils/parseApiError";
import Checkbox from "components/ub/forms/choices/Checkbox";

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
        <div className="overflow-hidden rounded-ub-xl border border-ub-border-overlay bg-ub-modal shadow-ub-xl">
          <ModalHeader
            title="Delete scholarships"
            description={`Select scholarships to remove from ${selectedProgramIds.length} selected program${selectedProgramIds.length !== 1 ? "s" : ""}.`}
            icon={GraduationCap}
            iconBg="bg-ub-tone-danger-bg"
            iconColor="text-ub-tone-danger-text"
            iconBorder="border-ub-tone-danger-border"
            titleColor="text-ub-text-primary"
            onClose={onClose}
          />

          <div className="px-6 py-5">
            {fetching && <Loading text="Fetching scholarships..." />}

            {!fetching && fetchError && (
              <div className="flex items-center gap-2 rounded-lg border border-ub-tone-danger-border bg-ub-tone-danger-bg px-4 py-3 text-sm text-ub-tone-danger-text">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {fetchError}
              </div>
            )}

            {!fetching && !fetchError && scholarships.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ub-surface-subtle">
                  <GraduationCap className="h-6 w-6 text-ub-text-tertiary" />
                </div>
                <p className="text-sm font-medium text-ub-text-secondary">No scholarships found</p>
                <p className="text-xs text-ub-text-tertiary">The selected programs have no scholarships attached.</p>
              </div>
            )}

            {!fetching && scholarships.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-ub-text-tertiary">
                    {scholarships.length} scholarship{scholarships.length !== 1 ? "s" : ""} found
                  </span>
                  <button
                    type="button"
                    onClick={toggleAll}
                    className="text-xs font-medium text-ub-tone-danger-text hover:text-ub-tone-danger-text"
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
                            ? "border-ub-tone-danger-border bg-ub-tone-danger-bg"
                            : "border-ub-border bg-ub-surface hover:border-ub-border hover:bg-ub-surface-subtle"
                        }`}
                      >
                        <Checkbox checked={isChecked} onChange={() => toggleOne(s.name)} className="-mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`truncate text-sm font-semibold ${isChecked ? "text-ub-tone-danger-text" : "text-ub-text-primary"}`}>
                              {s.name}
                            </p>
                            {s.coverage_percent > 0 && (
                              <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                                isChecked ? "bg-ub-tone-danger-bg text-ub-tone-danger-text" : "bg-ub-tone-brand-bg text-ub-text-link"
                              }`}>
                                {s.coverage_percent}%
                              </span>
                            )}
                          </div>
                          {s.description && (
                            <RichTextDisplay html={s.description} className="mt-0.5 line-clamp-2 text-xs text-ub-text-secondary" />
                          )}
                          {s.max_amount > 0 && (
                            <p className={`mt-1 text-xs font-medium ${isChecked ? "text-ub-tone-danger-text" : "text-ub-text-tertiary"}`}>
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

          <div className="flex justify-end gap-3 border-t border-ub-border px-6 py-4">
            <Button
              onClick={onClose}
              disabled={deleting}
              icon={<XCircle className="h-5 w-5" />}
              text="Cancel"
              variant="secondary"
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
              variant="destructive"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
