"use client";

import ProgramDetails from "features/programs/components/shared/details/ProgramDetails";

export default function AdminProgramDetails({ id }: { id: string }) {
  return (
    <ProgramDetails
      id={id}
      basePath="/admin"
      showApplyAction={false}
      editPath={`/admin/knowledge-hub/${id}/edit`}
    />
  );
}
