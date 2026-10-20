import { useState } from "react";
import { partnerAgreementApi } from "../services";

export function useStartPartnerAgreement() {
  const [loading, setLoading] = useState(false);

  const startAgreement = async (partnerId: string) => {
    setLoading(true);
    try {
      const res = await partnerAgreementApi.start(partnerId);
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  return { startAgreement, loading };
}
