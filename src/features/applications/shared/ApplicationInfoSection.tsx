import React from "react";
import { MdAssignmentTurnedIn } from "react-icons/md";
import { AppDate } from "components/ui/date";
import { SectionIconBadge } from "components/ui/icons";
import { courseTypeLabel } from "features/programs/utils/courseType";

interface ApplicationInfoSectionProps {
  application: any;
}

export default function ApplicationInfoSection({ application }: ApplicationInfoSectionProps) {
  const program = application.program || {};
  const university = program.university || {};
  const partner = application.partner || {};
  const stage = application.stage || {};
  const currentStatus = stage.statuses?.[0] || {};

  return (
    <div className="p-6 border-b border-slate-200">
      <h3 className="text-p3 mb-6 flex items-center gap-3 font-semibold text-slate-900">
        <SectionIconBadge icon={MdAssignmentTurnedIn} color="blue" />
        Application Information
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div>
          <span className="block text-p1 font-medium text-slate-900">Program</span>
          <span className="text-p2 text-slate-500">{program.name || "Not provided"}</span>
        </div>
        <div>
          <span className="block text-p1 font-medium text-slate-900">University</span>
          <span className="text-p2 text-slate-500">{university.name || "Not provided"}</span>
        </div>
        <div>
          <span className="block text-p1 font-medium text-slate-900">Country of University</span>
          <span className="text-p2 text-slate-500">{university.country || "Not provided"}</span>
        </div>
        <div>
          <span className="block text-p1 font-medium text-slate-900">Qualification</span>
          <span className="text-p2 text-slate-500 capitalize">{program.qualification_level || "Not provided"}</span>
        </div>
        {program.course_type && (
          <div>
            <span className="block text-p1 font-medium text-slate-900">Course Type</span>
            <span className="text-p2 text-slate-500">{courseTypeLabel(program.course_type)}</span>
          </div>
        )}
        <div>
          <span className="block text-p1 font-medium text-slate-900">Partner</span>
          <span className="text-p2 text-slate-500">{partner.name || "Not provided"}</span>
        </div>
        <div>
          <span className="block text-p1 font-medium text-slate-900">Stage</span>
          <span className="text-p2 text-slate-500">{stage.name || "Not provided"}</span>
        </div>
        <div>
          <span className="block text-p1 font-medium text-slate-900">Status</span>
          <span className="text-p2 text-slate-500">{currentStatus.name || "Not provided"}</span>
        </div>
        <div>
          <span className="block text-p1 font-medium text-slate-900">Intake Date</span>
          <span className="text-p2 text-slate-500">
            <AppDate value={application.intake_date} format="month" fallback="Not provided" />
          </span>
        </div>
        <div>
          <span className="block text-p1 font-medium text-slate-900">Tuition Fee</span>
          <span className="text-p1 text-green-700">
            RM {program.tuition_fee?.toLocaleString() || "Not provided"}
          </span>
        </div>
      </div>
    </div>
  );
}
