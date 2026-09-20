import React from "react";
import AdminTopBar from "features/applications/admin/components/topBar/AdminTopBar";
import ApplicationHero from "features/applications/shared/ApplicationHero";
import ApplicationInfoSection from "features/applications/shared/ApplicationInfoSection";
import ApplicationStudentInfoSection from "features/applications/shared/ApplicationStudentInfoSection";
import OfferLetterCard from './OfferLetterCard';
import ApplicationTimeline from 'features/applications/shared/ApplicationTimeline';
import ApplicationCommission from './ApplicationCommission';
import ApplicationDocuments from './ApplicationDocuments';

interface ApplicationDetailsProps {
  application: any;
  onRefetch?: () => void;
}

export default function ApplicationDetails({
  application,
  onRefetch,
}: ApplicationDetailsProps) {
  return (
    <section className="max-w-5xl mx-auto">

      <div className="mt-4 bg-white rounded-lg border border-slate-200">

        {/* Admin actions */}
        <div className="border-b border-slate-200">
          <AdminTopBar application={application} onRefetch={onRefetch} />
        </div>

        {/* Hero section */}
        <ApplicationHero application={application} />

        {/* Application Timeline */}
        <div className="p-6 border-b border-slate-200">
          <ApplicationTimeline application={application} />
        </div>

        {/* Commission Details */}
        <div className="border-b border-slate-200">
          <ApplicationCommission application={application} />
        </div>

        {/* Offer Letter + Visa Payment */}
        <div className="border-b border-slate-200">
          <OfferLetterCard application={application} onRefetch={onRefetch} />
        </div>

        {/* Application Information */}
        <ApplicationInfoSection application={application} />

        {/* Student Information */}
        <ApplicationStudentInfoSection application={application} />

        {/* Documents */}
        <ApplicationDocuments application={application} onRefetch={onRefetch} />

      </div>

    </section>
  );
}
