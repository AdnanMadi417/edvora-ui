import { useEffect, useMemo, useState } from "react";
import { useBranches } from "features/universities/hooks";
import { programApi } from "../../services";
import type { Program } from "../../types";
import {
  resolveCopyTargets,
  type CopyTargetBranchOption,
  type CopyEmptyReason,
} from "features/programs/utils/copyEligibility";

export type { CopyTargetBranchOption } from "features/programs/utils/copyEligibility";

export interface CopyTargetBranches {
  options: CopyTargetBranchOption[];
  /** null while loading or when at least one branch is selectable;
   *  otherwise why nothing can be picked. */
  emptyReason: CopyEmptyReason | null;
  loading: boolean;
}

/**
 * Resolves the branches a program can be copied into. Fetches the
 * university's branch list and program list once `universityId` is known,
 * then applies the shared `resolveCopyTargets` rule. Used by the copy
 * modal and by the program detail pages (to disable the copy action when
 * there's nowhere to copy).
 *
 * `enabled` (default true) gates both fetches — pass `false` when the copy
 * action isn't even rendered for the current viewer (e.g. the partner view
 * of program details), so partners don't pay for a branch list + up to 100
 * programs on every page view for a button they can't see.
 */
export function useCopyTargetBranches(params: {
  programId: string;
  programName: string;
  qualificationId: string;
  universityId: string;
  currentBranchId?: string;
  enabled?: boolean;
}): CopyTargetBranches {
  const { programId, programName, qualificationId, universityId, currentBranchId, enabled = true } = params;

  const { branches, branchesLoading } = useBranches(enabled ? universityId : undefined);

  const [universityPrograms, setUniversityPrograms] = useState<Program[]>([]);
  const [universityProgramsLoading, setUniversityProgramsLoading] = useState(false);

  useEffect(() => {
    if (!enabled || !universityId) {
      setUniversityPrograms([]);
      return;
    }
    let cancelled = false;
    setUniversityProgramsLoading(true);
    programApi.programs
      .list({ university_id: universityId, page_size: 100 })
      .then((res) => {
        if (!cancelled) setUniversityPrograms(res.data?.items ?? res.data ?? []);
      })
      .catch(() => {
        if (!cancelled) setUniversityPrograms([]);
      })
      .finally(() => {
        if (!cancelled) setUniversityProgramsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, universityId]);

  const loading = branchesLoading || universityProgramsLoading;

  const { options, emptyReason } = useMemo(() => {
    if (loading) return { options: [] as CopyTargetBranchOption[], emptyReason: null };
    return resolveCopyTargets({
      program: {
        id: programId,
        name: programName,
        qualification_id: qualificationId,
        branch: currentBranchId ? { id: currentBranchId } : null,
      },
      branches,
      universityPrograms,
    });
  }, [loading, programId, programName, qualificationId, currentBranchId, branches, universityPrograms]);

  return { options, emptyReason, loading };
}
