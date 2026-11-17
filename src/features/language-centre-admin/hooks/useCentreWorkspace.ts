"use client";
import { useCallback, useEffect, useState } from "react";
import type { CentreWorkspace } from "../model/types";
import { readWorkspace, WORKSPACE_EVENT } from "../services/centreWorkspace";
export function useCentreWorkspace() {
  const [workspace, setWorkspace] = useState<CentreWorkspace | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(() => {
    try {
      setWorkspace(readWorkspace());
      setError(null);
    } catch {
      setError(
        "Unable to read the centre workspace. Check browser storage and try again."
      );
    }
  }, []);
  useEffect(() => {
    reload();
    window.addEventListener(WORKSPACE_EVENT, reload);
    window.addEventListener("storage", reload);
    return () => {
      window.removeEventListener(WORKSPACE_EVENT, reload);
      window.removeEventListener("storage", reload);
    };
  }, [reload]);
  return { workspace, error, reload, loading: !workspace && !error };
}
