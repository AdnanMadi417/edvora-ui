"use client";
import { createContext, useContext, type ReactNode } from "react";
import { useSession } from "components/context/SessionContext";
import Loading from "components/ub/feedback/states/Loading";
import EmptyData from "components/ub/feedback/states/EmptyData";
import Button from "components/ub/core/buttons/Button";
import { useCentreWorkspace } from "../hooks/useCentreWorkspace";
import { assignedCentre } from "../services/centreWorkspace";
import type { CentreActor, ManagedCentre } from "../model/types";
const Context = createContext<{
  actor: CentreActor;
  centre: ManagedCentre;
} | null>(null);
export const useAssignedCentre = () => {
  const value = useContext(Context);
  if (!value) throw new Error("Centre access is required.");
  return value;
};
export default function CentreAccessBoundary({
  children,
}: {
  children: ReactNode;
}) {
  const session = useSession();
  const { workspace, error, loading, reload } = useCentreWorkspace();
  if (loading || session?.status === "loading")
    return <Loading text="Loading your centre…" />;
  if (error)
    return (
      <EmptyData
        title="Unable to load your centre"
        subtitle={error}
        action={<Button text="Try again" onClick={reload} />}
      />
    );
  let centre: ManagedCentre;
  try {
    centre = assignedCentre(session?.user, workspace!);
  } catch (failure) {
    return (
      <EmptyData
        title="Centre access unavailable"
        subtitle={
          failure instanceof Error
            ? failure.message
            : "Contact a Unibexs Admin."
        }
      />
    );
  }
  return (
    <Context.Provider
      key={`${session!.user!.id}:${centre.id}`}
      value={{ actor: session!.user!, centre }}
    >
      {children}
    </Context.Provider>
  );
}
