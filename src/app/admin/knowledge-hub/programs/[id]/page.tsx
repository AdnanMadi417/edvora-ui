"use client";

import { useParams } from "next/navigation";
import ProgramDetails from "../../../../../components/admin/KnowledgeHub/program/details/ProgramDetails";

export default function KnowledgeHubDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  return <ProgramDetails id={id} />;
}
