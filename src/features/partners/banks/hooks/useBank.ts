import { useMemo } from "react";
import { useBanks } from "./useBanks";

// No GET /banks/{id} endpoint exists in this API — fetch the full list
// (including inactive, so a retired bank's view/edit page still resolves)
// and find the matching record client-side.
export function useBank(id: string) {
  const { banks, loading, error, refetch } = useBanks({
    include_inactive: true,
  });
  const bank = useMemo(
    () => banks.find((b) => b.id === id) ?? null,
    [banks, id]
  );
  return { bank, loading, error, refetch };
}
