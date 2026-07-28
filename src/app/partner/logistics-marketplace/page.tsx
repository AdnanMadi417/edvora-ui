'use client';

import LogisticsMarketplace from "features/logistical-service/components/shared/LogisticsMarketplace";
import { usePartnerHasLogisticalAccess } from "features/applications/partner/hooks/usePartnerHasLogisticalAccess";

const LogisticsMarketplacePage = () => {
  const { hasAccess, loading, visaProcessingCount } = usePartnerHasLogisticalAccess();

  if (loading) return null;

  return <LogisticsMarketplace locked={!hasAccess} visaProcessingCount={visaProcessingCount} />;
};

export default LogisticsMarketplacePage;
