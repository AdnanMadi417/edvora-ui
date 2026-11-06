"use client";
import { useParams } from "next/navigation";
import UniversityConfigDetails from "features/universities/configuration/components/admin/details/UniversityConfigDetails";
export default function UniversityTypeDetailsPage() { const { id } = useParams(); return typeof id === "string" ? <UniversityConfigDetails id={id} basePath="/data-entry/university-configuration" /> : null; }
