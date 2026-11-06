"use client";
import { useParams } from "next/navigation";
import SetStaticTemplatePage from "features/universities/document-types/components/admin/SetStaticTemplatePage";
export default function EditDocumentTemplatePage() {
  const params = useParams();
  const id = params?.id as string;
  return id ? <SetStaticTemplatePage id={id} /> : null;
}
