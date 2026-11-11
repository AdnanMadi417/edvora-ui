"use client";

import Breadcrumbs from "components/ub/navigation/links/Breadcrumbs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CopyPlus,
  Eye,
  EyeOff,
  Pencil,
  Send,
  Trash2,
} from "lucide-react";
import {
  useProgram,
  useCopyTargetBranches,
  useDeletePrograms,
  useSetProgramHidden,
} from "features/programs/hooks";
import {
  nextIntakeMonth,
  resolveIntakeDate,
} from "features/programs/utils/intakeMonths";
import { parseApiError } from "utils/parseApiError";
import Button from "components/ub/core/buttons/Button";
import Loading from "components/ub/feedback/states/Loading";
import EmptyData from "components/ub/feedback/states/EmptyData";
import { buttonBase, buttonSizes, buttonVariants } from "components/ub/recipes";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import CatalogueQuotaNotice from "../CatalogueQuotaNotice";
import CopyProgramToBranch from "../../admin/popups/CopyProgramToBranch";
import DeleteProgramsConfirmation from "../../admin/popups/DeleteProgramsConfirmation";
import ProgramDetailsView from "./ProgramDetailsView";

interface ProgramDetailsProps {
  id: string;
  basePath?: string;
  showApplyAction?: boolean;
  /** Enables management actions for admin and data-entry views. */
  editPath?: string;
}

export default function ProgramDetails({
  id,
  basePath = "/partner",
  showApplyAction = true,
  editPath,
}: ProgramDetailsProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const {
    program,
    requiredDocuments,
    commission,
    exchangeRates,
    loading,
    error,
    quota,
  } = useProgram(id);
  const [isCopyOpen, setIsCopyOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hiddenOverride, setHiddenOverride] = useState<boolean | null>(null);
  const { deletePrograms } = useDeletePrograms();
  const { setProgramHidden, loading: isTogglingHidden } = useSetProgramHidden();
  const isHidden = hiddenOverride ?? program?.is_hidden ?? false;
  const copyTargets = useCopyTargetBranches({
    programId: program?.id ?? "",
    programName: program?.name ?? "",
    qualificationId: program?.qualification_id ?? "",
    universityId: program?.university?.id ?? "",
    currentBranchId: program?.branch?.id,
    enabled: !!editPath,
  });
  const copyDisabled = copyTargets.loading || copyTargets.emptyReason !== null;
  const copyDisabledReason =
    copyTargets.emptyReason === "single"
      ? "This university has only one branch"
      : copyTargets.emptyReason === "all-taken"
      ? "This program is already in every other branch"
      : undefined;
  const back = () => router.push(`${basePath}/knowledge-hub`);

  const toggleHidden = async () => {
    if (!program) return;
    try {
      await setProgramHidden(program.id, !isHidden);
      setHiddenOverride(!isHidden);
      showToast(
        isHidden ? "Program is visible again" : "Program hidden",
        "success"
      );
    } catch (err: unknown) {
      showToast(
        parseApiError(err, "Failed to update program visibility"),
        "error"
      );
    }
  };
  const deleteProgram = async () => {
    if (!program) return;
    setIsDeleting(true);
    try {
      await deletePrograms([program.id]);
      showToast("Deleted successfully", "success");
      setIsDeleteOpen(false);
      back();
    } catch (err: unknown) {
      showToast(parseApiError(err, "Delete failed"), "error");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <Loading text="Loading program details..." />;
  if (quota) return <CatalogueQuotaNotice quota={quota} />;
  if (error || !program)
    return (
      <EmptyData
        title="Program unavailable"
        subtitle={error || "This program could not be found."}
        action={<Button onClick={back} text="Back to programs" />}
      />
    );

  const month =
    program.next_intake_month ??
    nextIntakeMonth(program.intake_months) ??
    nextIntakeMonth(program.university.intake_months);
  return (
    <>
      <ProgramDetailsView
        breadcrumbs={<Breadcrumbs items={[{ label: "Programs", href: `${basePath}/knowledge-hub` }, { label: program.name }]} />}
        program={program}
        requiredDocuments={requiredDocuments}
        commission={commission}
        exchangeRates={exchangeRates}
        hidden={!!editPath && isHidden}
        onCopyError={() =>
          showToast("Couldn't copy the fee summary. Please try again.", "error")
        }
        managementActions={
          editPath ? (
            <>
              <Button
                size="sm"
                variant="secondary"
                text="Copy to branch"
                icon={<CopyPlus className="h-4 w-4" />}
                onClick={() => setIsCopyOpen(true)}
                disabled={copyDisabled}
                title={copyDisabledReason}
              />
              <Button
                size="sm"
                variant="secondary"
                text={isHidden ? "Unhide program" : "Hide program"}
                icon={
                  isHidden ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )
                }
                onClick={toggleHidden}
                loading={isTogglingHidden}
              />
              <Button
                size="sm"
                variant="tertiary"
                text="Delete program"
                icon={<Trash2 className="h-4 w-4" />}
                onClick={() => setIsDeleteOpen(true)}
              />
            </>
          ) : undefined
        }
        actions={
          <>
            {showApplyAction && (
              <Link
                href={{
                  pathname: "/partner/applications/apply-for-program",
                  query: {
                    program_id: program.id,
                    university_id: program.university.id,
                    intake_date: month ? resolveIntakeDate(month) : "",
                  },
                }}
                className={`${buttonBase} ${buttonSizes.md} ${buttonVariants.primary}`}
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                Apply now
              </Link>
            )}
            {editPath && (
              <Button
                variant="primary"
                text="Edit program"
                icon={<Pencil className="h-4 w-4" />}
                onClick={() => router.push(editPath)}
              />
            )}
          </>
        }
      />
      {editPath && isCopyOpen && (
        <CopyProgramToBranch
          isOpen={isCopyOpen}
          onClose={() => setIsCopyOpen(false)}
          programId={program.id}
          programName={program.name}
          qualificationId={program.qualification_id}
          universityId={program.university.id}
          currentBranchId={program.branch?.id}
          onCopied={(created) => {
            const newId = created?.program?.id ?? created?.id;
            setIsCopyOpen(false);
            if (newId) router.push(`${basePath}/knowledge-hub/${newId}`);
          }}
        />
      )}
      {editPath && (
        <DeleteProgramsConfirmation
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={deleteProgram}
          isDeleting={isDeleting}
          programNames={[program.name]}
        />
      )}
    </>
  );
}
