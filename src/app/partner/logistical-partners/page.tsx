'use client';

import { GraduationCap } from "lucide-react";
import LogisticalPartnersList from "features/logistical-service/components/partner/LogisticalPartnersMarketplace";
import { usePartnerHasLogisticalAccess } from "features/applications/partner/hooks/usePartnerHasLogisticalAccess";
import EmptyData from "components/emptyData/EmptyData";

const LogisticalPartnersPage = () => {
  const { hasAccess, loading } = usePartnerHasLogisticalAccess();

  if (loading) return null;

  if (!hasAccess) {
    return (
      <EmptyData
        icon={<GraduationCap className="h-10 w-10 text-slate-400" />}
        title="No Logistical Partners are available at this stage."
        subtitle={
          <>
            Logistical Partners are only available for applications in the{" "}
            <span className="font-medium text-slate-700">Student Arrival &amp; Enrollment</span>{" "}
            or{" "}
            <span className="font-medium text-slate-700">Partner Commission Invoicing</span>{" "}
            stages.
          </>
        }
      />
    );
  }

  return (
    <div>
      <LogisticalPartnersList />
    </div>
  );
};

export default LogisticalPartnersPage;
