import React from "react";
import {
  Building2,
  School,
  GraduationCap,
  Calendar,
  User,
  Users,
  Globe,
  BadgeCheck,
  Mail,
  Phone,
  MapPin,
  File,
  CheckCircle,
  XCircle,
  FileText
} from "lucide-react";

interface Props {
  formData: any;
  universities: any[];
  documentTypes: any[];
}

export default function StageReview({
                                       formData,
                                       universities,
                                       documentTypes,
                                     }: Props) {
  return (
    <div className="space-y-5">
      <div className="border-b border-slate-200 pb-4">
        <h4 className="text-xl font-semibold text-slate-900">
          Review Your Application
        </h4>
        <p className="text-sm text-slate-500">
          Please verify all information before submitting.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition">
        <div className="flex items-center gap-2 border-b border-slate-100 bg-blue-50 px-5 py-4">
          <Building2 className="h-4 w-4 text-blue-600" />
          <h5 className="text-sm font-semibold text-slate-800 md:text-base">
            Application Info
          </h5>
        </div>
        <div className="grid gap-3 p-5 text-sm md:grid-cols-2">
          <div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <School className="h-3.5 w-3.5" />
              University
            </div>
            <p className="mt-1 font-medium text-slate-900">
              {universities.find((u) => u.id === formData.university_id)
                ?.name || "-"}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <GraduationCap className="h-3.5 w-3.5" />
              Program
            </div>
            <p className="mt-1 font-medium text-slate-900">
              {universities
                .find((u) => u.id === formData.university_id)
                ?.programs?.find((p) => p.id === formData.program_id)
                ?.name || "-"}
            </p>
          </div>

          {formData.intake_date && (
            <div>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Calendar className="h-3.5 w-3.5" />
                Intake Date
              </div>
              <p className="mt-1 font-medium text-slate-900">
                {formData.intake_date}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition">
        <div className="flex items-center gap-2 border-b border-slate-100 bg-blue-50 px-5 py-4">
          <User className="h-4 w-4 text-blue-600" />
          <h5 className="text-sm font-semibold text-slate-800 md:text-base">
            Student Basic Information
          </h5>
        </div>
        <div className="grid gap-4 p-5 text-sm md:grid-cols-2">
          <div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <User className="h-3.5 w-3.5" />
              Full Name
            </div>
            <p className="mt-1 font-medium text-slate-900">
              {formData.student.name || "-"}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Calendar className="h-3.5 w-3.5" />
              Date of Birth
            </div>
            <p className="mt-1 font-medium text-slate-900">
              {formData.student.birthday || "-"}
            </p>
          </div>

          {formData.student.gender !== null && (
            <div>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Users className="h-3.5 w-3.5" />
                Gender
              </div>
              <p className="mt-1 font-medium text-slate-900">
                {formData.student.gender ? "Male" : "Female"}
              </p>
            </div>
          )}

          <div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Globe className="h-3.5 w-3.5" />
              Nationality
            </div>
            <p className="mt-1 font-medium text-slate-900">
              {formData.student.nationality || "-"}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <BadgeCheck className="h-3.5 w-3.5" />
              Passport
            </div>
            <p className="mt-1 font-medium text-slate-900">
              {formData.student.passport_number || "-"}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Mail className="h-3.5 w-3.5" />
              Email
            </div>
            <p className="mt-1 font-medium text-slate-900">
              {formData.student.email || "-"}
            </p>
          </div>

          {formData.student.phone && (
            <div>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Phone className="h-3.5 w-3.5" />
                Phone
              </div>
              <p className="mt-1 font-medium text-slate-900">
                {formData.student.phone}
              </p>
            </div>
          )}

          {formData.student.current_address && (
            <div>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <MapPin className="h-3.5 w-3.5" />
                Address
              </div>
              <p className="mt-1 font-medium text-slate-900">
                {formData.student.current_address}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition">
        <div className="flex items-center gap-2 border-b border-slate-100 bg-blue-50 px-5 py-4">
          <FileText className="h-4 w-4 text-blue-600" />
          <h5 className="text-sm font-semibold text-slate-800 md:text-base">
            Documents
          </h5>
        </div>

        <div className="grid gap-4 p-5 text-sm grid-cols-1">
          {documentTypes.map((docType) => {

            const uploadedDoc = formData.documents?.find(
              (doc) => doc.document_type_id === docType.id
            );

            return (
              <div
                key={docType.id}
                className="flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <File className="h-3.5 w-3.5" />
                  {docType.description}
                </div>
                <div className="mt-1">

                  {uploadedDoc ? (
                    <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-4 w-4" /> Uploaded
                          </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-500">
                            <XCircle className="h-4 w-4" /> Missing
                          </span>
                  )}

                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}