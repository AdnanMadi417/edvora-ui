'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LogisticalPartnersList from "features/logistical-service/components/partner/LogisticalPartnersMarketplace";
import { usePartnerHasStage4 } from "features/applications/partner/hooks/usePartnerHasStage4";

const Dashboard = () => {
  const router = useRouter();
  const { hasStage4, loading } = usePartnerHasStage4();

  useEffect(() => {
    if (!loading && !hasStage4) {
      router.replace("/partner/applications");
    }
  }, [hasStage4, loading, router]);

  if (loading || !hasStage4) return null;

  return (
    <div>
      <LogisticalPartnersList />
    </div>
  );
};

export default Dashboard;
