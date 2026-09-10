import { useCallback, useEffect, useState } from "react";
import { programApi } from "../services";
import { universityApi } from "features/universities/services";
import type { Program } from "../types";
import {
  resolveCopyTargets,
  copyEmptyReasonLabel,
  type CopyEmptyReason,
} from "features/programs/utils/copyEligibility";

interface BranchLike {
  id: string;
  name: string;
}
interface UniversityData {
  branches: BranchLike[];
  programs: Program[];
}

export interface CopyEligibility {
  disabled: boolean;
  reason?: CopyEmptyReason;
  /** Ready-to-use tooltip text. */
  title: string;
}

/**
 * For a page of programs, resolves per-row "can this be copied to another
 * branch" so the table can disable the copy action for programs that are
 * already in every branch (or whose university has only one branch).
 *
 * Cost: one branch-list + one program-list request per DISTINCT university
 * shown on the page (deduped, run in parallel, re-fetched only when the
 * set of universities changes). Cheap when the list is filtered to one
 * university (the common data-entry workflow); a handful of requests
 * otherwise. Until a university's data has loaded, its rows are treated as
 * copyable — the modal is the backstop.
 */
export function useProgramsCopyEligibility(programs: Program[]) {
  const universityIds = Array.from(
    new Set(programs.map((p) => p.university?.id).filter((v): v is string => !!v))
  ).sort();
  const key = universityIds.join(",");

  const [byUniversity, setByUniversity] = useState<Record<string, UniversityData>>({});

  useEffect(() => {
    if (universityIds.length === 0) return;
    let cancelled = false;
    Promise.all(
      universityIds.map(async (uid) => {
        const [branches, uniPrograms] = await Promise.all([
          universityApi.branches
            .list(uid)
            .then((r) => (r.data ?? []) as BranchLike[])
            .catch(() => [] as BranchLike[]),
          programApi.programs
            .list({ university_id: uid, page_size: 100 })
            .then((r) => (r.data?.items ?? r.data ?? []) as Program[])
            .catch(() => [] as Program[]),
        ]);
        return [uid, { branches, programs: uniPrograms }] as const;
      })
    ).then((entries) => {
      if (!cancelled) setByUniversity(Object.fromEntries(entries));
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return useCallback(
    (program: Program): CopyEligibility => {
      const data = byUniversity[program.university?.id ?? ""];
      if (!data) return { disabled: false, title: "Copy to another branch" };
      const { emptyReason } = resolveCopyTargets({
        program,
        branches: data.branches,
        universityPrograms: data.programs,
      });
      if (!emptyReason) return { disabled: false, title: "Copy to another branch" };
      return { disabled: true, reason: emptyReason, title: copyEmptyReasonLabel(emptyReason) };
    },
    [byUniversity]
  );
}
