"use client";

import { useParams } from "next/navigation";
import ProgramEditForm from "features/programs/components/admin/form/ProgramEditForm";

export default function DataEntryEditProgramPage() {
  const params = useParams();
  const programId = params?.id as string;

  if (!programId) return null;

  return (
    <ProgramEditForm
      id={programId}
      redirectPath="/data-entry/knowledge-hub"
      listPath="/data-entry/knowledge-hub"
      hideDelete
    />
  );
}
