"use client";

import { useParams } from "next/navigation";
import KnowledgeHubEditDetails from "../../../../../../components/admin/KnowledgeHub/program/Form/ProgramEditForm";

export default function KnowledgeHubEditDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  return <KnowledgeHubEditDetails id={id} />;
}
