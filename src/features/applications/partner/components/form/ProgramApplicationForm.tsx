"use client";

import { useSearchParams } from "next/navigation";
import Loading from "components/ub/feedback/states/Loading";
import ApplicationFormView from "features/applications/form/ApplicationFormView";
import { useApplicationForm } from "features/applications/form/useApplicationForm";

/** /partner/applications/apply-for-program: programme, Institution and intake preset from the Knowledge Hub link. */
export default function ProgramApplicationForm() {
  const params = useSearchParams();
  const form = useApplicationForm({
    program_id: params.get("program_id") ?? "",
    university_id: params.get("university_id") ?? "",
    intake_date: params.get("intake_date") ?? "",
  });
  if (form.universitiesLoading) return <Loading text="Loading the application form…" />;
  return (
    <div className="mt-5">
      <ApplicationFormView {...form} mode="programme" />
      {form.leaveDialog}
    </div>
  );
}
