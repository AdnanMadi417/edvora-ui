"use client";

import React, { useState, useEffect } from "react";
import { XCircle, CopyPlus, AlertTriangle } from "lucide-react";

import { useCopyProgramToBranch, useCopyTargetBranches } from "features/programs/hooks";

import ModalHeader from "components/ub/feedback/dialogs/ModalHeader";
import Button from "components/ub/core/buttons/Button";
import SelectField from "components/ub/forms/selection/SelectField";

import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { getApiErrorCode, parseApiError } from "utils/parseApiError";

interface CopyProgramToBranchProps {
  isOpen: boolean;
  onClose: () => void;
  programId: string;
  programName: string;
  /** program.qualification_id — with `name`, the backend's uniqueness key. */
  qualificationId: string;
  /** program.university.id — its branches are the only valid targets. */
  universityId: string;
  /** program.branch?.id — excluded from the target list. */
  currentBranchId?: string;
  /** Called with the 201 body ({ program, ... }) so the parent can
   *  navigate to the new program's detail page. */
  onCopied: (created: any) => void;
}

/** Backend error codes → in-modal copy; anything else falls back to the API message. */
const COPY_ERROR_MESSAGES: Record<string, string> = {
  program_already_exists_in_branch:
    "That branch already has a program with this name and qualification.",
  // Defensive — the target list is same-university and excludes the current branch,
  // so these two shouldn't be reachable through the UI.
  branch_university_mismatch: "That branch belongs to a different university.",
  same_branch_copy_not_allowed:
    "Pick a branch other than the program's current one.",
};

/**
 * "Copy to another branch" (knowledge hub). Deep-copies a program into a
 * different branch of the same university via
 * POST /knowledge-hub/programs/{id}/copy, then hands the 201 body back to
 * the parent to navigate to the new program.
 *
 * Target branches come from `useCopyTargetBranches` (shared with the detail
 * pages): the university's branches minus the current one, with any branch
 * that already has an equivalent program shown but not selectable. When
 * nothing can be picked, an explanatory notice replaces the dropdown. The
 * 409 handler stays as a backstop for races and name-normalisation edges.
 */
export default function CopyProgramToBranch({
  isOpen,
  onClose,
  programId,
  programName,
  qualificationId,
  universityId,
  currentBranchId,
  onCopied,
}: CopyProgramToBranchProps) {
  const { copyProgramToBranch, loading } = useCopyProgramToBranch();
  const { showToast } = useToast();
  const { options, emptyReason, loading: targetsLoading } = useCopyTargetBranches({
    programId,
    programName,
    qualificationId,
    universityId,
    currentBranchId,
  });

  const [isVisible, setIsVisible] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  // `loading` (from the hook) goes back to false as soon as the request
  // settles — this covers the gap between that and onClose actually firing,
  // so a second click during the success delay can't fire a second POST.
  const [justSucceeded, setJustSucceeded] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setSelectedBranchId("");
      setFormError(null);
      setJustSucceeded(false);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const selectedIsTaken = !!options.find((o) => o.value === selectedBranchId)?.disabled;
  const isFormValid =
    selectedBranchId !== "" && !selectedIsTaken && !loading && !justSucceeded && !emptyReason;

  const handleSubmit = async () => {
    setFormError(null);
    const branchName =
      options.find((o) => o.value === selectedBranchId)?.label ?? "the selected branch";
    try {
      const created = await copyProgramToBranch(programId, selectedBranchId);
      setJustSucceeded(true);
      showToast(`"${programName}" copied to ${branchName}.`, "success");
      setTimeout(() => {
        onClose();
        onCopied(created);
      }, 1500);
    } catch (err: unknown) {
      const code = getApiErrorCode(err);
      setFormError(
        (code && COPY_ERROR_MESSAGES[code]) ??
          parseApiError(err, "Failed to copy program. Please try again.")
      );
    }
  };

  if (!isVisible) return null;

  const formData = { branch_id: selectedBranchId };
  const errors = {};

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-overlay p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full max-w-lg transform transition-all duration-300 md:max-w-xl ${
          isOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-hidden rounded-ub-xl border border-ub-border-overlay bg-ub-modal shadow-ub-xl">
          <ModalHeader
            title="Copy to another branch"
            description={`Duplicate "${programName}" — with its fees, scholarships and commission — into another branch of the same university.`}
            icon={CopyPlus}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            iconBorder="border-blue-200"
            titleColor="text-gray-900"
            onClose={onClose}
          />

          <div className="space-y-4 px-6 py-6">
            {emptyReason ? (
              <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div className="text-sm text-amber-800">
                  {emptyReason === "single" ? (
                    <>
                      <p className="font-medium">No other branch to copy into.</p>
                      <p className="mt-1">
                        This university has no branch other than the program&apos;s current one.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium">Already in every branch.</p>
                      <p className="mt-1">
                        This program already exists in every other branch of this university.
                      </p>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <SelectField
                label="Target branch"
                field="branch_id"
                required
                options={options}
                formData={formData}
                errors={errors}
                updateFormData={(_field: string, value: string) => {
                  setSelectedBranchId(value);
                  setFormError(null);
                }}
                disabled={targetsLoading}
              />
            )}

            {formError && (
              <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                <p className="text-sm text-red-700">{formError}</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <Button
              onClick={onClose}
              icon={<XCircle className="h-5 w-5" />}
              text="Cancel"
              bgColor="bg-slate-50"
              textColor="text-slate-700"
              borderColor="border-slate-600"
              hoverTextColor="hover:text-slate-800"
              hoverBorderColor="hover:border-slate-700"
            />

            <Button
              onClick={handleSubmit}
              disabled={!isFormValid}
              icon={<CopyPlus className="h-5 w-5" />}
              text={loading ? "Copying..." : justSucceeded ? "Copied" : "Copy program"}
              bgColor="bg-blue-50"
              textColor="text-blue-700"
              borderColor="border-blue-600"
              hoverTextColor="hover:text-blue-800"
              hoverBorderColor="hover:border-blue-700"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
