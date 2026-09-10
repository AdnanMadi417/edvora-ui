import type { Program } from "features/programs/types";

const norm = (s: string) => (s ?? "").trim().toLowerCase();

export interface CopyTargetBranchOption {
  value: string;
  label: string;
  /** True when that branch already holds an equivalent program. */
  disabled: boolean;
}

export type CopyEmptyReason = "single" | "all-taken";

export interface CopyTargetsResult {
  /** Every branch of the university except the program's current one.
   *  Ones that already have an equivalent program are `disabled`. */
  options: CopyTargetBranchOption[];
  /** null when at least one branch is selectable; otherwise why not. */
  emptyReason: CopyEmptyReason | null;
}

interface BranchLike {
  id: string;
  name: string;
}

/**
 * Pure rule for "where can this program be copied": the university's
 * branches minus the program's current one, with any branch that already
 * holds an equivalent program (same name + qualification — the backend's
 * uniqueness rule) flagged non-selectable. Shared by the copy modal, the
 * program detail pages, and the table row action so they can't drift.
 */
export function resolveCopyTargets(args: {
  program: Pick<Program, "id" | "name" | "qualification_id"> & {
    branch?: { id?: string } | null;
  };
  branches: BranchLike[];
  universityPrograms: Program[];
}): CopyTargetsResult {
  const { program, branches, universityPrograms } = args;
  const currentBranchId = program.branch?.id;

  const takenBranchIds = new Set<string>();
  for (const p of universityPrograms) {
    if (p.id === program.id) continue;
    if (
      norm(p.name) === norm(program.name) &&
      String(p.qualification_id) === String(program.qualification_id) &&
      p.branch?.id
    ) {
      takenBranchIds.add(p.branch.id);
    }
  }

  const otherBranches = branches.filter((b) => b.id !== currentBranchId);

  const options: CopyTargetBranchOption[] = otherBranches.map((b) => {
    const taken = takenBranchIds.has(b.id);
    return {
      value: b.id,
      label: taken ? `${b.name} — already added` : b.name,
      disabled: taken,
    };
  });

  const emptyReason: CopyEmptyReason | null =
    otherBranches.length === 0
      ? "single"
      : otherBranches.every((b) => takenBranchIds.has(b.id))
      ? "all-taken"
      : null;

  return { options, emptyReason };
}

export function copyEmptyReasonLabel(reason: CopyEmptyReason): string {
  return reason === "single"
    ? "This university has only one branch"
    : "This program is already in every other branch";
}
