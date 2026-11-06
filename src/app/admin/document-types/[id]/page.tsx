"use client";
import { useParams } from "next/navigation";
import DocumentTypeDetails from "features/universities/document-types/components/admin/DocumentTypeDetails";
export default function DocumentTypePage() {
  const params = useParams();
  const id = params?.id as string;
  return id ? <DocumentTypeDetails id={id} /> : null;
}
