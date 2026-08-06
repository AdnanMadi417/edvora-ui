"use client";

import { useParams } from "next/navigation";
import KnowledgeHubEditDetails from "features/programs/components/admin/form/ProgramEditForm";

export default function KnowledgeHubEditDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  return <KnowledgeHubEditDetails id={id} />;
}
