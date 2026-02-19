"use client";

import { useParams } from "next/navigation";
import KnowledgeHubDetails from "../../../../../components/admin/KnowledgeHub/program/details/KnowledgeHubDetails";

export default function KnowledgeHubDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  return <KnowledgeHubDetails id={id} />;
}
