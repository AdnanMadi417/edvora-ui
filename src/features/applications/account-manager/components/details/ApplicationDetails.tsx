import React, { useState } from "react";
import ApplicationHero from "features/applications/shared/ApplicationHero";
import ApplicationInfoSection from "features/applications/shared/ApplicationInfoSection";
import ApplicationStudentInfoSection from "features/applications/shared/ApplicationStudentInfoSection";
import OfferLetterCard from './OfferLetterCard';
import AccountManagerTopBar from "features/applications/account-manager/components/topBar/AccountManagerTopBar";
import { AnimatePresence, motion } from "framer-motion";
import { EASE, MICRO_DURATION } from "components/ui/FadeIn";
import { Tabs } from "components/ui/tabs";
import { APPLICATION_DETAILS_TABS, type ApplicationDetailsTab } from "features/applications/shared/applicationDetailTabs";
import ApplicationActivityHistory from 'features/applications/shared/ApplicationActivityHistory';
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
  const [activeTab, setActiveTab] = useState<ApplicationDetailsTab>("details");

  return (
    <section className="max-w-5xl mx-auto">
      <div className="mt-4 bg-white rounded-lg border border-slate-200">

        {/* Account Manager TopBar */}
        <div className="border-b border-slate-200">
          <AccountManagerTopBar application={application} onRefetch={onRefetch} />
        </div>

        {/* Hero */}
        <ApplicationHero application={application} viewerActor="3" />

        <Tabs<ApplicationDetailsTab> tabs={APPLICATION_DETAILS_TABS} active={activeTab} onChange={setActiveTab} />

        <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: MICRO_DURATION, ease: EASE }}
        >
        {activeTab === "details" && (
        <>
        {/* Application Timeline */}
        <div className="p-6 border-b border-slate-200">
          <ApplicationTimeline application={application} />
        </div>

        {/* Commission Details */}
        <div className="border-b border-slate-200">
          <ApplicationCommission application={application} />
        </div>

        {/* Offer Letter */}
        <div className="border-b border-slate-200">
          <OfferLetterCard application={application} onRefetch={onRefetch} />
        </div>

        {/* Application Information */}
        <ApplicationInfoSection application={application} />

        {/* Student Information */}
        <ApplicationStudentInfoSection application={application} />

        {/* Documents */}
        <ApplicationDocuments application={application} onRefetch={onRefetch} />

        </>
        )}

        {activeTab === "activity" && <ApplicationActivityHistory application={application} />}
        </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
}
