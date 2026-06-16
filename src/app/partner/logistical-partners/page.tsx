'use client';

import LogisticalPartnersList from "features/logistical-service/components/partner/LogisticalPartnersMarketplace";
import { usePartnerHasLogisticalAccess } from "features/applications/partner/hooks/usePartnerHasLogisticalAccess";

const LogisticalPartnersPage = () => {
  const { hasAccess, loading, visaProcessingCount } = usePartnerHasLogisticalAccess();

  if (loading) return null;

  return <LogisticalPartnersList locked={!hasAccess} visaProcessingCount={visaProcessingCount} />;
};

export default LogisticalPartnersPage;
