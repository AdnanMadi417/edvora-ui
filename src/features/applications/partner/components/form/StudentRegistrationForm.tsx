"use client";

import Loading from "components/ub/feedback/Loading";
import ApplicationFormView from "features/applications/form/ApplicationFormView";
import { useApplicationForm } from "features/applications/form/useApplicationForm";

/** /partner/applications/apply-now: a new application, Institution and programme chosen in step 1. */
export default function StudentRegistrationForm() {
  const form = useApplicationForm();
  if (form.universitiesLoading) return <Loading text="Loading the application form…" />;
  return (
    <div className="mt-5">
      <ApplicationFormView {...form} mode="new" />
    </div>
  );
}
